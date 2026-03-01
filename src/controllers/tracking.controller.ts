import { Controller, Get } from '@gao/http';
import type { GaoRequest, GaoResponse } from '@gao/http';
import { renderPage } from '../views/renderer.js';
import { WebTrackingService } from '../services/web-tracking.service.js';
import { escapeHtml } from '../helpers/escape.js';
import { timeAgo } from '../helpers/format.js';

const service = new WebTrackingService();

@Controller('/tracking')
export class TrackingController {
    @Get('/')
    async index(req: GaoRequest, res: GaoResponse) {
        const user = req.user as Record<string, unknown>;
        const visitors = await service.getRecentVisitors(50);

        const totalVisitors = visitors.length;
        const totalPageViews = visitors.reduce((s, v) => s + (v.total_pageviews ?? 0), 0);

        const rows = visitors.map(v => {
            const contactLink = v.contact_id
                ? `<a href="/contacts/${v.contact_id}" style="color:#818cf8;text-decoration:none;font-weight:600;">${escapeHtml(v.visitor_id?.slice(0, 12) ?? '—')}… 👤</a>`
                : `${escapeHtml(v.visitor_id?.slice(0, 12) ?? '—')}…`;
            return `
            <tr>
                <td style="font-weight:600;">${contactLink}</td>
                <td style="font-size:12px;">${escapeHtml(v.browser ?? '—')}</td>
                <td style="font-size:12px;color:var(--gao-text-muted,#64748b);">${escapeHtml(v.referrer ?? 'Direct')}</td>
                <td style="font-size:12px;color:var(--gao-text-muted,#64748b);">${escapeHtml(v.utm_source ?? '—')}</td>
                <td style="font-size:12px;color:var(--gao-text-muted,#64748b);">${v.total_pageviews ?? 0} pages</td>
                <td style="font-size:12px;color:var(--gao-text-muted,#64748b);">${timeAgo(v.last_activity_at)}</td>
            </tr>`;
        }).join('');

        const content = `
        <div style="padding:8px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
                <h1 style="font-size:24px;font-weight:700;">Web Tracking</h1>
            </div>

            <!-- Tracking Setup Card -->
            <div class="gao-card" style="padding:20px;margin-bottom:20px;border:1px solid rgba(99,102,241,0.2);background:rgba(99,102,241,0.04);">
                <h3 style="font-size:14px;font-weight:700;margin-bottom:8px;">📋 Tracking Script</h3>
                <p style="font-size:12px;color:var(--gao-text-muted,#64748b);margin-bottom:12px;">Add this script to your website to track visitors:</p>
                <div style="display:flex;gap:8px;align-items:center;">
                    <code id="trackingCode" style="flex:1;padding:10px 14px;background:rgba(15,23,42,0.6);border:1px solid rgba(100,116,139,0.25);border-radius:8px;color:#22c55e;font-size:12px;font-family:monospace;overflow-x:auto;">&lt;script src="/api/tracking/script.js" async&gt;&lt;/script&gt;</code>
                    <button onclick="navigator.clipboard.writeText(document.getElementById('trackingCode').textContent);this.textContent='✅ Copied!';setTimeout(()=>this.textContent='Copy',1500)" style="padding:8px 16px;background:rgba(99,102,241,0.15);color:#818cf8;border:none;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;white-space:nowrap;">Copy</button>
                </div>
            </div>

            <!-- Analytics Summary -->
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin-bottom:20px;">
                <div class="gao-card" style="padding:16px;text-align:center;">
                    <div style="font-size:24px;font-weight:800;color:#3b82f6;">${totalVisitors}</div>
                    <div style="font-size:12px;color:var(--gao-text-muted,#64748b);">Visitors</div>
                </div>
                <div class="gao-card" style="padding:16px;text-align:center;">
                    <div style="font-size:24px;font-weight:800;color:#8b5cf6;">${totalPageViews}</div>
                    <div style="font-size:12px;color:var(--gao-text-muted,#64748b);">Page Views</div>
                </div>
                <div class="gao-card" style="padding:16px;text-align:center;">
                    <div style="font-size:24px;font-weight:800;color:#22c55e;">${totalVisitors > 0 ? Math.round(totalPageViews / totalVisitors) : 0}</div>
                    <div style="font-size:12px;color:var(--gao-text-muted,#64748b);">Avg Pages/Visitor</div>
                </div>
                <div class="gao-card" style="padding:16px;text-align:center;">
                    <div style="font-size:24px;font-weight:800;color:#f59e0b;">${visitors.filter(v => v.contact_id).length}</div>
                    <div style="font-size:12px;color:var(--gao-text-muted,#64748b);">Identified</div>
                </div>
            </div>

            <!-- Visitors Table -->
            <div class="gao-card" style="padding:24px;">
                <h3 style="font-size:15px;font-weight:700;margin-bottom:16px;">Recent Visitors</h3>
                <div class="gao-admin-table-wrapper">
                    <table class="gao-admin-table">
                        <thead><tr><th>Visitor ID</th><th>Browser</th><th>Referrer</th><th>UTM Source</th><th>Views</th><th>Last Seen</th></tr></thead>
                        <tbody>${rows || '<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--gao-text-muted,#64748b);">No visitor data — add the tracking script above to your website</td></tr>'}</tbody>
                    </table>
                </div>
            </div>
        </div>`;

        return res.html(renderPage({ title: 'Web Tracking', content, activePath: '/tracking', user: user ? { name: user.name as string, role: user.role as string } : undefined }));
    }
}
