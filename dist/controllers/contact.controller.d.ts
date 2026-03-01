/**
 * GAO CRM — Contact Controller (REDIRECT ONLY)
 *
 * All contact pages have been consolidated into the CRM Workspace.
 * This controller provides backward-compatible redirects from old URLs.
 */
import type { GaoRequest, GaoResponse } from '@gao/http';
export declare class ContactController {
    list(req: GaoRequest, res: GaoResponse): Promise<Response>;
    createForm(_req: GaoRequest, res: GaoResponse): Promise<Response>;
    detail(req: GaoRequest, res: GaoResponse): Promise<Response>;
    editForm(req: GaoRequest, res: GaoResponse): Promise<Response>;
}
//# sourceMappingURL=contact.controller.d.ts.map