import { Controller, Get } from '@gao/http';
import type { GaoRequest, GaoResponse } from '@gao/http';
import { renderPage } from '../views/renderer.js';
import { AuditTrailService } from '../services/audit-trail.service.js';
import { escapeHtml } from '../helpers/escape.js';
import { timeAgo } from '../helpers/format.js';

const service = new AuditTrailService();

const ACTION_COLORS: Record<string, string> = { create: '#22c55e', update: '#3b82f6', delete: '#ef4444', login: '#8b5cf6', logout: '#94a3b8', export: '#f59e0b', import: '#ec4899' };
const ACTIONS = ['create', 'update', 'delete', 'login', 'logout', 'export', 'import'];

@Controller('/audit')
export class AuditController {
    @Get('/')
    async index(req: GaoRequest, res: GaoResponse) {
        const user = req.user as Record<string, unknown>;
        const currentAction = typeof req.query.action === 'string' ? req.query.action : '';
        const currentEntity = typeof req.query.entity === 'string' ? req.query.entity : '';

        const logs = await service.getRecent(200);
        const filteredLogs = logs
            .filter(l => !currentAction || l.action === currentAction)
            .filter(l => !currentEntity || l.entity_type === currentEntity);

        const entities = [...new Set(logs.map(l => l.entity_type).filter(Boolean))];

        const rows = filteredLogs.slice(0, 100).map(l => `
            <tr>
                <td><span style="padding:3px 8px;border-radius:8px;font-size:10px;font-weight:700;color:#fff;background:${ACTION_COLORS[l.action] ?? '#6366f1'}">${l.action}</span></td>
                <td style="font-weight:600;">${escapeHtml(l.entity_type)}</td>
                <td style="font-size:12px;color:var(--gao-text-muted,#64748b);">${escapeHtml(l.entity_name ?? l.entity_id ?? '—')}</td>
                <td style="font-size:12px;color:var(--gao-text-muted,#64748b);">${escapeHtml(l.ip_address ?? '—')}</td>
                <td style="font-size:12px;color:var(--gao-text-muted,#64748b);">${timeAgo(l.created_at)}</td>
            </tr>`).join('');

        const filterBase = '/audit?';

        const content = `
        <div style="padding:8px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
                <h1 style="font-size:24px;font-weight:700;">Audit Trail</h1>
                <span style="font-size:13px;color:var(--gao-text-muted,#64748b);">${filteredLogs.length} entries</span>
            </div>

            <!-- Action Filter -->
            <div style="display:flex;gap:6px;margin-bottom:12px;flex-wrap:wrap;">
                <a href="/audit${currentEntity ? '?entity=' + currentEntity : ''}" style="padding:5px 12px;border-radius:8px;font-size:11px;font-weight:600;text-decoration:none;${!currentAction ? 'background:rgba(99,102,241,0.2);color:#818cf8;' : 'background:rgba(255,255,255,0.04);color:#94a3b8;'}">All Actions</a>
                ${ACTIONS.map(a => `
                    <a href="${filterBase}action=${a}${currentEntity ? '&entity=' + currentEntity : ''}" style="padding:5px 12px;border-radius:8px;font-size:11px;font-weight:600;text-decoration:none;${currentAction === a ? 'background:rgba(99,102,241,0.2);color:#818cf8;' : 'background:rgba(255,255,255,0.04);color:#94a3b8;'}">
                        <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${ACTION_COLORS[a] ?? '#6366f1'};margin-right:4px;"></span>${a}
                    </a>
                `).join('')}
            </div>

            <!-- Entity Filter -->
            <div style="display:flex;gap:6px;margin-bottom:16px;flex-wrap:wrap;">
                <a href="/audit${currentAction ? '?action=' + currentAction : ''}" style="padding:5px 12px;border-radius:8px;font-size:11px;font-weight:600;text-decoration:none;${!currentEntity ? 'background:rgba(99,102,241,0.2);color:#818cf8;' : 'background:rgba(255,255,255,0.04);color:#94a3b8;'}">All Entities</a>
                ${entities.map(e => `
                    <a href="${filterBase}${currentAction ? 'action=' + currentAction + '&' : ''}entity=${e}" style="padding:5px 12px;border-radius:8px;font-size:11px;font-weight:600;text-decoration:none;${currentEntity === e ? 'background:rgba(99,102,241,0.2);color:#818cf8;' : 'background:rgba(255,255,255,0.04);color:#94a3b8;'}">${e}</a>
                `).join('')}
            </div>

            <div class="gao-card" style="padding:24px;">
                <div class="gao-admin-table-wrapper">
                    <table class="gao-admin-table">
                        <thead><tr><th>Action</th><th>Entity</th><th>Name/ID</th><th>IP Address</th><th>When</th></tr></thead>
                        <tbody>${rows || '<tr><td colspan="5" style="text-align:center;padding:40px;color:var(--gao-text-muted,#64748b);">No audit logs match filters</td></tr>'}</tbody>
                    </table>
                </div>
            </div>
        </div>`;

        return res.html(renderPage({ title: 'Audit Trail', content, activePath: '/audit', user: user ? { name: user.name as string, role: user.role as string } : undefined }));
    }
}
