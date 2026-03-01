import { Controller, Get, Post, Put, Patch, Delete } from '@gao/http';
import type { GaoRequest, GaoResponse } from '@gao/http';
import { KnowledgeBaseService } from '../../services/knowledge-base.service.js';

const service = new KnowledgeBaseService();

@Controller('/api/kb')
export class KnowledgeBaseApiController {
    @Get('/articles')
    async list(req: GaoRequest, res: GaoResponse) {
        const category = req.query.category as string | undefined;
        const status = req.query.status as any;
        const articles = status
            ? await service.listAll(status)
            : await service.listPublished(category);
        return res.json({ data: articles.map((a) => a.toJSON()) });
    }

    @Get('/categories')
    async categories(_req: GaoRequest, res: GaoResponse) {
        const cats = await service.getCategories();
        return res.json({ data: cats });
    }

    @Get('/articles/:id')
    async show(req: GaoRequest, res: GaoResponse) {
        const article = await service.findById(req.params.id);
        if (!article) return res.error(404, 'NOT_FOUND', 'Article not found');
        await service.recordView(req.params.id);
        return res.json({ data: article.toJSON() });
    }

    @Get('/articles/slug/:slug')
    async bySlug(req: GaoRequest, res: GaoResponse) {
        const article = await service.findBySlug(req.params.slug);
        if (!article) return res.error(404, 'NOT_FOUND', 'Article not found');
        await service.recordView(article.id);
        return res.json({ data: article.toJSON() });
    }

    @Post('/articles')
    async create(req: GaoRequest, res: GaoResponse) {
        const userId = (req as any).user?.id as string | undefined;
        if (!userId) return res.error(401, 'UNAUTHORIZED', 'Authentication required');

        const body = req.body as Record<string, unknown>;
        if (!body.title || !body.slug || !body.content) {
            return res.error(422, 'VALIDATION', 'title, slug, and content are required');
        }

        const article = await service.create({ ...body as any, author_id: userId });
        return res.status(201).json({ data: article.toJSON() });
    }

    @Put('/articles/:id')
    async update(req: GaoRequest, res: GaoResponse) {
        const body = req.body as Record<string, unknown>;
        const article = await service.update(req.params.id, body as any);
        if (!article) return res.error(404, 'NOT_FOUND', 'Article not found');
        return res.json({ data: article.toJSON() });
    }

    @Patch('/articles/:id/vote')
    async vote(req: GaoRequest, res: GaoResponse) {
        const body = req.body as { helpful?: boolean };
        if (body.helpful === undefined) return res.error(422, 'VALIDATION', 'helpful is required');
        await service.vote(req.params.id, body.helpful);
        return res.json({ data: { voted: true } });
    }

    @Delete('/articles/:id')
    async destroy(req: GaoRequest, res: GaoResponse) {
        const deleted = await service.delete(req.params.id);
        if (!deleted) return res.error(404, 'NOT_FOUND', 'Article not found');
        return res.empty();
    }
}
