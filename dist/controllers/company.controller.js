var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Controller, Get } from '@gao/http';
import { renderPage } from '../views/renderer.js';
import { CompanyService } from '../services/company.service.js';
import { parsePagination, renderPaginationHtml } from '../helpers/pagination.js';
import { escapeHtml } from '../helpers/escape.js';
import { formatCurrency, timeAgo } from '../helpers/format.js';
const companyService = new CompanyService();
let CompanyController = class CompanyController {
    async list(req, res) {
        const pagination = parsePagination(req.query);
        const result = await companyService.list(pagination, req.query.search);
        const user = req.user;
        const tableRows = result.companies.map((c) => `<tr>
            <td><a href="/companies/${c.id}" style="color:#e2e8f0;text-decoration:none;font-weight:600;">${escapeHtml(c.name)}</a></td>
            <td style="color:var(--gao-text-muted,#64748b);">${escapeHtml(c.industry ?? '—')}</td>
            <td style="color:var(--gao-text-muted,#64748b);">${escapeHtml(c.city ?? '—')}</td>
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
                        <thead><tr><th>Company</th><th>Industry</th><th>City</th><th>Created</th></tr></thead>
                        <tbody>${tableRows || '<tr><td colspan="4" style="text-align:center;padding:40px;color:var(--gao-text-muted,#64748b);">No companies found</td></tr>'}</tbody>
                    </table>
                </div>
                ${renderPaginationHtml(result.meta, '/companies')}
            </div>
        </div>`;
        return res.html(renderPage({ title: 'Companies', content, activePath: '/companies', user: user ? { name: user.name, role: user.role } : undefined }));
    }
    async detail(req, res) {
        const company = await companyService.findById(req.params.id);
        if (!company)
            return res.redirect('/companies');
        const user = req.user;
        const content = `
        <div style="padding:8px;">
            <h1 style="font-size:24px;font-weight:700;margin-bottom:24px;">${escapeHtml(company.name)}</h1>
            <div class="gao-card" style="padding:24px;">
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;font-size:14px;">
                    <div><span style="color:var(--gao-text-muted,#64748b);">Industry:</span> ${escapeHtml(company.industry ?? '—')}</div>
                    <div><span style="color:var(--gao-text-muted,#64748b);">Website:</span> ${company.website ? `<a href="${escapeHtml(company.website)}" target="_blank" style="color:#6366f1;">${escapeHtml(company.website)}</a>` : '—'}</div>
                    <div><span style="color:var(--gao-text-muted,#64748b);">Phone:</span> ${escapeHtml(company.phone ?? '—')}</div>
                    <div><span style="color:var(--gao-text-muted,#64748b);">Email:</span> ${escapeHtml(company.email ?? '—')}</div>
                    <div><span style="color:var(--gao-text-muted,#64748b);">City:</span> ${escapeHtml(company.city ?? '—')}</div>
                    <div><span style="color:var(--gao-text-muted,#64748b);">Country:</span> ${escapeHtml(company.country ?? '—')}</div>
                    <div><span style="color:var(--gao-text-muted,#64748b);">Employees:</span> ${company.employee_count ?? '—'}</div>
                    <div><span style="color:var(--gao-text-muted,#64748b);">Revenue:</span> ${company.annual_revenue ? formatCurrency(company.annual_revenue) : '—'}</div>
                </div>
            </div>
        </div>`;
        return res.html(renderPage({ title: company.name, content, activePath: '/companies', user: user ? { name: user.name, role: user.role } : undefined }));
    }
};
__decorate([
    Get('/'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function, Function]),
    __metadata("design:returntype", Promise)
], CompanyController.prototype, "list", null);
__decorate([
    Get('/:id'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function, Function]),
    __metadata("design:returntype", Promise)
], CompanyController.prototype, "detail", null);
CompanyController = __decorate([
    Controller('/companies')
], CompanyController);
export { CompanyController };
//# sourceMappingURL=company.controller.js.map