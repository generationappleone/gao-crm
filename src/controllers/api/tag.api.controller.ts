import { Controller, Get, Post, Put, Delete } from '@gao/http';
import type { GaoRequest, GaoResponse } from '@gao/http';
import { TagService } from '../../services/tag.service.js';

const tagService = new TagService();

@Controller('/api/tags')
export class TagApiController {
    @Get('/')
    async list(_req: GaoRequest, res: GaoResponse) {
        const tags = await tagService.list();
        return res.json(tags);
    }

    @Post('/')
    async create(req: GaoRequest, res: GaoResponse) {
        const body = req.body as { name?: string; color?: string };
        if (!body.name) return res.error(422, 'VALIDATION', 'name is required');
        const tag = await tagService.create(body as { name: string; color?: string });
        return res.status(201).json(tag.toJSON());
    }

    @Put('/:id')
    async update(req: GaoRequest, res: GaoResponse) {
        const tag = await tagService.update(req.params.id, req.body as { name?: string; color?: string });
        if (!tag) return res.error(404, 'NOT_FOUND', 'Tag not found');
        return res.json(tag.toJSON());
    }

    @Delete('/:id')
    async destroy(req: GaoRequest, res: GaoResponse) {
        const deleted = await tagService.delete(req.params.id);
        if (!deleted) return res.error(404, 'NOT_FOUND', 'Tag not found');
        return res.empty();
    }
}
