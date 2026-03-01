import { Controller, Get, Post, Put, Delete } from '@gao/http';
import type { GaoRequest, GaoResponse } from '@gao/http';
import { ProductService } from '../../services/product.service.js';

const service = new ProductService();

@Controller('/api/products')
export class ProductApiController {
    @Get('/')
    async list(req: GaoRequest, res: GaoResponse) {
        const activeOnly = req.query.active !== 'false';
        const products = await service.list(activeOnly);
        return res.json({ data: products.map((p) => p.toJSON()) });
    }

    @Get('/:id')
    async show(req: GaoRequest, res: GaoResponse) {
        const product = await service.findById(req.params.id);
        if (!product) return res.error(404, 'NOT_FOUND', 'Product not found');
        return res.json({ data: product.toJSON() });
    }

    @Post('/')
    async create(req: GaoRequest, res: GaoResponse) {
        const body = req.body as Record<string, unknown>;
        if (!body.name || typeof body.name !== 'string') {
            return res.error(422, 'VALIDATION', 'name is required');
        }
        if (body.unit_price === undefined || typeof body.unit_price !== 'number') {
            return res.error(422, 'VALIDATION', 'unit_price is required and must be a number');
        }

        const product = await service.create({
            name: body.name,
            sku: body.sku as string | undefined,
            description: body.description as string | undefined,
            unit_price: body.unit_price,
            currency: body.currency as string | undefined,
            unit: body.unit as string | undefined,
            tax_rate: body.tax_rate as number | undefined,
        });
        return res.status(201).json({ data: product.toJSON() });
    }

    @Put('/:id')
    async update(req: GaoRequest, res: GaoResponse) {
        const body = req.body as Record<string, unknown>;
        const product = await service.update(req.params.id, {
            name: body.name as string | undefined,
            sku: body.sku as string | undefined,
            description: body.description as string | undefined,
            unit_price: body.unit_price as number | undefined,
            currency: body.currency as string | undefined,
            unit: body.unit as string | undefined,
            tax_rate: body.tax_rate as number | undefined,
            is_active: body.is_active as boolean | undefined,
        });
        if (!product) return res.error(404, 'NOT_FOUND', 'Product not found');
        return res.json({ data: product.toJSON() });
    }

    @Delete('/:id')
    async destroy(req: GaoRequest, res: GaoResponse) {
        const deleted = await service.delete(req.params.id);
        if (!deleted) return res.error(404, 'NOT_FOUND', 'Product not found');
        return res.empty();
    }
}
