import { Controller, Get, Post, Put, Delete } from '@gao/http';
import type { GaoRequest, GaoResponse } from '@gao/http';
import { BundleService } from '../../services/bundle.service.js';

const service = new BundleService();

@Controller('/api/bundles')
export class BundleApiController {
    @Get('/')
    async list(_req: GaoRequest, res: GaoResponse) {
        const bundles = await service.list();
        return res.json({ data: bundles.map(b => b.toJSON()) });
    }

    @Get('/:id')
    async get(req: GaoRequest, res: GaoResponse) {
        const bundle = await service.findById(req.params.id);
        if (!bundle) return res.error(404, 'NOT_FOUND', 'Bundle not found');
        const items = await service.getItems(req.params.id);
        return res.json({ data: { ...bundle.toJSON(), items: items.map(i => i.toJSON()) } });
    }

    @Post('/')
    async create(req: GaoRequest, res: GaoResponse) {
        const body = req.body as Record<string, unknown>;
        const user = req.user as Record<string, unknown>;
        if (!body.name || !body.bundle_price) return res.error(400, 'VALIDATION', 'name and bundle_price are required');
        const bundle = await service.create({
            name: body.name as string,
            description: body.description as string | undefined,
            bundle_price: Number(body.bundle_price),
            created_by: user?.id as string | undefined,
        });
        return res.json({ data: bundle.toJSON() });
    }

    @Put('/:id')
    async update(req: GaoRequest, res: GaoResponse) {
        const body = req.body as Record<string, unknown>;
        const bundle = await service.update(req.params.id, {
            name: body.name as string | undefined,
            description: body.description as string | undefined,
            bundle_price: body.bundle_price ? Number(body.bundle_price) : undefined,
            is_active: body.is_active as boolean | undefined,
        });
        if (!bundle) return res.error(404, 'NOT_FOUND', 'Bundle not found');
        return res.json({ data: bundle.toJSON() });
    }

    @Delete('/:id')
    async delete(req: GaoRequest, res: GaoResponse) {
        const ok = await service.delete(req.params.id);
        if (!ok) return res.error(404, 'NOT_FOUND', 'Bundle not found');
        return res.json({ data: { deleted: true } });
    }

    @Post('/:id/items')
    async addItem(req: GaoRequest, res: GaoResponse) {
        const body = req.body as Record<string, unknown>;
        if (!body.product_id) return res.error(400, 'VALIDATION', 'product_id is required');
        const item = await service.addItem(
            req.params.id,
            body.product_id as string,
            Number(body.quantity ?? 1),
            Number(body.display_order ?? 0),
        );
        return res.json({ data: item.toJSON() });
    }

    @Delete('/items/:itemId')
    async removeItem(req: GaoRequest, res: GaoResponse) {
        const ok = await service.removeItem(req.params.itemId);
        if (!ok) return res.error(404, 'NOT_FOUND', 'Item not found');
        return res.json({ data: { deleted: true } });
    }
}
