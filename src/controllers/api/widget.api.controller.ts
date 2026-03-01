import { Controller, Get, Post, Put, Patch, Delete } from '@gao/http';
import type { GaoRequest, GaoResponse } from '@gao/http';
import { DashboardWidgetService } from '../../services/dashboard-widget.service.js';

const service = new DashboardWidgetService();

@Controller('/api/widgets')
export class WidgetApiController {
    @Get('/')
    async list(req: GaoRequest, res: GaoResponse) {
        const userId = (req as any).user?.id as string;
        if (!userId) return res.error(401, 'UNAUTHORIZED', 'Authentication required');
        const widgets = await service.listByUser(userId);
        return res.json({ data: widgets.map((w) => w.toJSON()) });
    }

    @Post('/')
    async create(req: GaoRequest, res: GaoResponse) {
        const userId = (req as any).user?.id as string;
        if (!userId) return res.error(401, 'UNAUTHORIZED', 'Authentication required');
        const body = req.body as Record<string, unknown>;
        if (!body.title || !body.widget_type || !body.data_source) {
            return res.error(422, 'VALIDATION', 'title, widget_type, data_source are required');
        }
        const widget = await service.create({ ...body as any, user_id: userId });
        return res.status(201).json({ data: widget.toJSON() });
    }

    @Put('/:id')
    async update(req: GaoRequest, res: GaoResponse) {
        const body = req.body as Record<string, unknown>;
        const widget = await service.update(req.params.id, body as any);
        if (!widget) return res.error(404, 'NOT_FOUND', 'Widget not found');
        return res.json({ data: widget.toJSON() });
    }

    @Patch('/reorder')
    async reorder(req: GaoRequest, res: GaoResponse) {
        const userId = (req as any).user?.id as string;
        if (!userId) return res.error(401, 'UNAUTHORIZED', 'Authentication required');
        const body = req.body as { widget_ids?: string[] };
        if (!Array.isArray(body.widget_ids)) return res.error(422, 'VALIDATION', 'widget_ids array required');
        await service.reorder(userId, body.widget_ids);
        return res.json({ data: { reordered: true } });
    }

    @Delete('/:id')
    async destroy(req: GaoRequest, res: GaoResponse) {
        const deleted = await service.delete(req.params.id);
        if (!deleted) return res.error(404, 'NOT_FOUND', 'Widget not found');
        return res.empty();
    }
}
