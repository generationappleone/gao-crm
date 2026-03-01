/**
 * GAO CRM — Company Controller (REDIRECT ONLY)
 *
 * Companies are now accessed via the CRM Contacts page (Companies tab).
 * Detail/edit pages redirect to /crm/companies/:id.
 * The Companies list redirects to /crm/contacts?tab=companies.
 */
import type { GaoRequest, GaoResponse } from '@gao/http';
export declare class CompanyController {
    list(_req: GaoRequest, res: GaoResponse): Promise<Response>;
    createForm(req: GaoRequest, res: GaoResponse): Promise<Response>;
    detail(req: GaoRequest, res: GaoResponse): Promise<Response>;
    editForm(req: GaoRequest, res: GaoResponse): Promise<Response>;
}
//# sourceMappingURL=company.controller.d.ts.map