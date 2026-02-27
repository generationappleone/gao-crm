import { Controller, Get } from '@gao/http';
import type { GaoRequest, GaoResponse } from '@gao/http';
import { renderPage } from '../views/renderer.js';
import { ActivityService } from '../services/activity.service.js';
import { parsePagination, renderPaginationHtml } from '../helpers/pagination.js';
import { escapeHtml } from '../helpers/escape.js';
import { timeAgo } from '../helpers/format.js';

const activityService = new ActivityService();

const TYPE_ICONS: Record<string, string> = {
    call: '📞', meeting: '🤝', email: '📧', task: '✅', note: '📝',
};

@Controller('/activities')
export class ActivityController {
    @Get('/')
    async list(req: GaoRequest, res: GaoResponse) {
        const pagination = parsePagination(req.query);
        const result = await activityService.list(pagination, req.query.type);
        const user = req.user as Record<string, unknown>;

        const tableRows = result.activities.map((a) => `<tr>
            <td>${TYPE_ICONS[a.type] ?? '📋'} <span style="font-weight:600;">${escapeHtml(a.subject)}</span></td>
            <td><span style="padding:4px 10px;border-radius:12px;font-size:11px;font-weight:700;color:#fff;background:${a.type === 'call' ? '#3b82f6' : a.type === 'meeting' ? '#8b5cf6' : a.type === 'email' ? '#22c55e' : '#f59e0b'}">${escapeHtml(a.type)}</span></td>
            <td>${a.is_completed ? '<span style="color:#22c55e;font-weight:600;">✓ Done</span>' : '<span style="color:#f59e0b;">Pending</span>'}</td>
            <td style="font-size:13px;color:var(--gao-text-muted,#64748b);">${timeAgo(a.created_at)}</td>
        </tr>`).join('');

        const content = `
        <div style="padding:8px;">
            <h1 style="font-size:24px;font-weight:700;margin-bottom:24px;">Activities</h1>

            <div style="display:flex;gap:8px;margin-bottom:20px;">
                <a href="/activities" style="padding:8px 16px;border-radius:8px;font-size:12px;font-weight:600;text-decoration:none;${!req.query.type ? 'background:#6366f1;color:#fff;' : 'background:rgba(255,255,255,0.05);color:#94a3b8;'}">All</a>
                ${['call', 'meeting', 'email', 'task'].map(t => `<a href="/activities?type=${t}" style="padding:8px 16px;border-radius:8px;font-size:12px;font-weight:600;text-decoration:none;${req.query.type === t ? 'background:#6366f1;color:#fff;' : 'background:rgba(255,255,255,0.05);color:#94a3b8;'}">${TYPE_ICONS[t] ?? ''} ${t}</a>`).join('')}
            </div>

            <div class="gao-card" style="padding:24px;">
                <div class="gao-admin-table-wrapper">
                    <table class="gao-admin-table">
                        <thead><tr><th>Activity</th><th>Type</th><th>Status</th><th>Created</th></tr></thead>
                        <tbody>${tableRows || '<tr><td colspan="4" style="text-align:center;padding:40px;color:var(--gao-text-muted,#64748b);">No activities found</td></tr>'}</tbody>
                    </table>
                </div>
                ${renderPaginationHtml(result.meta, '/activities')}
            </div>
        </div>`;

        return res.html(renderPage({ title: 'Activities', content, activePath: '/activities', user: user ? { name: user.name as string, role: user.role as string } : undefined }));
    }
}
