import { Controller, Get } from '@gao/http';
import type { GaoRequest, GaoResponse } from '@gao/http';
import { renderPage } from '../views/renderer.js';
import { LandingPageService } from '../services/landing-page.service.js';
import { QuizResponse } from '../models/quiz-response.model.js';
import { SurveyResponse } from '../models/survey-response.model.js';
import { escapeHtml } from '../helpers/escape.js';
import { timeAgo, formatNumber } from '../helpers/format.js';
import { emptyState } from '../helpers/empty-state.js';
import { url } from '../helpers/url.js';

const service = new LandingPageService();

const STATUS_BADGE: Record<string, string> = {
    draft: 'background:rgba(148,163,184,0.15);color:#94a3b8;',
    published: 'background:rgba(34,197,94,0.15);color:#22c55e;',
    archived: 'background:rgba(239,68,68,0.15);color:#f87171;',
};

const TEMPLATES = [
    { slug: 'product-showcase', name: 'Product Showcase', emoji: '📦', desc: 'Highlight your product features and pricing' },
    { slug: 'lead-capture', name: 'Lead Capture', emoji: '🧲', desc: 'Capture leads with a prominent form' },
    { slug: 'event-registration', name: 'Event Registration', emoji: '🎟️', desc: 'Promote events with registration' },
    { slug: 'coming-soon', name: 'Coming Soon', emoji: '🚀', desc: 'Build anticipation before launch' },
    { slug: 'pricing', name: 'Pricing Page', emoji: '💰', desc: 'Showcase your pricing plans' },
    { slug: 'quiz-leaderboard', name: 'Quiz + Leaderboard', emoji: '🏆', desc: 'Interactive quiz with scoring and public leaderboard' },
    { slug: 'survey-form', name: 'Survey Form', emoji: '📋', desc: 'Multi-question survey with various input types' },
];

const btnPrimary = 'padding:10px 20px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;';
const inputStyle = 'width:100%;padding:10px 14px;background:rgba(255,255,255,0.04);border:1px solid rgba(100,116,139,0.25);border-radius:8px;color:#e2e8f0;font-size:14px;outline:none;';
const labelStyle = 'display:block;font-size:12px;font-weight:600;color:#94a3b8;margin-bottom:6px;';

@Controller('/landing-pages')
export class LandingPageController {
    @Get('/')
    async list(req: GaoRequest, res: GaoResponse) {
        const user = req.user as Record<string, unknown>;
        const pages = await service.list();

        const cards = pages.map(p => {
            const convRate = p.total_views && p.total_views > 0
                ? ((p.total_conversions ?? 0) / p.total_views * 100).toFixed(1) + '%'
                : '—';
            return `
            <a href="/landing-pages/${p.id}" style="text-decoration:none;color:inherit;">
                <div class="gao-card" style="padding:20px;transition:transform 0.15s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform=''">
                    <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:12px;">
                        <h3 style="font-size:15px;font-weight:700;color:#e2e8f0;">${escapeHtml(p.title)}</h3>
                        <span style="padding:3px 10px;border-radius:8px;font-size:10px;font-weight:700;${STATUS_BADGE[p.status] ?? ''}">${p.status}</span>
                    </div>
                    <p style="font-size:12px;color:var(--gao-text-muted,#64748b);margin-bottom:12px;">/p/${escapeHtml(p.slug)}</p>
                    <div style="display:flex;gap:16px;font-size:12px;color:#94a3b8;">
                        <span>👁️ ${formatNumber(p.total_views ?? 0)} views</span>
                        <span>🎯 ${formatNumber(p.total_conversions ?? 0)} conversions</span>
                        <span>📊 ${convRate}</span>
                    </div>
                    <div style="margin-top:8px;font-size:11px;color:#64748b;">${timeAgo(p.created_at)}</div>
                </div>
            </a>`;
        }).join('');

        const content = `
        <div style="padding:8px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
                <h1 style="font-size:24px;font-weight:700;">Landing Pages</h1>
                <a href="/landing-pages/create" style="${btnPrimary}text-decoration:none;">+ New Landing Page</a>
            </div>
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:16px;">
                ${cards || emptyState({ icon: 'default', title: 'No landing pages yet', description: 'Create your first landing page to start capturing leads.', action: { label: '+ New Landing Page', href: '/landing-pages/create' } })}
            </div>
        </div>`;

        return res.html(renderPage({ title: 'Landing Pages', content, activePath: '/landing-pages', user: user ? { name: user.name as string, role: user.role as string } : undefined }));
    }

    @Get('/create')
    async create(req: GaoRequest, res: GaoResponse) {
        const user = req.user as Record<string, unknown>;

        const templateCards = TEMPLATES.map(t => `
            <label style="cursor:pointer;">
                <input type="radio" name="template" value="${t.slug}" style="display:none;" onchange="document.querySelectorAll('.tpl-card').forEach(c=>c.style.border='1px solid rgba(100,116,139,0.15)');this.parentElement.querySelector('.tpl-card').style.border='2px solid #6366f1'">
                <div class="tpl-card gao-card" style="padding:20px;text-align:center;transition:all 0.15s;">
                    <div style="font-size:32px;margin-bottom:8px;">${t.emoji}</div>
                    <h4 style="font-size:14px;font-weight:700;color:#e2e8f0;margin-bottom:4px;">${t.name}</h4>
                    <p style="font-size:11px;color:#64748b;">${t.desc}</p>
                </div>
            </label>
        `).join('');

        const content = `
        <div style="padding:8px;">
            <a href="/landing-pages" style="display:inline-flex;align-items:center;gap:6px;font-size:13px;color:#94a3b8;text-decoration:none;margin-bottom:20px;">← Back</a>
            <h1 style="font-size:24px;font-weight:700;margin-bottom:24px;">Create Landing Page</h1>
            <div class="gao-card" style="padding:32px;max-width:720px;">
                <form id="createPageForm">
                    <div><label style="${labelStyle}">Page Title *</label><input type="text" name="title" required style="${inputStyle}" placeholder="e.g. Enterprise Cloud Solution"></div>
                    <div style="margin-top:16px;"><label style="${labelStyle}">URL Slug *</label><div style="display:flex;align-items:center;gap:0;"><span style="padding:10px 14px;background:rgba(255,255,255,0.02);border:1px solid rgba(100,116,139,0.25);border-right:none;border-radius:8px 0 0 8px;color:#64748b;font-size:14px;">/p/</span><input type="text" name="slug" required style="${inputStyle}border-radius:0 8px 8px 0;" placeholder="enterprise-cloud"></div></div>
                    <div style="margin-top:16px;"><label style="${labelStyle}">Description</label><textarea name="description" rows="2" style="${inputStyle}resize:vertical;" placeholder="Brief description for internal reference"></textarea></div>

                    <h3 style="font-size:15px;font-weight:700;margin-top:28px;margin-bottom:12px;">Choose Template</h3>
                    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px;margin-bottom:24px;">
                        ${templateCards}
                    </div>

                    <h3 style="font-size:15px;font-weight:700;margin-top:28px;margin-bottom:12px;">SEO Settings</h3>
                    <div><label style="${labelStyle}">SEO Title</label><input type="text" name="seo_title" style="${inputStyle}" placeholder="Title for search engines"></div>
                    <div style="margin-top:12px;"><label style="${labelStyle}">SEO Description</label><textarea name="seo_description" rows="2" style="${inputStyle}resize:vertical;" placeholder="Meta description for search engines"></textarea></div>

                    <div style="margin-top:24px;display:flex;gap:12px;">
                        <button type="submit" style="${btnPrimary}">Create Landing Page</button>
                        <a href="/landing-pages" style="padding:10px 20px;background:rgba(255,255,255,0.05);color:#94a3b8;border-radius:10px;text-decoration:none;font-size:14px;font-weight:600;display:inline-flex;align-items:center;">Cancel</a>
                    </div>
                </form>
            </div>
        </div>
        <script>
        document.getElementById('createPageForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const fd = new FormData(e.target);
            const data = Object.fromEntries(fd.entries());
            if (!data.template) { showToast('Please choose a template', 'warning'); return; }
            const res = await fetch('/api/landing-pages', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (res.ok) { const j = await res.json(); showToast('Landing page created!', 'success'); window.location.href = '/landing-pages/' + j.data.id; }
            else { const err = await res.json(); showToast(err.error?.message || 'Failed', 'error'); }
        });
        // Auto-generate slug from title
        document.querySelector('[name="title"]').addEventListener('input', function() {
            document.querySelector('[name="slug"]').value = this.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        });
        </script>`;

        return res.html(renderPage({ title: 'Create Landing Page', content, activePath: '/landing-pages', user: user ? { name: user.name as string, role: user.role as string } : undefined }));
    }

    @Get('/:id')
    async detail(req: GaoRequest, res: GaoResponse) {
        const user = req.user as Record<string, unknown>;
        const page = await service.findById(req.params.id);
        if (!page) return res.redirect(url('/landing-pages'));

        const convRate = page.total_views && page.total_views > 0
            ? ((page.total_conversions ?? 0) / page.total_views * 100).toFixed(1)
            : '0';

        const content = `
        <div style="padding:8px;">
            <a href="/landing-pages" style="display:inline-flex;align-items:center;gap:6px;font-size:13px;color:#94a3b8;text-decoration:none;margin-bottom:20px;">← Back to Landing Pages</a>

            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
                <div>
                    <h1 style="font-size:24px;font-weight:700;">${escapeHtml(page.title)}</h1>
                    <p style="font-size:13px;color:#64748b;margin-top:4px;">/p/${escapeHtml(page.slug)} · Template: ${escapeHtml(page.template)}</p>
                </div>
                <span style="padding:5px 14px;border-radius:8px;font-size:12px;font-weight:700;${STATUS_BADGE[page.status] ?? ''}">${page.status.toUpperCase()}</span>
            </div>

            <!-- Analytics -->
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin-bottom:20px;">
                <div class="gao-card" style="padding:16px;text-align:center;">
                    <div style="font-size:24px;font-weight:800;color:#3b82f6;">${formatNumber(page.total_views ?? 0)}</div>
                    <div style="font-size:12px;color:#64748b;">Views</div>
                </div>
                <div class="gao-card" style="padding:16px;text-align:center;">
                    <div style="font-size:24px;font-weight:800;color:#22c55e;">${formatNumber(page.total_conversions ?? 0)}</div>
                    <div style="font-size:12px;color:#64748b;">Conversions</div>
                </div>
                <div class="gao-card" style="padding:16px;text-align:center;">
                    <div style="font-size:24px;font-weight:800;color:#8b5cf6;">${convRate}%</div>
                    <div style="font-size:12px;color:#64748b;">Conv. Rate</div>
                </div>
            </div>

            <!-- Actions -->
            <div class="gao-card" style="padding:20px;">
                <div style="display:flex;gap:8px;flex-wrap:wrap;">
                    ${page.status === 'published'
                ? `<a href="/p/${page.slug}" target="_blank" style="padding:8px 16px;background:rgba(34,197,94,0.15);color:#22c55e;border:none;border-radius:8px;font-size:12px;font-weight:600;text-decoration:none;">🌐 View Live Page</a>
                           <button onclick="fetch('/api/landing-pages/${page.id}',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({status:'draft'})}).then(()=>{showToast('Page unpublished','info');setTimeout(()=>location.reload(),600)})" style="padding:8px 16px;background:rgba(148,163,184,0.15);color:#94a3b8;border:none;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;">⏸️ Unpublish</button>`
                : `<button onclick="fetch('/api/landing-pages/${page.id}',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({status:'published'})}).then(()=>{showToast('Page published!','success');setTimeout(()=>location.reload(),600)})" style="padding:8px 16px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border:none;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;">🚀 Publish</button>`}
                    <a href="/landing-pages/${page.id}/edit" style="padding:8px 16px;background:rgba(99,102,241,0.15);color:#818cf8;border:none;border-radius:8px;font-size:12px;font-weight:600;text-decoration:none;">✏️ Edit</a>
                    <button onclick="confirmDelete('landing page','/api/landing-pages/${page.id}','/landing-pages')" style="padding:8px 16px;background:rgba(239,68,68,0.1);color:#f87171;border:none;border-radius:8px;font-size:12px;cursor:pointer;">🗑️ Delete</button>
                </div>

                ${page.description ? `<p style="margin-top:16px;font-size:13px;color:#94a3b8;">${escapeHtml(page.description)}</p>` : ''}

                <div style="margin-top:16px;display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:13px;">
                    <div><span style="color:#64748b;">SEO Title:</span> <span style="color:#e2e8f0;">${escapeHtml(page.seo_title ?? '—')}</span></div>
                    <div><span style="color:#64748b;">Chat:</span> <span style="color:#e2e8f0;">${page.chat_enabled ? '✅ Enabled' : '❌ Disabled'}</span></div>
                    <div><span style="color:#64748b;">Published:</span> <span style="color:#e2e8f0;">${page.published_at ? timeAgo(page.published_at) : '—'}</span></div>
                    <div><span style="color:#64748b;">Created:</span> <span style="color:#e2e8f0;">${timeAgo(page.created_at)}</span></div>
                </div>
            </div>

            <!-- Responses Section (Quiz / Survey) -->
            ${await this.renderResponsesSection(page)}
        </div>`;

        return res.html(renderPage({ title: page.title, content, activePath: '/landing-pages', user: user ? { name: user.name as string, role: user.role as string } : undefined }));
    }

    @Get('/:id/edit')
    async edit(req: GaoRequest, res: GaoResponse) {
        const user = req.user as Record<string, unknown>;
        const page = await service.findById(req.params.id);
        if (!page) return res.redirect(url('/landing-pages'));

        const content = `
        <div style="padding:8px;">
            <a href="/landing-pages/${page.id}" style="display:inline-flex;align-items:center;gap:6px;font-size:13px;color:#94a3b8;text-decoration:none;margin-bottom:20px;">← Back</a>
            <h1 style="font-size:24px;font-weight:700;margin-bottom:24px;">Edit: ${escapeHtml(page.title)}</h1>
            <div class="gao-card" style="padding:32px;max-width:720px;">
                <form id="editPageForm">
                    <div><label style="${labelStyle}">Page Title *</label><input type="text" name="title" required value="${escapeHtml(page.title)}" style="${inputStyle}"></div>
                    <div style="margin-top:16px;"><label style="${labelStyle}">URL Slug *</label><input type="text" name="slug" required value="${escapeHtml(page.slug)}" style="${inputStyle}"></div>
                    <div style="margin-top:16px;"><label style="${labelStyle}">Description</label><textarea name="description" rows="2" style="${inputStyle}resize:vertical;">${escapeHtml(page.description ?? '')}</textarea></div>
                    <div style="margin-top:16px;"><label style="${labelStyle}">SEO Title</label><input type="text" name="seo_title" value="${escapeHtml(page.seo_title ?? '')}" style="${inputStyle}"></div>
                    <div style="margin-top:12px;"><label style="${labelStyle}">SEO Description</label><textarea name="seo_description" rows="2" style="${inputStyle}resize:vertical;">${escapeHtml(page.seo_description ?? '')}</textarea></div>
                    <div style="margin-top:16px;"><label style="${labelStyle}">Custom CSS</label><textarea name="custom_css" rows="4" style="${inputStyle}resize:vertical;font-family:monospace;font-size:13px;" placeholder="/* your custom styles */">${escapeHtml(page.custom_css ?? '')}</textarea></div>
                    <div style="margin-top:16px;"><label style="display:flex;align-items:center;gap:8px;font-size:13px;color:#e2e8f0;cursor:pointer;"><input type="checkbox" name="chat_enabled" value="true" ${page.chat_enabled ? 'checked' : ''}> Enable Chat Widget</label></div>
                    <div style="margin-top:24px;display:flex;gap:12px;">
                        <button type="submit" style="${btnPrimary}">Update Landing Page</button>
                        <a href="/landing-pages/${page.id}" style="padding:10px 20px;background:rgba(255,255,255,0.05);color:#94a3b8;border-radius:10px;text-decoration:none;font-size:14px;font-weight:600;display:inline-flex;align-items:center;">Cancel</a>
                    </div>
                </form>
            </div>
        </div>
        <script>
        document.getElementById('editPageForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const fd = new FormData(e.target);
            const data = Object.fromEntries(fd.entries());
            data.chat_enabled = fd.has('chat_enabled');
            const res = await fetch('/api/landing-pages/${page.id}', {
                method: 'PUT', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (res.ok) { showToast('Landing page updated!', 'success'); window.location.href = '/landing-pages/${page.id}'; }
            else { const err = await res.json(); showToast(err.error?.message || 'Failed', 'error'); }
        });
        </script>`;

        return res.html(renderPage({ title: `Edit ${page.title}`, content, activePath: '/landing-pages', user: user ? { name: user.name as string, role: user.role as string } : undefined }));
    }

    // ── Private: Render responses section for quiz/survey templates ──
    private async renderResponsesSection(page: { id: string; template: string }): Promise<string> {
        if (page.template === 'quiz-leaderboard') {
            const responses = await QuizResponse
                .where('landing_page_id', page.id)
                .orderBy('score', 'DESC')
                .limit(50)
                .get();

            if (responses.length === 0) {
                return `<div class="gao-card" style="padding:24px;margin-top:20px;">
                    <h3 style="font-size:15px;font-weight:700;margin-bottom:12px;">🏆 Quiz Responses</h3>
                    <p style="font-size:13px;color:#64748b;">No quiz submissions yet.</p>
                </div>`;
            }

            const rows = responses.map((r, i) => {
                const pct = r.total_questions > 0 ? Math.round((r.score / r.total_questions) * 100) : 0;
                const medal = i < 3 ? ['🥇', '🥈', '🥉'][i] : `#${i + 1}`;
                return `<tr style="border-bottom:1px solid rgba(100,116,139,0.08);">
                    <td style="padding:10px 12px;font-weight:700;color:#6366f1;">${medal}</td>
                    <td style="padding:10px 12px;color:#e2e8f0;font-weight:600;">${escapeHtml(r.participant_name)}</td>
                    <td style="padding:10px 12px;color:#94a3b8;">${r.participant_email ? escapeHtml(r.participant_email) : '—'}</td>
                    <td style="padding:10px 12px;font-weight:700;color:#a5b4fc;">${r.score}/${r.total_questions}</td>
                    <td style="padding:10px 12px;font-weight:700;color:#22c55e;">${pct}%</td>
                    <td style="padding:10px 12px;color:#64748b;font-size:12px;">${timeAgo(r.created_at)}</td>
                </tr>`;
            }).join('');

            return `<div class="gao-card" style="padding:24px;margin-top:20px;">
                <h3 style="font-size:15px;font-weight:700;margin-bottom:16px;">🏆 Quiz Responses (${responses.length})</h3>
                <div style="overflow-x:auto;">
                    <table style="width:100%;border-collapse:collapse;font-size:13px;">
                        <thead><tr style="text-align:left;color:#64748b;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;">
                            <th style="padding:8px 12px;">Rank</th>
                            <th style="padding:8px 12px;">Name</th>
                            <th style="padding:8px 12px;">Email</th>
                            <th style="padding:8px 12px;">Score</th>
                            <th style="padding:8px 12px;">%</th>
                            <th style="padding:8px 12px;">When</th>
                        </tr></thead>
                        <tbody>${rows}</tbody>
                    </table>
                </div>
            </div>`;
        }

        if (page.template === 'survey-form') {
            const responses = await SurveyResponse
                .where('landing_page_id', page.id)
                .orderBy('created_at', 'DESC')
                .limit(50)
                .get();

            if (responses.length === 0) {
                return `<div class="gao-card" style="padding:24px;margin-top:20px;">
                    <h3 style="font-size:15px;font-weight:700;margin-bottom:12px;">📋 Survey Responses</h3>
                    <p style="font-size:13px;color:#64748b;">No survey submissions yet.</p>
                </div>`;
            }

            const rows = responses.map(r => {
                let answersPreview = '—';
                try {
                    const answers = typeof r.answers === 'string' ? JSON.parse(r.answers) : r.answers;
                    if (Array.isArray(answers)) {
                        answersPreview = answers.filter(Boolean).slice(0, 3).map((a: unknown) =>
                            typeof a === 'string' ? a : Array.isArray(a) ? a.join(', ') : String(a)
                        ).join(' | ');
                        if (answersPreview.length > 80) answersPreview = answersPreview.slice(0, 80) + '…';
                    }
                } catch { /* invalid */ }

                return `<tr style="border-bottom:1px solid rgba(100,116,139,0.08);">
                    <td style="padding:10px 12px;color:#e2e8f0;font-weight:600;">${escapeHtml(r.respondent_name ?? '—')}</td>
                    <td style="padding:10px 12px;color:#94a3b8;">${r.respondent_email ? escapeHtml(r.respondent_email) : '—'}</td>
                    <td style="padding:10px 12px;color:#94a3b8;font-size:12px;">${escapeHtml(answersPreview)}</td>
                    <td style="padding:10px 12px;color:#64748b;font-size:12px;">${timeAgo(r.created_at)}</td>
                </tr>`;
            }).join('');

            return `<div class="gao-card" style="padding:24px;margin-top:20px;">
                <h3 style="font-size:15px;font-weight:700;margin-bottom:16px;">📋 Survey Responses (${responses.length})</h3>
                <div style="overflow-x:auto;">
                    <table style="width:100%;border-collapse:collapse;font-size:13px;">
                        <thead><tr style="text-align:left;color:#64748b;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;">
                            <th style="padding:8px 12px;">Name</th>
                            <th style="padding:8px 12px;">Email</th>
                            <th style="padding:8px 12px;">Answers Preview</th>
                            <th style="padding:8px 12px;">When</th>
                        </tr></thead>
                        <tbody>${rows}</tbody>
                    </table>
                </div>
            </div>`;
        }

        return ''; // Not a quiz/survey template
    }
}
