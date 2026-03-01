/**
 * GAO CRM — Activity Controller (REDIRECT + CREATE FORM)
 *
 * Activity list is now integrated into CRM Overview.
 * This controller redirects list but keeps the create form.
 */
import type { GaoRequest, GaoResponse } from '@gao/http';
export declare class ActivityController {
    list(_req: GaoRequest, res: GaoResponse): Promise<Response>;
    create(req: GaoRequest, res: GaoResponse): Promise<Response>;
}
//# sourceMappingURL=activity.controller.d.ts.map