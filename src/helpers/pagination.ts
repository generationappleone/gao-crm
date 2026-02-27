/**
 * GAO CRM — Pagination Helper
 */

export interface PaginationParams {
    page: number;
    perPage: number;
}

export interface PaginationMeta {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
}

export function parsePagination(query: Record<string, string>): PaginationParams {
    const page = Math.max(1, Number.parseInt(query.page ?? '1', 10) || 1);
    const perPage = Math.min(100, Math.max(1, Number.parseInt(query.per_page ?? '15', 10) || 15));
    return { page, perPage };
}

export function buildPaginationMeta(total: number, params: PaginationParams): PaginationMeta {
    return {
        page: params.page,
        per_page: params.perPage,
        total,
        total_pages: Math.ceil(total / params.perPage),
    };
}

export function paginationOffset(params: PaginationParams): number {
    return (params.page - 1) * params.perPage;
}

export function renderPaginationHtml(meta: PaginationMeta, baseUrl: string): string {
    if (meta.total_pages <= 1) return '';

    const pages: string[] = [];
    for (let i = 1; i <= meta.total_pages; i++) {
        const active = i === meta.page;
        const style = active
            ? 'background:var(--gao-primary,#6366f1);color:#fff;'
            : 'background:rgba(255,255,255,0.05);color:var(--gao-text-secondary,#94a3b8);';
        pages.push(
            `<a href="${baseUrl}?page=${i}" style="display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:8px;${style}font-size:13px;font-weight:600;text-decoration:none;">${i}</a>`
        );
    }

    return `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-top:24px;padding:0 4px;">
        <span style="font-size:13px;color:var(--gao-text-muted,#64748b);">
            Showing ${(meta.page - 1) * meta.per_page + 1} to ${Math.min(meta.page * meta.per_page, meta.total)} of ${meta.total} results
        </span>
        <div style="display:flex;gap:4px;">${pages.join('')}</div>
    </div>`;
}
