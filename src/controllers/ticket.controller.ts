import { Controller, Get } from '@gao/http';
import type { GaoRequest, GaoResponse } from '@gao/http';
import { renderPage } from '../views/renderer.js';
import { TicketService } from '../services/ticket.service.js';
import { escapeHtml } from '../helpers/escape.js';
import { timeAgo } from '../helpers/format.js';

const service = new TicketService();

const PRIORITY_COLORS: Record<string, string> = { low: '#94a3b8', medium: '#3b82f6', high: '#f59e0b', urgent: '#ef4444' };
const STATUS_COLORS: Record<string, string> = { open: '#3b82f6', in_progress: '#8b5cf6', waiting: '#f59e0b', resolved: '#22c55e', closed: '#64748b', reopened: '#ec4899' };
const inputStyle = `width:100%;padding:10px 14px;background:rgba(15,23,42,0.6);border:1px solid rgba(100,116,139,0.3);border-radius:8px;color:#e2e8f0;font-size:14px;outline:none;`;
const labelStyle = `display:block;font-size:13px;font-weight:600;color:#cbd5e1;margin-bottom:6px;`;
const btnPrimary = `padding:12px 24px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;`;

@Controller('/tickets')
export class TicketController {
    @Get('/')
    async list(req: GaoRequest, res: GaoResponse) {
        const user = req.user as Record<string, unknown>;
        const status = req.query.status as string | undefined;
        const tickets = await service.list({ status: status as any });
        const stats = await service.getStats();

        const statCards = `
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin-bottom:24px;">
            <div class="gao-card" style="padding:16px;text-align:center;"><div style="font-size:24px;font-weight:800;color:#3b82f6;">${stats.open}</div><div style="font-size:12px;color:var(--gao-text-muted,#64748b);">Open</div></div>
            <div class="gao-card" style="padding:16px;text-align:center;"><div style="font-size:24px;font-weight:800;color:#f59e0b;">${stats.waiting}</div><div style="font-size:12px;color:var(--gao-text-muted,#64748b);">Waiting</div></div>
            <div class="gao-card" style="padding:16px;text-align:center;"><div style="font-size:24px;font-weight:800;color:#22c55e;">${stats.resolved}</div><div style="font-size:12px;color:var(--gao-text-muted,#64748b);">Resolved</div></div>
            <div class="gao-card" style="padding:16px;text-align:center;"><div style="font-size:24px;font-weight:800;color:#ef4444;">${stats.urgent}</div><div style="font-size:12px;color:var(--gao-text-muted,#64748b);">Urgent</div></div>
        </div>`;

        const rows = tickets.map(t => `
            <tr>
                <td><a href="/tickets/${t.id}" style="color:#818cf8;text-decoration:none;font-weight:600;">${escapeHtml(t.ticket_number)}</a></td>
                <td>${escapeHtml(t.subject)}</td>
                <td><span style="padding:3px 8px;border-radius:8px;font-size:10px;font-weight:700;color:#fff;background:${PRIORITY_COLORS[t.priority] ?? '#6366f1'}">${t.priority}</span></td>
                <td><span style="padding:3px 8px;border-radius:8px;font-size:10px;font-weight:700;color:#fff;background:${STATUS_COLORS[t.status] ?? '#6366f1'}">${t.status}</span></td>
                <td style="font-size:12px;color:var(--gao-text-muted,#64748b);">${timeAgo(t.created_at)}</td>
            </tr>`).join('');

        const content = `
        <div style="padding:8px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
                <h1 style="font-size:24px;font-weight:700;">Support Tickets</h1>
                <a href="/tickets/create" style="${btnPrimary}text-decoration:none;">+ New Ticket</a>
            </div>
            ${statCards}
            <div class="gao-card" style="padding:24px;">
                <div class="gao-admin-table-wrapper">
                    <table class="gao-admin-table">
                        <thead><tr><th>Ticket #</th><th>Subject</th><th>Priority</th><th>Status</th><th>Created</th></tr></thead>
                        <tbody>${rows || '<tr><td colspan="5" style="text-align:center;padding:40px;color:var(--gao-text-muted,#64748b);">No tickets</td></tr>'}</tbody>
                    </table>
                </div>
            </div>
        </div>`;

        return res.html(renderPage({ title: 'Tickets', content, activePath: '/tickets', user: user ? { name: user.name as string, role: user.role as string } : undefined }));
    }

    @Get('/create')
    async create(req: GaoRequest, res: GaoResponse) {
        const user = req.user as Record<string, unknown>;
        const content = `
        <div style="padding:8px;">
            <a href="/tickets" style="display:inline-flex;align-items:center;gap:6px;font-size:13px;color:#94a3b8;text-decoration:none;margin-bottom:20px;">← Back to Tickets</a>
            <h1 style="font-size:24px;font-weight:700;margin-bottom:24px;">New Ticket</h1>
            <div class="gao-card" style="padding:32px;max-width:640px;">
                <form id="createTicketForm">
                    <div><label style="${labelStyle}">Subject *</label><input type="text" name="subject" required style="${inputStyle}"></div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px;">
                        <div><label style="${labelStyle}">Priority</label><select name="priority" style="${inputStyle}"><option value="low">Low</option><option value="medium" selected>Medium</option><option value="high">High</option><option value="urgent">Urgent</option></select></div>
                        <div><label style="${labelStyle}">Channel</label><select name="channel" style="${inputStyle}"><option value="web">Web</option><option value="email">Email</option><option value="phone">Phone</option><option value="chat">Chat</option></select></div>
                    </div>
                    <div style="margin-top:16px;"><label style="${labelStyle}">Description</label><textarea name="description" rows="4" style="${inputStyle}resize:vertical;"></textarea></div>
                    <div style="margin-top:24px;display:flex;gap:12px;">
                        <button type="submit" style="${btnPrimary}">Create Ticket</button>
                        <a href="/tickets" style="padding:12px 24px;background:rgba(255,255,255,0.05);color:#94a3b8;border-radius:10px;text-decoration:none;font-size:14px;font-weight:600;display:inline-flex;align-items:center;">Cancel</a>
                    </div>
                </form>
            </div>
        </div>
        <script>
        document.getElementById('createTicketForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const fd = new FormData(e.target);
            const data = Object.fromEntries(fd.entries());
            const res = await fetch('/api/tickets', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(data) });
            if (res.ok) window.location.href = '/tickets';
            else { const err = await res.json(); alert(err.error?.message || 'Failed to create ticket'); }
        });
        </script>`;
        return res.html(renderPage({ title: 'New Ticket', content, activePath: '/tickets', user: user ? { name: user.name as string, role: user.role as string } : undefined }));
    }

    @Get('/:id')
    async detail(req: GaoRequest, res: GaoResponse) {
        const user = req.user as Record<string, unknown>;
        const ticket = await service.findById(req.params.id);
        if (!ticket) return res.status(404).html(renderPage({ title: 'Not Found', content: '<div style="padding:40px;text-align:center;"><h1 style="font-size:24px;font-weight:700;">Ticket Not Found</h1><a href="/tickets" style="color:#818cf8;">← Back to Tickets</a></div>', activePath: '/tickets', user: user ? { name: user.name as string, role: user.role as string } : undefined }));

        let messages: Array<Record<string, unknown>> = [];
        try { messages = await service.getMessages(ticket.id, true) as unknown as Array<Record<string, unknown>>; } catch { /* ok */ }

        const msgHtml = messages.map(m => `
            <div style="padding:14px;background:${m.is_internal ? 'rgba(245,158,11,0.08)' : 'rgba(15,23,42,0.4)'};border-radius:10px;border:1px solid ${m.is_internal ? 'rgba(245,158,11,0.2)' : 'rgba(100,116,139,0.15)'};">
                <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
                    <span style="font-size:12px;font-weight:700;color:${m.sender_type === 'agent' ? '#818cf8' : '#cbd5e1'};">${m.sender_type === 'agent' ? '🛡️ Agent' : '👤 Customer'}${m.is_internal ? ' <span style="color:#f59e0b;">(internal note)</span>' : ''}</span>
                    <span style="font-size:11px;color:var(--gao-text-muted,#64748b);">${timeAgo(String(m.created_at))}</span>
                </div>
                <div style="font-size:13px;color:#cbd5e1;line-height:1.6;">${escapeHtml(String(m.content))}</div>
            </div>`).join('');

        const content = `
        <div style="padding:8px;">
            <a href="/tickets" style="display:inline-flex;align-items:center;gap:6px;font-size:13px;color:#94a3b8;text-decoration:none;margin-bottom:20px;">← Back to Tickets</a>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
                <div>
                    <h1 style="font-size:24px;font-weight:700;">${escapeHtml(ticket.ticket_number)}</h1>
                    <p style="font-size:14px;color:var(--gao-text-muted,#64748b);margin-top:4px;">${escapeHtml(ticket.subject)}</p>
                </div>
                <div style="display:flex;gap:8px;">
                    <span style="padding:6px 14px;border-radius:8px;font-size:12px;font-weight:700;color:#fff;background:${PRIORITY_COLORS[ticket.priority] ?? '#6366f1'}">${ticket.priority}</span>
                    <span style="padding:6px 14px;border-radius:8px;font-size:12px;font-weight:700;color:#fff;background:${STATUS_COLORS[ticket.status] ?? '#6366f1'}">${ticket.status}</span>
                </div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 300px;gap:20px;">
                <div>
                    ${ticket.description ? `<div class="gao-card" style="padding:20px;margin-bottom:16px;"><h3 style="font-size:14px;font-weight:700;color:#e2e8f0;margin-bottom:8px;">Description</h3><p style="font-size:13px;color:#cbd5e1;line-height:1.6;">${escapeHtml(ticket.description ?? '')}</p></div>` : ''}
                    <div class="gao-card" style="padding:20px;">
                        <h3 style="font-size:14px;font-weight:700;color:#e2e8f0;margin-bottom:12px;">Messages (${messages.length})</h3>
                        <div style="display:flex;flex-direction:column;gap:10px;">${msgHtml || '<p style="color:var(--gao-text-muted,#64748b);font-size:13px;">No messages yet</p>'}</div>
                        <form id="replyForm" style="margin-top:16px;padding-top:16px;border-top:1px solid rgba(100,116,139,0.15);">
                            <textarea name="content" placeholder="Type your reply..." rows="3" required style="${inputStyle}resize:vertical;font-size:13px;"></textarea>
                            <div style="margin-top:8px;display:flex;gap:8px;">
                                <button type="submit" style="padding:8px 16px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border:none;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;">Send Reply</button>
                            </div>
                        </form>
                    </div>
                </div>
                <div class="gao-card" style="padding:20px;height:fit-content;">
                    <h3 style="font-size:14px;font-weight:700;color:#e2e8f0;margin-bottom:12px;">Details</h3>
                    <div style="display:flex;flex-direction:column;gap:10px;font-size:13px;">
                        <div><span style="color:var(--gao-text-muted,#64748b);">Channel:</span> <span style="color:#cbd5e1;">${escapeHtml(ticket.channel ?? 'web')}</span></div>
                        <div><span style="color:var(--gao-text-muted,#64748b);">Created:</span> <span style="color:#cbd5e1;">${new Date(ticket.created_at).toLocaleString()}</span></div>
                        ${ticket.resolved_at ? `<div><span style="color:var(--gao-text-muted,#64748b);">Resolved:</span> <span style="color:#22c55e;">${new Date(ticket.resolved_at).toLocaleString()}</span></div>` : ''}
                        <div style="margin-top:12px;padding-top:12px;border-top:1px solid rgba(100,116,139,0.15);">
                            <select id="statusSelect" style="${inputStyle}">
                                ${['open', 'in_progress', 'waiting', 'resolved', 'closed'].map(s => `<option value="${s}" ${ticket.status === s ? 'selected' : ''}>${s}</option>`).join('')}
                            </select>
                            <button onclick="fetch('/api/tickets/${ticket.id}/status',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({status:document.getElementById('statusSelect').value})}).then(()=>location.reload())" style="margin-top:8px;padding:8px 16px;background:rgba(99,102,241,0.15);color:#818cf8;border:1px solid rgba(99,102,241,0.3);border-radius:8px;font-size:12px;cursor:pointer;width:100%;">Update Status</button>
                        </div>
                        <button onclick="if(confirm('Delete this ticket?'))fetch('/api/tickets/${ticket.id}',{method:'DELETE'}).then(r=>{if(r.ok)window.location.href='/tickets'})" style="margin-top:8px;padding:8px 16px;background:rgba(239,68,68,0.1);color:#f87171;border:1px solid rgba(239,68,68,0.2);border-radius:8px;font-size:12px;cursor:pointer;width:100%;">Delete Ticket</button>
                    </div>
                </div>
            </div>
        </div>
        <script>
        document.getElementById('replyForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const fd = new FormData(e.target);
            const data = { ticket_id: '${ticket.id}', sender_type: 'agent', content: fd.get('content') };
            const res = await fetch('/api/tickets/${ticket.id}/messages', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(data) });
            if (res.ok) location.reload();
            else { const err = await res.json(); alert(err.error?.message || 'Failed'); }
        });
        </script>`;
        return res.html(renderPage({ title: ticket.ticket_number, content, activePath: '/tickets', user: user ? { name: user.name as string, role: user.role as string } : undefined }));
    }
}
