import type { GaoRequest, GaoResponse } from '@gao/http';
export declare class ActivityApiController {
    list(req: GaoRequest, res: GaoResponse): Promise<Response>;
    show(req: GaoRequest, res: GaoResponse): Promise<Response>;
    create(req: GaoRequest, res: GaoResponse): Promise<Response>;
    update(req: GaoRequest, res: GaoResponse): Promise<Response>;
    complete(req: GaoRequest, res: GaoResponse): Promise<Response>;
    destroy(req: GaoRequest, res: GaoResponse): Promise<Response>;
}
//# sourceMappingURL=activity.api.controller.d.ts.map