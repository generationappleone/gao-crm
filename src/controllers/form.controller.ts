import { Controller, Get } from '@gao/http';
import type { GaoRequest, GaoResponse } from '@gao/http';
import { renderPage } from '../views/renderer.js';
import { FormBuilderService } from '../services/form-builder.service.js';
import { escapeHtml } from '../helpers/escape.js';
import { timeAgo } from '../helpers/format.js';
import { url } from '../helpers/url.js';

const service = new FormBuilderService();

const STATUS_COLORS: Record<string, string> = { draft: '#94a3b8', active: '#22c55e', paused: '#f59e0b', archived: '#64748b' };
const inputStyle = `width:100%;padding:10px 14px;background:rgba(15,23,42,0.6);border:1px solid rgba(100,116,139,0.3);border-radius:8px;color:#e2e8f0;font-size:14px;outline:none;`;
const labelStyle = `display:block;font-size:13px;font-weight:600;color:#cbd5e1;margin-bottom:6px;`;
const btnPrimary = `padding:12px 24px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;`;

@Controller('/forms')
export class FormController {
    @Get('/')
    async list(req: GaoRequest, res: GaoResponse) {
        const user = req.user as Record<string, unknown>;
        const forms = await service.listForms();

        const cards = forms.map(f => `
            <a href="/forms/${f.id}" style="text-decoration:none;">
                <div class="gao-card" style="padding:20px;cursor:pointer;transition:transform 0.15s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform=''">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
                        <h3 style="font-size:15px;font-weight:700;color:#e2e8f0;">${escapeHtml(f.name)}</h3>
                        <span style="padding:3px 8px;border-radius:8px;font-size:10px;font-weight:700;color:#fff;background:${STATUS_COLORS[f.status] ?? '#6366f1'}">${f.status}</span>
                    </div>
                    <p style="font-size:12px;color:var(--gao-text-muted,#64748b);">${escapeHtml(f.description?.slice(0, 120) ?? 'No description')}</p>
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px;font-size:12px;">
                        <span style="color:var(--gao-text-muted,#64748b);">📝 ${f.total_submissions ?? 0} submissions</span>
                        <span style="color:var(--gao-text-muted,#64748b);">${timeAgo(f.created_at)}</span>
                    </div>
                </div>
            </a>`).join('');

        const content = `
        <div style="padding:8px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
                <h1 style="font-size:24px;font-weight:700;">Form Builder</h1>
                <a href="/forms/create" style="${btnPrimary}text-decoration:none;">+ New Form</a>
            </div>
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:16px;">
                ${cards || '<p style="color:var(--gao-text-muted,#64748b);">No forms yet</p>'}
            </div>
        </div>`;

        return res.html(renderPage({ title: 'Forms', content, activePath: '/forms', user: user ? { name: user.name as string, role: user.role as string } : undefined }));
    }

    @Get('/create')
    async create(req: GaoRequest, res: GaoResponse) {
        const user = req.user as Record<string, unknown>;
        const content = `
        <div style="padding:8px;">
            <a href="/forms" style="display:inline-flex;align-items:center;gap:6px;font-size:13px;color:#94a3b8;text-decoration:none;margin-bottom:20px;">← Back to Forms</a>
            <h1 style="font-size:24px;font-weight:700;margin-bottom:24px;">New Form</h1>
            <div class="gao-card" style="padding:32px;max-width:640px;">
                <form id="createFormForm">
                    <div><label style="${labelStyle}">Form Name *</label><input type="text" name="name" required style="${inputStyle}"></div>
                    <div style="margin-top:16px;"><label style="${labelStyle}">Description</label><textarea name="description" rows="3" style="${inputStyle}resize:vertical;"></textarea></div>
                    <div style="margin-top:16px;"><label style="${labelStyle}">Success Message</label><input type="text" name="success_message" value="Thank you for your submission!" style="${inputStyle}"></div>
                    <div style="margin-top:16px;"><label style="${labelStyle}">Redirect URL (optional)</label><input type="url" name="redirect_url" placeholder="https://..." style="${inputStyle}"></div>
                    <div style="margin-top:24px;display:flex;gap:12px;">
                        <button type="submit" style="${btnPrimary}">Create Form</button>
                        <a href="/forms" style="padding:12px 24px;background:rgba(255,255,255,0.05);color:#94a3b8;border-radius:10px;text-decoration:none;font-size:14px;font-weight:600;display:inline-flex;align-items:center;">Cancel</a>
                    </div>
                </form>
            </div>
        </div>
        <script>
        document.getElementById('createFormForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const fd = new FormData(e.target);
            const data = Object.fromEntries(fd.entries());
            data.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
            const res = await fetch('/api/forms', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(data) });
            if (res.ok) window.location.href = '/forms';
            else { const err = await res.json(); alert(err.error?.message || 'Failed'); }
        });
        </script>`;
        return res.html(renderPage({ title: 'New Form', content, activePath: '/forms', user: user ? { name: user.name as string, role: user.role as string } : undefined }));
    }

    @Get('/:id')
    async detail(req: GaoRequest, res: GaoResponse) {
        const user = req.user as Record<string, unknown>;
        const form = await service.findById(req.params.id);
        if (!form) return res.redirect(url('/forms'));

        const fields = await service.getFields(req.params.id);
        const submissions = await service.listSubmissions(req.params.id);

        const fieldRows = fields.map(f => `
            <tr>
                <td style="font-weight:600;">${escapeHtml(f.label)}</td>
                <td><span style="padding:2px 8px;border-radius:6px;font-size:11px;font-weight:600;background:rgba(99,102,241,0.15);color:#818cf8;">${escapeHtml(f.field_type)}</span></td>
                <td>${f.is_required ? '<span style="color:#22c55e;font-weight:700;">Yes</span>' : '<span style="color:var(--gao-text-muted,#64748b);">No</span>'}</td>
                <td style="font-size:12px;color:var(--gao-text-muted,#64748b);">${escapeHtml(f.name)}</td>
            </tr>`).join('');

        const submissionRows = submissions.slice(0, 20).map(s => {
            let data: Record<string, unknown> = {};
            try { data = typeof s.data === 'string' ? JSON.parse(s.data) : (s.data as Record<string, unknown>); } catch { /* ignore */ }
            const preview = Object.values(data).slice(0, 3).map(v => escapeHtml(String(v ?? '').slice(0, 40))).join(' · ');
            return `
                <tr>
                    <td style="font-size:12px;">${preview || '<em style="color:var(--gao-text-muted,#64748b);">Empty</em>'}</td>
                    <td style="font-size:12px;color:var(--gao-text-muted,#64748b);">${s.ip_address ?? '—'}</td>
                    <td style="font-size:12px;color:var(--gao-text-muted,#64748b);">${timeAgo(s.created_at)}</td>
                </tr>`;
        }).join('');

        const publicUrl = `/api/forms/${escapeHtml(form.slug)}/submit`;

        const content = `
        <div style="padding:8px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
                <div>
                    <h1 style="font-size:24px;font-weight:700;">${escapeHtml(form.name)}</h1>
                    <div style="display:flex;gap:8px;margin-top:6px;">
                        <span style="padding:3px 10px;border-radius:8px;font-size:11px;font-weight:700;color:#fff;background:${STATUS_COLORS[form.status] ?? '#6366f1'}">${form.status}</span>
                        <span style="font-size:12px;color:var(--gao-text-muted,#64748b);padding-top:2px;">📝 ${form.total_submissions ?? 0} submissions</span>
                    </div>
                </div>
                <div style="display:flex;gap:8px;">
                    <button onclick="fetch('/api/forms/${form.id}',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({status:'${form.status === 'active' ? 'draft' : 'active'}'})}).then(()=>window.location.reload())"
                        style="padding:8px 16px;background:rgba(${form.status === 'active' ? '245,158,11' : '34,197,94'},0.15);color:${form.status === 'active' ? '#f59e0b' : '#22c55e'};border:none;border-radius:8px;font-size:13px;cursor:pointer;">
                        ${form.status === 'active' ? '⏸ Deactivate' : '▶ Activate'}
                    </button>
                    <button onclick="if(confirm('Delete this form?'))fetch('/api/forms/${form.id}',{method:'DELETE'}).then(()=>window.location='/forms')" style="padding:8px 16px;background:rgba(239,68,68,0.15);color:#ef4444;border:none;border-radius:8px;font-size:13px;cursor:pointer;">🗑 Delete</button>
                    <a href="/forms" style="padding:8px 16px;background:rgba(255,255,255,0.06);color:#94a3b8;border-radius:8px;text-decoration:none;font-size:13px;">← Back</a>
                </div>
            </div>

            <!-- Public URL Card -->
            <div class="gao-card" style="padding:20px;margin-bottom:20px;border:1px solid rgba(99,102,241,0.3);">
                <h3 style="font-size:14px;font-weight:700;margin-bottom:8px;">📋 Public Submission URL</h3>
                <div style="display:flex;gap:8px;align-items:center;">
                    <code id="publicUrl" style="flex:1;padding:10px 14px;background:rgba(0,0,0,0.3);border-radius:8px;font-size:13px;color:#818cf8;word-break:break-all;">${publicUrl}</code>
                    <button onclick="navigator.clipboard.writeText(document.getElementById('publicUrl').textContent);this.textContent='✓ Copied!';setTimeout(()=>this.textContent='📋 Copy',1500)" style="padding:8px 14px;background:rgba(99,102,241,0.15);color:#818cf8;border:none;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;white-space:nowrap;">📋 Copy</button>
                </div>
                <p style="font-size:12px;color:var(--gao-text-muted,#64748b);margin-top:8px;">ℹ️ Form submissions can be linked to Landing Pages and automatically create CRM Contacts.</p>
            </div>

            <!-- Fields -->
            <div class="gao-card" style="padding:24px;margin-bottom:20px;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                    <h3 style="font-size:15px;font-weight:700;">Fields (${fields.length})</h3>
                    <button onclick="document.getElementById('addFieldForm').style.display=document.getElementById('addFieldForm').style.display==='none'?'flex':'none'" style="padding:6px 14px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;border:none;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;">+ Add Field</button>
                </div>
                <form id="addFieldForm" style="display:none;gap:8px;margin-bottom:16px;align-items:end;flex-wrap:wrap;" onsubmit="event.preventDefault();addField()">
                    <input name="label" required placeholder="Label" style="padding:8px 12px;background:rgba(255,255,255,0.04);border:1px solid rgba(100,116,139,0.25);border-radius:8px;color:#e2e8f0;font-size:13px;flex:1;min-width:120px;" />
                    <select name="field_type" style="padding:8px 12px;background:rgba(255,255,255,0.04);border:1px solid rgba(100,116,139,0.25);border-radius:8px;color:#e2e8f0;font-size:13px;">
                        ${['text', 'email', 'phone', 'textarea', 'select', 'checkbox', 'number', 'date'].map(t => `<option value="${t}">${t}</option>`).join('')}
                    </select>
                    <label style="display:flex;align-items:center;gap:4px;font-size:12px;color:#cbd5e1;"><input type="checkbox" name="is_required" /> Required</label>
                    <button type="submit" style="padding:8px 16px;background:#6366f1;color:white;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;">Add</button>
                </form>
                <div class="gao-admin-table-wrapper">
                    <table class="gao-admin-table">
                        <thead><tr><th>Label</th><th>Type</th><th>Required</th><th>Name</th></tr></thead>
                        <tbody>${fieldRows || '<tr><td colspan="4" style="text-align:center;padding:20px;color:var(--gao-text-muted,#64748b);">No fields yet — add some fields to start collecting data</td></tr>'}</tbody>
                    </table>
                </div>
            </div>

            <!-- Submissions -->
            <div class="gao-card" style="padding:24px;">
                <h3 style="font-size:15px;font-weight:700;margin-bottom:16px;">Submissions (${submissions.length})</h3>
                <div class="gao-admin-table-wrapper">
                    <table class="gao-admin-table">
                        <thead><tr><th>Data Preview</th><th>IP</th><th>Submitted</th></tr></thead>
                        <tbody>${submissionRows || '<tr><td colspan="3" style="text-align:center;padding:20px;color:var(--gao-text-muted,#64748b);">No submissions yet</td></tr>'}</tbody>
                    </table>
                </div>
            </div>
        </div>
        <script>
        async function addField() {
            const form = document.getElementById('addFieldForm');
            const fd = new FormData(form);
            const label = fd.get('label');
            const name = label.toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/(^_|_$)/g,'');
            // We need to get existing fields and add the new one
            const existingRes = await fetch('/api/forms/${form.id}/fields');
            let existingFields = [];
            if (existingRes.ok) { const data = await existingRes.json(); existingFields = data.data || []; }
            existingFields.push({
                label: label,
                name: name,
                field_type: fd.get('field_type'),
                is_required: fd.has('is_required'),
            });
            const res = await fetch('/api/forms/${form.id}/fields', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fields: existingFields }),
            });
            if (res.ok) window.location.reload();
            else alert('Error adding field');
        }
        </script>`;

        return res.html(renderPage({ title: form.name, content, activePath: '/forms', user: user ? { name: user.name as string, role: user.role as string } : undefined }));
    }
}
