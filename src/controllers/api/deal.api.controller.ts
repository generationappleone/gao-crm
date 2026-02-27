import { Controller, Get, Post, Put, Patch, Delete } from '@gao/http';
import type { GaoRequest, GaoResponse } from '@gao/http';
import { DealService } from '../../services/deal.service.js';
import { parsePagination } from '../../helpers/pagination.js';

const dealService = new DealService();

@Controller('/api/deals')
export class DealApiController {
    @Get('/')
    async list(req: GaoRequest, res: GaoResponse) {
        const pagination = parsePagination(req.query);
        const result = await dealService.list(pagination, req.query.stage_id, req.query.owner_id);
        return res.json(result.deals, result.meta);
    }

    @Get('/stages')
    async stages(_req: GaoRequest, res: GaoResponse) {
        const stages = await dealService.getStages();
        return res.json(stages);
    }

    @Get('/:id')
    async show(req: GaoRequest, res: GaoResponse) {
        const deal = await dealService.findById(req.params.id);
        if (!deal) return res.error(404, 'NOT_FOUND', 'Deal not found');
        return res.json(deal.toJSON());
    }

    @Post('/')
    async create(req: GaoRequest, res: GaoResponse) {
        const body = req.body as Record<string, unknown>;
        if (!body.title || !body.contact_id || !body.stage_id || !body.owner_id) {
            return res.error(422, 'VALIDATION', 'title, contact_id, stage_id, and owner_id are required');
        }
        const deal = await dealService.create(body);
        return res.status(201).json(deal.toJSON());
    }

    @Put('/:id')
    async update(req: GaoRequest, res: GaoResponse) {
        const deal = await dealService.update(req.params.id, req.body as Record<string, unknown>);
        if (!deal) return res.error(404, 'NOT_FOUND', 'Deal not found');
        return res.json(deal.toJSON());
    }

    @Patch('/:id/stage')
    async moveStage(req: GaoRequest, res: GaoResponse) {
        const { stage_id } = req.body as { stage_id?: string };
        if (!stage_id) return res.error(422, 'VALIDATION', 'stage_id is required');
        const deal = await dealService.moveToStage(req.params.id, stage_id);
        if (!deal) return res.error(404, 'NOT_FOUND', 'Deal or stage not found');
        return res.json(deal.toJSON());
    }

    @Delete('/:id')
    async destroy(req: GaoRequest, res: GaoResponse) {
        const deleted = await dealService.delete(req.params.id);
        if (!deleted) return res.error(404, 'NOT_FOUND', 'Deal not found');
        return res.empty();
    }
}
