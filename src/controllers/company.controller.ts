import { Controller, Get } from '@gao/http';
import type { GaoRequest, GaoResponse } from '@gao/http';
import { renderPage } from '../views/renderer.js';
import { CompanyService } from '../services/company.service.js';
import { ContactService } from '../services/contact.service.js';
import { DealService } from '../services/deal.service.js';
import { parsePagination, renderPaginationHtml } from '../helpers/pagination.js';
import { escapeHtml } from '../helpers/escape.js';
import { formatCurrency, timeAgo } from '../helpers/format.js';

const companyService = new CompanyService();
const contactService = new ContactService();
const dealService = new DealService();

const inputStyle = `width:100%;padding:10px 14px;background:rgba(15,23,42,0.6);border:1px solid rgba(100,116,139,0.3);border-radius:8px;color:#e2e8f0;font-size:14px;outline:none;`;
const labelStyle = `display:block;font-size:13px;font-weight:600;color:#cbd5e1;margin-bottom:6px;`;

const STATUS_COLORS: Record<string, string> = {
    lead: '#94a3b8',
    prospect: '#3b82f6',
    customer: '#22c55e',
    churned: '#ef4444',
};

@Controller('/companies')
export class CompanyController {
    @Get('/')
    async list(req: GaoRequest, res: GaoResponse) {
        const pagination = parsePagination(req.query);
        const result = await companyService.list(pagination, req.query.search);
        const user = req.user as Record<string, unknown>;

        const tableRows = result.companies.map((c) => `<tr>
            <td><a href="/companies/${c.id}" style="color:#e2e8f0;text-decoration:none;font-weight:600;">${escapeHtml(c.name)}</a></td>
            <td style="color:var(--gao-text-muted,#64748b);">${escapeHtml(c.industry ?? '—')}</td>
            <td style="color:var(--gao-text-muted,#64748b);">${escapeHtml(c.city ?? '—')}</td>
            <td style="color:var(--gao-text-muted,#64748b);">${c.employee_count ?? '—'}</td>
            <td style="font-size:13px;color:var(--gao-text-muted,#64748b);">${timeAgo(c.created_at)}</td>
        </tr>`).join('');

        const content = `
        <div style="padding:8px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
                <h1 style="font-size:24px;font-weight:700;">Companies</h1>
                <a href="/companies/create" style="padding:10px 20px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border-radius:10px;text-decoration:none;font-size:13px;font-weight:700;">+ New Company</a>
            </div>
            <div class="gao-card" style="padding:24px;">
                <div class="gao-admin-table-wrapper">
                    <table class="gao-admin-table">
                        <thead><tr><th>Company</th><th>Industry</th><th>City</th><th>Employees</th><th>Created</th></tr></thead>
                        <tbody>${tableRows || '<tr><td colspan="5" style="text-align:center;padding:40px;color:var(--gao-text-muted,#64748b);">No companies found</td></tr>'}</tbody>
                    </table>
                </div>
                ${renderPaginationHtml(result.meta, '/companies')}
            </div>
        </div>`;

        return res.html(renderPage({ title: 'Companies', content, activePath: '/companies', user: user ? { name: user.name as string, role: user.role as string } : undefined }));
    }

    @Get('/create')
    async createForm(req: GaoRequest, res: GaoResponse) {
        const user = req.user as Record<string, unknown>;
        const content = `
        <div style="padding:8px;">
            <h1 style="font-size:24px;font-weight:700;margin-bottom:24px;">New Company</h1>
            <div class="gao-card" style="padding:32px;max-width:720px;">
                <form id="createCompanyForm">
                    <div><label style="${labelStyle}">Company Name *</label><input type="text" name="name" required style="${inputStyle}"></div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px;">
                        <div><label style="${labelStyle}">Industry</label><input type="text" name="industry" style="${inputStyle}"></div>
                        <div><label style="${labelStyle}">Website</label><input type="url" name="website" placeholder="https://" style="${inputStyle}"></div>
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px;">
                        <div><label style="${labelStyle}">Phone</label><input type="tel" name="phone" style="${inputStyle}"></div>
                        <div><label style="${labelStyle}">Email</label><input type="email" name="email" style="${inputStyle}"></div>
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px;">
                        <div><label style="${labelStyle}">City</label><input type="text" name="city" style="${inputStyle}"></div>
                        <div><label style="${labelStyle}">Country</label><input type="text" name="country" value="Indonesia" style="${inputStyle}"></div>
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px;">
                        <div><label style="${labelStyle}">Employees</label><input type="number" name="employee_count" min="0" style="${inputStyle}"></div>
                        <div><label style="${labelStyle}">Annual Revenue</label><input type="number" name="annual_revenue" min="0" style="${inputStyle}"></div>
                    </div>
                    <div style="margin-top:16px;">
                        <label style="${labelStyle}">Address</label><textarea name="address" rows="2" style="${inputStyle}resize:vertical;"></textarea>
                    </div>
                    <div style="margin-top:16px;">
                        <label style="${labelStyle}">Notes</label><textarea name="notes" rows="3" style="${inputStyle}resize:vertical;"></textarea>
                    </div>
                    <div style="margin-top:24px;display:flex;gap:12px;">
                        <button type="submit" style="padding:12px 24px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;">Save Company</button>
                        <a href="/companies" style="padding:12px 24px;background:rgba(255,255,255,0.05);color:#94a3b8;border-radius:10px;text-decoration:none;font-size:14px;font-weight:600;display:inline-flex;align-items:center;">Cancel</a>
                    </div>
                </form>
            </div>
        </div>
        <script>
            document.getElementById('createCompanyForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                const form = new FormData(e.target);
                const data = Object.fromEntries(form.entries());
                Object.keys(data).forEach(k => { if (data[k] === '') delete data[k]; });
                if (data.employee_count) data.employee_count = Number(data.employee_count);
                if (data.annual_revenue) data.annual_revenue = Number(data.annual_revenue);
                const res = await fetch('/api/companies', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                });
                if (res.ok) { window.location.href = '/companies'; }
                else { const err = await res.json(); alert(err.error?.message || 'Failed'); }
            });
        </script>`;

        return res.html(renderPage({ title: 'New Company', content, activePath: '/companies', user: user ? { name: user.name as string, role: user.role as string } : undefined }));
    }

    @Get('/:id')
    async detail(req: GaoRequest, res: GaoResponse) {
        const company = await companyService.findById(req.params.id);
        if (!company) return res.redirect('/companies');
        const user = req.user as Record<string, unknown>;

        // Related contacts
        const allContacts = await contactService.list({ page: 1, perPage: 100 });
        const companyContacts = allContacts.contacts.filter(c => c.company_id === company.id);

        // Related deals
        const allDeals = await dealService.list({ page: 1, perPage: 100 });
        const companyDeals = allDeals.deals.filter(d => d.company_id === company.id);
        const stages = await dealService.getStages();
        const stageMap = new Map(stages.map(s => [s.id, s]));

        // Contacts table
        const contactsHtml = companyContacts.length > 0 ? companyContacts.map(c => {
            const initials = `${(c.first_name?.[0] ?? '').toUpperCase()}${(c.last_name?.[0] ?? '').toUpperCase()}`;
            return `<tr>
                <td>
                    <div style="display:flex;align-items:center;gap:10px;">
                        <div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#8b5cf6);display:flex;align-items:center;justify-content:center;color:#fff;font-size:11px;font-weight:700;">${initials}</div>
                        <a href="/contacts/${c.id}" style="color:#e2e8f0;text-decoration:none;font-weight:600;">${escapeHtml(c.first_name)} ${escapeHtml(c.last_name)}</a>
                    </div>
                </td>
                <td style="font-size:13px;color:var(--gao-text-muted,#64748b);">${escapeHtml(c.position ?? '—')}</td>
                <td><span style="padding:3px 8px;border-radius:10px;font-size:11px;font-weight:700;color:#fff;background:${STATUS_COLORS[c.status] ?? '#6366f1'}">${escapeHtml(c.status)}</span></td>
            </tr>`;
        }).join('') : '<tr><td colspan="3" style="text-align:center;padding:20px;color:var(--gao-text-muted,#64748b);font-size:13px;">No contacts yet</td></tr>';

        // Deals table
        const dealsHtml = companyDeals.length > 0 ? companyDeals.map(d => {
            const stage = stageMap.get(d.stage_id);
            return `<tr>
                <td><a href="/deals/${d.id}" style="color:#e2e8f0;text-decoration:none;font-weight:600;">${escapeHtml(d.title)}</a></td>
                <td style="font-weight:600;">${formatCurrency(d.value, d.currency)}</td>
                <td><span style="padding:3px 8px;border-radius:10px;font-size:11px;font-weight:700;color:#fff;background:${stage?.color ?? '#6366f1'}">${escapeHtml(stage?.name ?? '—')}</span></td>
            </tr>`;
        }).join('') : '<tr><td colspan="3" style="text-align:center;padding:20px;color:var(--gao-text-muted,#64748b);font-size:13px;">No deals yet</td></tr>';

        const totalDealValue = companyDeals.reduce((sum, d) => sum + Number(d.value), 0);

        const content = `
        <div style="padding:8px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
                <div>
                    <h1 style="font-size:24px;font-weight:700;">${escapeHtml(company.name)}</h1>
                    <p style="color:var(--gao-text-muted,#64748b);font-size:14px;margin-top:4px;">${escapeHtml(company.industry ?? 'No industry')} · ${escapeHtml(company.city ?? '')}</p>
                </div>
                <a href="/companies/${company.id}/edit" style="padding:8px 18px;background:rgba(255,255,255,0.08);color:#e2e8f0;border-radius:8px;text-decoration:none;font-size:13px;font-weight:600;">✏️ Edit</a>
            </div>

            <!-- Quick stats -->
            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:24px;">
                <div class="gao-card" style="padding:20px;text-align:center;">
                    <div style="font-size:24px;font-weight:700;">${companyContacts.length}</div>
                    <div style="font-size:12px;color:var(--gao-text-muted,#64748b);margin-top:4px;">Contacts</div>
                </div>
                <div class="gao-card" style="padding:20px;text-align:center;">
                    <div style="font-size:24px;font-weight:700;">${companyDeals.length}</div>
                    <div style="font-size:12px;color:var(--gao-text-muted,#64748b);margin-top:4px;">Deals</div>
                </div>
                <div class="gao-card" style="padding:20px;text-align:center;">
                    <div style="font-size:24px;font-weight:700;">${formatCurrency(totalDealValue)}</div>
                    <div style="font-size:12px;color:var(--gao-text-muted,#64748b);margin-top:4px;">Total Deal Value</div>
                </div>
                <div class="gao-card" style="padding:20px;text-align:center;">
                    <div style="font-size:24px;font-weight:700;">${company.employee_count ?? '—'}</div>
                    <div style="font-size:12px;color:var(--gao-text-muted,#64748b);margin-top:4px;">Employees</div>
                </div>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px;">
                <div class="gao-card" style="padding:24px;">
                    <h3 style="font-size:15px;font-weight:700;margin-bottom:16px;">Company Information</h3>
                    <div style="display:grid;gap:12px;font-size:14px;">
                        <div><span style="color:var(--gao-text-muted,#64748b);min-width:100px;display:inline-block;">Website:</span> ${company.website ? `<a href="${escapeHtml(company.website)}" target="_blank" style="color:#6366f1;">${escapeHtml(company.website)}</a>` : '—'}</div>
                        <div><span style="color:var(--gao-text-muted,#64748b);min-width:100px;display:inline-block;">Phone:</span> ${escapeHtml(company.phone ?? '—')}</div>
                        <div><span style="color:var(--gao-text-muted,#64748b);min-width:100px;display:inline-block;">Email:</span> ${escapeHtml(company.email ?? '—')}</div>
                        <div><span style="color:var(--gao-text-muted,#64748b);min-width:100px;display:inline-block;">Address:</span> ${escapeHtml(company.address ?? '—')}</div>
                        <div><span style="color:var(--gao-text-muted,#64748b);min-width:100px;display:inline-block;">Country:</span> ${escapeHtml(company.country ?? '—')}</div>
                        <div><span style="color:var(--gao-text-muted,#64748b);min-width:100px;display:inline-block;">Revenue:</span> ${company.annual_revenue ? formatCurrency(company.annual_revenue) : '—'}</div>
                    </div>
                    ${company.notes ? `<div style="margin-top:16px;padding-top:16px;border-top:1px solid rgba(100,116,139,0.15);"><h4 style="font-size:13px;font-weight:700;color:var(--gao-text-muted,#64748b);margin-bottom:8px;">Notes</h4><p style="font-size:14px;line-height:1.6;">${escapeHtml(company.notes)}</p></div>` : ''}
                </div>
                <div class="gao-card" style="padding:24px;">
                    <h3 style="font-size:15px;font-weight:700;margin-bottom:16px;">Contacts (${companyContacts.length})</h3>
                    <div class="gao-admin-table-wrapper">
                        <table class="gao-admin-table" style="font-size:13px;">
                            <thead><tr><th>Name</th><th>Position</th><th>Status</th></tr></thead>
                            <tbody>${contactsHtml}</tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div class="gao-card" style="padding:24px;">
                <h3 style="font-size:15px;font-weight:700;margin-bottom:16px;">Deals (${companyDeals.length})</h3>
                <div class="gao-admin-table-wrapper">
                    <table class="gao-admin-table" style="font-size:13px;">
                        <thead><tr><th>Deal</th><th>Value</th><th>Stage</th></tr></thead>
                        <tbody>${dealsHtml}</tbody>
                    </table>
                </div>
            </div>
        </div>`;

        return res.html(renderPage({ title: company.name, content, activePath: '/companies', user: user ? { name: user.name as string, role: user.role as string } : undefined }));
    }

    @Get('/:id/edit')
    async editForm(req: GaoRequest, res: GaoResponse) {
        const company = await companyService.findById(req.params.id);
        if (!company) return res.redirect('/companies');
        const user = req.user as Record<string, unknown>;

        const content = `
        <div style="padding:8px;">
            <h1 style="font-size:24px;font-weight:700;margin-bottom:24px;">Edit Company</h1>
            <div class="gao-card" style="padding:32px;max-width:720px;">
                <form id="editCompanyForm">
                    <div><label style="${labelStyle}">Company Name *</label><input type="text" name="name" value="${escapeHtml(company.name)}" required style="${inputStyle}"></div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px;">
                        <div><label style="${labelStyle}">Industry</label><input type="text" name="industry" value="${escapeHtml(company.industry ?? '')}" style="${inputStyle}"></div>
                        <div><label style="${labelStyle}">Website</label><input type="url" name="website" value="${escapeHtml(company.website ?? '')}" style="${inputStyle}"></div>
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px;">
                        <div><label style="${labelStyle}">Phone</label><input type="tel" name="phone" value="${escapeHtml(company.phone ?? '')}" style="${inputStyle}"></div>
                        <div><label style="${labelStyle}">Email</label><input type="email" name="email" value="${escapeHtml(company.email ?? '')}" style="${inputStyle}"></div>
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px;">
                        <div><label style="${labelStyle}">City</label><input type="text" name="city" value="${escapeHtml(company.city ?? '')}" style="${inputStyle}"></div>
                        <div><label style="${labelStyle}">Country</label><input type="text" name="country" value="${escapeHtml(company.country ?? '')}" style="${inputStyle}"></div>
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px;">
                        <div><label style="${labelStyle}">Employees</label><input type="number" name="employee_count" value="${company.employee_count ?? ''}" min="0" style="${inputStyle}"></div>
                        <div><label style="${labelStyle}">Annual Revenue</label><input type="number" name="annual_revenue" value="${company.annual_revenue ?? ''}" min="0" style="${inputStyle}"></div>
                    </div>
                    <div style="margin-top:16px;">
                        <label style="${labelStyle}">Address</label><textarea name="address" rows="2" style="${inputStyle}resize:vertical;">${escapeHtml(company.address ?? '')}</textarea>
                    </div>
                    <div style="margin-top:16px;">
                        <label style="${labelStyle}">Notes</label><textarea name="notes" rows="3" style="${inputStyle}resize:vertical;">${escapeHtml(company.notes ?? '')}</textarea>
                    </div>
                    <div style="margin-top:24px;display:flex;gap:12px;">
                        <button type="submit" style="padding:12px 24px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;">Update Company</button>
                        <a href="/companies/${company.id}" style="padding:12px 24px;background:rgba(255,255,255,0.05);color:#94a3b8;border-radius:10px;text-decoration:none;font-size:14px;font-weight:600;display:inline-flex;align-items:center;">Cancel</a>
                    </div>
                </form>
            </div>
        </div>
        <script>
            document.getElementById('editCompanyForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                const form = new FormData(e.target);
                const data = Object.fromEntries(form.entries());
                Object.keys(data).forEach(k => { if (data[k] === '') delete data[k]; });
                if (data.employee_count) data.employee_count = Number(data.employee_count);
                if (data.annual_revenue) data.annual_revenue = Number(data.annual_revenue);
                const res = await fetch('/api/companies/${company.id}', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                });
                if (res.ok) { window.location.href = '/companies/${company.id}'; }
                else { const err = await res.json(); alert(err.error?.message || 'Failed'); }
            });
        </script>`;

        return res.html(renderPage({ title: `Edit ${company.name}`, content, activePath: '/companies', user: user ? { name: user.name as string, role: user.role as string } : undefined }));
    }
}
