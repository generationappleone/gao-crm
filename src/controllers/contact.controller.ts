import { Controller, Get } from '@gao/http';
import type { GaoRequest, GaoResponse } from '@gao/http';
import { renderPage } from '../views/renderer.js';
import { ContactService } from '../services/contact.service.js';
import { CompanyService } from '../services/company.service.js';
import { DealService } from '../services/deal.service.js';
import { ActivityService } from '../services/activity.service.js';
import { NoteService } from '../services/note.service.js';
import { parsePagination, renderPaginationHtml } from '../helpers/pagination.js';
import { escapeHtml } from '../helpers/escape.js';
import { formatCurrency, timeAgo } from '../helpers/format.js';

const contactService = new ContactService();
const companyService = new CompanyService();
const dealService = new DealService();
const activityService = new ActivityService();
const noteService = new NoteService();

const STATUS_COLORS: Record<string, string> = {
    lead: '#94a3b8',
    prospect: '#3b82f6',
    customer: '#22c55e',
    churned: '#ef4444',
};

const inputStyle = `width:100%;padding:10px 14px;background:rgba(15,23,42,0.6);border:1px solid rgba(100,116,139,0.3);border-radius:8px;color:#e2e8f0;font-size:14px;outline:none;`;
const labelStyle = `display:block;font-size:13px;font-weight:600;color:#cbd5e1;margin-bottom:6px;`;

@Controller('/contacts')
export class ContactController {
    @Get('/')
    async list(req: GaoRequest, res: GaoResponse) {
        const pagination = parsePagination(req.query);
        const result = await contactService.list(pagination, req.query.search, req.query.status);
        const user = req.user as Record<string, unknown>;

        const tableRows = result.contacts.map((c) => {
            const initials = `${(c.first_name?.[0] ?? '').toUpperCase()}${(c.last_name?.[0] ?? '').toUpperCase()}`;
            return `<tr>
                <td>
                    <div style="display:flex;align-items:center;gap:12px;">
                        <div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#8b5cf6);display:flex;align-items:center;justify-content:center;color:#fff;font-size:13px;font-weight:700;flex-shrink:0;">${initials}</div>
                        <div>
                            <a href="/contacts/${c.id}" style="color:#e2e8f0;text-decoration:none;font-weight:600;">${escapeHtml(c.first_name)} ${escapeHtml(c.last_name)}</a>
                            <div style="font-size:12px;color:var(--gao-text-muted,#64748b);">${escapeHtml(c.email ?? '')}</div>
                        </div>
                    </div>
                </td>
                <td style="color:var(--gao-text-muted,#64748b);">${escapeHtml(c.position ?? '—')}</td>
                <td><span style="padding:4px 10px;border-radius:12px;font-size:11px;font-weight:700;color:#fff;background:${STATUS_COLORS[c.status] ?? '#6366f1'}">${escapeHtml(c.status)}</span></td>
                <td style="font-size:13px;color:var(--gao-text-muted,#64748b);">${timeAgo(c.created_at)}</td>
            </tr>`;
        }).join('');

        const content = `
        <div style="padding:8px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
                <h1 style="font-size:24px;font-weight:700;">Contacts</h1>
                <a href="/contacts/create" style="padding:10px 20px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border-radius:10px;text-decoration:none;font-size:13px;font-weight:700;">+ New Contact</a>
            </div>
            <div class="gao-card" style="padding:24px;">
                <div class="gao-admin-table-wrapper">
                    <table class="gao-admin-table">
                        <thead><tr><th>Contact</th><th>Position</th><th>Status</th><th>Created</th></tr></thead>
                        <tbody>${tableRows || '<tr><td colspan="4" style="text-align:center;padding:40px;color:var(--gao-text-muted,#64748b);">No contacts found</td></tr>'}</tbody>
                    </table>
                </div>
                ${renderPaginationHtml(result.meta, '/contacts')}
            </div>
        </div>`;

        return res.html(renderPage({ title: 'Contacts', content, activePath: '/contacts', user: user ? { name: user.name as string, role: user.role as string } : undefined }));
    }

    @Get('/create')
    async createForm(req: GaoRequest, res: GaoResponse) {
        const user = req.user as Record<string, unknown>;
        const companies = await companyService.list({ page: 1, perPage: 100 });

        const companyOptions = companies.companies.map(c =>
            `<option value="${c.id}">${escapeHtml(c.name)}</option>`
        ).join('');

        const content = `
        <div style="padding:8px;">
            <h1 style="font-size:24px;font-weight:700;margin-bottom:24px;">New Contact</h1>
            <div class="gao-card" style="padding:32px;max-width:720px;">
                <form id="createContactForm">
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                        <div><label style="${labelStyle}">First Name *</label><input type="text" name="first_name" required style="${inputStyle}"></div>
                        <div><label style="${labelStyle}">Last Name *</label><input type="text" name="last_name" required style="${inputStyle}"></div>
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px;">
                        <div><label style="${labelStyle}">Email</label><input type="email" name="email" style="${inputStyle}"></div>
                        <div><label style="${labelStyle}">Phone</label><input type="tel" name="phone" style="${inputStyle}"></div>
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px;">
                        <div><label style="${labelStyle}">Position</label><input type="text" name="position" style="${inputStyle}"></div>
                        <div><label style="${labelStyle}">Status</label><select name="status" style="${inputStyle}"><option value="lead">Lead</option><option value="prospect">Prospect</option><option value="customer">Customer</option></select></div>
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px;">
                        <div><label style="${labelStyle}">Company</label><select name="company_id" style="${inputStyle}"><option value="">— None —</option>${companyOptions}</select></div>
                        <div><label style="${labelStyle}">Source</label><input type="text" name="source" placeholder="e.g. website, referral" style="${inputStyle}"></div>
                    </div>
                    <div style="margin-top:16px;">
                        <label style="${labelStyle}">City</label><input type="text" name="city" style="${inputStyle}">
                    </div>
                    <div style="margin-top:16px;">
                        <label style="${labelStyle}">Notes</label><textarea name="notes" rows="3" style="${inputStyle}resize:vertical;"></textarea>
                    </div>
                    <div style="margin-top:24px;display:flex;gap:12px;">
                        <button type="submit" style="padding:12px 24px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;">Save Contact</button>
                        <a href="/contacts" style="padding:12px 24px;background:rgba(255,255,255,0.05);color:#94a3b8;border-radius:10px;text-decoration:none;font-size:14px;font-weight:600;display:inline-flex;align-items:center;">Cancel</a>
                    </div>
                </form>
            </div>
        </div>
        <script>
            document.getElementById('createContactForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                const form = new FormData(e.target);
                const data = Object.fromEntries(form.entries());
                if (!data.company_id) delete data.company_id;
                const res = await fetch('/api/contacts', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...data, owner_id: '${user?.id ?? ''}' }),
                });
                if (res.ok) { window.location.href = '/contacts'; }
                else { const err = await res.json(); alert(err.error?.message || 'Failed to create contact'); }
            });
        </script>`;

        return res.html(renderPage({ title: 'New Contact', content, activePath: '/contacts', user: user ? { name: user.name as string, role: user.role as string } : undefined }));
    }

    @Get('/:id')
    async detail(req: GaoRequest, res: GaoResponse) {
        const contact = await contactService.findById(req.params.id);
        if (!contact) return res.redirect('/contacts');

        const user = req.user as Record<string, unknown>;

        // Fetch related data
        const deals = await dealService.list({ page: 1, perPage: 50 });
        const contactDeals = deals.deals.filter(d => d.contact_id === contact.id);
        const stages = await dealService.getStages();
        const stageMap = new Map(stages.map(s => [s.id, s]));

        const activities = await activityService.list({ page: 1, perPage: 50 }, undefined, contact.id);
        const contactActivities = activities.activities.slice(0, 10);

        const notes = await noteService.listByNotable('contact', contact.id);

        // Company info
        let companyName = '—';
        if (contact.company_id) {
            const company = await companyService.findById(contact.company_id);
            if (company) companyName = `<a href="/companies/${company.id}" style="color:#6366f1;text-decoration:none;">${escapeHtml(company.name)}</a>`;
        }

        const initials = `${(contact.first_name?.[0] ?? '').toUpperCase()}${(contact.last_name?.[0] ?? '').toUpperCase()}`;

        // Deals table
        const dealsHtml = contactDeals.length > 0 ? contactDeals.map(d => {
            const stage = stageMap.get(d.stage_id);
            return `<tr>
                <td><a href="/deals/${d.id}" style="color:#e2e8f0;text-decoration:none;font-weight:600;">${escapeHtml(d.title)}</a></td>
                <td style="font-weight:600;">${formatCurrency(d.value, d.currency)}</td>
                <td><span style="padding:3px 8px;border-radius:10px;font-size:11px;font-weight:700;color:#fff;background:${stage?.color ?? '#6366f1'}">${escapeHtml(stage?.name ?? '—')}</span></td>
            </tr>`;
        }).join('') : '<tr><td colspan="3" style="text-align:center;padding:20px;color:var(--gao-text-muted,#64748b);font-size:13px;">No deals yet</td></tr>';

        // Activities list
        const activitiesHtml = contactActivities.length > 0 ? contactActivities.map(a => {
            const typeIcons: Record<string, string> = { call: '📞', meeting: '🤝', email: '📧', task: '✅', note: '📝' };
            const icon = typeIcons[a.type] ?? '📌';
            return `<div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid rgba(100,116,139,0.15);">
                <span style="font-size:18px;">${icon}</span>
                <div style="flex:1;">
                    <div style="font-size:13px;font-weight:600;">${escapeHtml(a.subject)}</div>
                    <div style="font-size:12px;color:var(--gao-text-muted,#64748b);">${timeAgo(a.created_at)}</div>
                </div>
                <span style="font-size:11px;font-weight:600;color:${a.is_completed ? '#22c55e' : '#f59e0b'};">${a.is_completed ? 'Done' : 'Pending'}</span>
            </div>`;
        }).join('') : '<p style="color:var(--gao-text-muted,#64748b);font-size:13px;padding:12px 0;">No activities yet</p>';

        // Notes list
        const notesHtml = notes.length > 0 ? notes.map(n =>
            `<div style="padding:12px 0;border-bottom:1px solid rgba(100,116,139,0.15);">
                <p style="font-size:14px;line-height:1.6;margin:0;">${escapeHtml(n.content)}</p>
                <div style="font-size:12px;color:var(--gao-text-muted,#64748b);margin-top:6px;">${timeAgo(n.created_at)}</div>
            </div>`
        ).join('') : '<p style="color:var(--gao-text-muted,#64748b);font-size:13px;padding:12px 0;">No notes yet</p>';

        const content = `
        <div style="padding:8px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
                <div style="display:flex;align-items:center;gap:16px;">
                    <div style="width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#8b5cf6);display:flex;align-items:center;justify-content:center;color:#fff;font-size:20px;font-weight:700;">${initials}</div>
                    <div>
                        <h1 style="font-size:24px;font-weight:700;">${escapeHtml(contact.first_name)} ${escapeHtml(contact.last_name)}</h1>
                        <p style="color:var(--gao-text-muted,#64748b);font-size:14px;margin-top:2px;">${escapeHtml(contact.position ?? 'No position')} ${contact.email ? '· ' + escapeHtml(contact.email) : ''}</p>
                    </div>
                </div>
                <div style="display:flex;gap:10px;align-items:center;">
                    <a href="/contacts/${contact.id}/edit" style="padding:8px 18px;background:rgba(255,255,255,0.08);color:#e2e8f0;border-radius:8px;text-decoration:none;font-size:13px;font-weight:600;">✏️ Edit</a>
                    <span style="padding:6px 14px;border-radius:12px;font-size:12px;font-weight:700;color:#fff;background:${STATUS_COLORS[contact.status] ?? '#6366f1'}">${escapeHtml(contact.status)}</span>
                </div>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px;">
                <div class="gao-card" style="padding:24px;">
                    <h3 style="font-size:15px;font-weight:700;margin-bottom:16px;">Contact Information</h3>
                    <div style="display:grid;gap:12px;font-size:14px;">
                        <div><span style="color:var(--gao-text-muted,#64748b);min-width:100px;display:inline-block;">Phone:</span> ${escapeHtml(contact.phone ?? '—')}</div>
                        <div><span style="color:var(--gao-text-muted,#64748b);min-width:100px;display:inline-block;">Email:</span> ${escapeHtml(contact.email ?? '—')}</div>
                        <div><span style="color:var(--gao-text-muted,#64748b);min-width:100px;display:inline-block;">Company:</span> ${companyName}</div>
                        <div><span style="color:var(--gao-text-muted,#64748b);min-width:100px;display:inline-block;">City:</span> ${escapeHtml(contact.city ?? '—')}</div>
                        <div><span style="color:var(--gao-text-muted,#64748b);min-width:100px;display:inline-block;">Source:</span> ${escapeHtml(contact.source ?? '—')}</div>
                        <div><span style="color:var(--gao-text-muted,#64748b);min-width:100px;display:inline-block;">Created:</span> ${timeAgo(contact.created_at)}</div>
                    </div>
                </div>
                <div class="gao-card" style="padding:24px;">
                    <h3 style="font-size:15px;font-weight:700;margin-bottom:16px;">Deals (${contactDeals.length})</h3>
                    <div class="gao-admin-table-wrapper">
                        <table class="gao-admin-table" style="font-size:13px;">
                            <thead><tr><th>Deal</th><th>Value</th><th>Stage</th></tr></thead>
                            <tbody>${dealsHtml}</tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
                <div class="gao-card" style="padding:24px;">
                    <h3 style="font-size:15px;font-weight:700;margin-bottom:16px;">Activities</h3>
                    ${activitiesHtml}
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
        </div>
        <script>
            document.getElementById('addNoteForm')?.addEventListener('submit', async (e) => {
                e.preventDefault();
                const content = new FormData(e.target).get('content');
                const res = await fetch('/api/notes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ notable_type: 'contact', notable_id: '${contact.id}', content }),
                });
                if (res.ok) { window.location.reload(); }
                else { const err = await res.json(); alert(err.error?.message || 'Failed'); }
            });
        </script>`;

        return res.html(renderPage({ title: `${contact.first_name} ${contact.last_name}`, content, activePath: '/contacts', user: user ? { name: user.name as string, role: user.role as string } : undefined }));
    }

    @Get('/:id/edit')
    async editForm(req: GaoRequest, res: GaoResponse) {
        const contact = await contactService.findById(req.params.id);
        if (!contact) return res.redirect('/contacts');
        const user = req.user as Record<string, unknown>;
        const companies = await companyService.list({ page: 1, perPage: 100 });

        const companyOptions = companies.companies.map(c =>
            `<option value="${c.id}" ${c.id === contact.company_id ? 'selected' : ''}>${escapeHtml(c.name)}</option>`
        ).join('');

        const content = `
        <div style="padding:8px;">
            <h1 style="font-size:24px;font-weight:700;margin-bottom:24px;">Edit Contact</h1>
            <div class="gao-card" style="padding:32px;max-width:720px;">
                <form id="editContactForm">
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                        <div><label style="${labelStyle}">First Name *</label><input type="text" name="first_name" value="${escapeHtml(contact.first_name)}" required style="${inputStyle}"></div>
                        <div><label style="${labelStyle}">Last Name *</label><input type="text" name="last_name" value="${escapeHtml(contact.last_name)}" required style="${inputStyle}"></div>
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px;">
                        <div><label style="${labelStyle}">Email</label><input type="email" name="email" value="${escapeHtml(contact.email ?? '')}" style="${inputStyle}"></div>
                        <div><label style="${labelStyle}">Phone</label><input type="tel" name="phone" value="${escapeHtml(contact.phone ?? '')}" style="${inputStyle}"></div>
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px;">
                        <div><label style="${labelStyle}">Position</label><input type="text" name="position" value="${escapeHtml(contact.position ?? '')}" style="${inputStyle}"></div>
                        <div><label style="${labelStyle}">Status</label><select name="status" style="${inputStyle}">
                            <option value="lead" ${contact.status === 'lead' ? 'selected' : ''}>Lead</option>
                            <option value="prospect" ${contact.status === 'prospect' ? 'selected' : ''}>Prospect</option>
                            <option value="customer" ${contact.status === 'customer' ? 'selected' : ''}>Customer</option>
                            <option value="churned" ${contact.status === 'churned' ? 'selected' : ''}>Churned</option>
                        </select></div>
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px;">
                        <div><label style="${labelStyle}">Company</label><select name="company_id" style="${inputStyle}"><option value="">— None —</option>${companyOptions}</select></div>
                        <div><label style="${labelStyle}">Source</label><input type="text" name="source" value="${escapeHtml(contact.source ?? '')}" style="${inputStyle}"></div>
                    </div>
                    <div style="margin-top:16px;">
                        <label style="${labelStyle}">City</label><input type="text" name="city" value="${escapeHtml(contact.city ?? '')}" style="${inputStyle}">
                    </div>
                    <div style="margin-top:16px;">
                        <label style="${labelStyle}">Notes</label><textarea name="notes" rows="3" style="${inputStyle}resize:vertical;">${escapeHtml(contact.notes ?? '')}</textarea>
                    </div>
                    <div style="margin-top:24px;display:flex;gap:12px;">
                        <button type="submit" style="padding:12px 24px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;">Update Contact</button>
                        <a href="/contacts/${contact.id}" style="padding:12px 24px;background:rgba(255,255,255,0.05);color:#94a3b8;border-radius:10px;text-decoration:none;font-size:14px;font-weight:600;display:inline-flex;align-items:center;">Cancel</a>
                    </div>
                </form>
            </div>
        </div>
        <script>
            document.getElementById('editContactForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                const form = new FormData(e.target);
                const data = Object.fromEntries(form.entries());
                if (!data.company_id) delete data.company_id;
                const res = await fetch('/api/contacts/${contact.id}', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                });
                if (res.ok) { window.location.href = '/contacts/${contact.id}'; }
                else { const err = await res.json(); alert(err.error?.message || 'Failed to update'); }
            });
        </script>`;

        return res.html(renderPage({ title: `Edit ${contact.first_name}`, content, activePath: '/contacts', user: user ? { name: user.name as string, role: user.role as string } : undefined }));
    }
}
