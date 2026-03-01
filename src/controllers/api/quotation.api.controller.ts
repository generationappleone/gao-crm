import { Controller, Get, Post, Put, Patch, Delete } from '@gao/http';
import type { GaoRequest, GaoResponse } from '@gao/http';
import { QuotationService } from '../../services/quotation.service.js';
import type { QuotationStatus } from '../../models/quotation.model.js';

const service = new QuotationService();

const VALID_STATUSES = ['draft', 'sent', 'viewed', 'accepted', 'rejected', 'expired'];

@Controller('/api/quotations')
export class QuotationApiController {
    @Get('/')
    async list(req: GaoRequest, res: GaoResponse) {
        const ownerId = (req as any).user?.id as string | undefined;
        const status = req.query.status as string | undefined;

        const quotations = await service.list(
            ownerId ?? undefined,
            status && VALID_STATUSES.includes(status) ? status as QuotationStatus : undefined
        );
        return res.json({ data: quotations.map((q) => q.toJSON()) });
    }

    @Get('/:id')
    async show(req: GaoRequest, res: GaoResponse) {
        const quotation = await service.findById(req.params.id);
        if (!quotation) return res.error(404, 'NOT_FOUND', 'Quotation not found');

        const items = await service.getItems(quotation.id);
        return res.json({
            data: {
                ...quotation.toJSON(),
                items: items.map((i) => i.toJSON()),
            },
        });
    }

    @Post('/')
    async create(req: GaoRequest, res: GaoResponse) {
        const ownerId = (req as any).user?.id as string | undefined;
        if (!ownerId) return res.error(401, 'UNAUTHORIZED', 'Authentication required');

        const body = req.body as Record<string, unknown>;
        if (!body.contact_id || typeof body.contact_id !== 'string') {
            return res.error(422, 'VALIDATION', 'contact_id is required');
        }
        if (!body.title || typeof body.title !== 'string') {
            return res.error(422, 'VALIDATION', 'title is required');
        }
        if (!Array.isArray(body.items) || body.items.length === 0) {
            return res.error(422, 'VALIDATION', 'at least one item is required');
        }

        const result = await service.create({
            deal_id: body.deal_id as string | undefined,
            contact_id: body.contact_id,
            company_id: body.company_id as string | undefined,
            owner_id: ownerId,
            title: body.title,
            currency: body.currency as string | undefined,
            notes: body.notes as string | undefined,
            terms: body.terms as string | undefined,
            valid_until: body.valid_until as string | undefined,
            discount_type: body.discount_type as 'percentage' | 'fixed' | undefined,
            discount_value: body.discount_value as number | undefined,
            items: body.items as Array<{
                product_id?: string;
                description: string;
                quantity: number;
                unit_price: number;
                discount_percent?: number;
                tax_rate?: number;
            }>,
        });

        return res.status(201).json({
            data: {
                ...result.quotation.toJSON(),
                items: result.items.map((i) => i.toJSON()),
            },
        });
    }

    @Put('/:id')
    async update(req: GaoRequest, res: GaoResponse) {
        const body = req.body as Record<string, unknown>;
        const quotation = await service.update(req.params.id, {
            title: body.title as string | undefined,
            notes: body.notes as string | undefined,
            terms: body.terms as string | undefined,
            valid_until: body.valid_until as string | undefined,
            discount_type: body.discount_type as 'percentage' | 'fixed' | undefined,
            discount_value: body.discount_value as number | undefined,
        });
        if (!quotation) return res.error(400, 'UPDATE_FAILED', 'Cannot update quotation (not found or not a draft)');
        return res.json({ data: quotation.toJSON() });
    }

    @Patch('/:id/status')
    async updateStatus(req: GaoRequest, res: GaoResponse) {
        const body = req.body as { status?: string };
        if (!body.status || !VALID_STATUSES.includes(body.status)) {
            return res.error(422, 'VALIDATION', `status must be one of: ${VALID_STATUSES.join(', ')}`);
        }

        const quotation = await service.updateStatus(req.params.id, body.status as QuotationStatus);
        if (!quotation) return res.error(404, 'NOT_FOUND', 'Quotation not found');
        return res.json({ data: quotation.toJSON() });
    }

    @Delete('/:id')
    async destroy(req: GaoRequest, res: GaoResponse) {
        const deleted = await service.delete(req.params.id);
        if (!deleted) return res.error(404, 'NOT_FOUND', 'Quotation not found');
        return res.empty();
    }
}
