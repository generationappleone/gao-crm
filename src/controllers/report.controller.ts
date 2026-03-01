import { Controller, Get } from '@gao/http';
import type { GaoRequest, GaoResponse } from '@gao/http';
import { renderPage } from '../views/renderer.js';
import { ReportBuilderService } from '../services/report-builder.service.js';
import { escapeHtml } from '../helpers/escape.js';
import { timeAgo } from '../helpers/format.js';
import { url } from '../helpers/url.js';

const service = new ReportBuilderService();

const TYPE_ICONS: Record<string, string> = { table: '📊', summary: '📋', chart: '📈', pivot: '🔄' };

@Controller('/reports')
export class ReportController {
    @Get('/')
    async list(req: GaoRequest, res: GaoResponse) {
        const user = req.user as Record<string, unknown>;
        const reports = await service.list();

        const cards = reports.map(r => `
            <a href="/reports/${r.id}" style="text-decoration:none;">
                <div class="gao-card" style="padding:20px;cursor:pointer;transition:transform 0.15s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform=''">
                    <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px;">
                        <span style="font-size:24px;">${TYPE_ICONS[r.report_type] ?? '📊'}</span>
                        <div>
                            <h3 style="font-size:15px;font-weight:700;color:#e2e8f0;">${escapeHtml(r.name)}</h3>
                            <span style="font-size:11px;color:var(--gao-text-muted,#64748b);">${escapeHtml(r.entity_type)} · ${escapeHtml(r.report_type)}</span>
                        </div>
                    </div>
                    <p style="font-size:12px;color:var(--gao-text-muted,#64748b);">${escapeHtml(r.description?.slice(0, 100) ?? 'No description')}</p>
                    <div style="display:flex;justify-content:space-between;margin-top:10px;font-size:11px;color:var(--gao-text-muted,#64748b);">
                        <span>${r.is_public ? '🌐 Public' : '🔒 Private'}${r.is_favorite ? ' · ⭐' : ''}</span>
                        <span>${r.last_run_at ? 'Last run ' + timeAgo(r.last_run_at) : 'Never run'}</span>
                    </div>
                </div>
            </a>`).join('');

        const content = `
        <div style="padding:8px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
                <h1 style="font-size:24px;font-weight:700;">Reports</h1>
                <a href="/reports/create" style="display:inline-flex;align-items:center;gap:6px;padding:8px 16px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;border-radius:10px;text-decoration:none;font-size:13px;font-weight:600;">+ Create Report</a>
            </div>
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:16px;">
                ${cards || '<p style="color:var(--gao-text-muted,#64748b);">No reports yet — create your first report</p>'}
            </div>
        </div>`;

        return res.html(renderPage({ title: 'Reports', content, activePath: '/reports', user: user ? { name: user.name as string, role: user.role as string } : undefined }));
    }

    @Get('/create')
    async create(req: GaoRequest, res: GaoResponse) {
        const user = req.user as Record<string, unknown>;

        const content = `
        <div style="padding:8px;max-width:640px;">
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px;">
                <a href="/reports" style="color:#94a3b8;text-decoration:none;font-size:13px;">← Back</a>
                <h1 style="font-size:24px;font-weight:700;">Create Report</h1>
            </div>
            <form id="reportForm" class="gao-card" style="padding:24px;">
                <div style="margin-bottom:20px;">
                    <label style="display:block;font-size:13px;font-weight:600;color:#cbd5e1;margin-bottom:6px;">Report Name *</label>
                    <input name="name" required style="width:100%;padding:10px 14px;background:rgba(255,255,255,0.04);border:1px solid rgba(100,116,139,0.25);border-radius:8px;color:#e2e8f0;font-size:14px;" placeholder="e.g. Monthly Sales Summary" />
                </div>
                <div style="margin-bottom:20px;">
                    <label style="display:block;font-size:13px;font-weight:600;color:#cbd5e1;margin-bottom:6px;">Description</label>
                    <textarea name="description" rows="2" style="width:100%;padding:10px 14px;background:rgba(255,255,255,0.04);border:1px solid rgba(100,116,139,0.25);border-radius:8px;color:#e2e8f0;font-size:14px;resize:vertical;"></textarea>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px;">
                    <div>
                        <label style="display:block;font-size:13px;font-weight:600;color:#cbd5e1;margin-bottom:6px;">Entity Type *</label>
                        <select name="entity_type" required style="width:100%;padding:10px 14px;background:rgba(255,255,255,0.04);border:1px solid rgba(100,116,139,0.25);border-radius:8px;color:#e2e8f0;font-size:14px;">
                            <option value="contacts">Contacts</option>
                            <option value="deals">Deals</option>
                            <option value="companies">Companies</option>
                            <option value="tickets">Tickets</option>
                            <option value="activities">Activities</option>
                            <option value="invoices">Invoices</option>
                        </select>
                    </div>
                    <div>
                        <label style="display:block;font-size:13px;font-weight:600;color:#cbd5e1;margin-bottom:6px;">Report Type *</label>
                        <select name="report_type" required style="width:100%;padding:10px 14px;background:rgba(255,255,255,0.04);border:1px solid rgba(100,116,139,0.25);border-radius:8px;color:#e2e8f0;font-size:14px;">
                            <option value="table">📊 Table</option>
                            <option value="summary">📋 Summary</option>
                            <option value="chart">📈 Chart</option>
                        </select>
                    </div>
                </div>
                <div style="margin-bottom:24px;">
                    <label style="display:block;font-size:13px;font-weight:600;color:#cbd5e1;margin-bottom:6px;">Chart Type</label>
                    <select name="chart_type" style="width:100%;padding:10px 14px;background:rgba(255,255,255,0.04);border:1px solid rgba(100,116,139,0.25);border-radius:8px;color:#e2e8f0;font-size:14px;">
                        <option value="">None</option>
                        <option value="bar">Bar Chart</option>
                        <option value="line">Line Chart</option>
                        <option value="donut">Donut Chart</option>
                    </select>
                </div>
                <div style="display:flex;gap:12px;">
                    <button type="submit" style="padding:10px 24px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;">Create Report</button>
                    <a href="/reports" style="padding:10px 24px;background:rgba(255,255,255,0.06);color:#94a3b8;border-radius:8px;text-decoration:none;font-size:14px;display:flex;align-items:center;">Cancel</a>
                </div>
            </form>
            <script>
            document.getElementById('reportForm').addEventListener('submit', async function(e) {
                e.preventDefault();
                const fd = new FormData(this);
                const body = {
                    name: fd.get('name'),
                    description: fd.get('description') || null,
                    entity_type: fd.get('entity_type'),
                    report_type: fd.get('report_type'),
                    chart_type: fd.get('chart_type') || null,
                    owner_id: null,
                };
                const res = await fetch('/api/reports', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body),
                });
                if (res.ok) window.location.href = '/reports';
                else alert('Error creating report');
            });
            </script>
        </div>`;

        return res.html(renderPage({ title: 'Create Report', content, activePath: '/reports', user: user ? { name: user.name as string, role: user.role as string } : undefined }));
    }

    @Get('/:id')
    async detail(req: GaoRequest, res: GaoResponse) {
        const user = req.user as Record<string, unknown>;

        let report;
        let data: unknown[] = [];
        try {
            const result = await service.execute(req.params.id);
            report = result.report;
            data = result.data;
        } catch {
            return res.redirect(url('/reports'));
        }

        const dataRows = data.length > 0
            ? `<p style="font-size:13px;color:#cbd5e1;">${data.length} records found</p>`
            : '<p style="font-size:13px;color:var(--gao-text-muted,#64748b);">No data — this report has no results yet. Add data to your CRM to see results.</p>';

        const content = `
        <div style="padding:8px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
                <div>
                    <h1 style="font-size:24px;font-weight:700;">${escapeHtml(report.name)}</h1>
                    <div style="display:flex;gap:8px;margin-top:6px;">
                        <span style="padding:3px 10px;border-radius:8px;font-size:11px;font-weight:700;background:rgba(99,102,241,0.15);color:#818cf8;">${escapeHtml(report.entity_type)}</span>
                        <span style="padding:3px 10px;border-radius:8px;font-size:11px;font-weight:700;background:rgba(139,92,246,0.15);color:#a78bfa;">${escapeHtml(report.report_type)}</span>
                        ${report.last_run_at ? `<span style="font-size:11px;color:var(--gao-text-muted,#64748b);padding-top:3px;">Last run ${timeAgo(report.last_run_at)}</span>` : ''}
                    </div>
                </div>
                <div style="display:flex;gap:8px;">
                    <button onclick="window.location.reload()" style="padding:8px 16px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;">▶ Run Report</button>
                    <button onclick="if(confirm('Delete this report?'))fetch('/api/reports/${report.id}',{method:'DELETE'}).then(()=>window.location='/reports')" style="padding:8px 16px;background:rgba(239,68,68,0.15);color:#ef4444;border:none;border-radius:8px;font-size:13px;cursor:pointer;">🗑 Delete</button>
                    <a href="/reports" style="padding:8px 16px;background:rgba(255,255,255,0.06);color:#94a3b8;border-radius:8px;text-decoration:none;font-size:13px;">← Back</a>
                </div>
            </div>

            ${report.description ? `<div class="gao-card" style="padding:16px;margin-bottom:20px;"><p style="font-size:13px;color:#cbd5e1;">${escapeHtml(report.description)}</p></div>` : ''}

            <div class="gao-card" style="padding:24px;">
                <h3 style="font-size:15px;font-weight:700;margin-bottom:16px;">Results</h3>
                ${dataRows}
            </div>
        </div>`;

        return res.html(renderPage({ title: report.name, content, activePath: '/reports', user: user ? { name: user.name as string, role: user.role as string } : undefined }));
    }
}
