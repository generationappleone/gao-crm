import { Controller, Get, Post, Put, Patch, Delete } from '@gao/http';
import type { GaoRequest, GaoResponse } from '@gao/http';
import { PipelineService } from '../../services/pipeline.service.js';

const service = new PipelineService();

@Controller('/api/pipelines')
export class PipelineApiController {
    /**
     * GET /api/pipelines — List all pipelines
     */
    @Get('/')
    async list(_req: GaoRequest, res: GaoResponse) {
        const pipelines = await service.list();
        return res.json({ data: pipelines.map((p) => p.toJSON()) });
    }

    /**
     * POST /api/pipelines — Create a pipeline
     */
    @Post('/')
    async create(req: GaoRequest, res: GaoResponse) {
        const body = req.body as Record<string, unknown>;
        if (!body.name || typeof body.name !== 'string') {
            return res.error(422, 'VALIDATION', 'name is required');
        }

        const pipeline = await service.create({
            name: body.name,
            description: body.description as string | undefined,
            is_default: body.is_default as boolean | undefined,
            display_order: body.display_order as number | undefined,
        });

        return res.status(201).json({ data: pipeline.toJSON() });
    }

    /**
     * PUT /api/pipelines/:id — Update a pipeline
     */
    @Put('/:id')
    async update(req: GaoRequest, res: GaoResponse) {
        const body = req.body as Record<string, unknown>;
        const pipeline = await service.update(req.params.id, {
            name: body.name as string | undefined,
            description: body.description as string | undefined,
            is_default: body.is_default as boolean | undefined,
            display_order: body.display_order as number | undefined,
        });

        if (!pipeline) return res.error(404, 'NOT_FOUND', 'Pipeline not found');
        return res.json({ data: pipeline.toJSON() });
    }

    /**
     * DELETE /api/pipelines/:id — Delete a pipeline
     */
    @Delete('/:id')
    async destroy(req: GaoRequest, res: GaoResponse) {
        const deleted = await service.delete(req.params.id);
        if (!deleted) return res.error(400, 'DELETE_FAILED', 'Cannot delete this pipeline (may be the default pipeline)');
        return res.empty();
    }

    /**
     * GET /api/pipelines/:id/board — Get Kanban board data
     */
    @Get('/:id/board')
    async board(req: GaoRequest, res: GaoResponse) {
        const board = await service.getBoard(req.params.id);
        if (!board) return res.error(404, 'NOT_FOUND', 'Pipeline not found');

        return res.json({
            data: {
                pipeline: board.pipeline.toJSON(),
                stages: board.stages.map((s) => ({
                    ...s.stage.toJSON(),
                    deals: s.deals.map((d) => d.toJSON()),
                })),
            },
        });
    }

    /**
     * PATCH /api/deals/:dealId/move — Move deal to new stage/position
     */
    @Patch('/deals/:dealId/move')
    async moveDeal(req: GaoRequest, res: GaoResponse) {
        const body = req.body as { stage_id?: string; position?: number };
        if (!body.stage_id) {
            return res.error(422, 'VALIDATION', 'stage_id is required');
        }

        const deal = await service.moveDeal(
            req.params.dealId,
            body.stage_id,
            body.position ?? 0
        );

        if (!deal) return res.error(404, 'NOT_FOUND', 'Deal not found');
        return res.json({ data: deal.toJSON() });
    }
}
