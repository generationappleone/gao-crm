import { Controller, Get } from '@gao/http';
import type { GaoRequest, GaoResponse } from '@gao/http';
import { renderPage } from '../views/renderer.js';
import { AnnouncementService } from '../services/announcement.service.js';
import { escapeHtml } from '../helpers/escape.js';
import { timeAgo } from '../helpers/format.js';

const service = new AnnouncementService();

@Controller('/announcements')
export class AnnouncementController {
    @Get('/')
    async list(req: GaoRequest, res: GaoResponse) {
        const user = req.user as Record<string, unknown>;
        const announcements = await service.list();

        const cards = announcements.map(a => `
            <div class="gao-card" style="padding:24px;margin-bottom:16px;">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;">
                    <div style="flex:1;">
                        <h3 style="font-size:16px;font-weight:700;color:#e2e8f0;">${escapeHtml(a.title)}</h3>
                        <p style="font-size:14px;color:#cbd5e1;margin-top:8px;line-height:1.7;">${escapeHtml(a.content.slice(0, 280))}${a.content.length > 280 ? '...' : ''}</p>
                    </div>
                    <div style="display:flex;gap:8px;align-items:center;flex-shrink:0;margin-left:16px;">
                        ${a.is_pinned ? '<span style="padding:3px 8px;border-radius:8px;font-size:10px;font-weight:700;background:#f59e0b;color:#fff;">📌 Pinned</span>' : ''}
                        <button onclick="if(confirm('Delete this announcement?'))fetch('/api/announcements/${a.id}',{method:'DELETE'}).then(()=>window.location.reload())" style="padding:4px 8px;background:rgba(239,68,68,0.15);color:#ef4444;border:none;border-radius:6px;font-size:11px;cursor:pointer;" title="Delete">🗑</button>
                    </div>
                </div>
                <div style="margin-top:12px;font-size:12px;color:var(--gao-text-muted,#64748b);">Published ${timeAgo(a.published_at ?? a.created_at)}</div>
            </div>`).join('');

        const content = `
        <div style="padding:8px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
                <h1 style="font-size:24px;font-weight:700;">Announcements</h1>
                <a href="/announcements/create" style="display:inline-flex;align-items:center;gap:6px;padding:8px 16px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;border-radius:10px;text-decoration:none;font-size:13px;font-weight:600;">+ New Announcement</a>
            </div>
            <div style="max-width:800px;">
                ${cards || '<p style="color:var(--gao-text-muted,#64748b);">No announcements yet</p>'}
            </div>
        </div>`;

        return res.html(renderPage({ title: 'Announcements', content, activePath: '/announcements', user: user ? { name: user.name as string, role: user.role as string } : undefined }));
    }

    @Get('/create')
    async create(req: GaoRequest, res: GaoResponse) {
        const user = req.user as Record<string, unknown>;

        const content = `
        <div style="padding:8px;max-width:640px;">
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px;">
                <a href="/announcements" style="color:#94a3b8;text-decoration:none;font-size:13px;">← Back</a>
                <h1 style="font-size:24px;font-weight:700;">New Announcement</h1>
            </div>
            <form id="announcementForm" class="gao-card" style="padding:24px;">
                <div style="margin-bottom:20px;">
                    <label style="display:block;font-size:13px;font-weight:600;color:#cbd5e1;margin-bottom:6px;">Title *</label>
                    <input name="title" required style="width:100%;padding:10px 14px;background:rgba(255,255,255,0.04);border:1px solid rgba(100,116,139,0.25);border-radius:8px;color:#e2e8f0;font-size:14px;" />
                </div>
                <div style="margin-bottom:20px;">
                    <label style="display:block;font-size:13px;font-weight:600;color:#cbd5e1;margin-bottom:6px;">Content *</label>
                    <textarea name="content" required rows="6" style="width:100%;padding:10px 14px;background:rgba(255,255,255,0.04);border:1px solid rgba(100,116,139,0.25);border-radius:8px;color:#e2e8f0;font-size:14px;resize:vertical;line-height:1.6;"></textarea>
                </div>
                <div style="margin-bottom:24px;">
                    <label style="display:flex;align-items:center;gap:8px;cursor:pointer;">
                        <input type="checkbox" name="is_pinned" style="width:16px;height:16px;accent-color:#f59e0b;" />
                        <span style="font-size:13px;color:#cbd5e1;">📌 Pin this announcement</span>
                    </label>
                </div>
                <div style="display:flex;gap:12px;">
                    <button type="submit" style="padding:10px 24px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;">Publish</button>
                    <a href="/announcements" style="padding:10px 24px;background:rgba(255,255,255,0.06);color:#94a3b8;border-radius:8px;text-decoration:none;font-size:14px;display:flex;align-items:center;">Cancel</a>
                </div>
            </form>
            <script>
            document.getElementById('announcementForm').addEventListener('submit', async function(e) {
                e.preventDefault();
                const fd = new FormData(this);
                const body = {
                    title: fd.get('title'),
                    content: fd.get('content'),
                    is_pinned: fd.has('is_pinned'),
                    author_id: null,
                };
                const res = await fetch('/api/announcements', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body),
                });
                if (res.ok) window.location.href = '/announcements';
                else alert('Error creating announcement');
            });
            </script>
        </div>`;

        return res.html(renderPage({ title: 'New Announcement', content, activePath: '/announcements', user: user ? { name: user.name as string, role: user.role as string } : undefined }));
    }
}
