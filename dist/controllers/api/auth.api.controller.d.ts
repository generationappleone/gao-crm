import type { GaoRequest, GaoResponse } from '@gao/http';
export declare class AuthApiController {
    login(req: GaoRequest, res: GaoResponse): Promise<Response>;
    logout(req: GaoRequest, res: GaoResponse): Promise<Response>;
    me(req: GaoRequest, res: GaoResponse): Promise<Response>;
}
//# sourceMappingURL=auth.api.controller.d.ts.map