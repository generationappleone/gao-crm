import { Controller, Get, Post, Patch } from '@gao/http';
import type { GaoRequest, GaoResponse } from '@gao/http';
import { PluginService } from '../../services/plugin.service.js';

const service = new PluginService();

@Controller('/api/plugins')
export class PluginApiController {
    @Get('/')
    async list(req: GaoRequest, res: GaoResponse) {
        const activeOnly = req.query.active === 'true';
        const plugins = await service.list(activeOnly);
        return res.json({ data: plugins.map((p) => p.toJSON()) });
    }

    @Get('/:slug')
    async show(req: GaoRequest, res: GaoResponse) {
        const plugin = await service.findBySlug(req.params.slug);
        if (!plugin) return res.error(404, 'NOT_FOUND', 'Plugin not found');
        const versions = await service.getVersions(plugin.id);
        return res.json({ data: { ...plugin.toJSON(), versions: versions.map((v) => v.toJSON()) } });
    }

    @Post('/')
    async register(req: GaoRequest, res: GaoResponse) {
        const body = req.body as Record<string, unknown>;
        if (!body.slug || !body.name) return res.error(422, 'VALIDATION', 'slug and name are required');
        const plugin = await service.register({
            slug: body.slug as string,
            name: body.name as string,
            description: body.description as string | undefined,
            author: body.author as string | undefined,
            homepage: body.homepage as string | undefined,
            icon_url: body.icon_url as string | undefined,
            category: body.category as string | undefined,
        });
        return res.status(201).json({ data: plugin.toJSON() });
    }

    @Patch('/:slug/install')
    async install(req: GaoRequest, res: GaoResponse) {
        const plugin = await service.install(req.params.slug);
        if (!plugin) return res.error(404, 'NOT_FOUND', 'Plugin not found');
        return res.json({ data: plugin.toJSON() });
    }

    @Patch('/:slug/activate')
    async activate(req: GaoRequest, res: GaoResponse) {
        const plugin = await service.activate(req.params.slug);
        if (!plugin) return res.error(404, 'NOT_FOUND', 'Plugin not found or not installed');
        return res.json({ data: plugin.toJSON() });
    }

    @Patch('/:slug/deactivate')
    async deactivate(req: GaoRequest, res: GaoResponse) {
        const plugin = await service.deactivate(req.params.slug);
        if (!plugin) return res.error(404, 'NOT_FOUND', 'Plugin not found');
        return res.json({ data: plugin.toJSON() });
    }

    @Patch('/:slug/uninstall')
    async uninstall(req: GaoRequest, res: GaoResponse) {
        const success = await service.uninstall(req.params.slug);
        if (!success) return res.error(404, 'NOT_FOUND', 'Plugin not found');
        return res.json({ data: { uninstalled: true } });
    }
}
