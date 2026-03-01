/**
 * GAO CRM — Pipeline Controller (REDIRECT + FORMS)
 *
 * Pipeline kanban/board is now at /crm/pipeline.
 * This controller redirects list/kanban but keeps create/edit forms.
 */

import { Controller, Get } from '@gao/http';
import type { GaoRequest, GaoResponse } from '@gao/http';
import { renderPage } from '../views/renderer.js';
import { PipelineService } from '../services/pipeline.service.js';
import { escapeHtml } from '../helpers/escape.js';
import { cardStyle, inputStyle, labelStyle } from '../helpers/crm-shared.js';
import { url } from '../helpers/url.js';

const service = new PipelineService();

@Controller('/pipelines')
export class PipelineController {
    @Get('/')
    async list(_req: GaoRequest, res: GaoResponse) {
        return res.redirect(url('/crm/pipeline'));
    }

    @Get('/create')
    async create(req: GaoRequest, res: GaoResponse) {
        const user = req.user as Record<string, unknown>;
        const content = this.renderForm('New Pipeline', null);
        return res.html(renderPage({ title: 'New Pipeline', content, activePath: '/crm/pipeline', user: user ? { name: user.name as string, role: user.role as string } : undefined }));
    }

    @Get('/:id/edit')
    async edit(req: GaoRequest, res: GaoResponse) {
        const user = req.user as Record<string, unknown>;
        const pipeline = await service.findById(req.params.id);
        if (!pipeline) return res.redirect(url('/crm/pipeline'));
        const content = this.renderForm('Edit Pipeline', pipeline as unknown as Record<string, unknown>);
        return res.html(renderPage({ title: `Edit ${pipeline.name}`, content, activePath: '/crm/pipeline', user: user ? { name: user.name as string, role: user.role as string } : undefined }));
    }

    @Get('/:id')
    async kanban(req: GaoRequest, res: GaoResponse) {
        return res.redirect(url(`/crm/pipeline/${req.params.id}`));
    }

    private renderForm(title: string, pipeline: Record<string, unknown> | null): string {
        const isEdit = pipeline !== null;
        const action = isEdit ? `/api/pipelines/${pipeline.id}` : '/api/pipelines';
        const method = isEdit ? 'PUT' : 'POST';

        return `
        <div style="padding:8px;max-width:640px;">
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px;">
                <a href="/crm/pipeline" style="color:#94a3b8;text-decoration:none;font-size:13px;">← Back</a>
                <h1 style="font-size:24px;font-weight:700;color:#e2e8f0;">${title}</h1>
            </div>
            <div style="${cardStyle}">
                <form id="pipelineForm">
                    <div style="margin-bottom:20px;">
                        <label style="${labelStyle}">Name *</label>
                        <input name="name" required value="${escapeHtml(String(pipeline?.name ?? ''))}" style="${inputStyle}" />
                    </div>
                    <div style="margin-bottom:20px;">
                        <label style="${labelStyle}">Description</label>
                        <textarea name="description" rows="3" style="${inputStyle}resize:vertical;">${escapeHtml(String(pipeline?.description ?? ''))}</textarea>
                    </div>
                    <div style="margin-bottom:24px;">
                        <label style="display:flex;align-items:center;gap:8px;cursor:pointer;">
                            <input type="checkbox" name="is_default" ${pipeline?.is_default ? 'checked' : ''} style="width:16px;height:16px;accent-color:#6366f1;" />
                            <span style="font-size:13px;color:#cbd5e1;">Set as default pipeline</span>
                        </label>
                    </div>
                    <div style="display:flex;gap:12px;">
                        <button type="submit" style="padding:10px 24px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;">${isEdit ? 'Update Pipeline' : 'Create Pipeline'}</button>
                        <a href="/crm/pipeline" style="padding:10px 24px;background:rgba(255,255,255,0.06);color:#94a3b8;border-radius:8px;text-decoration:none;font-size:14px;display:flex;align-items:center;">Cancel</a>
                    </div>
                </form>
            </div>
            <script>
            document.getElementById('pipelineForm').addEventListener('submit', async function(e) {
                e.preventDefault();
                const fd = new FormData(this);
                const body = {
                    name: fd.get('name'),
                    description: fd.get('description') || null,
                    is_default: fd.has('is_default'),
                };
                const res = await fetch('${action}', {
                    method: '${method}',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body),
                });
                if (res.ok) { showToast('Pipeline saved!', 'success'); setTimeout(() => window.location.href = '/crm/pipeline', 600); }
                else { showToast('Error saving pipeline', 'error'); }
            });
            </script>
        </div>`;
    }
}
