/**
 * GAO CRM — Shared Admin Template Renderer
 */
import { createAdminTemplate, } from '@gao/ui';
const PREFIX = '/gaocrm/admin-panel';
/**
 * Server-side URL prefix rewriter.
 *
 * Rewrites all internal href, fetch(), and window.location references
 * inside content HTML so they include the /gaocrm/admin-panel prefix.
 * This runs at string level before HTML parsing — bulletproof.
 *
 * Excluded:
 *   - Already prefixed:  /gaocrm/...
 *   - Public pages:       /p/...
 *   - Protocol-relative:  //...
 *   - Anchors:            #...
 *   - External:           http/mailto/tel
 */
function prefixContent(html) {
    return html
        // href="/..." (double quotes)
        .replace(/href="\/(?!gaocrm\/)(?!p\/)(?!\/)/g, `href="${PREFIX}/`)
        // href='/...' (single quotes)
        .replace(/href='\/(?!gaocrm\/)(?!p\/)(?!\/)/g, `href='${PREFIX}/`)
        // fetch('/...' (single/double quotes)
        .replace(/fetch\('\/(?!gaocrm\/)(?!p\/)(?!\/)/g, `fetch('${PREFIX}/`)
        .replace(/fetch\("\/(?!gaocrm\/)(?!p\/)(?!\/)/g, `fetch("${PREFIX}/`)
        // window.location.href = '/...'
        .replace(/window\.location\.href\s*=\s*'\/(?!gaocrm\/)(?!p\/)(?!\/)/g, `window.location.href='${PREFIX}/`)
        .replace(/window\.location\.href\s*=\s*"\/(?!gaocrm\/)(?!p\/)(?!\/)/g, `window.location.href="${PREFIX}/`)
        // window.location = '/...'
        .replace(/window\.location\s*=\s*'\/(?!gaocrm\/)(?!p\/)(?!\/)/g, `window.location='${PREFIX}/`)
        .replace(/window\.location\s*=\s*"\/(?!gaocrm\/)(?!p\/)(?!\/)/g, `window.location="${PREFIX}/`);
}
export function renderPage(options) {
    const { title, content, activePath, user, notifications } = options;
    const P = PREFIX;
    const sidebar = [
        // ─── MAIN ─────────────────────────────────
        { label: 'Dashboard', icon: 'home', section: 'MAIN', href: `${P}/`, active: activePath === '/' },
        // ─── CRM ──────────────────────────────────
        { label: 'CRM Overview', icon: 'bar-chart-alt', section: 'CRM', href: `${P}/crm`, active: activePath === '/crm' },
        { label: 'Contacts', icon: 'users', href: `${P}/crm/contacts`, active: activePath.startsWith('/crm/contacts') || activePath.startsWith('/crm/companies') },
        { label: 'Pipeline', icon: 'layers', href: `${P}/crm/pipeline`, active: activePath.startsWith('/crm/pipeline') },
        // ─── SALES ────────────────────────────────
        { label: 'Products', icon: 'box', section: 'SALES', href: `${P}/products`, active: activePath.startsWith('/products') },
        { label: 'Quotations', icon: 'file-text', href: `${P}/quotations`, active: activePath.startsWith('/quotations') },
        { label: 'Invoices', icon: 'credit-card', href: `${P}/invoices`, active: activePath.startsWith('/invoices') },
        { label: 'Calendar', icon: 'clock', href: `${P}/calendar`, active: activePath.startsWith('/calendar') },
        // ─── MARKETING ────────────────────────────
        { label: 'Email Hub', icon: 'inbox', section: 'MARKETING', href: `${P}/email-hub`, active: activePath.startsWith('/email-hub') },
        { label: 'Campaigns', icon: 'send', href: `${P}/campaigns`, active: activePath.startsWith('/campaigns') },
        { label: 'Forms', icon: 'clipboard', href: `${P}/forms`, active: activePath.startsWith('/forms') },
        { label: 'Web Tracking', icon: 'globe', href: `${P}/tracking`, active: activePath.startsWith('/tracking') },
        { label: 'Landing Pages', icon: 'layout', href: `${P}/landing-pages`, active: activePath.startsWith('/landing-pages') },
        // ─── SUPPORT ──────────────────────────────
        { label: 'Tickets', icon: 'help-circle', section: 'SUPPORT', href: `${P}/tickets`, active: activePath.startsWith('/tickets') },
        { label: 'Knowledge Base', icon: 'file-text', href: `${P}/kb`, active: activePath.startsWith('/kb') },
        { label: 'Live Chat', icon: 'comment', href: `${P}/live-chat`, active: activePath.startsWith('/live-chat') },
        // ─── COLLABORATION ────────────────────────
        { label: 'Messenger', icon: 'comment', section: 'COLLAB', href: `${P}/messenger`, active: activePath.startsWith('/messenger') },
        { label: 'Projects', icon: 'folder', href: `${P}/projects`, active: activePath.startsWith('/projects') },
        { label: 'Announcements', icon: 'bell', href: `${P}/announcements`, active: activePath.startsWith('/announcements') },
        // ─── ADMIN ────────────────────────────────
        { label: 'Reports', icon: 'bar-chart-alt', section: 'ADMIN', href: `${P}/reports`, active: activePath.startsWith('/reports') },
        { label: 'Features', icon: 'puzzle', href: `${P}/plugins`, active: activePath.startsWith('/plugins') },
        { label: 'Audit Trail', icon: 'shield', href: `${P}/audit`, active: activePath.startsWith('/audit') },
        { label: 'Settings', icon: 'cpu', href: `${P}/settings`, active: activePath.startsWith('/settings') },
    ];
    // Toast notification system + confirm delete dialog + loading states
    const globalScripts = `
    <div id="gao-toast-container" style="position:fixed;top:20px;right:20px;z-index:9999;display:flex;flex-direction:column;gap:8px;pointer-events:none;"></div>
    <script>
    function showToast(msg, type) {
        type = type || 'success';
        var colors = {success:'#22c55e',error:'#ef4444',warning:'#f59e0b',info:'#3b82f6'};
        var icons = {success:'✅',error:'❌',warning:'⚠️',info:'ℹ️'};
        var c = document.getElementById('gao-toast-container');
        var t = document.createElement('div');
        t.style.cssText = 'pointer-events:auto;padding:12px 20px;background:rgba(15,23,42,0.95);border:1px solid '+(colors[type]||'#6366f1')+'40;border-left:4px solid '+(colors[type]||'#6366f1')+';border-radius:10px;color:#e2e8f0;font-size:13px;font-weight:600;box-shadow:0 8px 32px rgba(0,0,0,0.3);backdrop-filter:blur(12px);display:flex;align-items:center;gap:10px;max-width:380px;animation:gaoToastIn .3s ease;';
        t.innerHTML = '<span style="font-size:16px;">'+(icons[type]||'ℹ️')+'</span><span>'+msg+'</span>';
        c.appendChild(t);
        setTimeout(function(){t.style.opacity='0';t.style.transform='translateX(100px)';t.style.transition='all .3s ease';setTimeout(function(){t.remove()},300)},4000);
    }
    function confirmDelete(entity, url, redirectUrl) {
        if(confirm('Delete this '+entity+'? This action cannot be undone.')) {
            fetch(url, {method:'DELETE'}).then(function(r){
                if(r.ok){showToast(entity+' deleted','success');setTimeout(function(){window.location=redirectUrl},600);}
                else showToast('Failed to delete '+entity,'error');
            });
        }
    }
    function gaoSubmit(btn, asyncFn) {
        var origText = btn.textContent;
        btn.disabled = true;
        btn.style.opacity = '0.6';
        btn.textContent = '⏳ Processing...';
        asyncFn().then(function(){btn.disabled=false;btn.style.opacity='1';btn.textContent=origText;})
                 .catch(function(){btn.disabled=false;btn.style.opacity='1';btn.textContent=origText;showToast('Something went wrong','error');});
    }
    </script>
    <style>
    @keyframes gaoToastIn { from { opacity:0; transform:translateX(100px); } to { opacity:1; transform:translateX(0); } }
    @keyframes gaoShimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
    .gao-skeleton { background: linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 75%); background-size: 200% 100%; animation: gaoShimmer 1.5s infinite; border-radius: 8px; }
    .gao-skeleton-text { height: 14px; margin-bottom: 8px; }
    .gao-skeleton-card { height: 120px; margin-bottom: 16px; }
    .gao-skeleton-avatar { width: 40px; height: 40px; border-radius: 50%; }
    </style>
    <script>
    // Admin panel URL rewriter — automatically prefixes internal links & API calls
    (function(){
        var PREFIX = '/gaocrm/admin-panel';
        function needsPrefix(url) {
            return typeof url === 'string' && url.startsWith('/') && !url.startsWith(PREFIX) && !url.startsWith('/p/');
        }
        function prefixed(url) { return needsPrefix(url) ? PREFIX + url : url; }
        // Expose helper for inline scripts
        window.gaoUrl = prefixed;

        // ── 1. Proactively rewrite ALL <a href> attributes at DOM ready ──
        function rewriteAllLinks() {
            document.querySelectorAll('a[href]').forEach(function(a) {
                var href = a.getAttribute('href');
                if (href && needsPrefix(href)) a.setAttribute('href', PREFIX + href);
            });
        }

        // ── 2. Capture-phase click handler (safety net for dynamically added links) ──
        document.addEventListener('click', function(e) {
            var a = e.target.closest ? e.target.closest('a[href]') : null;
            if (!a) return;
            var href = a.getAttribute('href');
            if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith(PREFIX) || href.startsWith('/p/')) return;
            if (href.startsWith('/')) {
                e.preventDefault();
                window.location.href = PREFIX + href;
            }
        }, true);

        // ── 3. Rewrite fetch() calls to prefix API routes ──
        var origFetch = window.fetch;
        window.fetch = function(url, opts) {
            if (needsPrefix(url)) url = PREFIX + url;
            return origFetch.call(this, url, opts);
        };

        // ── 4. Rewrite form actions ──
        document.addEventListener('submit', function(e) {
            var f = e.target;
            if (f.action && f.action.startsWith(window.location.origin + '/') && !f.action.includes(PREFIX)) {
                var path = new URL(f.action).pathname;
                if (needsPrefix(path)) f.action = PREFIX + path;
            }
        }, true);

        // ── 5. Rewrite inline event handlers (onclick, onchange, onsubmit) ──
        function rewriteInlineHandlers() {
            document.querySelectorAll('[onclick],[onchange],[onsubmit]').forEach(function(el) {
                ['onclick','onchange','onsubmit'].forEach(function(attr) {
                    var val = el.getAttribute(attr);
                    if (!val || val.indexOf(PREFIX) !== -1) return;
                    var rewritten = rewriteLocationUrls(val);
                    if (rewritten !== val) el.setAttribute(attr, rewritten);
                });
            });
        }
        function rewriteLocationUrls(code) {
            return code
                .replace(/window\.location\.href\s*=\s*'\/(?!gaocrm)/g, "window.location.href='" + PREFIX + "/")
                .replace(/window\.location\.href\s*=\s*"\/(?!gaocrm)/g, 'window.location.href="' + PREFIX + '/')
                .replace(/window\.location\s*=\s*'\/(?!gaocrm)/g, "window.location='" + PREFIX + "/")
                .replace(/window\.location\s*=\s*"\/(?!gaocrm)/g, 'window.location="' + PREFIX + '/');
        }

        // ── 6. Run all DOM rewrites at DOMContentLoaded ──
        function runAllRewrites() {
            rewriteAllLinks();
            rewriteInlineHandlers();
        }
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', runAllRewrites);
        } else {
            runAllRewrites();
        }

        // ── 7. MutationObserver: rewrite dynamically added links ──
        if (typeof MutationObserver !== 'undefined') {
            new MutationObserver(function(mutations) {
                mutations.forEach(function(m) {
                    m.addedNodes.forEach(function(n) {
                        if (n.nodeType === 1) {
                            if (n.tagName === 'A' && n.hasAttribute && n.hasAttribute('href')) {
                                var href = n.getAttribute('href');
                                if (needsPrefix(href)) n.setAttribute('href', PREFIX + href);
                            }
                            if (n.querySelectorAll) {
                                n.querySelectorAll('a[href]').forEach(function(a) {
                                    var href = a.getAttribute('href');
                                    if (needsPrefix(href)) a.setAttribute('href', PREFIX + href);
                                });
                            }
                        }
                    });
                });
            }).observe(document.documentElement, { childList: true, subtree: true });
        }
    })();
    </script>`;
    return createAdminTemplate.layout({
        title: `${title} — GAO CRM`,
        brandName: 'GAO CRM',
        brandIcon: 'layout',
        sidebar,
        navbar: {
            showSearch: true,
            user: user ? { name: user.name, role: user.role } : { name: 'Guest' },
            notifications: notifications ?? 0,
        },
        content: prefixContent(content + globalScripts),
        footer: '© 2026 GAO CRM — Built with GAO Framework',
    });
}
//# sourceMappingURL=renderer.js.map