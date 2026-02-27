/**
 * GAO CRM — Shared Admin Template Renderer
 */
export interface RenderPageOptions {
    title: string;
    content: string;
    activePath: string;
    user?: {
        name: string;
        role: string;
        avatar_url?: string;
    };
    notifications?: number;
}
export declare function renderPage(options: RenderPageOptions): string;
//# sourceMappingURL=renderer.d.ts.map