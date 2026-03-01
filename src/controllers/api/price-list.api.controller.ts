import { Controller, Get, Post, Put, Delete } from '@gao/http';
import type { GaoRequest, GaoResponse } from '@gao/http';
import { PriceListService } from '../../services/price-list.service.js';

const service = new PriceListService();

@Controller('/api/price-lists')
export class PriceListApiController {
    @Get('/')
    async list(_req: GaoRequest, res: GaoResponse) {
        const data = await service.list();
        return res.json({ data: data.map(d => d.toJSON()) });
    }

    @Get('/:id')
    async get(req: GaoRequest, res: GaoResponse) {
        const list = await service.findById(req.params.id);
        if (!list) return res.error(404, 'NOT_FOUND', 'Price list not found');
        const items = await service.getItems(req.params.id);
        return res.json({ data: { ...list.toJSON(), items: items.map(i => i.toJSON()) } });
    }

    @Post('/')
    async create(req: GaoRequest, res: GaoResponse) {
        const body = req.body as Record<string, unknown>;
        if (!body.name) return res.error(400, 'VALIDATION', 'name is required');
        const list = await service.create({
            name: body.name as string,
            description: body.description as string | undefined,
            discount_percent: body.discount_percent ? Number(body.discount_percent) : 0,
        });
        return res.json({ data: list.toJSON() });
    }

    @Put('/:id')
    async update(req: GaoRequest, res: GaoResponse) {
        const body = req.body as Record<string, unknown>;
        const list = await service.update(req.params.id, {
            name: body.name as string | undefined,
            description: body.description as string | undefined,
            discount_percent: body.discount_percent ? Number(body.discount_percent) : undefined,
            is_active: body.is_active as boolean | undefined,
        });
        if (!list) return res.error(404, 'NOT_FOUND', 'Price list not found');
        return res.json({ data: list.toJSON() });
    }

    @Delete('/:id')
    async delete(req: GaoRequest, res: GaoResponse) {
        const ok = await service.delete(req.params.id);
        if (!ok) return res.error(400, 'CANNOT_DELETE', 'Cannot delete default price list');
        return res.json({ data: { deleted: true } });
    }

    @Post('/:id/items')
    async setItemPrice(req: GaoRequest, res: GaoResponse) {
        const body = req.body as Record<string, unknown>;
        if (!body.product_id || !body.custom_price) return res.error(400, 'VALIDATION', 'product_id and custom_price are required');
        const item = await service.setItemPrice(req.params.id, body.product_id as string, Number(body.custom_price));
        return res.json({ data: item.toJSON() });
    }
}
