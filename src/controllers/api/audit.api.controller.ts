import { Controller, Get } from '@gao/http';
import type { GaoRequest, GaoResponse } from '@gao/http';
import { AuditTrailService } from '../../services/audit-trail.service.js';
import type { AuditAction } from '../../models/audit-log.model.js';

const service = new AuditTrailService();

@Controller('/api/audit')
export class AuditApiController {
    @Get('/')
    async recent(_req: GaoRequest, res: GaoResponse) {
        const logs = await service.getRecent(100);
        return res.json({ data: logs.map((l) => l.toJSON()) });
    }

    @Get('/search')
    async search(req: GaoRequest, res: GaoResponse) {
        const logs = await service.search({
            action: req.query.action as AuditAction | undefined,
            entity_type: req.query.entity_type as string | undefined,
            user_id: req.query.user_id as string | undefined,
            from: req.query.from as string | undefined,
            to: req.query.to as string | undefined,
        });
        return res.json({ data: logs.map((l) => l.toJSON()) });
    }

    @Get('/entity/:entityType/:entityId')
    async entityHistory(req: GaoRequest, res: GaoResponse) {
        const logs = await service.getByEntity(req.params.entityType, req.params.entityId);
        return res.json({ data: logs.map((l) => l.toJSON()) });
    }

    @Get('/user/:userId')
    async userActivity(req: GaoRequest, res: GaoResponse) {
        const limit = parseInt(req.query.limit as string) || 50;
        const logs = await service.getByUser(req.params.userId, limit);
        return res.json({ data: logs.map((l) => l.toJSON()) });
    }
}
