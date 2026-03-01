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
import { getOnboardingSteps, renderOnboardingWizard } from '../helpers/onboarding.js';
const dashboardService = new DashboardService();
let DashboardController = class DashboardController {
    async dashboard(req, res) {
        const stats = await dashboardService.getStats();
        const user = req.user;
        const userName = user?.name ?? 'User';
        // ─── Onboarding Check ────────────────────────────
        // Show welcome wizard if user is new (no data yet)
        const hasData = stats.totalContacts > 0 || stats.totalDeals > 0 || stats.totalRevenue > 0;
        const skipOnboarding = req.query.skip_onboarding === 'true';
        if (!hasData && !skipOnboarding) {
            const progress = {
                products_added: stats.totalProducts > 0 || false,
                contacts_added: stats.totalContacts > 0,
                deals_created: stats.totalDeals > 0,
                quotations_sent: stats.totalQuotations > 0 || false,
                invoices_created: stats.totalRevenue > 0,
            };
            const steps = getOnboardingSteps(progress);
            const content = renderOnboardingWizard(userName, steps);
            return res.html(renderPage({ title: 'Welcome', content, activePath: '/', user: user ? { name: user.name, role: user.role } : undefined }));
        }
        // ─── 6 Clickable Stat Cards ───────────────────────────
        const statCards = `
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:16px;margin-bottom:24px;">
            <a href="/contacts" style="text-decoration:none;color:inherit;">
                ${statCard({ label: 'Total Contacts', value: formatNumber(stats.totalContacts), icon: 'users', iconColor: '#3b82f6' })}
            </a>
            <a href="/deals" style="text-decoration:none;color:inherit;">
                ${statCard({ label: 'Active Deals', value: formatNumber(stats.totalDeals), icon: 'dollar', iconColor: '#8b5cf6' })}
            </a>
            <a href="/invoices" style="text-decoration:none;color:inherit;">
                ${statCard({ label: 'Revenue', value: formatCurrency(stats.totalRevenue), icon: 'dollar', iconColor: '#22c55e' })}
            </a>
            <a href="/pipelines" style="text-decoration:none;color:inherit;">
                ${statCard({ label: 'Win Rate', value: formatPercentage(stats.winRate), icon: 'target', iconColor: '#f59e0b' })}
            </a>
            <a href="/companies" style="text-decoration:none;color:inherit;">
                ${statCard({ label: 'Companies', value: formatNumber(stats.totalCompanies), icon: 'store', iconColor: '#ec4899' })}
            </a>
            <a href="/deals?status=won" style="text-decoration:none;color:inherit;">
                ${statCard({ label: 'Won Deals', value: String(stats.wonDeals), icon: 'check-circle', iconColor: '#22c55e' })}
            </a>
        </div>`;
        // ─── Sales Pipeline ───────────────────────────────────────
        const totalPipelineDeals = stats.pipeline.reduce((s, p) => s + p.count, 0);
        const pipelineCards = stats.pipeline.map(s => {
            const pct = totalPipelineDeals > 0 ? Math.round((s.count / totalPipelineDeals) * 100) : 0;
            return `
            <div style="flex:1;min-width:120px;background:var(--gao-surface, rgba(255,255,255,0.03));border:1px solid var(--gao-border-light, rgba(100,116,139,0.15));border-left:3px solid ${s.color};border-radius:12px;padding:16px;text-align:center;transition:transform 0.15s,box-shadow 0.15s;cursor:default;"
                 onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 4px 12px rgba(0,0,0,0.15)'"
                 onmouseout="this.style.transform='none';this.style.boxShadow='none'">
                <div style="font-size:13px;font-weight:600;color:var(--gao-text-secondary, #cbd5e1);margin-bottom:6px;">${escapeHtml(s.name)}</div>
                <div style="font-size:28px;font-weight:800;color:var(--gao-text, #e2e8f0);margin:4px 0;">${s.count}</div>
                <div style="font-size:12px;color:var(--gao-text-muted,#64748b);margin-bottom:8px;">${formatCurrency(s.value)}</div>
                <div style="height:4px;background:var(--gao-gray-100, rgba(255,255,255,0.06));border-radius:4px;overflow:hidden;">
                    <div style="height:100%;width:${pct}%;background:${s.color};border-radius:4px;transition:width 0.5s ease;"></div>
                </div>
                <div style="font-size:10px;color:var(--gao-text-muted,#64748b);margin-top:4px;">${pct}%</div>
            </div>`;
        }).join('');
        // ─── Today's Tasks (pending activities) ───────────────
        const todayTasks = stats.recentActivities
            .filter((a) => !a.is_completed)
            .slice(0, 5);
        const taskRows = todayTasks.length > 0
            ? todayTasks.map(a => `
                <div style="display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid rgba(100,116,139,0.1);">
                    <button onclick="fetch('/api/activities/${a.id}',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({is_completed:true})}).then(()=>this.closest('div[style]').style.opacity='0.4')"
                        style="width:24px;height:24px;border-radius:6px;border:2px solid #64748b;background:transparent;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.2s;flex-shrink:0;"
                        onmouseover="this.style.borderColor='#22c55e';this.style.background='rgba(34,197,94,0.1)'"
                        onmouseout="this.style.borderColor='#64748b';this.style.background='transparent'"
                        title="Mark as done">
                    </button>
                    <div style="font-size:18px;flex-shrink:0;">${a.type === 'call' ? '📞' : a.type === 'meeting' ? '🤝' : a.type === 'email' ? '📧' : '✅'}</div>
                    <div style="flex:1;min-width:0;">
                        <div style="font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(a.subject)}</div>
                        <div style="font-size:12px;color:var(--gao-text-muted,#64748b);">${timeAgo(a.created_at)}</div>
                    </div>
                    <span style="font-size:11px;padding:3px 8px;border-radius:6px;background:rgba(245,158,11,0.15);color:#f59e0b;font-weight:600;">Pending</span>
                </div>`).join('')
            : '<p style="color:var(--gao-text-muted,#64748b);font-size:13px;padding:12px 0;">🎉 No pending tasks — you\'re all caught up!</p>';
        // ─── Recent Activities Timeline ───────────────────────
        const activityRows = stats.recentActivities.slice(0, 8).map(a => `
            <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid rgba(100,116,139,0.08);">
                <div style="font-size:16px;">${a.type === 'call' ? '📞' : a.type === 'meeting' ? '🤝' : a.type === 'email' ? '📧' : '✅'}</div>
                <div style="flex:1;min-width:0;">
                    <div style="font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(a.subject)}</div>
                    <div style="font-size:12px;color:var(--gao-text-muted,#64748b);">${timeAgo(a.created_at)}</div>
                </div>
                <div>${a.is_completed ? '<span style="color:#22c55e;font-size:11px;font-weight:700;">Done</span>' : '<span style="color:#f59e0b;font-size:11px;font-weight:700;">Pending</span>'}</div>
            </div>`).join('');
        // ─── Business Health + Revenue ────────────────────────
        const healthColor = stats.winRate >= 60 ? '#22c55e' : stats.winRate >= 40 ? '#f59e0b' : '#ef4444';
        const content = `
        <div style="padding:8px;">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;">
                <div>
                    <h1 style="font-size:24px;font-weight:700;">Dashboard</h1>
                    <p style="font-size:14px;color:var(--gao-text-muted,#64748b);margin-top:4px;">Business overview at a glance</p>
                </div>
                <a href="/activities/create" style="display:inline-flex;align-items:center;gap:6px;padding:8px 16px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;border-radius:10px;text-decoration:none;font-size:13px;font-weight:600;transition:opacity 0.2s;" onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">
                    + Log Activity
                </a>
            </div>

            ${statCards}

            <div style="display:grid;grid-template-columns:2fr 1fr;gap:20px;margin-bottom:20px;">
                <div>
                    <div class="gao-card" style="padding:24px;margin-bottom:20px;">
                        <h3 style="font-size:15px;font-weight:700;margin-bottom:16px;">Sales Pipeline</h3>
                        <div style="display:flex;gap:12px;flex-wrap:wrap;">${pipelineCards}</div>
                    </div>

                    <div class="gao-card" style="padding:24px;">
                        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
                            <h3 style="font-size:15px;font-weight:700;">Pipeline Summary</h3>
                        </div>
                        <!-- Stacked progress bar -->
                        <div style="display:flex;height:12px;border-radius:6px;overflow:hidden;margin-bottom:16px;background:var(--gao-gray-100, rgba(255,255,255,0.06));">
                            ${stats.pipeline.map(s => {
            const pct = totalPipelineDeals > 0 ? Math.max((s.count / totalPipelineDeals) * 100, s.count > 0 ? 5 : 0) : 0;
            return `<div style="width:${pct}%;background:${s.color};transition:width 0.5s ease;" title="${s.name}: ${s.count}"></div>`;
        }).join('')}
                        </div>
                        <div style="display:flex;flex-wrap:wrap;gap:12px;margin-bottom:16px;">
                            ${stats.pipeline.map(s => `
                                <div style="display:flex;align-items:center;gap:6px;font-size:12px;">
                                    <div style="width:8px;height:8px;border-radius:2px;background:${s.color};"></div>
                                    <span style="color:var(--gao-text-secondary, #64748b);">${s.name}</span>
                                    <strong style="color:var(--gao-text, #e2e8f0);">${s.count}</strong>
                                </div>
                            `).join('')}
                        </div>
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:13px;padding-top:12px;border-top:1px solid var(--gao-border-light, rgba(100,116,139,0.1));">
                            <div><span style="color:var(--gao-text-muted,#64748b);">Total Value</span><br><strong>${formatCurrency(stats.totalDealValue)}</strong></div>
                            <div><span style="color:var(--gao-text-muted,#64748b);">Emails Sent</span><br><strong>${formatNumber(stats.emailsSent)}</strong></div>
                            <div><span style="color:var(--gao-text-muted,#64748b);">Won</span><br><strong style="color:#22c55e;">${stats.wonDeals}</strong></div>
                            <div><span style="color:var(--gao-text-muted,#64748b);">Lost</span><br><strong style="color:#ef4444;">${stats.lostDeals}</strong></div>
                        </div>
                    </div>
                </div>

                <div>
                    <div class="gao-card" style="padding:24px;margin-bottom:20px;">
                        <h3 style="font-size:15px;font-weight:700;margin-bottom:12px;">📋 Today's Tasks</h3>
                        ${taskRows}
                        ${todayTasks.length > 0 ? `<a href="/activities" style="display:block;text-align:center;font-size:12px;color:var(--gao-primary, #818cf8);margin-top:12px;text-decoration:none;">View all activities →</a>` : ''}
                    </div>

                    <div class="gao-card" style="padding:24px;">
                        <h3 style="font-size:15px;font-weight:700;margin-bottom:16px;">📊 Business Health</h3>
                        <!-- SVG Donut Ring -->
                        <div style="display:flex;flex-direction:column;align-items:center;padding:8px 0;">
                            <div style="position:relative;width:110px;height:110px;margin-bottom:12px;">
                                <svg width="110" height="110" style="transform:rotate(-90deg)">
                                    <circle cx="55" cy="55" r="46" stroke="var(--gao-danger-bg, rgba(239,68,68,0.2))" stroke-width="8" fill="none"/>
                                    <circle cx="55" cy="55" r="46" stroke="${healthColor}" stroke-width="8" fill="none"
                                        stroke-dasharray="${2 * Math.PI * 46}" stroke-dashoffset="${2 * Math.PI * 46 - (stats.winRate / 100) * 2 * Math.PI * 46}" stroke-linecap="round"
                                        style="transition:stroke-dashoffset 0.8s ease;"/>
                                </svg>
                                <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:800;color:${healthColor};">${formatPercentage(stats.winRate)}</div>
                            </div>
                            <div style="font-size:12px;color:var(--gao-text-muted,#64748b);margin-bottom:12px;">Win Rate</div>
                        </div>
                        <div style="display:grid;gap:8px;font-size:13px;">
                            <div style="display:flex;justify-content:space-between;"><span style="color:var(--gao-text-muted,#64748b);">Revenue</span><strong style="color:#22c55e;">${formatCurrency(stats.totalRevenue)}</strong></div>
                            <div style="display:flex;justify-content:space-between;"><span style="color:var(--gao-text-muted,#64748b);">Pipeline</span><strong>${formatCurrency(stats.totalDealValue)}</strong></div>
                            <div style="display:flex;justify-content:space-between;"><span style="color:var(--gao-text-muted,#64748b);">Quotations</span><strong>${stats.quotationsSent}</strong></div>
                            <div style="display:flex;justify-content:space-between;"><span style="color:var(--gao-text-muted,#64748b);">Events (7d)</span><strong>${stats.upcomingEvents}</strong></div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="gao-card" style="padding:24px;">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
                    <h3 style="font-size:15px;font-weight:700;">Recent Activities</h3>
                    <a href="/activities" style="font-size:12px;color:#818cf8;text-decoration:none;">View all →</a>
                </div>
                ${activityRows || '<p style="color:var(--gao-text-muted,#64748b);font-size:13px;">No recent activities</p>'}
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