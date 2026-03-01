import { Controller, Get, Post, Patch } from '@gao/http';
import type { GaoRequest, GaoResponse } from '@gao/http';
import { ApprovalService } from '../../services/approval.service.js';

const service = new ApprovalService();

@Controller('/api/approvals')
export class ApprovalApiController {
    @Get('/chains') async chains(req: GaoRequest, res: GaoResponse) { const et = req.query.entity_type as string | undefined; return res.json({ data: (await service.listChains(et ?? undefined)).map((c) => c.toJSON()) }); }
    @Post('/chains') async createChain(req: GaoRequest, res: GaoResponse) { const b = req.body as any; if (!b.name || !b.entity_type) return res.error(422, 'VALIDATION', 'name and entity_type required'); return res.status(201).json({ data: (await service.createChain(b)).toJSON() }); }
    @Post('/') async request(req: GaoRequest, res: GaoResponse) { const userId = (req as any).user?.id as string; if (!userId) return res.error(401, 'UNAUTHORIZED', 'Auth required'); const b = req.body as any; if (!b.chain_id || !b.entity_type || !b.entity_id) return res.error(422, 'VALIDATION', 'chain_id, entity_type, entity_id required'); return res.status(201).json({ data: (await service.requestApproval({ ...b, requested_by: userId })).toJSON() }); }
    @Get('/pending') async pending(req: GaoRequest, res: GaoResponse) { const userId = (req as any).user?.id as string; if (!userId) return res.error(401, 'UNAUTHORIZED', 'Auth required'); return res.json({ data: (await service.getPending(userId)).map((r) => r.toJSON()) }); }
    @Patch('/:id/approve') async approve(req: GaoRequest, res: GaoResponse) { const userId = (req as any).user?.id as string; if (!userId) return res.error(401, 'UNAUTHORIZED', 'Auth required'); const r = await service.approve(req.params.id, userId); if (!r) return res.error(404, 'NOT_FOUND', 'Request not found'); return res.json({ data: r.toJSON() }); }
    @Patch('/:id/reject') async reject(req: GaoRequest, res: GaoResponse) { const userId = (req as any).user?.id as string; if (!userId) return res.error(401, 'UNAUTHORIZED', 'Auth required'); const b = req.body as { reason?: string }; const r = await service.reject(req.params.id, userId, b.reason); if (!r) return res.error(404, 'NOT_FOUND', 'Request not found'); return res.json({ data: r.toJSON() }); }
}
