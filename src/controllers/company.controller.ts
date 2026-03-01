/**
 * GAO CRM — Company Controller (REDIRECT ONLY)
 *
 * Companies are now accessed via the CRM Contacts page (Companies tab).
 * Detail/edit pages redirect to /crm/companies/:id.
 * The Companies list redirects to /crm/contacts?tab=companies.
 */

import { Controller, Get } from '@gao/http';
import type { GaoRequest, GaoResponse } from '@gao/http';
import { renderPage } from '../views/renderer.js';
import { CompanyService } from '../services/company.service.js';
import { ContactService } from '../services/contact.service.js';
import { DealService } from '../services/deal.service.js';
import { escapeHtml } from '../helpers/escape.js';
import { formatCurrency, timeAgo, formatNumber } from '../helpers/format.js';
import { renderAvatar, renderBadge, STATUS_COLORS, cardStyle, inputStyle, labelStyle, renderStatCard } from '../helpers/crm-shared.js';
import { url } from '../helpers/url.js';

const companyService = new CompanyService();
const contactService = new ContactService();
const dealService = new DealService();

@Controller('/companies')
export class CompanyController {
    @Get('/')
    async list(_req: GaoRequest, res: GaoResponse) {
        return res.redirect(url('/crm/contacts?tab=companies'));
    }

    @Get('/create')
    async createForm(req: GaoRequest, res: GaoResponse) {
        // Company create form stays here (served by this controller)
        const user = req.user as Record<string, unknown>;
        const content = `
        <div style="padding:8px;">
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px;">
                <a href="/crm/contacts?tab=companies" style="color:#94a3b8;text-decoration:none;font-size:13px;">← Back</a>
                <h1 style="font-size:24px;font-weight:700;color:#e2e8f0;">New Company</h1>
            </div>
            <div style="${cardStyle}max-width:720px;">
                <form id="createCompanyForm">
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                        <div><label style="${labelStyle}">Company Name *</label><input type="text" name="name" required style="${inputStyle}"></div>
                        <div><label style="${labelStyle}">Industry</label><input type="text" name="industry" style="${inputStyle}"></div>
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px;">
                        <div><label style="${labelStyle}">Website</label><input type="url" name="website" style="${inputStyle}"></div>
                        <div><label style="${labelStyle}">Phone</label><input type="tel" name="phone" style="${inputStyle}"></div>
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px;">
                        <div><label style="${labelStyle}">Employees</label><input type="number" name="employee_count" style="${inputStyle}"></div>
                        <div><label style="${labelStyle}">Annual Revenue</label><input type="number" name="annual_revenue" style="${inputStyle}"></div>
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px;">
                        <div><label style="${labelStyle}">City</label><input type="text" name="city" style="${inputStyle}"></div>
                        <div><label style="${labelStyle}">State/Province</label><input type="text" name="state" style="${inputStyle}"></div>
                    </div>
                    <div style="margin-top:16px;"><label style="${labelStyle}">Address</label><textarea name="address" rows="2" style="${inputStyle}resize:vertical;"></textarea></div>
                    <div style="margin-top:16px;"><label style="${labelStyle}">Notes</label><textarea name="notes" rows="3" style="${inputStyle}resize:vertical;"></textarea></div>
                    <div style="margin-top:24px;display:flex;gap:12px;">
                        <button type="submit" style="padding:12px 24px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;">Save Company</button>
                        <a href="/crm/contacts?tab=companies" style="padding:12px 24px;background:rgba(255,255,255,0.05);color:#94a3b8;border-radius:10px;text-decoration:none;font-size:14px;font-weight:600;">Cancel</a>
                    </div>
                </form>
            </div>
        </div>
        <script>
            document.getElementById('createCompanyForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                const form = new FormData(e.target);
                const data = Object.fromEntries(form.entries());
                const res = await fetch('/api/companies', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                });
                if (res.ok) { showToast('Company created!', 'success'); setTimeout(() => window.location.href = '/crm/contacts?tab=companies', 600); }
                else { showToast('Failed to create company', 'error'); }
            });
        </script>`;
        return res.html(renderPage({ title: 'New Company', content, activePath: '/crm/contacts', user: user ? { name: user.name as string, role: user.role as string } : undefined }));
    }

    @Get('/:id')
    async detail(req: GaoRequest, res: GaoResponse) {
        const user = req.user as Record<string, unknown>;
        const company = await companyService.findById(req.params.id);
        if (!company) return res.redirect(url('/crm/contacts?tab=companies'));

        // Fetch related contacts and deals
        const [contactsResult, dealsResult] = await Promise.all([
            contactService.list({ page: 1, perPage: 100 }),
            dealService.list({ page: 1, perPage: 100 }),
        ]);
        const companyContacts = contactsResult.contacts.filter(c => c.company_id === company.id);
        const companyDeals = dealsResult.deals.filter(d => d.company_id === company.id);
        const totalDealValue = companyDeals.reduce((s, d) => s + Number(d.value), 0);

        const contactRows = companyContacts.map(c => `
            <tr>
                <td><div style="display:flex;align-items:center;gap:10px;">${renderAvatar(c.first_name, c.last_name, 28)}<a href="/crm/contacts/${c.id}" style="color:#e2e8f0;text-decoration:none;font-weight:600;font-size:13px;">${escapeHtml(c.first_name)} ${escapeHtml(c.last_name)}</a></div></td>
                <td style="font-size:13px;color:var(--gao-text-muted,#64748b);">${escapeHtml(c.position ?? '—')}</td>
                <td>${renderBadge(c.status, STATUS_COLORS[c.status] ?? '#6366f1')}</td>
            </tr>
        `).join('');
        const dealRows = companyDeals.map(d => `
            <tr>
                <td><a href="/deals/${d.id}" style="color:#818cf8;text-decoration:none;font-weight:600;font-size:13px;">${escapeHtml(d.title)}</a></td>
                <td style="font-weight:700;font-size:13px;">${formatCurrency(d.value, d.currency)}</td>
                <td style="font-size:13px;color:var(--gao-text-muted,#64748b);">${timeAgo(d.created_at)}</td>
            </tr>
        `).join('');

        const content = `
        <div style="padding:8px;">
            <div style="margin-bottom:16px;"><a href="/crm/contacts?tab=companies" style="color:#94a3b8;text-decoration:none;font-size:13px;">← Back to Companies</a></div>
            <div style="${cardStyle}margin-bottom:24px;">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;">
                    <div style="display:flex;align-items:center;gap:16px;">
                        <div style="width:48px;height:48px;border-radius:14px;background:linear-gradient(135deg,#8b5cf6,#6366f1);display:flex;align-items:center;justify-content:center;font-size:22px;">🏢</div>
                        <div>
                            <h1 style="font-size:22px;font-weight:800;color:#e2e8f0;margin:0;">${escapeHtml(company.name)}</h1>
                            <div style="font-size:13px;color:var(--gao-text-muted,#64748b);">${escapeHtml(company.industry ?? '')}</div>
                        </div>
                    </div>
                    <div style="display:flex;gap:8px;">
                        <a href="/companies/${company.id}/edit" style="padding:8px 16px;background:rgba(255,255,255,0.06);color:#94a3b8;border-radius:8px;text-decoration:none;font-size:13px;">✏️ Edit</a>
                    </div>
                </div>
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;">
                    <div><span style="font-size:12px;color:var(--gao-text-muted,#64748b);">Website</span><div style="margin-top:4px;">${company.website ? `<a href="${escapeHtml(company.website)}" target="_blank" style="color:#818cf8;text-decoration:none;font-size:14px;">${escapeHtml(company.website)}</a>` : '—'}</div></div>
                    <div><span style="font-size:12px;color:var(--gao-text-muted,#64748b);">Phone</span><div style="font-size:14px;color:#e2e8f0;margin-top:4px;">${escapeHtml(company.phone ?? '—')}</div></div>
                    <div><span style="font-size:12px;color:var(--gao-text-muted,#64748b);">Employees</span><div style="font-size:14px;color:#e2e8f0;margin-top:4px;">${company.employee_count ? formatNumber(company.employee_count) : '—'}</div></div>
                    <div><span style="font-size:12px;color:var(--gao-text-muted,#64748b);">Revenue</span><div style="font-size:14px;color:#e2e8f0;margin-top:4px;">${company.annual_revenue ? formatCurrency(company.annual_revenue) : '—'}</div></div>
                </div>
            </div>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;margin-bottom:24px;">
                ${renderStatCard({ label: 'Contacts', value: companyContacts.length.toString(), icon: '👥', color: '#6366f1' })}
                ${renderStatCard({ label: 'Deals', value: companyDeals.length.toString(), icon: '💰', color: '#f59e0b', subtext: formatCurrency(totalDealValue) })}
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
                <div style="${cardStyle}">
                    <h2 style="font-size:16px;font-weight:700;color:#e2e8f0;margin:0 0 16px;">👥 Contacts (${companyContacts.length})</h2>
                    ${contactRows ? `<table class="gao-admin-table"><thead><tr><th>Name</th><th>Position</th><th>Status</th></tr></thead><tbody>${contactRows}</tbody></table>` : '<div style="text-align:center;padding:20px;color:var(--gao-text-muted);font-size:13px;">No contacts</div>'}
                </div>
                <div style="${cardStyle}">
                    <h2 style="font-size:16px;font-weight:700;color:#e2e8f0;margin:0 0 16px;">💰 Deals (${companyDeals.length})</h2>
                    ${dealRows ? `<table class="gao-admin-table"><thead><tr><th>Deal</th><th>Value</th><th>Created</th></tr></thead><tbody>${dealRows}</tbody></table>` : '<div style="text-align:center;padding:20px;color:var(--gao-text-muted);font-size:13px;">No deals</div>'}
                </div>
            </div>
        </div>`;

        return res.html(renderPage({ title: company.name, content, activePath: '/crm/contacts', user: user ? { name: user.name as string, role: user.role as string } : undefined }));
    }

    @Get('/:id/edit')
    async editForm(req: GaoRequest, res: GaoResponse) {
        const user = req.user as Record<string, unknown>;
        const company = await companyService.findById(req.params.id);
        if (!company) return res.redirect(url('/crm/contacts?tab=companies'));

        const content = `
        <div style="padding:8px;">
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px;">
                <a href="/companies/${company.id}" style="color:#94a3b8;text-decoration:none;font-size:13px;">← Back</a>
                <h1 style="font-size:24px;font-weight:700;color:#e2e8f0;">Edit Company</h1>
            </div>
            <div style="${cardStyle}max-width:720px;">
                <form id="editCompanyForm">
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                        <div><label style="${labelStyle}">Company Name *</label><input type="text" name="name" required value="${escapeHtml(company.name)}" style="${inputStyle}"></div>
                        <div><label style="${labelStyle}">Industry</label><input type="text" name="industry" value="${escapeHtml(company.industry ?? '')}" style="${inputStyle}"></div>
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px;">
                        <div><label style="${labelStyle}">Website</label><input type="url" name="website" value="${escapeHtml(company.website ?? '')}" style="${inputStyle}"></div>
                        <div><label style="${labelStyle}">Phone</label><input type="tel" name="phone" value="${escapeHtml(company.phone ?? '')}" style="${inputStyle}"></div>
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px;">
                        <div><label style="${labelStyle}">Employees</label><input type="number" name="employee_count" value="${company.employee_count ?? ''}" style="${inputStyle}"></div>
                        <div><label style="${labelStyle}">Annual Revenue</label><input type="number" name="annual_revenue" value="${company.annual_revenue ?? ''}" style="${inputStyle}"></div>
                    </div>
                    <div style="margin-top:24px;display:flex;gap:12px;">
                        <button type="submit" style="padding:12px 24px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;">Update Company</button>
                        <a href="/companies/${company.id}" style="padding:12px 24px;background:rgba(255,255,255,0.05);color:#94a3b8;border-radius:10px;text-decoration:none;font-size:14px;">Cancel</a>
                        <button type="button" onclick="confirmDelete('company','/api/companies/${company.id}','/crm/contacts?tab=companies')" style="margin-left:auto;padding:12px 24px;background:rgba(239,68,68,0.1);color:#ef4444;border:none;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;">🗑 Delete</button>
                    </div>
                </form>
            </div>
        </div>
        <script>
            document.getElementById('editCompanyForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                const form = new FormData(e.target);
                const data = Object.fromEntries(form.entries());
                const res = await fetch('/api/companies/${company.id}', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                });
                if (res.ok) { showToast('Company updated!', 'success'); setTimeout(() => window.location.href = '/companies/${company.id}', 600); }
                else { showToast('Failed to update company', 'error'); }
            });
        </script>`;

        return res.html(renderPage({ title: `Edit — ${company.name}`, content, activePath: '/crm/contacts', user: user ? { name: user.name as string, role: user.role as string } : undefined }));
    }
}
