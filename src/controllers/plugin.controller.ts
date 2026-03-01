import { Controller, Get } from '@gao/http';
import type { GaoRequest, GaoResponse } from '@gao/http';
import { renderPage } from '../views/renderer.js';
import { PluginService } from '../services/plugin.service.js';
import { escapeHtml } from '../helpers/escape.js';

const service = new PluginService();

const CATEGORY_ICONS: Record<string, string> = { crm: '👥', marketing: '📣', communication: '💬', reporting: '📊', integration: '🔌', ai: '🤖', security: '🔒' };

@Controller('/plugins')
export class PluginPageController {
    @Get('/')
    async list(req: GaoRequest, res: GaoResponse) {
        const user = req.user as Record<string, unknown>;
        const plugins = await service.list();
        const currentCategory = typeof req.query.category === 'string' ? req.query.category : '';

        const filteredPlugins = currentCategory ? plugins.filter(p => (p as any).category === currentCategory) : plugins;

        const categories = [...new Set(plugins.map(p => (p as any).category ?? 'general').filter(Boolean))];

        const cards = filteredPlugins.map(p => {
            const cat = (p as any).category ?? 'general';
            const icon = CATEGORY_ICONS[cat] ?? '🧩';
            return `
            <div class="gao-card" style="padding:20px;">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px;">
                    <div style="display:flex;align-items:center;gap:14px;">
                        <div style="width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,#6366f1,#8b5cf6);display:flex;align-items:center;justify-content:center;font-size:20px;">${icon}</div>
                        <div>
                            <h3 style="font-size:15px;font-weight:700;color:#e2e8f0;">${escapeHtml(p.name)}</h3>
                            <span style="font-size:11px;color:var(--gao-text-muted,#64748b);">v${escapeHtml(p.current_version ?? '0.0.0')} · ${escapeHtml(p.author ?? 'GAO CRM')}</span>
                        </div>
                    </div>
                </div>
                <p style="font-size:12px;color:var(--gao-text-muted,#64748b);margin-bottom:12px;min-height:36px;">${escapeHtml(p.description ?? 'No description')}</p>
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <span style="padding:2px 8px;border-radius:6px;font-size:10px;font-weight:600;background:rgba(99,102,241,0.12);color:#818cf8;">${cat}</span>
                    <button onclick="fetch('/api/plugins/${p.slug}/${p.is_active ? 'deactivate' : 'activate'}',{method:'PATCH'}).then(()=>window.location.reload())"
                        style="padding:6px 14px;border-radius:8px;font-size:11px;font-weight:700;border:none;cursor:pointer;transition:all 0.2s;${p.is_active
                    ? 'background:rgba(34,197,94,0.15);color:#22c55e;'
                    : 'background:rgba(148,163,184,0.15);color:#94a3b8;'}"
                        onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'">
                        ${p.is_active ? '🟢 Active' : '🔴 Inactive'}
                    </button>
                </div>
            </div>`;
        }).join('');

        const content = `
        <div style="padding:8px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                <div>
                    <h1 style="font-size:24px;font-weight:700;">Features & Integrations</h1>
                    <p style="font-size:13px;color:var(--gao-text-muted,#64748b);margin-top:4px;">Enable or disable CRM features and configure integrations.</p>
                </div>
            </div>

            <!-- Category Filter Tabs -->
            <div style="display:flex;gap:6px;margin-bottom:20px;flex-wrap:wrap;">
                <a href="/plugins" style="padding:6px 14px;border-radius:8px;font-size:12px;font-weight:600;text-decoration:none;${!currentCategory ? 'background:rgba(99,102,241,0.2);color:#818cf8;' : 'background:rgba(255,255,255,0.04);color:#94a3b8;'}">All</a>
                ${categories.map(cat => `
                    <a href="/plugins?category=${cat}" style="padding:6px 14px;border-radius:8px;font-size:12px;font-weight:600;text-decoration:none;${currentCategory === cat ? 'background:rgba(99,102,241,0.2);color:#818cf8;' : 'background:rgba(255,255,255,0.04);color:#94a3b8;'}">${CATEGORY_ICONS[cat] ?? '🧩'} ${cat}</a>
                `).join('')}
            </div>

            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px;">
                ${cards || '<p style="color:var(--gao-text-muted,#64748b);">No features found</p>'}
            </div>
        </div>`;

        return res.html(renderPage({ title: 'Features & Integrations', content, activePath: '/plugins', user: user ? { name: user.name as string, role: user.role as string } : undefined }));
    }
}
