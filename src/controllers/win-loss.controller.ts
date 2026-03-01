import { Controller, Get } from '@gao/http';
import type { GaoRequest, GaoResponse } from '@gao/http';
import { renderPage } from '../views/renderer.js';
import { WinLossService } from '../services/win-loss.service.js';
import { formatNumber } from '../helpers/format.js';

const service = new WinLossService();

@Controller('/reports/win-loss')
export class WinLossController {
    @Get('/')
    async dashboard(req: GaoRequest, res: GaoResponse) {
        const user = req.user as Record<string, unknown>;
        const summary = await service.getSummary({ period: 'all' });

        const winEmoji = summary.winRate > 60 ? '🟢' : summary.winRate > 40 ? '🟡' : '🔴';

        const reasonRows = summary.topLostReasons.map(r => `
            <tr>
                <td style="font-weight:600;">${r.reason}</td>
                <td style="text-align:center;">${r.count}</td>
            </tr>`).join('');

        const content = `
        <div style="padding:8px;">
            <a href="/reports" style="display:inline-flex;align-items:center;gap:6px;font-size:13px;color:#94a3b8;text-decoration:none;margin-bottom:20px;">← Back to Reports</a>
            <h1 style="font-size:24px;font-weight:700;margin-bottom:24px;">Win/Loss Analysis</h1>

            <!-- Summary Cards -->
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;margin-bottom:24px;">
                <div class="gao-card" style="padding:20px;text-align:center;">
                    <div style="font-size:28px;font-weight:800;color:#6366f1;">${winEmoji} ${summary.winRate.toFixed(1)}%</div>
                    <div style="font-size:12px;color:#64748b;margin-top:4px;">Win Rate</div>
                </div>
                <div class="gao-card" style="padding:20px;text-align:center;">
                    <div style="font-size:28px;font-weight:800;color:#22c55e;">${summary.totalWon}</div>
                    <div style="font-size:12px;color:#64748b;margin-top:4px;">Deals Won</div>
                </div>
                <div class="gao-card" style="padding:20px;text-align:center;">
                    <div style="font-size:28px;font-weight:800;color:#f87171;">${summary.totalLost}</div>
                    <div style="font-size:12px;color:#64748b;margin-top:4px;">Deals Lost</div>
                </div>
                <div class="gao-card" style="padding:20px;text-align:center;">
                    <div style="font-size:28px;font-weight:800;color:#3b82f6;">Rp ${formatNumber(Math.round(summary.avgDealValue))}</div>
                    <div style="font-size:12px;color:#64748b;margin-top:4px;">Avg Deal Value</div>
                </div>
            </div>

            <!-- Top Lost Reasons -->
            <div class="gao-card" style="padding:24px;">
                <h3 style="font-size:16px;font-weight:700;color:#e2e8f0;margin-bottom:16px;">Top Lost Reasons</h3>
                ${reasonRows ? `
                <div class="gao-admin-table-wrapper"><table class="gao-admin-table">
                    <thead><tr><th>Reason</th><th style="text-align:center;">Count</th></tr></thead>
                    <tbody>${reasonRows}</tbody>
                </table></div>` : '<p style="color:#64748b;font-size:13px;text-align:center;padding:20px;">No lost deals yet — great work! 🎉</p>'}
            </div>
        </div>`;

        return res.html(renderPage({ title: 'Win/Loss Analysis', content, activePath: '/reports', user: user ? { name: user.name as string, role: user.role as string } : undefined }));
    }
}
