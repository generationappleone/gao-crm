import { Controller, Get } from '@gao/http';
import type { GaoRequest, GaoResponse } from '@gao/http';
import { renderPage } from '../views/renderer.js';
import { KnowledgeBaseService } from '../services/knowledge-base.service.js';
import { escapeHtml } from '../helpers/escape.js';
import { timeAgo } from '../helpers/format.js';
import { url } from '../helpers/url.js';

const service = new KnowledgeBaseService();

const STATUS_COLORS: Record<string, string> = { draft: '#94a3b8', published: '#22c55e', archived: '#64748b' };
const inputStyle = `width:100%;padding:10px 14px;background:rgba(15,23,42,0.6);border:1px solid rgba(100,116,139,0.3);border-radius:8px;color:#e2e8f0;font-size:14px;outline:none;`;
const labelStyle = `display:block;font-size:13px;font-weight:600;color:#cbd5e1;margin-bottom:6px;`;
const btnPrimary = `padding:12px 24px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;`;

@Controller('/kb')
export class KnowledgeBaseController {
    @Get('/')
    async index(req: GaoRequest, res: GaoResponse) {
        const user = req.user as Record<string, unknown>;
        const articles = await service.listAll();
        const categories = await service.getCategories();

        const categoryCards = categories.map(cat => `
            <a href="/kb?category=${encodeURIComponent(cat)}" style="text-decoration:none;">
                <div style="padding:14px;background:rgba(99,102,241,0.08);border:1px solid rgba(99,102,241,0.2);border-radius:10px;text-align:center;">
                    <span style="font-size:14px;font-weight:700;color:#8b5cf6;">${escapeHtml(cat)}</span>
                </div>
            </a>`).join('');

        const rows = articles.map(a => `
            <tr>
                <td>
                    <a href="/kb/${a.id}" style="text-decoration:none;color:#e2e8f0;">
                        <div style="font-weight:600;">${escapeHtml(a.title)}</div>
                        <div style="font-size:11px;color:var(--gao-text-muted,#64748b);margin-top:2px;">${escapeHtml(a.excerpt?.slice(0, 80) ?? '')}</div>
                    </a>
                </td>
                <td>${escapeHtml(a.category ?? '—')}</td>
                <td><span style="padding:3px 8px;border-radius:8px;font-size:10px;font-weight:700;color:#fff;background:${STATUS_COLORS[a.status] ?? '#6366f1'}">${a.status}</span></td>
                <td style="font-size:12px;">${a.view_count ?? 0} views</td>
                <td style="font-size:12px;color:var(--gao-text-muted,#64748b);">${timeAgo(a.updated_at)}</td>
            </tr>`).join('');

        const content = `
        <div style="padding:8px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
                <h1 style="font-size:24px;font-weight:700;">Knowledge Base</h1>
                <a href="/kb/create" style="${btnPrimary}text-decoration:none;">+ New Article</a>
            </div>
            ${categories.length > 0 ? `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:12px;margin-bottom:24px;">${categoryCards}</div>` : ''}
            <div class="gao-card" style="padding:24px;">
                <div class="gao-admin-table-wrapper">
                    <table class="gao-admin-table">
                        <thead><tr><th>Article</th><th>Category</th><th>Status</th><th>Views</th><th>Updated</th></tr></thead>
                        <tbody>${rows || '<tr><td colspan="5" style="text-align:center;padding:40px;color:var(--gao-text-muted,#64748b);">No articles yet</td></tr>'}</tbody>
                    </table>
                </div>
            </div>
        </div>`;

        return res.html(renderPage({ title: 'Knowledge Base', content, activePath: '/kb', user: user ? { name: user.name as string, role: user.role as string } : undefined }));
    }

    @Get('/create')
    async create(req: GaoRequest, res: GaoResponse) {
        const user = req.user as Record<string, unknown>;
        const content = `
        <div style="padding:8px;">
            <a href="/kb" style="display:inline-flex;align-items:center;gap:6px;font-size:13px;color:#94a3b8;text-decoration:none;margin-bottom:20px;">← Back to Knowledge Base</a>
            <h1 style="font-size:24px;font-weight:700;margin-bottom:24px;">New Article</h1>
            <div class="gao-card" style="padding:32px;max-width:720px;">
                <form id="createArticleForm">
                    <div><label style="${labelStyle}">Title *</label><input type="text" name="title" required style="${inputStyle}"></div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px;">
                        <div><label style="${labelStyle}">Category</label><input type="text" name="category" placeholder="e.g. Getting Started" style="${inputStyle}"></div>
                        <div><label style="${labelStyle}">Status</label><select name="status" style="${inputStyle}"><option value="draft">Draft</option><option value="published">Published</option></select></div>
                    </div>
                    <div style="margin-top:16px;"><label style="${labelStyle}">Excerpt</label><input type="text" name="excerpt" placeholder="Brief summary..." style="${inputStyle}"></div>
                    <div style="margin-top:16px;"><label style="${labelStyle}">Content *</label><textarea name="content" rows="10" required style="${inputStyle}resize:vertical;font-family:monospace;font-size:13px;" placeholder="Write your article content here..."></textarea></div>
                    <div style="margin-top:24px;display:flex;gap:12px;">
                        <button type="submit" style="${btnPrimary}">Save Article</button>
                        <a href="/kb" style="padding:12px 24px;background:rgba(255,255,255,0.05);color:#94a3b8;border-radius:10px;text-decoration:none;font-size:14px;font-weight:600;display:inline-flex;align-items:center;">Cancel</a>
                    </div>
                </form>
            </div>
        </div>
        <script>
        document.getElementById('createArticleForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const fd = new FormData(e.target);
            const data = Object.fromEntries(fd.entries());
            data.slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
            const res = await fetch('/api/kb/articles', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(data) });
            if (res.ok) window.location.href = '/kb';
            else { const err = await res.json(); alert(err.error?.message || 'Failed'); }
        });
        </script>`;
        return res.html(renderPage({ title: 'New Article', content, activePath: '/kb', user: user ? { name: user.name as string, role: user.role as string } : undefined }));
    }

    @Get('/:id/edit')
    async edit(req: GaoRequest, res: GaoResponse) {
        const user = req.user as Record<string, unknown>;
        const article = await service.findById(req.params.id);
        if (!article) return res.redirect(url('/kb'));

        const content = `
        <div style="padding:8px;">
            <a href="/kb/${article.id}" style="display:inline-flex;align-items:center;gap:6px;font-size:13px;color:#94a3b8;text-decoration:none;margin-bottom:20px;">← Back</a>
            <h1 style="font-size:24px;font-weight:700;margin-bottom:24px;">Edit Article</h1>
            <div class="gao-card" style="padding:32px;max-width:720px;">
                <form id="editArticleForm">
                    <div><label style="${labelStyle}">Title *</label><input type="text" name="title" required value="${escapeHtml(article.title)}" style="${inputStyle}"></div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px;">
                        <div><label style="${labelStyle}">Category</label><input type="text" name="category" value="${escapeHtml(article.category ?? '')}" style="${inputStyle}"></div>
                        <div><label style="${labelStyle}">Status</label><select name="status" style="${inputStyle}">${['draft', 'published', 'archived'].map(s => `<option value="${s}" ${article.status === s ? 'selected' : ''}>${s}</option>`).join('')}</select></div>
                    </div>
                    <div style="margin-top:16px;"><label style="${labelStyle}">Excerpt</label><input type="text" name="excerpt" value="${escapeHtml(article.excerpt ?? '')}" style="${inputStyle}"></div>
                    <div style="margin-top:16px;"><label style="${labelStyle}">Content *</label><textarea name="content" rows="12" required style="${inputStyle}resize:vertical;font-family:monospace;font-size:13px;">${escapeHtml(article.content ?? '')}</textarea></div>
                    <div style="margin-top:24px;display:flex;gap:12px;">
                        <button type="submit" style="${btnPrimary}">Update Article</button>
                        <a href="/kb/${article.id}" style="padding:12px 24px;background:rgba(255,255,255,0.05);color:#94a3b8;border-radius:10px;text-decoration:none;font-size:14px;font-weight:600;display:inline-flex;align-items:center;">Cancel</a>
                    </div>
                </form>
            </div>
        </div>
        <script>
        document.getElementById('editArticleForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const fd = new FormData(e.target);
            const data = Object.fromEntries(fd.entries());
            const res = await fetch('/api/kb/articles/${article.id}', { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(data) });
            if (res.ok) window.location.href = '/kb/${article.id}';
            else { const err = await res.json(); alert(err.error?.message || 'Failed'); }
        });
        </script>`;
        return res.html(renderPage({ title: `Edit ${article.title}`, content, activePath: '/kb', user: user ? { name: user.name as string, role: user.role as string } : undefined }));
    }

    @Get('/:id')
    async detail(req: GaoRequest, res: GaoResponse) {
        const user = req.user as Record<string, unknown>;
        const article = await service.findById(req.params.id);
        if (!article) return res.status(404).html(renderPage({ title: 'Not Found', content: '<div style="padding:40px;text-align:center;"><h1 style="font-size:24px;font-weight:700;">Article Not Found</h1><a href="/kb" style="color:#818cf8;">← Back to Knowledge Base</a></div>', activePath: '/kb', user: user ? { name: user.name as string, role: user.role as string } : undefined }));

        await service.recordView(article.id);

        const content = `
        <div style="padding:8px;">
            <a href="/kb" style="display:inline-flex;align-items:center;gap:6px;font-size:13px;color:#94a3b8;text-decoration:none;margin-bottom:20px;">← Back to Knowledge Base</a>
            <div class="gao-card" style="padding:32px;max-width:800px;">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px;">
                    <div>
                        <h1 style="font-size:22px;font-weight:700;">${escapeHtml(article.title)}</h1>
                        <div style="display:flex;gap:12px;margin-top:8px;font-size:12px;color:var(--gao-text-muted,#64748b);">
                            ${article.category ? `<span>📁 ${escapeHtml(article.category)}</span>` : ''}
                            <span>👁️ ${article.view_count ?? 0} views</span>
                            <span>Updated ${timeAgo(article.updated_at)}</span>
                        </div>
                    </div>
                    <span style="padding:4px 12px;border-radius:8px;font-size:11px;font-weight:700;color:#fff;background:${STATUS_COLORS[article.status] ?? '#6366f1'}">${article.status}</span>
                </div>
                <div style="border-top:1px solid rgba(100,116,139,0.15);padding-top:20px;font-size:14px;color:#cbd5e1;line-height:1.8;white-space:pre-wrap;">${escapeHtml(article.content ?? '')}</div>
                <div style="border-top:1px solid rgba(100,116,139,0.15);margin-top:24px;padding-top:16px;display:flex;justify-content:space-between;align-items:center;">
                    <div style="font-size:13px;color:var(--gao-text-muted,#64748b);">Was this helpful?
                        <button onclick="fetch('/api/kb/articles/${article.id}/vote',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({helpful:true})}).then(()=>this.textContent='✅ Thanks!')" style="margin-left:10px;padding:4px 12px;background:rgba(34,197,94,0.1);color:#22c55e;border:1px solid rgba(34,197,94,0.2);border-radius:6px;font-size:12px;cursor:pointer;">👍 Yes (${article.helpful_count ?? 0})</button>
                        <button onclick="fetch('/api/kb/articles/${article.id}/vote',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({helpful:false})}).then(()=>this.textContent='Noted')" style="margin-left:6px;padding:4px 12px;background:rgba(239,68,68,0.1);color:#f87171;border:1px solid rgba(239,68,68,0.2);border-radius:6px;font-size:12px;cursor:pointer;">👎 No (${article.not_helpful_count ?? 0})</button>
                    </div>
                    <div style="display:flex;gap:8px;">
                        <a href="/kb/${article.id}/edit" style="padding:6px 14px;background:rgba(99,102,241,0.1);color:#818cf8;border:1px solid rgba(99,102,241,0.2);border-radius:6px;text-decoration:none;font-size:12px;">✏️ Edit</a>
                        <button onclick="if(confirm('Delete this article?'))fetch('/api/kb/articles/${article.id}',{method:'DELETE'}).then(r=>{if(r.ok)window.location.href='/kb'})" style="padding:6px 14px;background:rgba(239,68,68,0.1);color:#f87171;border:1px solid rgba(239,68,68,0.2);border-radius:6px;font-size:12px;cursor:pointer;">Delete</button>
                    </div>
                </div>
            </div>
        </div>`;
        return res.html(renderPage({ title: article.title, content, activePath: '/kb', user: user ? { name: user.name as string, role: user.role as string } : undefined }));
    }
}
