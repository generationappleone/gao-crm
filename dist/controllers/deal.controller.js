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
import { DealService } from '../services/deal.service.js';
import { parsePagination, renderPaginationHtml } from '../helpers/pagination.js';
import { escapeHtml } from '../helpers/escape.js';
import { formatCurrency, timeAgo } from '../helpers/format.js';
const dealService = new DealService();
let DealController = class DealController {
    async list(req, res) {
        const pagination = parsePagination(req.query);
        const result = await dealService.list(pagination, req.query.stage_id);
        const stages = await dealService.getStages();
        const user = req.user;
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
        return res.html(renderPage({ title: 'Deals', content, activePath: '/deals', user: user ? { name: user.name, role: user.role } : undefined }));
    }
    async detail(req, res) {
        const deal = await dealService.findById(req.params.id);
        if (!deal)
            return res.redirect('/deals');
        const stages = await dealService.getStages();
        const stageMap = new Map(stages.map(s => [s.id, s]));
        const currentStage = stageMap.get(deal.stage_id);
        const user = req.user;
        const content = `
        <div style="padding:8px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
                <div>
                    <h1 style="font-size:24px;font-weight:700;">${escapeHtml(deal.title)}</h1>
                    <p style="color:var(--gao-text-muted,#64748b);font-size:14px;margin-top:4px;">${formatCurrency(deal.value, deal.currency)}</p>
                </div>
                <span style="padding:6px 14px;border-radius:12px;font-size:12px;font-weight:700;color:#fff;background:${currentStage?.color ?? '#6366f1'}">${escapeHtml(currentStage?.name ?? '—')}</span>
            </div>

            <div style="display:flex;gap:4px;margin-bottom:24px;">
                ${stages.filter(s => !s.is_lost).map(s => `<div style="flex:1;height:8px;border-radius:4px;background:${s.display_order <= (currentStage?.display_order ?? 0) ? (s.color ?? '#6366f1') : 'rgba(255,255,255,0.1)'}"></div>`).join('')}
            </div>

            <div class="gao-card" style="padding:24px;">
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;font-size:14px;">
                    <div><span style="color:var(--gao-text-muted,#64748b);">Probability:</span> ${deal.probability}%</div>
                    <div><span style="color:var(--gao-text-muted,#64748b);">Expected Close:</span> ${deal.expected_close_at ?? '—'}</div>
                    <div><span style="color:var(--gao-text-muted,#64748b);">Won:</span> ${deal.won_at ? '✅ ' + timeAgo(deal.won_at) : '—'}</div>
                    <div><span style="color:var(--gao-text-muted,#64748b);">Lost:</span> ${deal.lost_at ? '❌ ' + timeAgo(deal.lost_at) : '—'}</div>
                </div>
            </div>
        </div>`;
        return res.html(renderPage({ title: deal.title, content, activePath: '/deals', user: user ? { name: user.name, role: user.role } : undefined }));
    }
};
__decorate([
    Get('/'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function, Function]),
    __metadata("design:returntype", Promise)
], DealController.prototype, "list", null);
__decorate([
    Get('/:id'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function, Function]),
    __metadata("design:returntype", Promise)
], DealController.prototype, "detail", null);
DealController = __decorate([
    Controller('/deals')
], DealController);
export { DealController };
//# sourceMappingURL=deal.controller.js.map