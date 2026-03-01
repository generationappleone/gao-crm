import { Controller, Get } from '@gao/http';
import type { GaoRequest, GaoResponse } from '@gao/http';
import { renderPage } from '../views/renderer.js';
import { EmailHubService } from '../services/email-hub.service.js';
import { escapeHtml } from '../helpers/escape.js';
import { timeAgo } from '../helpers/format.js';

const service = new EmailHubService();

const STATUS_COLORS: Record<string, string> = { draft: '#94a3b8', queued: '#f59e0b', sent: '#3b82f6', delivered: '#22c55e', opened: '#8b5cf6', clicked: '#ec4899', bounced: '#ef4444', failed: '#dc2626' };

@Controller('/email-hub')
export class EmailHubController {
    @Get('/')
    async index(req: GaoRequest, res: GaoResponse) {
        const user = req.user as Record<string, unknown>;
        const userId = (user?.id as string) ?? '';
        const messages = userId ? await service.listMessages(userId) : [];
        const templates = userId ? await service.listTemplates(userId) : [];

        const msgRows = messages.slice(0, 30).map(m => `
            <tr>
                <td style="font-weight:600;">${escapeHtml(m.subject)}</td>
                <td style="font-size:12px;color:var(--gao-text-muted,#64748b);">${escapeHtml(m.to_email)}</td>
                <td><span style="padding:3px 8px;border-radius:8px;font-size:10px;font-weight:700;color:#fff;background:${STATUS_COLORS[m.status] ?? '#6366f1'}">${m.status}</span></td>
                <td style="font-size:12px;color:var(--gao-text-muted,#64748b);">${timeAgo(m.created_at)}</td>
            </tr>`).join('');

        const templateCards = templates.slice(0, 6).map(t => `
            <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(100,116,139,0.12);border-radius:10px;padding:16px;">
                <div style="font-size:13px;font-weight:600;color:#e2e8f0;">${escapeHtml(t.name)}</div>
                <div style="font-size:11px;color:var(--gao-text-muted,#64748b);margin-top:4px;">${escapeHtml(t.category ?? 'General')}</div>
            </div>`).join('');

        const iStyle = `width:100%;padding:10px 14px;background:rgba(15,23,42,0.6);border:1px solid rgba(100,116,139,0.3);border-radius:8px;color:#e2e8f0;font-size:14px;outline:none;`;
        const lStyle = `display:block;font-size:13px;font-weight:600;color:#cbd5e1;margin-bottom:6px;`;

        const content = `
        <div style="padding:8px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
                <h1 style="font-size:24px;font-weight:700;">Email Hub</h1>
                <button onclick="document.getElementById('composeModal').style.display='flex'" style="padding:12px 24px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;">✉️ Compose</button>
            </div>
            <div style="display:grid;grid-template-columns:1fr 320px;gap:20px;">
                <div class="gao-card" style="padding:24px;">
                    <h3 style="font-size:15px;font-weight:700;margin-bottom:16px;">Recent Messages (${messages.length})</h3>
                    <div class="gao-admin-table-wrapper">
                        <table class="gao-admin-table">
                            <thead><tr><th>Subject</th><th>To</th><th>Status</th><th>Sent</th></tr></thead>
                            <tbody>${msgRows || '<tr><td colspan="4" style="text-align:center;padding:30px;color:var(--gao-text-muted,#64748b);">No emails sent</td></tr>'}</tbody>
                        </table>
                    </div>
                </div>
                <div class="gao-card" style="padding:24px;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                        <h3 style="font-size:15px;font-weight:700;">Templates (${templates.length})</h3>
                        <button onclick="document.getElementById('templateModal').style.display='flex'" style="padding:6px 14px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;border:none;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;">+ New Template</button>
                    </div>
                    <div style="display:grid;gap:10px;">${templateCards || '<p style="font-size:13px;color:var(--gao-text-muted,#64748b);">No templates</p>'}</div>
                </div>
            </div>
        </div>
        <div id="composeModal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:1000;align-items:center;justify-content:center;">
            <div class="gao-card" style="padding:32px;max-width:560px;width:100%;">
                <h3 style="font-size:18px;font-weight:700;color:#e2e8f0;margin-bottom:16px;">Compose Email</h3>
                <form id="composeForm">
                    <div><label style="${lStyle}">To *</label><input type="email" name="to_email" required style="${iStyle}" placeholder="recipient@email.com"></div>
                    <div style="margin-top:12px;"><label style="${lStyle}">Subject *</label><input type="text" name="subject" required style="${iStyle}"></div>
                    <div style="margin-top:12px;"><label style="${lStyle}">Body</label><textarea name="body_html" rows="6" style="${iStyle}resize:vertical;"></textarea></div>
                    <div style="margin-top:20px;display:flex;gap:12px;">
                        <button type="submit" style="padding:12px 24px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;">Send</button>
                        <button type="button" onclick="document.getElementById('composeModal').style.display='none'" style="padding:12px 24px;background:rgba(255,255,255,0.05);color:#94a3b8;border:none;border-radius:10px;cursor:pointer;font-size:14px;">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
        <div id="templateModal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:1001;align-items:center;justify-content:center;">
            <div class="gao-card" style="padding:32px;max-width:560px;width:100%;">
                <h3 style="font-size:18px;font-weight:700;color:#e2e8f0;margin-bottom:16px;">New Email Template</h3>
                <form id="templateForm">
                    <div><label style="${lStyle}">Template Name *</label><input type="text" name="name" required style="${iStyle}" placeholder="e.g. Follow-up Email"></div>
                    <div style="margin-top:12px;"><label style="${lStyle}">Subject *</label><input type="text" name="subject" required style="${iStyle}" placeholder="Re: {{deal_name}}"></div>
                    <div style="margin-top:12px;"><label style="${lStyle}">Category</label><select name="category" style="${iStyle}"><option value="general">General</option><option value="follow_up">Follow Up</option><option value="proposal">Proposal</option><option value="onboarding">Onboarding</option></select></div>
                    <div style="margin-top:12px;"><label style="${lStyle}">Body</label><textarea name="body_html" rows="6" style="${iStyle}resize:vertical;" placeholder="Hello {{first_name}},\n\nThank you for..."></textarea></div>
                    <p style="font-size:11px;color:var(--gao-text-muted,#64748b);margin-top:8px;">Variables: {{first_name}}, {{last_name}}, {{company}}, {{deal_name}}, {{email}}</p>
                    <div style="margin-top:20px;display:flex;gap:12px;">
                        <button type="submit" style="padding:12px 24px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;">Create Template</button>
                        <button type="button" onclick="document.getElementById('templateModal').style.display='none'" style="padding:12px 24px;background:rgba(255,255,255,0.05);color:#94a3b8;border:none;border-radius:10px;cursor:pointer;font-size:14px;">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
        <script>
        document.getElementById('composeForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const fd = new FormData(e.target);
            const data = Object.fromEntries(fd.entries());
            const res = await fetch('/api/email/send', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(data) });
            if (res.ok) { document.getElementById('composeModal').style.display='none'; location.reload(); }
            else { const err = await res.json(); alert(err.error?.message || 'Failed to send'); }
        });
        document.getElementById('templateForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const fd = new FormData(e.target);
            const data = Object.fromEntries(fd.entries());
            const res = await fetch('/api/email/templates', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(data) });
            if (res.ok) { document.getElementById('templateModal').style.display='none'; location.reload(); }
            else { const err = await res.json(); alert(err.error?.message || 'Failed to create template'); }
        });
        </script>`;

        return res.html(renderPage({ title: 'Email Hub', content, activePath: '/email-hub', user: user ? { name: user.name as string, role: user.role as string } : undefined }));
    }
}
