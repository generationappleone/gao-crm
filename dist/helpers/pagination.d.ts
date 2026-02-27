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
export declare function parsePagination(query: Record<string, string>): PaginationParams;
export declare function buildPaginationMeta(total: number, params: PaginationParams): PaginationMeta;
export declare function paginationOffset(params: PaginationParams): number;
export declare function renderPaginationHtml(meta: PaginationMeta, baseUrl: string): string;
//# sourceMappingURL=pagination.d.ts.map