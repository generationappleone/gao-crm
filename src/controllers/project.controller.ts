import { Controller, Get } from '@gao/http';
import type { GaoRequest, GaoResponse } from '@gao/http';
import { renderPage } from '../views/renderer.js';
import { ProjectService } from '../services/project.service.js';
import { escapeHtml } from '../helpers/escape.js';
import { timeAgo } from '../helpers/format.js';
import { url } from '../helpers/url.js';

const service = new ProjectService();

const STATUS_COLORS: Record<string, string> = { active: '#3b82f6', on_hold: '#f59e0b', completed: '#22c55e', cancelled: '#ef4444' };
const PRIORITY_COLORS: Record<string, string> = { low: '#94a3b8', medium: '#3b82f6', high: '#f59e0b', urgent: '#ef4444' };
const TASK_STATUS_COLORS: Record<string, string> = { todo: '#94a3b8', in_progress: '#3b82f6', review: '#8b5cf6', done: '#22c55e', blocked: '#ef4444' };

@Controller('/projects')
export class ProjectController {
    @Get('/')
    async list(req: GaoRequest, res: GaoResponse) {
        const user = req.user as Record<string, unknown>;
        const projects = await service.list();

        const cards = projects.map(p => `
            <a href="/projects/${p.id}" style="text-decoration:none;">
                <div class="gao-card" style="padding:20px;cursor:pointer;transition:transform 0.15s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform=''">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                        <h3 style="font-size:15px;font-weight:700;color:#e2e8f0;">${escapeHtml(p.name)}</h3>
                        <span style="padding:3px 8px;border-radius:8px;font-size:10px;font-weight:700;color:#fff;background:${STATUS_COLORS[p.status] ?? '#6366f1'}">${p.status}</span>
                    </div>
                    <p style="font-size:12px;color:var(--gao-text-muted,#64748b);margin-bottom:8px;">${escapeHtml(p.description?.slice(0, 100) ?? 'No description')}</p>
                    <div style="display:flex;gap:12px;font-size:11px;color:var(--gao-text-muted,#64748b);">
                        <span style="padding:2px 6px;border-radius:6px;background:${PRIORITY_COLORS[p.priority] ?? '#6366f1'};color:#fff;font-weight:700;">${p.priority}</span>
                        <span>${timeAgo(p.created_at)}</span>
                    </div>
                </div>
            </a>`).join('');

        const content = `
        <div style="padding:8px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
                <h1 style="font-size:24px;font-weight:700;">Projects</h1>
                <a href="/projects/create" style="display:inline-flex;align-items:center;gap:6px;padding:8px 16px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;border-radius:10px;text-decoration:none;font-size:13px;font-weight:600;">+ New Project</a>
            </div>
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:16px;">
                ${cards || '<p style="color:var(--gao-text-muted,#64748b);">No projects yet</p>'}
            </div>
        </div>`;

        return res.html(renderPage({ title: 'Projects', content, activePath: '/projects', user: user ? { name: user.name as string, role: user.role as string } : undefined }));
    }

    @Get('/create')
    async create(req: GaoRequest, res: GaoResponse) {
        const user = req.user as Record<string, unknown>;
        const content = this.renderForm('New Project', null);
        return res.html(renderPage({ title: 'New Project', content, activePath: '/projects', user: user ? { name: user.name as string, role: user.role as string } : undefined }));
    }

    @Get('/:id/edit')
    async edit(req: GaoRequest, res: GaoResponse) {
        const user = req.user as Record<string, unknown>;
        const project = await service.findById(req.params.id);
        if (!project) return res.redirect(url('/projects'));
        const content = this.renderForm('Edit Project', project as unknown as Record<string, unknown>);
        return res.html(renderPage({ title: `Edit ${project.name}`, content, activePath: '/projects', user: user ? { name: user.name as string, role: user.role as string } : undefined }));
    }

    @Get('/:id')
    async detail(req: GaoRequest, res: GaoResponse) {
        const user = req.user as Record<string, unknown>;
        const project = await service.findById(req.params.id);
        if (!project) return res.redirect(url('/projects'));
        const tasks = await service.getTasks(req.params.id);

        const taskRows = tasks.map(t => `
            <tr>
                <td style="font-weight:600;">${escapeHtml(t.title)}</td>
                <td>
                    <select onchange="fetch('/api/projects/tasks/${t.id}/status',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({status:this.value})}).then(()=>window.location.reload())"
                        style="padding:4px 8px;border-radius:6px;font-size:11px;font-weight:700;border:none;cursor:pointer;background:${TASK_STATUS_COLORS[t.status] ?? '#6366f1'};color:#fff;">
                        ${['todo', 'in_progress', 'review', 'done', 'blocked'].map(s => `<option value="${s}" ${t.status === s ? 'selected' : ''}>${s.replace('_', ' ')}</option>`).join('')}
                    </select>
                </td>
                <td style="font-size:12px;color:var(--gao-text-muted,#64748b);">${t.due_date ?? '—'}</td>
            </tr>`).join('');

        const content = `
        <div style="padding:8px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
                <div>
                    <h1 style="font-size:24px;font-weight:700;">${escapeHtml(project.name)}</h1>
                    <div style="display:flex;gap:8px;margin-top:8px;">
                        <span style="padding:4px 12px;border-radius:10px;font-size:11px;font-weight:700;color:#fff;background:${STATUS_COLORS[project.status] ?? '#6366f1'}">${project.status}</span>
                        <span style="padding:4px 12px;border-radius:10px;font-size:11px;font-weight:700;color:#fff;background:${PRIORITY_COLORS[project.priority] ?? '#6366f1'}">${project.priority}</span>
                    </div>
                </div>
                <div style="display:flex;gap:8px;">
                    <a href="/projects/${project.id}/edit" style="padding:8px 16px;background:rgba(255,255,255,0.06);color:#94a3b8;border-radius:8px;text-decoration:none;font-size:13px;">✏️ Edit</a>
                    <button onclick="if(confirm('Delete this project?'))fetch('/api/projects/${project.id}',{method:'DELETE'}).then(()=>window.location='/projects')" style="padding:8px 16px;background:rgba(239,68,68,0.15);color:#ef4444;border:none;border-radius:8px;font-size:13px;cursor:pointer;">🗑 Delete</button>
                    <a href="/projects" style="padding:8px 16px;background:rgba(255,255,255,0.06);color:#94a3b8;border-radius:8px;text-decoration:none;font-size:13px;">← Back</a>
                </div>
            </div>

            ${project.description ? `<div class="gao-card" style="padding:20px;margin-bottom:20px;"><p style="font-size:14px;color:#cbd5e1;">${escapeHtml(project.description)}</p></div>` : ''}

            <div class="gao-card" style="padding:24px;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                    <h3 style="font-size:15px;font-weight:700;">Tasks (${tasks.length})</h3>
                    <button onclick="document.getElementById('addTaskForm').style.display=document.getElementById('addTaskForm').style.display==='none'?'flex':'none'" style="padding:6px 14px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;border:none;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;">+ Add Task</button>
                </div>

                <form id="addTaskForm" style="display:none;gap:8px;margin-bottom:16px;align-items:end;" onsubmit="event.preventDefault();fetch('/api/projects/${project.id}/tasks',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({title:this.title.value,due_date:this.due_date.value||null})}).then(()=>window.location.reload())">
                    <input name="title" required placeholder="Task title" style="flex:1;padding:8px 12px;background:rgba(255,255,255,0.04);border:1px solid rgba(100,116,139,0.25);border-radius:8px;color:#e2e8f0;font-size:13px;" />
                    <input name="due_date" type="date" style="padding:8px 12px;background:rgba(255,255,255,0.04);border:1px solid rgba(100,116,139,0.25);border-radius:8px;color:#e2e8f0;font-size:13px;" />
                    <button type="submit" style="padding:8px 16px;background:#6366f1;color:white;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;">Add</button>
                </form>

                <div class="gao-admin-table-wrapper">
                    <table class="gao-admin-table">
                        <thead><tr><th>Task</th><th>Status</th><th>Due</th></tr></thead>
                        <tbody>${taskRows || '<tr><td colspan="3" style="text-align:center;padding:20px;color:var(--gao-text-muted,#64748b);">No tasks — click "+ Add Task" to create one</td></tr>'}</tbody>
                    </table>
                </div>
            </div>
        </div>`;

        return res.html(renderPage({ title: project.name, content, activePath: '/projects', user: user ? { name: user.name as string, role: user.role as string } : undefined }));
    }

    private renderForm(title: string, project: Record<string, unknown> | null): string {
        const isEdit = project !== null;
        const action = isEdit ? `/api/projects/${project.id}` : '/api/projects';
        const method = isEdit ? 'PUT' : 'POST';

        return `
        <div style="padding:8px;max-width:640px;">
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px;">
                <a href="/projects" style="color:#94a3b8;text-decoration:none;font-size:13px;">← Back</a>
                <h1 style="font-size:24px;font-weight:700;">${title}</h1>
            </div>
            <form id="projectForm" class="gao-card" style="padding:24px;">
                <div style="margin-bottom:20px;">
                    <label style="display:block;font-size:13px;font-weight:600;color:#cbd5e1;margin-bottom:6px;">Name *</label>
                    <input name="name" required value="${escapeHtml(String(project?.name ?? ''))}" style="width:100%;padding:10px 14px;background:rgba(255,255,255,0.04);border:1px solid rgba(100,116,139,0.25);border-radius:8px;color:#e2e8f0;font-size:14px;" />
                </div>
                <div style="margin-bottom:20px;">
                    <label style="display:block;font-size:13px;font-weight:600;color:#cbd5e1;margin-bottom:6px;">Description</label>
                    <textarea name="description" rows="3" style="width:100%;padding:10px 14px;background:rgba(255,255,255,0.04);border:1px solid rgba(100,116,139,0.25);border-radius:8px;color:#e2e8f0;font-size:14px;resize:vertical;">${escapeHtml(String(project?.description ?? ''))}</textarea>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px;">
                    <div>
                        <label style="display:block;font-size:13px;font-weight:600;color:#cbd5e1;margin-bottom:6px;">Priority</label>
                        <select name="priority" style="width:100%;padding:10px 14px;background:rgba(255,255,255,0.04);border:1px solid rgba(100,116,139,0.25);border-radius:8px;color:#e2e8f0;font-size:14px;">
                            ${['low', 'medium', 'high', 'urgent'].map(p => `<option value="${p}" ${project?.priority === p ? 'selected' : ''}>${p}</option>`).join('')}
                        </select>
                    </div>
                    <div>
                        <label style="display:block;font-size:13px;font-weight:600;color:#cbd5e1;margin-bottom:6px;">Status</label>
                        <select name="status" style="width:100%;padding:10px 14px;background:rgba(255,255,255,0.04);border:1px solid rgba(100,116,139,0.25);border-radius:8px;color:#e2e8f0;font-size:14px;">
                            ${['active', 'on_hold', 'completed', 'cancelled'].map(s => `<option value="${s}" ${project?.status === s ? 'selected' : ''}>${s.replace('_', ' ')}</option>`).join('')}
                        </select>
                    </div>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px;">
                    <div>
                        <label style="display:block;font-size:13px;font-weight:600;color:#cbd5e1;margin-bottom:6px;">Start Date</label>
                        <input name="start_date" type="date" value="${project?.start_date ?? ''}" style="width:100%;padding:10px 14px;background:rgba(255,255,255,0.04);border:1px solid rgba(100,116,139,0.25);border-radius:8px;color:#e2e8f0;font-size:14px;" />
                    </div>
                    <div>
                        <label style="display:block;font-size:13px;font-weight:600;color:#cbd5e1;margin-bottom:6px;">Due Date</label>
                        <input name="due_date" type="date" value="${project?.due_date ?? ''}" style="width:100%;padding:10px 14px;background:rgba(255,255,255,0.04);border:1px solid rgba(100,116,139,0.25);border-radius:8px;color:#e2e8f0;font-size:14px;" />
                    </div>
                </div>
                <div style="display:flex;gap:12px;">
                    <button type="submit" style="padding:10px 24px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;">${isEdit ? 'Update' : 'Create Project'}</button>
                    <a href="/projects" style="padding:10px 24px;background:rgba(255,255,255,0.06);color:#94a3b8;border-radius:8px;text-decoration:none;font-size:14px;display:flex;align-items:center;">Cancel</a>
                </div>
            </form>
            <script>
            document.getElementById('projectForm').addEventListener('submit', async function(e) {
                e.preventDefault();
                const fd = new FormData(this);
                const body = {
                    name: fd.get('name'),
                    description: fd.get('description') || null,
                    priority: fd.get('priority'),
                    status: fd.get('status'),
                    start_date: fd.get('start_date') || null,
                    due_date: fd.get('due_date') || null,
                    owner_id: null,
                };
                const res = await fetch('${action}', {
                    method: '${method}',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body),
                });
                if (res.ok) window.location.href = '/projects';
                else alert('Error saving project');
            });
            </script>
        </div>`;
    }
}
