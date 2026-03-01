/**
 * GAO CRM — CRM Contacts Controller (Enhanced)
 *
 * Consolidated contacts page with People/Companies tab switcher,
 * enriched table rows, status filter tabs, and integrated search.
 *
 * Routes:
 *   GET /crm/contacts              → contacts list (people tab)
 *   GET /crm/contacts?tab=companies → companies tab
 *   GET /crm/contacts/create       → new contact form
 *   GET /crm/contacts/:id          → contact detail (delegates to original)
 *   GET /crm/contacts/:id/edit     → contact edit (delegates to original)
 *   GET /crm/companies/:id         → company detail (delegates to original)
 *   GET /crm/companies/create      → new company form (delegates to original)
 */

import { Controller, Get } from '@gao/http';
import type { GaoRequest, GaoResponse } from '@gao/http';
import { renderPage } from '../../views/renderer.js';
import { ContactService } from '../../services/contact.service.js';
import { CompanyService } from '../../services/company.service.js';
import { DealService } from '../../services/deal.service.js';
import { ActivityService } from '../../services/activity.service.js';
import { NoteService } from '../../services/note.service.js';
import { parsePagination, renderPaginationHtml } from '../../helpers/pagination.js';
import { escapeHtml } from '../../helpers/escape.js';
import { formatCurrency, timeAgo, formatNumber } from '../../helpers/format.js';
import { emptyState } from '../../helpers/empty-state.js';
import {
    renderSectionHeader,
    renderQuickAddDropdown,
    renderTabSwitcher,
    renderAvatar,
    renderBadge,
    renderStatCard,
    renderCrmStyles,
    STATUS_COLORS,
    cardStyle,
    inputStyle,
    labelStyle,
} from '../../helpers/crm-shared.js';
import { url } from '../../helpers/url.js';

const contactService = new ContactService();
const companyService = new CompanyService();
const dealService = new DealService();
const activityService = new ActivityService();
const noteService = new NoteService();

@Controller('/crm')
export class CrmContactsController {

    // ─── People List (default tab) ───────────────────────
    @Get('/contacts')
    async contactsList(req: GaoRequest, res: GaoResponse) {
        const user = req.user as Record<string, unknown>;
        const tab = req.query.tab === 'companies' ? 'companies' : 'people';

        if (tab === 'companies') {
            return this.companiesList(req, res);
        }

        const pagination = parsePagination(req.query);
        const result = await contactService.list(pagination, req.query.search, req.query.status);

        // Fetch companies for display
        const companiesResult = await companyService.list({ page: 1, perPage: 500 });
        const companyMap = new Map(companiesResult.companies.map(c => [c.id, c]));

        // Fetch deal counts per contact
        const dealsResult = await dealService.list({ page: 1, perPage: 1000 });
        const dealCountByContact = new Map<string, { count: number; totalValue: number }>();
        for (const d of dealsResult.deals) {
            const existing = dealCountByContact.get(d.contact_id) ?? { count: 0, totalValue: 0 };
            existing.count++;
            existing.totalValue += Number(d.value);
            dealCountByContact.set(d.contact_id, existing);
        }

        // Enriched table rows
        const tableRows = result.contacts.map((c) => {
            const company = c.company_id ? companyMap.get(c.company_id) : null;
            const dealInfo = dealCountByContact.get(c.id);
            return `<tr style="transition:background 0.15s;" onmouseover="this.style.background='rgba(255,255,255,0.02)'" onmouseout="this.style.background=''">
                <td>
                    <div style="display:flex;align-items:center;gap:12px;">
                        ${renderAvatar(c.first_name, c.last_name)}
                        <div>
                            <a href="/crm/contacts/${c.id}" style="color:#e2e8f0;text-decoration:none;font-weight:600;">${escapeHtml(c.first_name)} ${escapeHtml(c.last_name)}</a>
                            <div style="font-size:12px;color:var(--gao-text-muted,#64748b);">${escapeHtml(c.email ?? '')}</div>
                        </div>
                    </div>
                </td>
                <td style="color:var(--gao-text-muted,#64748b);font-size:13px;">${escapeHtml(c.position ?? '—')}</td>
                <td>${company ? `<a href="/crm/companies/${company.id}" style="color:#818cf8;text-decoration:none;font-size:13px;">${escapeHtml(company.name)}</a>` : '<span style="color:var(--gao-text-muted,#64748b);font-size:13px;">—</span>'}</td>
                <td>${renderBadge(c.status, STATUS_COLORS[c.status] ?? '#6366f1')}</td>
                <td style="font-size:13px;color:var(--gao-text-muted,#64748b);">${dealInfo ? `<span style="color:#a78bfa;font-weight:600;">${dealInfo.count}</span> deals` : '—'}</td>
                <td style="font-size:13px;color:var(--gao-text-muted,#64748b);">${timeAgo(c.created_at)}</td>
            </tr>`;
        }).join('');

        const currentSearch = typeof req.query.search === 'string' ? req.query.search : '';
        const currentStatus = typeof req.query.status === 'string' ? req.query.status : '';
        const filterBase = `/crm/contacts?${currentSearch ? 'search=' + encodeURIComponent(currentSearch) + '&' : ''}`;

        // Count for tabs
        const totalPeople = result.meta.total;
        const totalCompanies = companiesResult.meta.total;

        const content = `
        <div style="padding:8px;">
            ${renderCrmStyles()}
            ${renderSectionHeader('CRM Contacts', renderQuickAddDropdown())}

            ${renderTabSwitcher([
            { label: 'People', icon: '👥', href: '/crm/contacts', active: true, count: totalPeople },
            { label: 'Companies', icon: '🏢', href: '/crm/contacts?tab=companies', active: false, count: totalCompanies },
        ])}

            <!-- Search Bar -->
            <form action="/crm/contacts" method="GET" style="display:flex;gap:8px;margin-bottom:16px;">
                <input name="search" value="${escapeHtml(currentSearch)}" placeholder="🔍 Search by name, email, or company..." style="flex:1;${inputStyle}" />
                ${currentStatus ? `<input type="hidden" name="status" value="${escapeHtml(currentStatus)}" />` : ''}
                <button type="submit" style="padding:10px 20px;background:rgba(99,102,241,0.15);color:#818cf8;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;transition:background 0.2s;" onmouseover="this.style.background='rgba(99,102,241,0.25)'" onmouseout="this.style.background='rgba(99,102,241,0.15)'">Search</button>
                ${currentSearch ? `<a href="/crm/contacts${currentStatus ? '?status=' + currentStatus : ''}" style="padding:10px 16px;background:rgba(255,255,255,0.06);color:#94a3b8;border-radius:8px;text-decoration:none;font-size:13px;">Clear</a>` : ''}
            </form>

            <!-- Status Filter Tabs -->
            <div style="display:flex;gap:6px;margin-bottom:20px;flex-wrap:wrap;">
                ${[{ label: 'All', value: '' }, { label: '🔵 Lead', value: 'lead' }, { label: '🟣 Prospect', value: 'prospect' }, { label: '🟢 Customer', value: 'customer' }, { label: '🔴 Churned', value: 'churned' }].map(s => `
                    <a href="${filterBase}${s.value ? 'status=' + s.value : ''}" style="padding:7px 16px;border-radius:8px;font-size:12px;font-weight:700;text-decoration:none;transition:all 0.15s;${currentStatus === s.value ? 'background:rgba(99,102,241,0.2);color:#818cf8;' : 'background:rgba(255,255,255,0.04);color:#94a3b8;'}" 
                       onmouseover="if(!this.classList.contains('active'))this.style.background='rgba(255,255,255,0.06)'" 
                       onmouseout="if(!this.classList.contains('active'))this.style.background='rgba(255,255,255,0.04)'">${s.label}</a>
                `).join('')}
            </div>

            <div style="${cardStyle}">
                <div class="gao-admin-table-wrapper">
                    <table class="gao-admin-table">
                        <thead><tr>
                            <th>Contact</th><th>Position</th><th>Company</th><th>Status</th><th>Deals</th><th>Created</th>
                        </tr></thead>
                        <tbody>${tableRows || '<tr><td colspan="6">' + emptyState({ icon: 'contacts', title: 'No contacts yet', description: 'Add your first contact to start building relationships.', action: { label: '+ Add Contact', href: '/crm/contacts/create' } }) + '</td></tr>'}</tbody>
                    </table>
                </div>
                ${renderPaginationHtml(result.meta, '/crm/contacts')}
            </div>
        </div>`;

        return res.html(renderPage({ title: 'Contacts', content, activePath: '/crm/contacts', user: user ? { name: user.name as string, role: user.role as string } : undefined }));
    }

    // ─── Companies List (sub-tab) ────────────────────────
    private async companiesList(req: GaoRequest, res: GaoResponse) {
        const user = req.user as Record<string, unknown>;
        const pagination = parsePagination(req.query);
        const result = await companyService.list(pagination, req.query.search);

        // Fetch deal counts per company
        const dealsResult = await dealService.list({ page: 1, perPage: 1000 });
        const dealsByCompany = new Map<string, { count: number; totalValue: number }>();
        for (const d of dealsResult.deals) {
            if (!d.company_id) continue;
            const existing = dealsByCompany.get(d.company_id) ?? { count: 0, totalValue: 0 };
            existing.count++;
            existing.totalValue += Number(d.value);
            dealsByCompany.set(d.company_id, existing);
        }

        // Fetch contact counts per company
        const contactsResult = await contactService.list({ page: 1, perPage: 1000 });
        const contactCountByCompany = new Map<string, number>();
        for (const c of contactsResult.contacts) {
            if (!c.company_id) continue;
            contactCountByCompany.set(c.company_id, (contactCountByCompany.get(c.company_id) ?? 0) + 1);
        }

        // Count for tabs
        const totalPeople = contactsResult.meta.total;
        const totalCompanies = result.meta.total;

        const tableRows = result.companies.map(c => {
            const dealInfo = dealsByCompany.get(c.id);
            const contactCount = contactCountByCompany.get(c.id) ?? 0;
            return `<tr style="transition:background 0.15s;" onmouseover="this.style.background='rgba(255,255,255,0.02)'" onmouseout="this.style.background=''">
                <td>
                    <div style="display:flex;align-items:center;gap:12px;">
                        <div style="width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#8b5cf6,#6366f1);display:flex;align-items:center;justify-content:center;color:#fff;font-size:16px;flex-shrink:0;">🏢</div>
                        <div>
                            <a href="/crm/companies/${c.id}" style="color:#e2e8f0;text-decoration:none;font-weight:600;">${escapeHtml(c.name)}</a>
                            <div style="font-size:12px;color:var(--gao-text-muted,#64748b);">${escapeHtml(c.industry ?? '')}</div>
                        </div>
                    </div>
                </td>
                <td style="font-size:13px;color:var(--gao-text-muted,#64748b);">${escapeHtml(c.city ?? '—')}</td>
                <td style="font-size:13px;color:var(--gao-text-muted,#64748b);">${c.employee_count ? formatNumber(c.employee_count) : '—'}</td>
                <td style="font-size:13px;">
                    <span style="color:#a78bfa;font-weight:600;">${contactCount}</span>
                    <span style="color:var(--gao-text-muted,#64748b);"> contacts</span>
                </td>
                <td style="font-size:13px;">
                    ${dealInfo ? `<span style="color:#f59e0b;font-weight:600;">${dealInfo.count}</span> <span style="color:var(--gao-text-muted,#64748b);">deals (${formatCurrency(dealInfo.totalValue)})</span>` : '<span style="color:var(--gao-text-muted,#64748b);">—</span>'}
                </td>
                <td style="font-size:13px;color:var(--gao-text-muted,#64748b);">${timeAgo(c.created_at)}</td>
            </tr>`;
        }).join('');

        const currentSearch = typeof req.query.search === 'string' ? req.query.search : '';

        const content = `
        <div style="padding:8px;">
            ${renderSectionHeader('CRM Contacts', renderQuickAddDropdown())}

            ${renderTabSwitcher([
            { label: 'People', icon: '👥', href: '/crm/contacts', active: false, count: totalPeople },
            { label: 'Companies', icon: '🏢', href: '/crm/contacts?tab=companies', active: true, count: totalCompanies },
        ])}

            <!-- Search Bar -->
            <form action="/crm/contacts" method="GET" style="display:flex;gap:8px;margin-bottom:20px;">
                <input type="hidden" name="tab" value="companies" />
                <input name="search" value="${escapeHtml(currentSearch)}" placeholder="🔍 Search companies..." style="flex:1;${inputStyle}" />
                <button type="submit" style="padding:10px 20px;background:rgba(99,102,241,0.15);color:#818cf8;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;">Search</button>
                ${currentSearch ? `<a href="/crm/contacts?tab=companies" style="padding:10px 16px;background:rgba(255,255,255,0.06);color:#94a3b8;border-radius:8px;text-decoration:none;font-size:13px;">Clear</a>` : ''}
            </form>

            <div style="${cardStyle}">
                <div class="gao-admin-table-wrapper">
                    <table class="gao-admin-table">
                        <thead><tr>
                            <th>Company</th><th>City</th><th>Employees</th><th>Contacts</th><th>Deals</th><th>Created</th>
                        </tr></thead>
                        <tbody>${tableRows || '<tr><td colspan="6">' + emptyState({ icon: 'companies', title: 'No companies yet', description: 'Add your first company to organize your contacts.', action: { label: '+ Add Company', href: '/crm/companies/create' } }) + '</td></tr>'}</tbody>
                    </table>
                </div>
                ${renderPaginationHtml(result.meta, '/crm/contacts?tab=companies')}
            </div>
        </div>`;

        return res.html(renderPage({ title: 'Companies', content, activePath: '/crm/contacts', user: user ? { name: user.name as string, role: user.role as string } : undefined }));
    }

    // ─── Contact Create Form ─────────────────────────────
    @Get('/contacts/create')
    async createContact(req: GaoRequest, res: GaoResponse) {
        const user = req.user as Record<string, unknown>;
        const companies = await companyService.list({ page: 1, perPage: 100 });
        const companyOptions = companies.companies.map(c =>
            `<option value="${c.id}">${escapeHtml(c.name)}</option>`
        ).join('');

        const content = `
        <div style="padding:8px;">
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px;">
                <a href="/crm/contacts" style="color:#94a3b8;text-decoration:none;font-size:13px;display:flex;align-items:center;gap:4px;" onmouseover="this.style.color='#e2e8f0'" onmouseout="this.style.color='#94a3b8'">← Back</a>
                <h1 style="font-size:24px;font-weight:700;color:#e2e8f0;">New Contact</h1>
            </div>
            <div style="${cardStyle}max-width:720px;">
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
                    <div style="margin-top:16px;"><label style="${labelStyle}">City</label><input type="text" name="city" style="${inputStyle}"></div>
                    <div style="margin-top:16px;"><label style="${labelStyle}">Notes</label><textarea name="notes" rows="3" style="${inputStyle}resize:vertical;"></textarea></div>
                    <div style="margin-top:24px;display:flex;gap:12px;">
                        <button type="submit" style="padding:12px 24px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;">Save Contact</button>
                        <a href="/crm/contacts" style="padding:12px 24px;background:rgba(255,255,255,0.05);color:#94a3b8;border-radius:10px;text-decoration:none;font-size:14px;font-weight:600;display:inline-flex;align-items:center;">Cancel</a>
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
                if (res.ok) { showToast('Contact created!', 'success'); setTimeout(() => window.location.href = '/crm/contacts', 600); }
                else { const err = await res.json(); showToast(err.error?.message || 'Failed to create contact', 'error'); }
            });
        </script>`;

        return res.html(renderPage({ title: 'New Contact', content, activePath: '/crm/contacts', user: user ? { name: user.name as string, role: user.role as string } : undefined }));
    }

    // ─── Contact Detail (360° View) ──────────────────────
    @Get('/contacts/:id')
    async contactDetail(req: GaoRequest, res: GaoResponse) {
        const user = req.user as Record<string, unknown>;
        const contact = await contactService.findById(req.params.id);
        if (!contact) return res.redirect(url('/crm/contacts'));

        // Fetch related data
        const [company, deals, activities, notes] = await Promise.all([
            contact.company_id ? companyService.findById(contact.company_id) : null,
            dealService.list({ page: 1, perPage: 50 }, undefined, req.params.id),
            activityService.list({ page: 1, perPage: 20 }, undefined, req.params.id),
            noteService.listByNotable('contact', req.params.id),
        ]);

        // Counts for stat cards
        const emailCount = 0; // Can be enriched later with email hub integration
        const ticketCount = 0; // Can be enriched later with tickets integration

        const contactDeals = deals.deals ?? [];
        const contactActivities = activities.activities ?? [];
        const contactNotes = notes ?? [];

        // Total deal value
        const totalDealValue = contactDeals.reduce((s, d) => s + Number(d.value), 0);

        // ─── Build the 360° detail page (reuse the original pattern) ─
        const infoCards = `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;margin-bottom:24px;">
            ${renderStatCard({ label: 'Deals', value: contactDeals.length.toString(), icon: '💰', color: '#f59e0b', subtext: formatCurrency(totalDealValue) })}
            ${renderStatCard({ label: 'Activities', value: contactActivities.length.toString(), icon: '📋', color: '#3b82f6' })}
            ${renderStatCard({ label: 'Emails', value: emailCount.toString(), icon: '📧', color: '#22c55e' })}
            ${renderStatCard({ label: 'Tickets', value: ticketCount.toString(), icon: '🎫', color: '#8b5cf6' })}
        </div>`;

        // Contact info card
        const contactInfoHtml = `<div style="${cardStyle}margin-bottom:24px;">
            <div style="display:flex;align-items:center;gap:20px;margin-bottom:20px;">
                ${renderAvatar(contact.first_name, contact.last_name, 56)}
                <div>
                    <h1 style="font-size:22px;font-weight:800;color:#e2e8f0;margin:0;">${escapeHtml(contact.first_name)} ${escapeHtml(contact.last_name)}</h1>
                    <div style="font-size:14px;color:var(--gao-text-muted,#64748b);margin-top:4px;">${escapeHtml(contact.position ?? '')} ${company ? `at <a href="/crm/companies/${company.id}" style="color:#818cf8;text-decoration:none;">${escapeHtml(company.name)}</a>` : ''}</div>
                </div>
                <div style="margin-left:auto;display:flex;gap:8px;">
                    ${renderBadge(contact.status, STATUS_COLORS[contact.status] ?? '#6366f1')}
                    <a href="/crm/contacts/${contact.id}/edit" style="padding:8px 16px;background:rgba(255,255,255,0.06);color:#94a3b8;border-radius:8px;text-decoration:none;font-size:13px;">✏️ Edit</a>
                </div>
            </div>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;">
                <div><span style="font-size:12px;color:var(--gao-text-muted,#64748b);">Email</span><div style="font-size:14px;color:#e2e8f0;margin-top:4px;">${contact.email ? `<a href="mailto:${escapeHtml(contact.email)}" style="color:#818cf8;text-decoration:none;">${escapeHtml(contact.email)}</a>` : '—'}</div></div>
                <div><span style="font-size:12px;color:var(--gao-text-muted,#64748b);">Phone</span><div style="font-size:14px;color:#e2e8f0;margin-top:4px;">${escapeHtml(contact.phone ?? '—')}</div></div>
                <div><span style="font-size:12px;color:var(--gao-text-muted,#64748b);">City</span><div style="font-size:14px;color:#e2e8f0;margin-top:4px;">${escapeHtml(contact.city ?? '—')}</div></div>
                <div><span style="font-size:12px;color:var(--gao-text-muted,#64748b);">Source</span><div style="font-size:14px;color:#e2e8f0;margin-top:4px;">${escapeHtml(contact.source ?? '—')}</div></div>
            </div>
        </div>`;

        // Deals table
        const dealsHtml = contactDeals.length > 0
            ? `<table class="gao-admin-table"><thead><tr><th>Deal</th><th>Value</th><th>Probability</th><th>Created</th></tr></thead><tbody>
                ${contactDeals.map(d => `<tr><td><a href="/deals/${d.id}" style="color:#818cf8;text-decoration:none;font-weight:600;">${escapeHtml(d.title)}</a></td><td style="font-weight:700;">${formatCurrency(d.value, d.currency)}</td><td>${d.probability}%</td><td>${timeAgo(d.created_at)}</td></tr>`).join('')}
            </tbody></table>`
            : '<div style="text-align:center;padding:20px;color:var(--gao-text-muted,#64748b);font-size:13px;">No deals yet</div>';

        // Activities list
        const activitiesHtml = contactActivities.length > 0
            ? contactActivities.map(a => `<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.04);">
                <span style="font-size:14px;">${a.type === 'call' ? '📞' : a.type === 'meeting' ? '🤝' : a.type === 'email' ? '📧' : '✅'}</span>
                <span style="flex:1;font-size:13px;color:#e2e8f0;${a.is_completed ? 'text-decoration:line-through;opacity:0.5;' : ''}">${escapeHtml(a.subject)}</span>
                <span style="font-size:11px;color:var(--gao-text-muted,#64748b);">${timeAgo(a.created_at)}</span>
            </div>`).join('')
            : '<div style="text-align:center;padding:20px;color:var(--gao-text-muted,#64748b);font-size:13px;">No activities yet</div>';

        // 360° Timeline
        interface TimelineEntry { icon: string; label: string; detail: string; time: string; color: string; }
        const timeline: TimelineEntry[] = [];
        for (const a of contactActivities) {
            timeline.push({ icon: '📞', label: 'ACTIVITY', detail: a.subject, time: a.created_at ?? '', color: '#3b82f6' });
        }
        for (const n of contactNotes) {
            timeline.push({ icon: '🗒️', label: 'NOTE', detail: (n.content ?? '').slice(0, 80), time: n.created_at ?? '', color: '#f59e0b' });
        }
        for (const d of contactDeals) {
            timeline.push({ icon: '💰', label: 'DEAL', detail: `${d.title} — ${formatCurrency(Number(d.value), d.currency)}`, time: d.created_at ?? '', color: '#8b5cf6' });
        }
        timeline.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

        const timelineHtml = timeline.length > 0
            ? timeline.slice(0, 15).map(t => `<div style="display:flex;gap:12px;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.04);">
                <div style="width:28px;height:28px;border-radius:8px;background:${t.color}18;display:flex;align-items:center;justify-content:center;font-size:13px;flex-shrink:0;">${t.icon}</div>
                <div style="flex:1;">
                    <div style="font-size:10px;font-weight:700;color:${t.color};text-transform:uppercase;letter-spacing:0.5px;">${t.label}</div>
                    <div style="font-size:13px;color:#e2e8f0;margin-top:2px;">${escapeHtml(t.detail)}</div>
                </div>
                <div style="font-size:11px;color:var(--gao-text-muted,#64748b);white-space:nowrap;">${timeAgo(t.time)}</div>
            </div>`).join('')
            : '<div style="text-align:center;padding:30px;color:var(--gao-text-muted);font-size:13px;">No timeline entries</div>';

        const content = `
        <div style="padding:8px;">
            <div style="margin-bottom:16px;"><a href="/crm/contacts" style="color:#94a3b8;text-decoration:none;font-size:13px;" onmouseover="this.style.color='#e2e8f0'" onmouseout="this.style.color='#94a3b8'">← Back to Contacts</a></div>
            ${contactInfoHtml}
            ${infoCards}
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px;">
                <div style="${cardStyle}">
                    <h2 style="font-size:16px;font-weight:700;color:#e2e8f0;margin:0 0 16px;">💰 Deals (${contactDeals.length})</h2>
                    ${dealsHtml}
                </div>
                <div style="${cardStyle}">
                    <h2 style="font-size:16px;font-weight:700;color:#e2e8f0;margin:0 0 16px;">📋 Activities (${contactActivities.length})</h2>
                    ${activitiesHtml}
                </div>
            </div>
            <div style="${cardStyle}">
                <h2 style="font-size:16px;font-weight:700;color:#e2e8f0;margin:0 0 16px;">🕐 360° Timeline</h2>
                ${timelineHtml}
            </div>
        </div>`;

        return res.html(renderPage({ title: `${contact.first_name} ${contact.last_name}`, content, activePath: '/crm/contacts', user: user ? { name: user.name as string, role: user.role as string } : undefined }));
    }

    // ─── Contact Edit (redirect to original) ─────────────
    @Get('/contacts/:id/edit')
    async editContact(req: GaoRequest, res: GaoResponse) {
        // Delegate to the original contact edit form
        const user = req.user as Record<string, unknown>;
        const contact = await contactService.findById(req.params.id);
        if (!contact) return res.redirect(url('/crm/contacts'));

        const companies = await companyService.list({ page: 1, perPage: 100 });
        const companyOptions = companies.companies.map(c =>
            `<option value="${c.id}" ${c.id === contact.company_id ? 'selected' : ''}>${escapeHtml(c.name)}</option>`
        ).join('');

        const content = `
        <div style="padding:8px;">
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px;">
                <a href="/crm/contacts/${contact.id}" style="color:#94a3b8;text-decoration:none;font-size:13px;">← Back</a>
                <h1 style="font-size:24px;font-weight:700;color:#e2e8f0;">Edit Contact</h1>
            </div>
            <div style="${cardStyle}max-width:720px;">
                <form id="editContactForm">
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                        <div><label style="${labelStyle}">First Name *</label><input type="text" name="first_name" required value="${escapeHtml(contact.first_name)}" style="${inputStyle}"></div>
                        <div><label style="${labelStyle}">Last Name *</label><input type="text" name="last_name" required value="${escapeHtml(contact.last_name)}" style="${inputStyle}"></div>
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
                        <div><label style="${labelStyle}">City</label><input type="text" name="city" value="${escapeHtml(contact.city ?? '')}" style="${inputStyle}"></div>
                    </div>
                    <div style="margin-top:24px;display:flex;gap:12px;">
                        <button type="submit" style="padding:12px 24px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;">Update Contact</button>
                        <a href="/crm/contacts/${contact.id}" style="padding:12px 24px;background:rgba(255,255,255,0.05);color:#94a3b8;border-radius:10px;text-decoration:none;font-size:14px;">Cancel</a>
                        <button type="button" onclick="confirmDelete('contact','/api/contacts/${contact.id}','/crm/contacts')" style="margin-left:auto;padding:12px 24px;background:rgba(239,68,68,0.1);color:#ef4444;border:none;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;">🗑 Delete</button>
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
                if (res.ok) { showToast('Contact updated!', 'success'); setTimeout(() => window.location.href = '/crm/contacts/${contact.id}', 600); }
                else { showToast('Failed to update contact', 'error'); }
            });
        </script>`;

        return res.html(renderPage({ title: `Edit — ${contact.first_name} ${contact.last_name}`, content, activePath: '/crm/contacts', user: user ? { name: user.name as string, role: user.role as string } : undefined }));
    }

    // ─── Company Detail (delegated) ──────────────────────
    @Get('/companies/:id')
    async companyDetail(req: GaoRequest, res: GaoResponse) {
        // Redirect to existing company detail page logic
        return res.redirect(url(`/companies/${req.params.id}`));
    }

    // ─── Company Create (delegated) ──────────────────────
    @Get('/companies/create')
    async companyCreate(_req: GaoRequest, res: GaoResponse) {
        return res.redirect(url('/companies/create'));
    }
}
