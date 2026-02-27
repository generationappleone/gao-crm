import { Controller, Get, Post, Put, Patch, Delete } from '@gao/http';
import type { GaoRequest, GaoResponse } from '@gao/http';
import { ActivityService } from '../../services/activity.service.js';
import { parsePagination } from '../../helpers/pagination.js';

const activityService = new ActivityService();

@Controller('/api/activities')
export class ActivityApiController {
    @Get('/')
    async list(req: GaoRequest, res: GaoResponse) {
        const pagination = parsePagination(req.query);
        const result = await activityService.list(pagination, req.query.type, req.query.contact_id, req.query.deal_id);
        return res.json(result.activities, result.meta);
    }

    @Get('/:id')
    async show(req: GaoRequest, res: GaoResponse) {
        const activity = await activityService.findById(req.params.id);
        if (!activity) return res.error(404, 'NOT_FOUND', 'Activity not found');
        return res.json(activity.toJSON());
    }

    @Post('/')
    async create(req: GaoRequest, res: GaoResponse) {
        const body = req.body as Record<string, unknown>;
        if (!body.type || !body.subject || !body.owner_id) {
            return res.error(422, 'VALIDATION', 'type, subject, and owner_id are required');
        }
        const activity = await activityService.create(body);
        return res.status(201).json(activity.toJSON());
    }

    @Put('/:id')
    async update(req: GaoRequest, res: GaoResponse) {
        const activity = await activityService.update(req.params.id, req.body as Record<string, unknown>);
        if (!activity) return res.error(404, 'NOT_FOUND', 'Activity not found');
        return res.json(activity.toJSON());
    }

    @Patch('/:id/complete')
    async complete(req: GaoRequest, res: GaoResponse) {
        const activity = await activityService.markComplete(req.params.id);
        if (!activity) return res.error(404, 'NOT_FOUND', 'Activity not found');
        return res.json(activity.toJSON());
    }

    @Delete('/:id')
    async destroy(req: GaoRequest, res: GaoResponse) {
        const deleted = await activityService.delete(req.params.id);
        if (!deleted) return res.error(404, 'NOT_FOUND', 'Activity not found');
        return res.empty();
    }
}
