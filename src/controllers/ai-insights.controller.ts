import { Controller, Get } from '@gao/http';
import type { GaoRequest, GaoResponse } from '@gao/http';
import { renderPage } from '../views/renderer.js';
import { AiSalesService } from '../services/ai-sales.service.js';

const service = new AiSalesService();

@Controller('/reports/ai-insights')
export class AiInsightsController {
    @Get('/')
    async index(req: GaoRequest, res: GaoResponse) {
        const user = req.user as Record<string, unknown>;

        let insights: Awaited<ReturnType<AiSalesService['getMonthlyInsights']>> | null = null;
        const hasGenerated = typeof req.query.generate === 'string';

        if (hasGenerated) {
            insights = await service.getMonthlyInsights();
        }

        const recoHtml = insights ? insights.recommendations.map(r => `
            <div style="display:flex;gap:10px;align-items:flex-start;padding:12px;background:rgba(255,255,255,0.02);border-radius:10px;border:1px solid rgba(100,116,139,0.12);margin-bottom:8px;">
                <span style="font-size:20px;">${r.icon}</span>
                <div>
                    <span style="font-size:10px;font-weight:700;color:#818cf8;text-transform:uppercase;">${r.category}</span>
                    <p style="font-size:13px;color:#e2e8f0;margin-top:2px;">${r.suggestion}</p>
                </div>
            </div>`).join('') : '';

        const newProductHtml = insights ? insights.new_product_opportunities.map(p => `
            <span style="display:inline-block;padding:4px 12px;background:rgba(34,197,94,0.1);color:#22c55e;border-radius:20px;font-size:12px;font-weight:600;margin:4px;">${p}</span>`).join('') : '';

        const content = `
        <div style="padding:8px;">
            <a href="/reports" style="display:inline-flex;align-items:center;gap:6px;font-size:13px;color:#94a3b8;text-decoration:none;margin-bottom:20px;">← Back to Reports</a>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
                <h1 style="font-size:24px;font-weight:700;">🤖 AI Sales Insights</h1>
                <a href="/reports/ai-insights?generate=1" style="padding:12px 24px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:700;text-decoration:none;">🤖 Generate Monthly Report</a>
            </div>

            ${insights ? `
            <div class="gao-card" style="padding:32px;margin-bottom:16px;">
                <h3 style="font-size:16px;font-weight:700;color:#e2e8f0;margin-bottom:12px;">📊 Summary</h3>
                <p style="font-size:14px;color:#e2e8f0;line-height:1.6;">${insights.summary}</p>
            </div>

            <div class="gao-card" style="padding:32px;margin-bottom:16px;">
                <h3 style="font-size:16px;font-weight:700;color:#e2e8f0;margin-bottom:16px;">💡 Recommendations</h3>
                ${recoHtml}
            </div>

            <div class="gao-card" style="padding:32px;">
                <h3 style="font-size:16px;font-weight:700;color:#e2e8f0;margin-bottom:12px;">🆕 New Product Opportunities</h3>
                <div>${newProductHtml}</div>
            </div>
            ` : `
            <div class="gao-card" style="padding:48px;text-align:center;">
                <div style="font-size:48px;margin-bottom:16px;">🤖</div>
                <h3 style="font-size:18px;font-weight:700;color:#e2e8f0;">AI Monthly Sales Intelligence</h3>
                <p style="font-size:13px;color:#64748b;margin-top:8px;">Click "Generate Monthly Report" to analyze this month's sales data and get strategic recommendations.</p>
            </div>
            `}
        </div>`;

        return res.html(renderPage({ title: 'AI Insights', content, activePath: '/reports', user: user ? { name: user.name as string, role: user.role as string } : undefined }));
    }
}
