import { Controller, Get } from '@gao/http';
import type { GaoRequest, GaoResponse } from '@gao/http';
import { renderPage } from '../views/renderer.js';
import { MessengerService } from '../services/messenger.service.js';
import { escapeHtml } from '../helpers/escape.js';
import { timeAgo } from '../helpers/format.js';

const service = new MessengerService();

@Controller('/messenger')
export class MessengerController {
    @Get('/')
    async index(req: GaoRequest, res: GaoResponse) {
        const user = req.user as Record<string, unknown>;
        const userId = (user?.id as string) ?? '';
        const channels = userId ? await service.listChannels(userId) : [];

        const channelList = channels.map(ch => `
            <a href="/messenger/${ch.id}" style="text-decoration:none;">
                <div style="display:flex;align-items:center;gap:12px;padding:14px 16px;border-bottom:1px solid rgba(100,116,139,0.12);cursor:pointer;transition:background 0.15s;" onmouseover="this.style.background='rgba(255,255,255,0.03)'" onmouseout="this.style.background=''">
                    <div style="width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#6366f1,#8b5cf6);display:flex;align-items:center;justify-content:center;color:#fff;font-size:14px;font-weight:700;">#</div>
                    <div>
                        <div style="font-size:14px;font-weight:600;color:#e2e8f0;">${escapeHtml(ch.name)}</div>
                        <div style="font-size:11px;color:var(--gao-text-muted,#64748b);">${ch.type}</div>
                    </div>
                </div>
            </a>`).join('');

        const content = `
        <div style="padding:8px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
                <h1 style="font-size:24px;font-weight:700;">Messenger</h1>
                <button onclick="document.getElementById('newChannelForm').style.display=document.getElementById('newChannelForm').style.display==='none'?'flex':'none'" style="padding:8px 18px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border:none;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;">+ New Channel</button>
            </div>
            <form id="newChannelForm" style="display:none;gap:8px;margin-bottom:16px;align-items:end;" onsubmit="event.preventDefault();fetch('/api/messenger/channels',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:this.name.value,type:this.type.value})}).then(()=>window.location.reload())">
                <input name="name" placeholder="Channel name *" required style="flex:1;padding:10px 14px;background:rgba(255,255,255,0.04);border:1px solid rgba(100,116,139,0.25);border-radius:8px;color:#e2e8f0;font-size:14px;" />
                <select name="type" style="padding:10px 14px;background:rgba(255,255,255,0.04);border:1px solid rgba(100,116,139,0.25);border-radius:8px;color:#e2e8f0;font-size:14px;"><option value="public">Public</option><option value="private">Private</option></select>
                <button type="submit" style="padding:10px 20px;background:#6366f1;color:white;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;">Create</button>
            </form>
            <div style="display:grid;grid-template-columns:320px 1fr;gap:0;height:calc(100vh - 200px);">
                <div class="gao-card" style="border-radius:12px 0 0 12px;overflow-y:auto;">
                    ${channelList || '<p style="padding:24px;color:var(--gao-text-muted,#64748b);font-size:13px;">No channels yet. Create one to get started.</p>'}
                </div>
                <div class="gao-card" style="border-radius:0 12px 12px 0;display:flex;align-items:center;justify-content:center;">
                    <div style="text-align:center;color:var(--gao-text-muted,#64748b);">
                        <div style="font-size:48px;margin-bottom:16px;">💬</div>
                        <p style="font-size:15px;font-weight:600;">Select a channel to start chatting</p>
                    </div>
                </div>
            </div>
        </div>`;

        return res.html(renderPage({ title: 'Messenger', content, activePath: '/messenger', user: user ? { name: user.name as string, role: user.role as string } : undefined }));
    }

    @Get('/:id')
    async channel(req: GaoRequest, res: GaoResponse) {
        const user = req.user as Record<string, unknown>;
        const userId = (user?.id as string) ?? '';
        const channels = userId ? await service.listChannels(userId) : [];
        const messages = await service.getMessages(req.params.id);

        const channelList = channels.map(ch => {
            const isActive = ch.id === req.params.id;
            return `
            <a href="/messenger/${ch.id}" style="text-decoration:none;">
                <div style="display:flex;align-items:center;gap:12px;padding:14px 16px;border-bottom:1px solid rgba(100,116,139,0.12);${isActive ? 'background:rgba(99,102,241,0.1);border-left:3px solid #6366f1;' : ''}">
                    <div style="width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,${isActive ? '#6366f1,#8b5cf6' : '#475569,#64748b'});display:flex;align-items:center;justify-content:center;color:#fff;font-size:14px;font-weight:700;">#</div>
                    <div style="font-size:14px;font-weight:600;color:#e2e8f0;">${escapeHtml(ch.name)}</div>
                </div>
            </a>`;
        }).join('');

        const msgList = messages.reverse().map(m => `
            <div style="padding:10px 0;border-bottom:1px solid rgba(100,116,139,0.08);">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
                    <span style="font-size:12px;font-weight:700;color:#8b5cf6;">User</span>
                    <span style="font-size:10px;color:var(--gao-text-muted,#64748b);">${timeAgo(m.created_at)}</span>
                </div>
                <p style="font-size:14px;color:#e2e8f0;margin:0;">${escapeHtml(m.content)}</p>
            </div>`).join('');

        const content = `
        <div style="padding:8px;">
            <h1 style="font-size:24px;font-weight:700;margin-bottom:24px;">Messenger</h1>
            <div style="display:grid;grid-template-columns:320px 1fr;gap:0;height:calc(100vh - 200px);">
                <div class="gao-card" style="border-radius:12px 0 0 12px;overflow-y:auto;">${channelList}</div>
                <div class="gao-card" style="border-radius:0 12px 12px 0;display:flex;flex-direction:column;">
                    <div style="flex:1;overflow-y:auto;padding:20px;">${msgList || '<p style="color:var(--gao-text-muted,#64748b);text-align:center;">No messages yet</p>'}</div>
                    <form id="sendMsg" style="padding:16px;border-top:1px solid rgba(100,116,139,0.15);display:flex;gap:10px;">
                        <input name="content" placeholder="Type a message..." required style="flex:1;padding:10px 14px;background:rgba(15,23,42,0.6);border:1px solid rgba(100,116,139,0.3);border-radius:8px;color:#e2e8f0;font-size:14px;outline:none;">
                        <button type="submit" style="padding:10px 20px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border:none;border-radius:8px;font-weight:700;cursor:pointer;">Send</button>
                    </form>
                </div>
            </div>
        </div>
        <script>
            document.getElementById('sendMsg')?.addEventListener('submit', async (e) => {
                e.preventDefault();
                const fd = new FormData(e.target);
                const res = await fetch('/api/messenger/channels/${req.params.id}/messages', {
                    method: 'POST', headers: {'Content-Type':'application/json'},
                    body: JSON.stringify({ content: fd.get('content') }),
                });
                if (res.ok) window.location.reload();
            });
        </script>`;

        return res.html(renderPage({ title: 'Messenger', content, activePath: '/messenger', user: user ? { name: user.name as string, role: user.role as string } : undefined }));
    }
}
