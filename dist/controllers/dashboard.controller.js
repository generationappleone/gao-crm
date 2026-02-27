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
import { DashboardService } from '../services/dashboard.service.js';
import { escapeHtml } from '../helpers/escape.js';
import { formatCurrency, formatNumber, formatPercentage, timeAgo } from '../helpers/format.js';
import { statCard } from '@gao/ui';
const dashboardService = new DashboardService();
let DashboardController = class DashboardController {
    async dashboard(req, res) {
        const stats = await dashboardService.getStats();
        const user = req.user;
        const statCards = `
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;margin-bottom:24px;">
            ${statCard({ label: 'Total Contacts', value: formatNumber(stats.totalContacts), icon: 'users', iconColor: '#3b82f6' })}
            ${statCard({ label: 'Total Deals', value: formatNumber(stats.totalDeals), icon: 'dollar', iconColor: '#8b5cf6' })}
            ${statCard({ label: 'Revenue', value: formatCurrency(stats.totalRevenue), icon: 'dollar', iconColor: '#22c55e' })}
            ${statCard({ label: 'Win Rate', value: formatPercentage(stats.winRate), icon: 'target', iconColor: '#f59e0b' })}
        </div>`;
        const pipelineCards = stats.pipeline.map(s => `
            <div style="flex:1;min-width:120px;background:rgba(255,255,255,0.03);border:1px solid rgba(100,116,139,0.15);border-radius:12px;padding:16px;text-align:center;">
                <div style="width:10px;height:10px;border-radius:50%;background:${s.color};display:inline-block;margin-bottom:8px;"></div>
                <div style="font-size:13px;font-weight:600;color:#cbd5e1;">${escapeHtml(s.name)}</div>
                <div style="font-size:24px;font-weight:800;color:#e2e8f0;margin:4px 0;">${s.count}</div>
                <div style="font-size:12px;color:var(--gao-text-muted,#64748b);">${formatCurrency(s.value)}</div>
            </div>`).join('');
        const activityRows = stats.recentActivities.map(a => `
            <div style="display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid rgba(100,116,139,0.1);">
                <div style="font-size:18px;">${a.type === 'call' ? '📞' : a.type === 'meeting' ? '🤝' : a.type === 'email' ? '📧' : '✅'}</div>
                <div style="flex:1;">
                    <div style="font-size:13px;font-weight:600;">${escapeHtml(a.subject)}</div>
                    <div style="font-size:12px;color:var(--gao-text-muted,#64748b);">${timeAgo(a.created_at)}</div>
                </div>
                <div>${a.is_completed ? '<span style="color:#22c55e;font-size:11px;font-weight:700;">Done</span>' : '<span style="color:#f59e0b;font-size:11px;font-weight:700;">Pending</span>'}</div>
            </div>`).join('');
        const content = `
        <div style="padding:8px;">
            <h1 style="font-size:24px;font-weight:700;margin-bottom:24px;">Dashboard</h1>
            ${statCards}

            <div style="display:grid;grid-template-columns:2fr 1fr;gap:20px;">
                <div>
                    <div class="gao-card" style="padding:24px;margin-bottom:20px;">
                        <h3 style="font-size:15px;font-weight:700;margin-bottom:16px;">Sales Pipeline</h3>
                        <div style="display:flex;gap:12px;flex-wrap:wrap;">${pipelineCards}</div>
                    </div>

                    <div class="gao-card" style="padding:24px;">
                        <h3 style="font-size:15px;font-weight:700;margin-bottom:4px;">Pipeline Summary</h3>
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px;font-size:14px;">
                            <div><span style="color:var(--gao-text-muted,#64748b);">Total Deal Value:</span><br><strong>${formatCurrency(stats.totalDealValue)}</strong></div>
                            <div><span style="color:var(--gao-text-muted,#64748b);">Companies:</span><br><strong>${formatNumber(stats.totalCompanies)}</strong></div>
                            <div><span style="color:var(--gao-text-muted,#64748b);">Won Deals:</span><br><strong style="color:#22c55e;">${stats.wonDeals}</strong></div>
                            <div><span style="color:var(--gao-text-muted,#64748b);">Lost Deals:</span><br><strong style="color:#ef4444;">${stats.lostDeals}</strong></div>
                        </div>
                    </div>
                </div>

                <div class="gao-card" style="padding:24px;">
                    <h3 style="font-size:15px;font-weight:700;margin-bottom:16px;">Recent Activities</h3>
                    ${activityRows || '<p style="color:var(--gao-text-muted,#64748b);font-size:13px;">No recent activities</p>'}
                </div>
            </div>
        </div>`;
        return res.html(renderPage({
            title: 'Dashboard',
            content,
            activePath: '/',
            user: user ? { name: user.name, role: user.role } : undefined,
        }));
    }
};
__decorate([
    Get('/'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function, Function]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "dashboard", null);
DashboardController = __decorate([
    Controller('/')
], DashboardController);
export { DashboardController };
//# sourceMappingURL=dashboard.controller.js.map