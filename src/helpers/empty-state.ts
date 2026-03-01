/**
 * GAO CRM — Reusable Empty State Component
 */

export interface EmptyStateOptions {
    icon: string;
    title: string;
    description: string;
    action?: {
        label: string;
        href: string;
    };
}

/**
 * Generates a beautiful empty state HTML block.
 */
export function emptyState(opts: EmptyStateOptions): string {
    const ICON_MAP: Record<string, string> = {
        users: '👥', contacts: '👥', companies: '🏢', deals: '💰',
        pipelines: '📊', activities: '📋', projects: '📁',
        announcements: '📢', reports: '📈', forms: '📝',
        products: '📦', quotations: '📄', invoices: '💳',
        tickets: '🎫', campaigns: '📣', email: '✉️',
        messenger: '💬', kb: '📚', tracking: '🌐',
        plugins: '🧩', audit: '🛡️', calendar: '📅',
        notifications: '🔔', search: '🔍', default: '📭',
    };

    const emoji = ICON_MAP[opts.icon] ?? ICON_MAP['default'];

    return `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 20px;text-align:center;">
        <div style="width:80px;height:80px;border-radius:24px;background:linear-gradient(135deg,rgba(99,102,241,0.12),rgba(139,92,246,0.08));border:1px solid rgba(99,102,241,0.15);display:flex;align-items:center;justify-content:center;font-size:36px;margin-bottom:20px;">${emoji}</div>
        <h3 style="font-size:18px;font-weight:700;color:var(--gao-text, #e2e8f0);margin-bottom:8px;">${opts.title}</h3>
        <p style="font-size:14px;color:var(--gao-text-muted,#64748b);max-width:360px;line-height:1.6;margin-bottom:${opts.action ? '20px' : '0'};">${opts.description}</p>
        ${opts.action ? `
            <a href="${opts.action.href}" style="padding:10px 24px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border-radius:10px;text-decoration:none;font-size:14px;font-weight:700;transition:transform 0.15s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform=''">${opts.action.label}</a>
        ` : ''}
    </div>`;
}
