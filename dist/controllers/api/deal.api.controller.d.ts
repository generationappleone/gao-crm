import type { GaoRequest, GaoResponse } from '@gao/http';
export declare class DealApiController {
    list(req: GaoRequest, res: GaoResponse): Promise<Response>;
    stages(_req: GaoRequest, res: GaoResponse): Promise<Response>;
    show(req: GaoRequest, res: GaoResponse): Promise<Response>;
    create(req: GaoRequest, res: GaoResponse): Promise<Response>;
    update(req: GaoRequest, res: GaoResponse): Promise<Response>;
    moveStage(req: GaoRequest, res: GaoResponse): Promise<Response>;
    destroy(req: GaoRequest, res: GaoResponse): Promise<Response>;
}
//# sourceMappingURL=deal.api.controller.d.ts.map