import { Controller, Get } from '@gao/http';
import type { GaoRequest, GaoResponse } from '@gao/http';
import { renderPage } from '../views/renderer.js';
import { CampaignService } from '../services/campaign.service.js';
import { escapeHtml } from '../helpers/escape.js';
import { timeAgo } from '../helpers/format.js';
import { emptyState } from '../helpers/empty-state.js';

const service = new CampaignService();

const STATUS_COLORS: Record<string, string> = { draft: '#94a3b8', scheduled: '#f59e0b', sending: '#3b82f6', sent: '#22c55e', paused: '#8b5cf6', cancelled: '#ef4444' };
const inputStyle = `width:100%;padding:10px 14px;background:rgba(15,23,42,0.6);border:1px solid rgba(100,116,139,0.3);border-radius:8px;color:#e2e8f0;font-size:14px;outline:none;`;
const labelStyle = `display:block;font-size:13px;font-weight:600;color:#cbd5e1;margin-bottom:6px;`;
const btnPrimary = `padding:12px 24px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;`;

@Controller('/campaigns')
export class CampaignController {
    @Get('/')
    async list(req: GaoRequest, res: GaoResponse) {
        const user = req.user as Record<string, unknown>;
        const campaigns = await service.list();

        const cards = campaigns.map(c => `
            <a href="/campaigns/${c.id}" style="text-decoration:none;">
                <div class="gao-card" style="padding:20px;margin-bottom:16px;cursor:pointer;transition:transform 0.15s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform=''">
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                        <div>
                            <h3 style="font-size:15px;font-weight:700;color:#e2e8f0;">${escapeHtml(c.name)}</h3>
                            <div style="font-size:12px;color:var(--gao-text-muted,#64748b);margin-top:4px;">${escapeHtml(c.type)} · ${escapeHtml(c.subject ?? 'No subject')}</div>
                        </div>
                        <span style="padding:3px 10px;border-radius:10px;font-size:11px;font-weight:700;color:#fff;background:${STATUS_COLORS[c.status] ?? '#6366f1'}">${c.status}</span>
                    </div>
                    <div style="display:flex;gap:24px;margin-top:14px;font-size:12px;">
                        <div><span style="color:var(--gao-text-muted,#64748b);">Recipients:</span> <strong>${c.total_recipients}</strong></div>
                        <div><span style="color:var(--gao-text-muted,#64748b);">Sent:</span> <strong>${c.total_sent}</strong></div>
                        <div><span style="color:var(--gao-text-muted,#64748b);">Opens:</span> <strong style="color:#22c55e;">${c.total_opens}</strong></div>
                        <div><span style="color:var(--gao-text-muted,#64748b);">Clicks:</span> <strong style="color:#3b82f6;">${c.total_clicks}</strong></div>
                        <div style="margin-left:auto;color:var(--gao-text-muted,#64748b);">${timeAgo(c.created_at)}</div>
                    </div>
                </div>
            </a>`).join('');

        const content = `
        <div style="padding:8px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
                <h1 style="font-size:24px;font-weight:700;">Campaigns</h1>
                <a href="/campaigns/create" style="${btnPrimary}text-decoration:none;">+ New Campaign</a>
            </div>
            ${cards || emptyState({ icon: 'campaigns', title: 'No campaigns yet', description: 'Create your first email campaign to reach your contacts.', action: { label: '+ New Campaign', href: '/campaigns/create' } })}
        </div>`;

        return res.html(renderPage({ title: 'Campaigns', content, activePath: '/campaigns', user: user ? { name: user.name as string, role: user.role as string } : undefined }));
    }

    @Get('/create')
    async create(req: GaoRequest, res: GaoResponse) {
        const user = req.user as Record<string, unknown>;
        const content = `
        <div style="padding:8px;">
            <a href="/campaigns" style="display:inline-flex;align-items:center;gap:6px;font-size:13px;color:#94a3b8;text-decoration:none;margin-bottom:20px;">← Back to Campaigns</a>
            <h1 style="font-size:24px;font-weight:700;margin-bottom:24px;">New Campaign</h1>
            <div class="gao-card" style="padding:32px;max-width:640px;">
                <form id="createCampaignForm">
                    <div><label style="${labelStyle}">Campaign Name *</label><input type="text" name="name" required style="${inputStyle}"></div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px;">
                        <div><label style="${labelStyle}">Type</label><select name="type" style="${inputStyle}"><option value="email">Email</option><option value="sms">SMS</option><option value="whatsapp">WhatsApp</option></select></div>
                        <div><label style="${labelStyle}">Subject</label><input type="text" name="subject" style="${inputStyle}"></div>
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px;">
                        <div><label style="${labelStyle}">From Email</label><input type="email" name="from_email" style="${inputStyle}"></div>
                        <div><label style="${labelStyle}">From Name</label><input type="text" name="from_name" style="${inputStyle}"></div>
                    </div>
                    <div style="margin-top:16px;"><label style="${labelStyle}">Content</label><textarea name="body_html" rows="6" style="${inputStyle}resize:vertical;"></textarea></div>
                    <div style="margin-top:24px;display:flex;gap:12px;">
                        <button type="submit" style="${btnPrimary}">Create Campaign</button>
                        <a href="/campaigns" style="padding:12px 24px;background:rgba(255,255,255,0.05);color:#94a3b8;border-radius:10px;text-decoration:none;font-size:14px;font-weight:600;display:inline-flex;align-items:center;">Cancel</a>
                    </div>
                </form>
            </div>
        </div>
        <script>
        document.getElementById('createCampaignForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const fd = new FormData(e.target);
            const data = Object.fromEntries(fd.entries());
            const res = await fetch('/api/campaigns', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(data) });
            if (res.ok) window.location.href = '/campaigns';
            else { const err = await res.json(); alert(err.error?.message || 'Failed'); }
        });
        </script>`;
        return res.html(renderPage({ title: 'New Campaign', content, activePath: '/campaigns', user: user ? { name: user.name as string, role: user.role as string } : undefined }));
    }

    @Get('/:id')
    async detail(req: GaoRequest, res: GaoResponse) {
        const user = req.user as Record<string, unknown>;
        const campaign = await service.findById(req.params.id);
        if (!campaign) return res.status(404).html(renderPage({ title: 'Not Found', content: '<div style="padding:40px;text-align:center;"><h1 style="font-size:24px;font-weight:700;">Campaign Not Found</h1><a href="/campaigns" style="color:#818cf8;">← Back to Campaigns</a></div>', activePath: '/campaigns', user: user ? { name: user.name as string, role: user.role as string } : undefined }));

        const analytics = await service.getAnalytics(campaign.id);

        const content = `
        <div style="padding:8px;">
            <a href="/campaigns" style="display:inline-flex;align-items:center;gap:6px;font-size:13px;color:#94a3b8;text-decoration:none;margin-bottom:20px;">← Back to Campaigns</a>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
                <div>
                    <h1 style="font-size:24px;font-weight:700;">${escapeHtml(campaign.name)}</h1>
                    <p style="font-size:14px;color:var(--gao-text-muted,#64748b);margin-top:4px;">${escapeHtml(campaign.type)} campaign · ${escapeHtml(campaign.subject ?? '')}</p>
                </div>
                <span style="padding:6px 14px;border-radius:10px;font-size:12px;font-weight:700;color:#fff;background:${STATUS_COLORS[campaign.status] ?? '#6366f1'}">${campaign.status}</span>
            </div>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin-bottom:24px;">
                <div class="gao-card" style="padding:16px;text-align:center;"><div style="font-size:24px;font-weight:800;color:#3b82f6;">${analytics?.total_recipients ?? 0}</div><div style="font-size:12px;color:var(--gao-text-muted,#64748b);">Recipients</div></div>
                <div class="gao-card" style="padding:16px;text-align:center;"><div style="font-size:24px;font-weight:800;color:#8b5cf6;">${analytics?.total_sent ?? 0}</div><div style="font-size:12px;color:var(--gao-text-muted,#64748b);">Sent</div></div>
                <div class="gao-card" style="padding:16px;text-align:center;"><div style="font-size:24px;font-weight:800;color:#22c55e;">${analytics?.open_rate ?? 0}%</div><div style="font-size:12px;color:var(--gao-text-muted,#64748b);">Open Rate</div></div>
                <div class="gao-card" style="padding:16px;text-align:center;"><div style="font-size:24px;font-weight:800;color:#f59e0b;">${analytics?.click_rate ?? 0}%</div><div style="font-size:12px;color:var(--gao-text-muted,#64748b);">Click Rate</div></div>
            </div>
            <div class="gao-card" style="padding:24px;">
                <h3 style="font-size:15px;font-weight:700;margin-bottom:12px;">Campaign Details</h3>
                <div style="display:grid;grid-template-columns:160px 1fr;gap:10px;font-size:13px;">
                    <div style="color:var(--gao-text-muted,#64748b);">From:</div><div style="color:#cbd5e1;">${escapeHtml(campaign.from_name ?? '')} &lt;${escapeHtml(campaign.from_email ?? '')}&gt;</div>
                    <div style="color:var(--gao-text-muted,#64748b);">Subject:</div><div style="color:#cbd5e1;">${escapeHtml(campaign.subject ?? '—')}</div>
                    <div style="color:var(--gao-text-muted,#64748b);">Created:</div><div style="color:#cbd5e1;">${new Date(campaign.created_at).toLocaleString()}</div>
                    ${campaign.sent_at ? `<div style="color:var(--gao-text-muted,#64748b);">Sent:</div><div style="color:#cbd5e1;">${new Date(campaign.sent_at).toLocaleString()}</div>` : ''}
                </div>
                <div style="margin-top:20px;display:flex;gap:8px;">
                    ${['draft', 'scheduled'].includes(campaign.status) ? `<button onclick="if(confirm('Send this campaign to ${campaign.total_recipients} recipients?'))fetch('/api/campaigns/${campaign.id}/send',{method:'POST'}).then(()=>location.reload())" style="padding:10px 20px;background:linear-gradient(135deg,#22c55e,#16a34a);color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;">🚀 Send Now</button>` : ''}
                    <button onclick="if(confirm('Delete this campaign?'))fetch('/api/campaigns/${campaign.id}',{method:'DELETE'}).then(r=>{if(r.ok)window.location.href='/campaigns'})" style="padding:10px 20px;background:rgba(239,68,68,0.1);color:#f87171;border:1px solid rgba(239,68,68,0.2);border-radius:8px;font-size:13px;cursor:pointer;">Delete</button>
                </div>
            </div>

            <!-- Recipients -->
            <div class="gao-card" style="padding:24px;margin-top:20px;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                    <h3 style="font-size:15px;font-weight:700;">Recipients (${campaign.total_recipients})</h3>
                    ${['draft', 'scheduled'].includes(campaign.status) ? `
                        <button onclick="document.getElementById('addRecipientForm').style.display=document.getElementById('addRecipientForm').style.display==='none'?'flex':'none'" style="padding:6px 14px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;border:none;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;">+ Add Recipients</button>
                    ` : ''}
                </div>
                <form id="addRecipientForm" style="display:none;gap:8px;margin-bottom:16px;align-items:end;" onsubmit="event.preventDefault();fetch('/api/campaigns/${campaign.id}/recipients',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:this.email.value,name:this.name.value})}).then(()=>window.location.reload())">
                    <input name="name" placeholder="Name" style="padding:8px 12px;background:rgba(255,255,255,0.04);border:1px solid rgba(100,116,139,0.25);border-radius:8px;color:#e2e8f0;font-size:13px;flex:1;" />
                    <input name="email" type="email" required placeholder="Email *" style="padding:8px 12px;background:rgba(255,255,255,0.04);border:1px solid rgba(100,116,139,0.25);border-radius:8px;color:#e2e8f0;font-size:13px;flex:1;" />
                    <button type="submit" style="padding:8px 16px;background:#6366f1;color:white;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;">Add</button>
                </form>
                <p style="font-size:13px;color:var(--gao-text-muted,#64748b);">${campaign.total_recipients > 0 ? campaign.total_recipients + ' recipients added to this campaign.' : 'No recipients yet — add some to send this campaign.'}</p>
            </div>
        </div>`;
        return res.html(renderPage({ title: campaign.name, content, activePath: '/campaigns', user: user ? { name: user.name as string, role: user.role as string } : undefined }));
    }
}
