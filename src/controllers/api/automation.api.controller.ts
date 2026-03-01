import { Controller, Get, Post, Put, Patch, Delete } from '@gao/http';
import type { GaoRequest, GaoResponse } from '@gao/http';
import { AutomationService } from '../../services/automation.service.js';
import type { AutomationTrigger, AutomationStatus } from '../../models/automation.model.js';

const service = new AutomationService();

@Controller('/api/automations')
export class AutomationApiController {
    @Get('/')
    async list(req: GaoRequest, res: GaoResponse) {
        const ownerId = (req as any).user?.id as string | undefined;
        const status = req.query.status as AutomationStatus | undefined;
        const automations = await service.list(ownerId ?? undefined, status);
        return res.json({ data: automations.map((a) => a.toJSON()) });
    }

    @Get('/:id')
    async show(req: GaoRequest, res: GaoResponse) {
        const result = await service.findById(req.params.id);
        if (!result) return res.error(404, 'NOT_FOUND', 'Automation not found');
        return res.json({
            data: {
                ...result.automation.toJSON(),
                steps: result.steps.map((s) => s.toJSON()),
            },
        });
    }

    @Post('/')
    async create(req: GaoRequest, res: GaoResponse) {
        const ownerId = (req as any).user?.id as string | undefined;
        if (!ownerId) return res.error(401, 'UNAUTHORIZED', 'Authentication required');

        const body = req.body as Record<string, unknown>;
        if (!body.name || typeof body.name !== 'string') return res.error(422, 'VALIDATION', 'name is required');
        if (!body.trigger_type || typeof body.trigger_type !== 'string') return res.error(422, 'VALIDATION', 'trigger_type is required');

        const automation = await service.create({
            name: body.name,
            description: body.description as string | undefined,
            owner_id: ownerId,
            trigger_type: body.trigger_type as AutomationTrigger,
            trigger_config: body.trigger_config as Record<string, unknown> | undefined,
        });
        return res.status(201).json({ data: automation.toJSON() });
    }

    @Put('/:id')
    async update(req: GaoRequest, res: GaoResponse) {
        const body = req.body as Record<string, unknown>;
        const automation = await service.update(req.params.id, body as any);
        if (!automation) return res.error(404, 'NOT_FOUND', 'Automation not found');
        return res.json({ data: automation.toJSON() });
    }

    @Put('/:id/steps')
    async setSteps(req: GaoRequest, res: GaoResponse) {
        const body = req.body as { steps?: unknown[] };
        if (!Array.isArray(body.steps)) return res.error(422, 'VALIDATION', 'steps array is required');

        const steps = await service.setSteps(req.params.id, body.steps as any);
        return res.json({ data: steps.map((s) => s.toJSON()) });
    }

    @Patch('/:id/activate')
    async activate(req: GaoRequest, res: GaoResponse) {
        const automation = await service.activate(req.params.id);
        if (!automation) return res.error(404, 'NOT_FOUND', 'Automation not found');
        return res.json({ data: automation.toJSON() });
    }

    @Patch('/:id/deactivate')
    async deactivate(req: GaoRequest, res: GaoResponse) {
        const automation = await service.deactivate(req.params.id);
        if (!automation) return res.error(404, 'NOT_FOUND', 'Automation not found');
        return res.json({ data: automation.toJSON() });
    }

    @Post('/:id/execute')
    async execute(req: GaoRequest, res: GaoResponse) {
        const body = req.body as { entity_type?: string; entity_id?: string };
        if (!body.entity_type || !body.entity_id) {
            return res.error(422, 'VALIDATION', 'entity_type and entity_id are required');
        }
        await service.execute(req.params.id, body.entity_type, body.entity_id);
        return res.json({ data: { executed: true } });
    }

    @Get('/:id/logs')
    async logs(req: GaoRequest, res: GaoResponse) {
        const limit = parseInt(req.query.limit as string) || 50;
        const logs = await service.getLogs(req.params.id, limit);
        return res.json({ data: logs.map((l) => l.toJSON()) });
    }

    @Delete('/:id')
    async destroy(req: GaoRequest, res: GaoResponse) {
        const deleted = await service.delete(req.params.id);
        if (!deleted) return res.error(404, 'NOT_FOUND', 'Automation not found');
        return res.empty();
    }
}
