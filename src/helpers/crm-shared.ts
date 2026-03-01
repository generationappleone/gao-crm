/**
 * GAO CRM — Shared CRM UI Constants & HTML Helpers
 *
 * Extracted from contact, company, deal, pipeline, activity controllers
 * to eliminate ~500 lines of duplication across CRM modules.
 */

import { escapeHtml } from './escape.js';
import { formatCurrency, timeAgo } from './format.js';
import { url } from './url.js';

// ─── Form Styles (shared across 11+ controllers) ─────────────────
export const inputStyle = `width:100%;padding:10px 14px;background:var(--gao-surface-raised, rgba(15,23,42,0.6));border:1px solid var(--gao-border, rgba(100,116,139,0.3));border-radius:8px;color:var(--gao-text, #e2e8f0);font-size:14px;outline:none;`;
export const labelStyle = `display:block;font-size:13px;font-weight:600;color:var(--gao-text-secondary, #cbd5e1);margin-bottom:6px;`;
export const btnPrimary = `padding:12px 28px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;transition:all 0.2s;`;
export const btnSecondary = `padding:10px 20px;background:var(--gao-gray-100, rgba(255,255,255,0.06));color:var(--gao-text-secondary, #cbd5e1);border:1px solid var(--gao-border, rgba(100,116,139,0.3));border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;text-decoration:none;transition:all 0.2s;`;
export const cardStyle = `background:var(--gao-surface, rgba(255,255,255,0.03));border:1px solid var(--gao-border-light, rgba(255,255,255,0.06));border-radius:16px;padding:24px;`;

// ─── Color Maps ──────────────────────────────────────────────────
export const STATUS_COLORS: Record<string, string> = {
    lead: '#94a3b8',
    prospect: '#3b82f6',
    customer: '#22c55e',
    churned: '#ef4444',
};

export const TYPE_ICONS: Record<string, string> = {
    call: '📞', meeting: '🤝', email: '📧', task: '✅', note: '📝',
};

export const TYPE_COLORS: Record<string, string> = {
    call: '#3b82f6', meeting: '#8b5cf6', email: '#22c55e', task: '#f59e0b', note: '#94a3b8',
};

export const STAGE_COLORS: Record<string, string> = {
    lead: '#94a3b8', qualified: '#3b82f6', proposal: '#8b5cf6',
    negotiation: '#f59e0b', won: '#22c55e', lost: '#ef4444',
};

// ─── Stat Card HTML ──────────────────────────────────────────────
export interface StatCardOpts {
    label: string;
    value: string | number;
    icon: string;
    color?: string;
    href?: string;
    trend?: string;         // e.g. "+12%" or "−3%"
    trendUp?: boolean;      // green if up, red if down
    subtext?: string;       // small text below value
}

export function renderStatCard(opts: StatCardOpts): string {
    const color = opts.color ?? '#6366f1';
    const trendHtml = opts.trend
        ? `<div style="font-size:11px;font-weight:700;color:${opts.trendUp ? '#22c55e' : '#ef4444'};margin-top:4px;">${opts.trendUp ? '▲' : '▼'} ${opts.trend}</div>`
        : '';
    const subtextHtml = opts.subtext
        ? `<div style="font-size:11px;color:var(--gao-text-muted,#64748b);margin-top:2px;">${opts.subtext}</div>`
        : '';
    const wrapper = opts.href ? `a href="${opts.href}" style="text-decoration:none;color:inherit;"` : 'div';
    const endWrapper = opts.href ? 'a' : 'div';

    return `<${wrapper}>
        <div style="background:var(--gao-surface, rgba(255,255,255,0.03));border:1px solid var(--gao-border-light, rgba(255,255,255,0.06));border-radius:16px;padding:20px;transition:all 0.2s;cursor:${opts.href ? 'pointer' : 'default'};" 
             onmouseover="this.style.borderColor='${color}40';this.style.transform='translateY(-2px)';this.style.boxShadow='0 8px 25px ${color}15'"
             onmouseout="this.style.borderColor='';this.style.transform='';this.style.boxShadow=''"> 
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
                <div style="width:40px;height:40px;border-radius:12px;background:${color}18;display:flex;align-items:center;justify-content:center;font-size:18px;">${opts.icon}</div>
                <div style="font-size:12px;color:var(--gao-text-muted,#64748b);font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">${opts.label}</div>
            </div>
            <div style="font-size:28px;font-weight:800;color:var(--gao-text, #e2e8f0);letter-spacing:-0.5px;">${opts.value}</div>
            ${trendHtml}
            ${subtextHtml}
        </div>
    </${endWrapper}>`;
}

// ─── Pipeline Mini Bar ───────────────────────────────────────────
export function renderPipelineBar(stages: Array<{ name: string; slug: string; color: string; count: number; value: number }>): string {
    const totalDeals = stages.reduce((s, st) => s + st.count, 0);
    if (totalDeals === 0) return '<div style="color:var(--gao-text-muted,#64748b);text-align:center;padding:20px;">No active deals in pipeline</div>';

    const barsHtml = stages.map(st => {
        const pct = Math.max(st.count / totalDeals * 100, 8); // min 8% width for visibility
        return `<div style="flex:${pct};min-width:60px;text-align:center;cursor:pointer;" title="${st.name}: ${st.count} deals — ${formatCurrency(st.value)}">
            <div style="height:8px;border-radius:4px;background:${st.color};margin-bottom:6px;transition:all 0.2s;" onmouseover="this.style.transform='scaleY(1.5)'" onmouseout="this.style.transform=''"></div>
            <div style="font-size:11px;color:var(--gao-text, #e2e8f0);font-weight:600;">${st.name}</div>
            <div style="font-size:10px;color:var(--gao-text-muted,#64748b);">${st.count} deals</div>
        </div>`;
    }).join('');

    return `<div style="display:flex;gap:4px;align-items:flex-start;">${barsHtml}</div>`;
}

// ─── Activity Feed Item ──────────────────────────────────────────
export interface ActivityItemOpts {
    id: string;
    type: string;
    subject: string;
    created_at: string;
    is_completed: boolean;
    contact_id?: string | null;
    contact_name?: string;
    deal_id?: string | null;
    deal_title?: string;
    showToggle?: boolean;
}

export function renderActivityItem(opts: ActivityItemOpts): string {
    const icon = TYPE_ICONS[opts.type] ?? '📋';
    const color = TYPE_COLORS[opts.type] ?? '#94a3b8';
    const contactLink = opts.contact_id && opts.contact_name
        ? `<a href="/crm/contacts/${opts.contact_id}" style="color:#818cf8;text-decoration:none;font-size:12px;">${escapeHtml(opts.contact_name)}</a>`
        : '';
    const dealLink = opts.deal_id && opts.deal_title
        ? `<a href="/deals/${opts.deal_id}" style="color:#818cf8;text-decoration:none;font-size:12px;">📎 ${escapeHtml(opts.deal_title)}</a>`
        : '';
    const toggleBtn = opts.showToggle
        ? `<button onclick="fetch('/api/activities/${opts.id}',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({is_completed:${!opts.is_completed}})}).then(()=>window.location.reload())"
            style="padding:3px 10px;border-radius:6px;border:none;font-size:10px;font-weight:700;cursor:pointer;${opts.is_completed ? 'background:rgba(34,197,94,0.15);color:#22c55e;' : 'background:rgba(245,158,11,0.15);color:#f59e0b;'}">
            ${opts.is_completed ? '✓' : '○'}
           </button>`
        : '';

    return `<div style="display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:10px;transition:all 0.15s;${opts.is_completed ? 'opacity:0.55;' : ''}" 
                 onmouseover="this.style.background='var(--gao-gray-50, rgba(255,255,255,0.03))'" onmouseout="this.style.background=''">
        <div style="width:32px;height:32px;border-radius:8px;background:${color}18;display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0;">${icon}</div>
        <div style="flex:1;min-width:0;">
            <div style="font-size:13px;font-weight:600;color:var(--gao-text, #e2e8f0);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;${opts.is_completed ? 'text-decoration:line-through;' : ''}">${escapeHtml(opts.subject)}</div>
            <div style="display:flex;gap:8px;align-items:center;margin-top:2px;">${contactLink}${contactLink && dealLink ? '<span style="color:var(--gao-text-muted, #334155);">•</span>' : ''}${dealLink}</div>
        </div>
        ${toggleBtn}
        <div style="font-size:11px;color:var(--gao-text-muted,#64748b);white-space:nowrap;">${timeAgo(opts.created_at)}</div>
    </div>`;
}

// ─── Quick Add Dropdown ──────────────────────────────────────────
export function renderQuickAddDropdown(): string {
    return `
    <div style="position:relative;display:inline-block;" id="quickAddWrapper">
        <button onclick="document.getElementById('quickAddMenu').style.display=document.getElementById('quickAddMenu').style.display==='block'?'none':'block'"
            style="${btnPrimary}display:flex;align-items:center;gap:8px;">
            <span style="font-size:16px;">+</span> Quick Add <span style="font-size:10px;">▼</span>
        </button>
        <div id="quickAddMenu" class="gao-crm-dropdown-menu" style="display:none;position:absolute;right:0;top:calc(100% + 6px);background:var(--gao-surface, #fff);border:1px solid var(--gao-border, #e2e8f0);border-radius:12px;min-width:220px;box-shadow:var(--gao-shadow-xl, 0 12px 40px rgba(0,0,0,0.15));z-index:100;padding:6px;">
            <a href="${url('/crm/contacts/create')}" class="gao-crm-dropdown-item" style="display:flex;align-items:center;gap:10px;padding:10px 14px;color:var(--gao-text, #1e293b);text-decoration:none;border-radius:8px;font-size:13px;font-weight:600;transition:background 0.15s;" onmouseover="this.style.background='var(--gao-primary-bg, rgba(99,102,241,0.08))'" onmouseout="this.style.background=''">
                <span style="font-size:16px;">👤</span> New Contact
            </a>
            <a href="${url('/crm/companies/create')}" class="gao-crm-dropdown-item" style="display:flex;align-items:center;gap:10px;padding:10px 14px;color:var(--gao-text, #1e293b);text-decoration:none;border-radius:8px;font-size:13px;font-weight:600;transition:background 0.15s;" onmouseover="this.style.background='var(--gao-primary-bg, rgba(99,102,241,0.08))'" onmouseout="this.style.background=''">
                <span style="font-size:16px;">🏢</span> New Company
            </a>
            <a href="${url('/deals/create')}" class="gao-crm-dropdown-item" style="display:flex;align-items:center;gap:10px;padding:10px 14px;color:var(--gao-text, #1e293b);text-decoration:none;border-radius:8px;font-size:13px;font-weight:600;transition:background 0.15s;" onmouseover="this.style.background='var(--gao-primary-bg, rgba(99,102,241,0.08))'" onmouseout="this.style.background=''">
                <span style="font-size:16px;">💰</span> New Deal
            </a>
            <a href="${url('/activities/create')}" class="gao-crm-dropdown-item" style="display:flex;align-items:center;gap:10px;padding:10px 14px;color:var(--gao-text, #1e293b);text-decoration:none;border-radius:8px;font-size:13px;font-weight:600;transition:background 0.15s;" onmouseover="this.style.background='var(--gao-primary-bg, rgba(99,102,241,0.08))'" onmouseout="this.style.background=''">
                <span style="font-size:16px;">📋</span> Log Activity
            </a>
        </div>
    </div>
    <script>document.addEventListener('click',function(e){var w=document.getElementById('quickAddWrapper');if(w&&!w.contains(e.target))document.getElementById('quickAddMenu').style.display='none';});</script>`;
}

// ─── Section Header (page title bar) ─────────────────────────────
export function renderSectionHeader(title: string, rightHtml = ''): string {
    return `<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;flex-wrap:wrap;gap:12px;">
        <h1 style="font-size:24px;font-weight:800;color:var(--gao-text, #e2e8f0);margin:0;">${title}</h1>
        <div style="display:flex;align-items:center;gap:10px;">${rightHtml}</div>
    </div>`;
}

// ─── Tab Switcher ────────────────────────────────────────────────
export function renderTabSwitcher(tabs: Array<{ label: string; icon: string; href: string; active: boolean; count?: number }>): string {
    return `<div style="display:flex;gap:4px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:4px;margin-bottom:20px;">
        ${tabs.map(t => `
            <a href="${t.href}" style="padding:10px 20px;border-radius:9px;font-size:13px;font-weight:700;text-decoration:none;display:flex;align-items:center;gap:8px;transition:all 0.2s;
                ${t.active
            ? 'background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;box-shadow:0 4px 15px rgba(99,102,241,0.3);'
            : 'color:var(--gao-text-muted,#64748b);'}"
                ${!t.active ? 'onmouseover="this.style.color=\'#e2e8f0\';this.style.background=\'rgba(255,255,255,0.05)\'" onmouseout="this.style.color=\'var(--gao-text-muted,#64748b)\';this.style.background=\'\'"' : ''}>
                <span>${t.icon}</span> ${t.label}${t.count !== undefined ? ` <span style="font-size:11px;opacity:0.8;">(${t.count})</span>` : ''}
            </a>
        `).join('')}
    </div>`;
}

// ─── Revenue Chart (CSS bar chart) ───────────────────────────────
export function renderRevenueChart(months: Array<{ month: string; revenue: number }>): string {
    if (!months.length) return '<div style="color:var(--gao-text-muted,#64748b);text-align:center;padding:20px;">No revenue data</div>';

    const maxRevenue = Math.max(...months.map(m => m.revenue), 1);

    const barsHtml = months.map(m => {
        const heightPct = Math.max((m.revenue / maxRevenue) * 100, 4);
        return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:6px;">
            <div style="font-size:11px;color:var(--gao-text, #e2e8f0);font-weight:600;">${formatCurrency(m.revenue)}</div>
            <div style="width:100%;max-width:36px;height:120px;display:flex;align-items:flex-end;justify-content:center;">
                <div style="width:100%;height:${heightPct}%;background:linear-gradient(180deg,#6366f1,#8b5cf6);border-radius:6px 6px 2px 2px;transition:all 0.3s;"
                     onmouseover="this.style.background='linear-gradient(180deg,#818cf8,#a78bfa)'" 
                     onmouseout="this.style.background='linear-gradient(180deg,#6366f1,#8b5cf6)'"></div>
            </div>
            <div style="font-size:11px;color:var(--gao-text-muted,#64748b);font-weight:600;">${m.month}</div>
        </div>`;
    }).join('');

    return `<div style="display:flex;gap:6px;align-items:flex-end;padding:8px 0;">${barsHtml}</div>`;
}

// ─── Contact Avatar Initials ─────────────────────────────────────
export function renderAvatar(firstName: string, lastName: string, size = 36): string {
    const initials = `${(firstName?.[0] ?? '').toUpperCase()}${(lastName?.[0] ?? '').toUpperCase()}`;
    return `<div style="width:${size}px;height:${size}px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#8b5cf6);display:flex;align-items:center;justify-content:center;color:#fff;font-size:${Math.floor(size * 0.36)}px;font-weight:700;flex-shrink:0;">${initials}</div>`;
}

// ─── Badge ───────────────────────────────────────────────────────
export function renderBadge(text: string, color: string): string {
    return `<span style="padding:4px 10px;border-radius:12px;font-size:11px;font-weight:700;color:#fff;background:${color}">${escapeHtml(text)}</span>`;
}

// ─── Win Rate Ring ───────────────────────────────────────────────
export function renderWinRateRing(winRate: number, won: number, lost: number): string {
    const circumference = 2 * Math.PI * 38;
    const offset = circumference - (winRate / 100) * circumference;
    return `<div style="display:flex;align-items:center;gap:24px;">
        <div style="position:relative;width:90px;height:90px;">
            <svg width="90" height="90" style="transform:rotate(-90deg)">
                <circle cx="45" cy="45" r="38" stroke="rgba(239,68,68,0.2)" stroke-width="6" fill="none"/>
                <circle cx="45" cy="45" r="38" stroke="#22c55e" stroke-width="6" fill="none"
                    stroke-dasharray="${circumference}" stroke-dashoffset="${offset}" stroke-linecap="round"
                    style="transition:stroke-dashoffset 0.8s ease;"/>
            </svg>
            <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:800;color:var(--gao-text, #e2e8f0);">${winRate}%</div>
        </div>
        <div>
            <div style="font-size:13px;font-weight:700;color:#22c55e;margin-bottom:4px;">🏆 Won: ${won}</div>
            <div style="font-size:13px;font-weight:700;color:#ef4444;">❌ Lost: ${lost}</div>
        </div>
    </div>`;
}

// ─── CRM Global Styles (micro-animations & polish) ───────────────
export function renderCrmStyles(): string {
    return `<style>
    @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(12px); }
        to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeIn {
        from { opacity: 0; }
        to   { opacity: 1; }
    }
    @keyframes slideInRight {
        from { opacity: 0; transform: translateX(16px); }
        to   { opacity: 1; transform: translateX(0); }
    }
    @keyframes pulseGlow {
        0%, 100% { box-shadow: 0 0 0 0 rgba(99,102,241,0.2); }
        50%      { box-shadow: 0 0 0 6px rgba(99,102,241,0); }
    }
    /* Smooth table row hover */
    .crm-table tr { transition: background 0.15s ease; }
    .crm-table tr:hover { background: rgba(255,255,255,0.03); }
    /* Kanban card entrance */
    [draggable="true"] { animation: fadeInUp 0.25s ease-out; }
    /* Stat card entrance (staggered) */
    .crm-stat:nth-child(1) { animation: fadeInUp 0.3s ease-out 0.0s both; }
    .crm-stat:nth-child(2) { animation: fadeInUp 0.3s ease-out 0.06s both; }
    .crm-stat:nth-child(3) { animation: fadeInUp 0.3s ease-out 0.12s both; }
    .crm-stat:nth-child(4) { animation: fadeInUp 0.3s ease-out 0.18s both; }
    .crm-stat:nth-child(5) { animation: fadeInUp 0.3s ease-out 0.24s both; }
    /* Toast notification */
    .crm-toast-enter { animation: slideInRight 0.3s ease-out; }
    /* Focus glow for inline forms */
    input:focus, select:focus, textarea:focus {
        border-color: rgba(99,102,241,0.5) !important;
        box-shadow: 0 0 0 3px rgba(99,102,241,0.12) !important;
        transition: all 0.2s ease;
    }
    /* Smooth scrollbar */
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: rgba(100,116,139,0.3); border-radius: 3px; }
    ::-webkit-scrollbar-thumb:hover { background: rgba(100,116,139,0.5); }
    </style>`;
}

