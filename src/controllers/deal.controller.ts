import { Controller, Get } from '@gao/http';
import type { GaoRequest, GaoResponse } from '@gao/http';
import { renderPage } from '../views/renderer.js';
import { DealService } from '../services/deal.service.js';
import { ActivityService } from '../services/activity.service.js';
import { NoteService } from '../services/note.service.js';
import { ContactService } from '../services/contact.service.js';
import { CompanyService } from '../services/company.service.js';
import { parsePagination, renderPaginationHtml } from '../helpers/pagination.js';
import { escapeHtml } from '../helpers/escape.js';
import { formatCurrency, timeAgo } from '../helpers/format.js';

const dealService = new DealService();
const activityService = new ActivityService();
const noteService = new NoteService();
const contactService = new ContactService();
const companyService = new CompanyService();

const inputStyle = `width:100%;padding:10px 14px;background:rgba(15,23,42,0.6);border:1px solid rgba(100,116,139,0.3);border-radius:8px;color:#e2e8f0;font-size:14px;outline:none;`;
const labelStyle = `display:block;font-size:13px;font-weight:600;color:#cbd5e1;margin-bottom:6px;`;

@Controller('/deals')
export class DealController {
    @Get('/')
    async list(req: GaoRequest, res: GaoResponse) {
        const pagination = parsePagination(req.query);
        const result = await dealService.list(pagination, req.query.stage_id);
        const stages = await dealService.getStages();
        const user = req.user as Record<string, unknown>;

        const stageMap = new Map(stages.map(s => [s.id, s]));

        const tableRows = result.deals.map((d) => {
            const stage = stageMap.get(d.stage_id);
            return `<tr>
                <td><a href="/deals/${d.id}" style="color:#e2e8f0;text-decoration:none;font-weight:600;">${escapeHtml(d.title)}</a></td>
                <td style="font-weight:600;">${formatCurrency(d.value, d.currency)}</td>
                <td><span style="padding:4px 10px;border-radius:12px;font-size:11px;font-weight:700;color:#fff;background:${stage?.color ?? '#6366f1'}">${escapeHtml(stage?.name ?? '—')}</span></td>
                <td style="color:var(--gao-text-muted,#64748b);">${d.probability}%</td>
                <td style="font-size:13px;color:var(--gao-text-muted,#64748b);">${timeAgo(d.created_at)}</td>
            </tr>`;
        }).join('');

        const content = `
        <div style="padding:8px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
                <h1 style="font-size:24px;font-weight:700;">Deals Pipeline</h1>
                <a href="/deals/create" style="padding:10px 20px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border-radius:10px;text-decoration:none;font-size:13px;font-weight:700;">+ New Deal</a>
            </div>

            <div style="display:flex;gap:8px;margin-bottom:20px;flex-wrap:wrap;">
                <a href="/deals" style="padding:8px 16px;border-radius:8px;font-size:12px;font-weight:600;text-decoration:none;${!req.query.stage_id ? 'background:#6366f1;color:#fff;' : 'background:rgba(255,255,255,0.05);color:#94a3b8;'}">All</a>
                ${stages.map(s => `<a href="/deals?stage_id=${s.id}" style="padding:8px 16px;border-radius:8px;font-size:12px;font-weight:600;text-decoration:none;${req.query.stage_id === s.id ? `background:${s.color};color:#fff;` : 'background:rgba(255,255,255,0.05);color:#94a3b8;'}">${escapeHtml(s.name)}</a>`).join('')}
            </div>

            <div class="gao-card" style="padding:24px;">
                <div class="gao-admin-table-wrapper">
                    <table class="gao-admin-table">
                        <thead><tr><th>Deal</th><th>Value</th><th>Stage</th><th>Probability</th><th>Created</th></tr></thead>
                        <tbody>${tableRows || '<tr><td colspan="5" style="text-align:center;padding:40px;color:var(--gao-text-muted,#64748b);">No deals found</td></tr>'}</tbody>
                    </table>
                </div>
                ${renderPaginationHtml(result.meta, '/deals')}
            </div>
        </div>`;

        return res.html(renderPage({ title: 'Deals', content, activePath: '/deals', user: user ? { name: user.name as string, role: user.role as string } : undefined }));
    }

    @Get('/create')
    async createForm(req: GaoRequest, res: GaoResponse) {
        const user = req.user as Record<string, unknown>;
        const stages = await dealService.getStages();
        const contacts = await contactService.list({ page: 1, perPage: 200 });
        const companies = await companyService.list({ page: 1, perPage: 200 });

        const stageOptions = stages.filter(s => !s.is_won && !s.is_lost).map(s =>
            `<option value="${s.id}">${escapeHtml(s.name)}</option>`
        ).join('');
        const contactOptions = contacts.contacts.map(c =>
            `<option value="${c.id}">${escapeHtml(c.first_name)} ${escapeHtml(c.last_name)}</option>`
        ).join('');
        const companyOptions = companies.companies.map(c =>
            `<option value="${c.id}">${escapeHtml(c.name)}</option>`
        ).join('');

        const content = `
        <div style="padding:8px;">
            <h1 style="font-size:24px;font-weight:700;margin-bottom:24px;">New Deal</h1>
            <div class="gao-card" style="padding:32px;max-width:720px;">
                <form id="createDealForm">
                    <div><label style="${labelStyle}">Title *</label><input type="text" name="title" required style="${inputStyle}"></div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px;">
                        <div><label style="${labelStyle}">Value (IDR) *</label><input type="number" name="value" min="0" required style="${inputStyle}"></div>
                        <div><label style="${labelStyle}">Stage *</label><select name="stage_id" required style="${inputStyle}">${stageOptions}</select></div>
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px;">
                        <div><label style="${labelStyle}">Contact *</label><select name="contact_id" required style="${inputStyle}"><option value="">— Select —</option>${contactOptions}</select></div>
                        <div><label style="${labelStyle}">Company</label><select name="company_id" style="${inputStyle}"><option value="">— None —</option>${companyOptions}</select></div>
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px;">
                        <div><label style="${labelStyle}">Probability (%)</label><input type="number" name="probability" min="0" max="100" value="0" style="${inputStyle}"></div>
                        <div><label style="${labelStyle}">Expected Close</label><input type="date" name="expected_close_at" style="${inputStyle}"></div>
                    </div>
                    <div style="margin-top:16px;">
                        <label style="${labelStyle}">Notes</label><textarea name="notes" rows="3" style="${inputStyle}resize:vertical;"></textarea>
                    </div>
                    <div style="margin-top:24px;display:flex;gap:12px;">
                        <button type="submit" style="padding:12px 24px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;">Create Deal</button>
                        <a href="/deals" style="padding:12px 24px;background:rgba(255,255,255,0.05);color:#94a3b8;border-radius:10px;text-decoration:none;font-size:14px;font-weight:600;display:inline-flex;align-items:center;">Cancel</a>
                    </div>
                </form>
            </div>
        </div>
        <script>
            document.getElementById('createDealForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                const form = new FormData(e.target);
                const data = Object.fromEntries(form.entries());
                if (!data.company_id) delete data.company_id;
                if (!data.expected_close_at) delete data.expected_close_at;
                data.value = Number(data.value);
                data.probability = Number(data.probability);
                const res = await fetch('/api/deals', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...data, owner_id: '${user?.id ?? ''}', currency: 'IDR' }),
                });
                if (res.ok) { window.location.href = '/deals'; }
                else { const err = await res.json(); alert(err.error?.message || 'Failed'); }
            });
        </script>`;

        return res.html(renderPage({ title: 'New Deal', content, activePath: '/deals', user: user ? { name: user.name as string, role: user.role as string } : undefined }));
    }

    @Get('/:id')
    async detail(req: GaoRequest, res: GaoResponse) {
        const deal = await dealService.findById(req.params.id);
        if (!deal) return res.redirect('/deals');
        const stages = await dealService.getStages();
        const stageMap = new Map(stages.map(s => [s.id, s]));
        const currentStage = stageMap.get(deal.stage_id);
        const user = req.user as Record<string, unknown>;

        // Related data
        const activities = await activityService.list({ page: 1, perPage: 50 }, undefined, undefined, deal.id);
        const dealActivities = activities.activities.slice(0, 10);
        const notes = await noteService.listByNotable('deal', deal.id);

        // Contact & Company
        let contactHtml = '—';
        if (deal.contact_id) {
            const contact = await contactService.findById(deal.contact_id);
            if (contact) contactHtml = `<a href="/contacts/${contact.id}" style="color:#6366f1;text-decoration:none;">${escapeHtml(contact.first_name)} ${escapeHtml(contact.last_name)}</a>`;
        }
        let companyHtml = '—';
        if (deal.company_id) {
            const company = await companyService.findById(deal.company_id);
            if (company) companyHtml = `<a href="/companies/${company.id}" style="color:#6366f1;text-decoration:none;">${escapeHtml(company.name)}</a>`;
        }

        // Pipeline progress bar
        const pipelineStages = stages.filter(s => !s.is_lost);
        const pipelineHtml = pipelineStages.map(s => {
            const isActive = s.display_order <= (currentStage?.display_order ?? 0);
            return `<div style="flex:1;text-align:center;">
                <div style="height:8px;border-radius:4px;background:${isActive ? (s.color ?? '#6366f1') : 'rgba(255,255,255,0.1)'};margin-bottom:6px;"></div>
                <span style="font-size:11px;color:${isActive ? '#e2e8f0' : 'var(--gao-text-muted,#64748b)'};font-weight:${isActive ? '700' : '400'};">${escapeHtml(s.name)}</span>
            </div>`;
        }).join('');

        // Activities
        const activitiesHtml = dealActivities.length > 0 ? dealActivities.map(a => {
            const typeIcons: Record<string, string> = { call: '📞', meeting: '🤝', email: '📧', task: '✅', note: '📝' };
            return `<div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid rgba(100,116,139,0.15);">
                <span style="font-size:18px;">${typeIcons[a.type] ?? '📌'}</span>
                <div style="flex:1;"><div style="font-size:13px;font-weight:600;">${escapeHtml(a.subject)}</div><div style="font-size:12px;color:var(--gao-text-muted,#64748b);">${timeAgo(a.created_at)}</div></div>
                <span style="font-size:11px;font-weight:600;color:${a.is_completed ? '#22c55e' : '#f59e0b'};">${a.is_completed ? 'Done' : 'Pending'}</span>
            </div>`;
        }).join('') : '<p style="color:var(--gao-text-muted,#64748b);font-size:13px;padding:12px 0;">No activities yet</p>';

        // Notes
        const notesHtml = notes.length > 0 ? notes.map(n =>
            `<div style="padding:12px 0;border-bottom:1px solid rgba(100,116,139,0.15);">
                <p style="font-size:14px;line-height:1.6;margin:0;">${escapeHtml(n.content)}</p>
                <div style="font-size:12px;color:var(--gao-text-muted,#64748b);margin-top:6px;">${timeAgo(n.created_at)}</div>
            </div>`
        ).join('') : '<p style="color:var(--gao-text-muted,#64748b);font-size:13px;padding:12px 0;">No notes yet</p>';

        const content = `
        <div style="padding:8px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
                <div>
                    <h1 style="font-size:24px;font-weight:700;">${escapeHtml(deal.title)}</h1>
                    <p style="color:var(--gao-text-muted,#64748b);font-size:14px;margin-top:4px;">${formatCurrency(deal.value, deal.currency)}</p>
                </div>
                <div style="display:flex;gap:10px;align-items:center;">
                    <a href="/deals/${deal.id}/edit" style="padding:8px 18px;background:rgba(255,255,255,0.08);color:#e2e8f0;border-radius:8px;text-decoration:none;font-size:13px;font-weight:600;">✏️ Edit</a>
                    <span style="padding:6px 14px;border-radius:12px;font-size:12px;font-weight:700;color:#fff;background:${currentStage?.color ?? '#6366f1'}">${escapeHtml(currentStage?.name ?? '—')}</span>
                </div>
            </div>

            <div style="display:flex;gap:4px;margin-bottom:24px;">${pipelineHtml}</div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px;">
                <div class="gao-card" style="padding:24px;">
                    <h3 style="font-size:15px;font-weight:700;margin-bottom:16px;">Deal Information</h3>
                    <div style="display:grid;gap:12px;font-size:14px;">
                        <div><span style="color:var(--gao-text-muted,#64748b);min-width:120px;display:inline-block;">Contact:</span> ${contactHtml}</div>
                        <div><span style="color:var(--gao-text-muted,#64748b);min-width:120px;display:inline-block;">Company:</span> ${companyHtml}</div>
                        <div><span style="color:var(--gao-text-muted,#64748b);min-width:120px;display:inline-block;">Probability:</span> ${deal.probability}%</div>
                        <div><span style="color:var(--gao-text-muted,#64748b);min-width:120px;display:inline-block;">Expected Close:</span> ${deal.expected_close_at ?? '—'}</div>
                        <div><span style="color:var(--gao-text-muted,#64748b);min-width:120px;display:inline-block;">Won:</span> ${deal.won_at ? '✅ ' + timeAgo(deal.won_at) : '—'}</div>
                        <div><span style="color:var(--gao-text-muted,#64748b);min-width:120px;display:inline-block;">Lost:</span> ${deal.lost_at ? '❌ ' + timeAgo(deal.lost_at) : '—'}</div>
                        <div><span style="color:var(--gao-text-muted,#64748b);min-width:120px;display:inline-block;">Created:</span> ${timeAgo(deal.created_at)}</div>
                    </div>
                </div>
                <div class="gao-card" style="padding:24px;">
                    <h3 style="font-size:15px;font-weight:700;margin-bottom:16px;">Activities</h3>
                    ${activitiesHtml}
                </div>
            </div>

            <div class="gao-card" style="padding:24px;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                    <h3 style="font-size:15px;font-weight:700;">Notes</h3>
                </div>
                ${notesHtml}
                <form id="addNoteForm" style="margin-top:16px;">
                    <textarea name="content" placeholder="Add a note..." rows="2" required style="${inputStyle}resize:vertical;font-size:13px;"></textarea>
                    <button type="submit" style="margin-top:8px;padding:8px 16px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border:none;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;">Add Note</button>
                </form>
            </div>
        </div>
        <script>
            document.getElementById('addNoteForm')?.addEventListener('submit', async (e) => {
                e.preventDefault();
                const content = new FormData(e.target).get('content');
                const res = await fetch('/api/notes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ notable_type: 'deal', notable_id: '${deal.id}', content }),
                });
                if (res.ok) { window.location.reload(); }
                else { const err = await res.json(); alert(err.error?.message || 'Failed'); }
            });
        </script>`;

        return res.html(renderPage({ title: deal.title, content, activePath: '/deals', user: user ? { name: user.name as string, role: user.role as string } : undefined }));
    }

    @Get('/:id/edit')
    async editForm(req: GaoRequest, res: GaoResponse) {
        const deal = await dealService.findById(req.params.id);
        if (!deal) return res.redirect('/deals');
        const user = req.user as Record<string, unknown>;
        const stages = await dealService.getStages();
        const contacts = await contactService.list({ page: 1, perPage: 200 });
        const companies = await companyService.list({ page: 1, perPage: 200 });

        const stageOptions = stages.map(s =>
            `<option value="${s.id}" ${s.id === deal.stage_id ? 'selected' : ''}>${escapeHtml(s.name)}</option>`
        ).join('');
        const contactOptions = contacts.contacts.map(c =>
            `<option value="${c.id}" ${c.id === deal.contact_id ? 'selected' : ''}>${escapeHtml(c.first_name)} ${escapeHtml(c.last_name)}</option>`
        ).join('');
        const companyOptions = companies.companies.map(c =>
            `<option value="${c.id}" ${c.id === deal.company_id ? 'selected' : ''}>${escapeHtml(c.name)}</option>`
        ).join('');

        const content = `
        <div style="padding:8px;">
            <h1 style="font-size:24px;font-weight:700;margin-bottom:24px;">Edit Deal</h1>
            <div class="gao-card" style="padding:32px;max-width:720px;">
                <form id="editDealForm">
                    <div><label style="${labelStyle}">Title *</label><input type="text" name="title" value="${escapeHtml(deal.title)}" required style="${inputStyle}"></div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px;">
                        <div><label style="${labelStyle}">Value (IDR)</label><input type="number" name="value" value="${deal.value}" min="0" style="${inputStyle}"></div>
                        <div><label style="${labelStyle}">Stage</label><select name="stage_id" style="${inputStyle}">${stageOptions}</select></div>
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px;">
                        <div><label style="${labelStyle}">Contact</label><select name="contact_id" style="${inputStyle}"><option value="">— Select —</option>${contactOptions}</select></div>
                        <div><label style="${labelStyle}">Company</label><select name="company_id" style="${inputStyle}"><option value="">— None —</option>${companyOptions}</select></div>
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px;">
                        <div><label style="${labelStyle}">Probability (%)</label><input type="number" name="probability" value="${deal.probability}" min="0" max="100" style="${inputStyle}"></div>
                        <div><label style="${labelStyle}">Expected Close</label><input type="date" name="expected_close_at" value="${deal.expected_close_at ?? ''}" style="${inputStyle}"></div>
                    </div>
                    <div style="margin-top:16px;">
                        <label style="${labelStyle}">Notes</label><textarea name="notes" rows="3" style="${inputStyle}resize:vertical;">${escapeHtml(deal.notes ?? '')}</textarea>
                    </div>
                    <div style="margin-top:24px;display:flex;gap:12px;">
                        <button type="submit" style="padding:12px 24px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;">Update Deal</button>
                        <a href="/deals/${deal.id}" style="padding:12px 24px;background:rgba(255,255,255,0.05);color:#94a3b8;border-radius:10px;text-decoration:none;font-size:14px;font-weight:600;display:inline-flex;align-items:center;">Cancel</a>
                    </div>
                </form>
            </div>
        </div>
        <script>
            document.getElementById('editDealForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                const form = new FormData(e.target);
                const data = Object.fromEntries(form.entries());
                if (!data.company_id) delete data.company_id;
                if (!data.expected_close_at) delete data.expected_close_at;
                data.value = Number(data.value);
                data.probability = Number(data.probability);
                const res = await fetch('/api/deals/${deal.id}', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                });
                if (res.ok) { window.location.href = '/deals/${deal.id}'; }
                else { const err = await res.json(); alert(err.error?.message || 'Failed'); }
            });
        </script>`;

        return res.html(renderPage({ title: `Edit ${deal.title}`, content, activePath: '/deals', user: user ? { name: user.name as string, role: user.role as string } : undefined }));
    }
}
