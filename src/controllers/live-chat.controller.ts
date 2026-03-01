import { Controller, Get } from '@gao/http';
import type { GaoRequest, GaoResponse } from '@gao/http';
import { renderPage } from '../views/renderer.js';
import { LiveChatService } from '../services/live-chat.service.js';
import { escapeHtml } from '../helpers/escape.js';
import { timeAgo } from '../helpers/format.js';

const service = new LiveChatService();

@Controller('/live-chat')
export class LiveChatController {
    @Get('/')
    async index(req: GaoRequest, res: GaoResponse) {
        const user = req.user as Record<string, unknown>;

        const [active, waiting] = await Promise.all([
            service.getActiveSessions(),
            service.getWaitingSessions(),
        ]);

        const allSessions = [...waiting, ...active];

        const sessionList = allSessions.map(s => {
            const statusIcon = s.status === 'waiting' ? '🟡' : s.status === 'active' ? '🟢' : '⚫';
            const isSelected = req.query.session === s.id;
            return `
            <a href="/live-chat?session=${s.id}" style="text-decoration:none;display:block;">
                <div style="display:flex;align-items:center;gap:12px;padding:14px 16px;border-bottom:1px solid rgba(100,116,139,0.12);${isSelected ? 'background:rgba(99,102,241,0.1);border-left:3px solid #6366f1;' : ''}cursor:pointer;" onmouseover="this.style.background='rgba(255,255,255,0.03)'" onmouseout="this.style.background='${isSelected ? 'rgba(99,102,241,0.1)' : ''}'">
                    <div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#8b5cf6);display:flex;align-items:center;justify-content:center;color:#fff;font-size:14px;font-weight:700;">${String(s.visitor_name || 'V').charAt(0).toUpperCase()}</div>
                    <div style="flex:1;min-width:0;">
                    <div style="font-size:13px;font-weight:600;color:#e2e8f0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${statusIcon} ${escapeHtml(s.visitor_name ?? 'Visitor')}</div>
                        <div style="font-size:11px;color:#64748b;">${s.total_messages} msgs · ${timeAgo(s.started_at)}</div>
                    </div>
                </div>
            </a>`;
        }).join('');

        // If a session is selected, show its messages
        let chatPanel = `
        <div style="display:flex;align-items:center;justify-content:center;height:100%;color:#64748b;">
            <div style="text-align:center;">
                <div style="font-size:48px;margin-bottom:16px;">💬</div>
                <p style="font-size:15px;font-weight:600;">Select a conversation</p>
                <p style="font-size:12px;margin-top:4px;">${allSessions.length} active sessions</p>
            </div>
        </div>`;

        const sessionId = typeof req.query.session === 'string' ? req.query.session : '';
        if (sessionId) {
            const messages = await service.getMessages(sessionId);
            const session = allSessions.find(s => s.id === sessionId);

            const msgHtml = messages.map(m => {
                const isAgent = m.sender_type === 'agent';
                const isBot = m.sender_type === 'bot';
                const align = isAgent || isBot ? 'flex-end' : 'flex-start';
                const bg = isAgent ? 'rgba(99,102,241,0.15)' : isBot ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.04)';
                const label = isAgent ? '🧑‍💼 Agent' : isBot ? '🤖 Bot' : '👤 Visitor';
                return `
                <div style="display:flex;justify-content:${align};margin-bottom:10px;">
                    <div style="max-width:70%;padding:10px 14px;background:${bg};border-radius:12px;">
                        <div style="font-size:10px;color:#64748b;margin-bottom:4px;">${label} · ${timeAgo(m.created_at)}</div>
                        <p style="font-size:14px;color:#e2e8f0;margin:0;">${escapeHtml(m.content)}</p>
                    </div>
                </div>`;
            }).join('');

            chatPanel = `
            <div style="display:flex;flex-direction:column;height:100%;">
                <!-- Chat Header -->
                <div style="padding:16px;border-bottom:1px solid rgba(100,116,139,0.15);display:flex;justify-content:space-between;align-items:center;">
                    <div>
                        <h3 style="font-size:15px;font-weight:700;color:#e2e8f0;">${escapeHtml(session?.visitor_name ?? 'Visitor')}</h3>
                        <span style="font-size:11px;color:#64748b;">${escapeHtml(session?.visitor_email ?? '—')} · ${escapeHtml(session?.page_url ?? '—')}</span>
                    </div>
                    <div style="display:flex;gap:6px;">
                        ${session?.status === 'waiting' ? `<button onclick="fetch('/api/live-chat/sessions/${sessionId}/assign',{method:'POST'}).then(()=>{showToast('Assigned to you','success');location.reload()})" style="padding:6px 14px;background:rgba(34,197,94,0.15);color:#22c55e;border:none;border-radius:8px;font-size:11px;font-weight:600;cursor:pointer;">✋ Take Over</button>` : ''}
                        <button onclick="fetch('/api/live-chat/sessions/${sessionId}/end',{method:'POST'}).then(()=>{showToast('Chat ended','info');window.location='/live-chat'})" style="padding:6px 14px;background:rgba(239,68,68,0.1);color:#f87171;border:none;border-radius:8px;font-size:11px;cursor:pointer;">End Chat</button>
                    </div>
                </div>
                <!-- Messages -->
                <div style="flex:1;overflow-y:auto;padding:20px;">
                    ${msgHtml || '<p style="text-align:center;color:#64748b;font-size:13px;">No messages yet</p>'}
                </div>
                <!-- Reply -->
                <form id="replyForm" style="padding:16px;border-top:1px solid rgba(100,116,139,0.15);display:flex;gap:8px;">
                    <input name="content" placeholder="Type a reply..." required style="flex:1;padding:10px 14px;background:rgba(15,23,42,0.6);border:1px solid rgba(100,116,139,0.3);border-radius:8px;color:#e2e8f0;font-size:14px;outline:none;">
                    <button type="submit" style="padding:10px 20px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border:none;border-radius:8px;font-weight:700;cursor:pointer;">Send</button>
                </form>
            </div>
            <script>
            document.getElementById('replyForm')?.addEventListener('submit', async (e) => {
                e.preventDefault();
                const fd = new FormData(e.target);
                const res = await fetch('/api/live-chat/sessions/${sessionId}/messages', {
                    method: 'POST', headers: {'Content-Type':'application/json'},
                    body: JSON.stringify({ content: fd.get('content'), sender_type: 'agent' }),
                });
                if (res.ok) location.reload();
                else showToast('Failed to send', 'error');
            });
            </script>`;
        }

        // Stats bar
        const statsBar = `
        <div style="display:flex;gap:16px;margin-bottom:16px;">
            <div class="gao-card" style="padding:12px 20px;display:flex;align-items:center;gap:8px;">
                <span style="font-size:20px;font-weight:800;color:#22c55e;">${active.length}</span>
                <span style="font-size:12px;color:#94a3b8;">Active</span>
            </div>
            <div class="gao-card" style="padding:12px 20px;display:flex;align-items:center;gap:8px;">
                <span style="font-size:20px;font-weight:800;color:#f59e0b;">${waiting.length}</span>
                <span style="font-size:12px;color:#94a3b8;">Waiting</span>
            </div>
            <div class="gao-card" style="padding:12px 20px;display:flex;align-items:center;gap:8px;">
                <span style="font-size:20px;font-weight:800;color:#3b82f6;">${allSessions.reduce((s, x) => s + x.total_messages, 0)}</span>
                <span style="font-size:12px;color:#94a3b8;">Messages</span>
            </div>
        </div>`;

        const content = `
        <div style="padding:8px;">
            <h1 style="font-size:24px;font-weight:700;margin-bottom:16px;">Live Chat</h1>
            ${statsBar}
            <div style="display:grid;grid-template-columns:320px 1fr;gap:0;height:calc(100vh - 260px);">
                <div class="gao-card" style="border-radius:12px 0 0 12px;overflow-y:auto;">
                    ${sessionList || '<div style="padding:24px;text-align:center;color:#64748b;font-size:13px;">No active chat sessions</div>'}
                </div>
                <div class="gao-card" style="border-radius:0 12px 12px 0;">
                    ${chatPanel}
                </div>
            </div>
        </div>`;

        return res.html(renderPage({ title: 'Live Chat', content, activePath: '/live-chat', user: user ? { name: user.name as string, role: user.role as string } : undefined }));
    }
}
