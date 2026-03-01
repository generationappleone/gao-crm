import { Controller, Get, Post, Patch, Delete } from '@gao/http';
import type { GaoRequest, GaoResponse } from '@gao/http';
import { InvoiceService } from '../../services/invoice.service.js';
import type { InvoiceStatus } from '../../models/invoice.model.js';

const service = new InvoiceService();

@Controller('/api/invoices')
export class InvoiceApiController {
    @Get('/')
    async list(req: GaoRequest, res: GaoResponse) {
        const status = req.query.status as InvoiceStatus | undefined;
        const contactId = req.query.contact_id as string | undefined;
        const companyId = req.query.company_id as string | undefined;
        const invoices = await service.list({ status, contact_id: contactId, company_id: companyId });
        return res.json({ data: invoices.map((i) => i.toJSON()) });
    }

    @Get('/:id')
    async show(req: GaoRequest, res: GaoResponse) {
        const invoice = await service.findById(req.params.id);
        if (!invoice) return res.error(404, 'NOT_FOUND', 'Invoice not found');
        const items = await service.getItems(req.params.id);
        return res.json({ data: { ...invoice.toJSON(), items: items.map((i) => i.toJSON()) } });
    }

    @Post('/')
    async create(req: GaoRequest, res: GaoResponse) {
        const userId = (req as any).user?.id as string | undefined;
        if (!userId) return res.error(401, 'UNAUTHORIZED', 'Authentication required');

        const body = req.body as Record<string, unknown>;
        if (!Array.isArray(body.items) || body.items.length === 0) {
            return res.error(422, 'VALIDATION', 'At least one item is required');
        }

        const invoice = await service.create({
            quotation_id: body.quotation_id as string | undefined,
            deal_id: body.deal_id as string | undefined,
            contact_id: body.contact_id as string | undefined,
            company_id: body.company_id as string | undefined,
            issued_by: userId,
            status: body.status as string | undefined,
            currency: body.currency as string | undefined,
            tax_rate: body.tax_rate as number | undefined,
            discount_amount: body.discount_amount as number | undefined,
            notes: body.notes as string | undefined,
            terms: body.terms as string | undefined,
            due_at: body.due_at as string | undefined,
            is_recurring: body.is_recurring as boolean | undefined,
            recurring_day: body.recurring_day as number | undefined,
            is_prorated: body.is_prorated as boolean | undefined,
            items: body.items as any[],
        });
        return res.status(201).json({ data: invoice.toJSON() });
    }

    @Patch('/:id/status')
    async updateStatus(req: GaoRequest, res: GaoResponse) {
        const body = req.body as { status?: string };
        if (!body.status) return res.error(422, 'VALIDATION', 'status is required');
        const invoice = await service.updateStatus(req.params.id, body.status as InvoiceStatus);
        if (!invoice) return res.error(404, 'NOT_FOUND', 'Invoice not found');
        return res.json({ data: invoice.toJSON() });
    }

    @Delete('/:id')
    async destroy(req: GaoRequest, res: GaoResponse) {
        const deleted = await service.delete(req.params.id);
        if (!deleted) return res.error(404, 'NOT_FOUND', 'Invoice not found');
        return res.empty();
    }
}
