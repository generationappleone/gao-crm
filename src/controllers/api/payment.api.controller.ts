import { Controller, Get, Post, Patch } from '@gao/http';
import type { GaoRequest, GaoResponse } from '@gao/http';
import { PaymentService } from '../../services/payment.service.js';
import type { PaymentStatus } from '../../models/payment.model.js';

const service = new PaymentService();

@Controller('/api/payments')
export class PaymentApiController {
    @Get('/methods')
    async methods(_req: GaoRequest, res: GaoResponse) {
        const methods = await service.listMethods();
        return res.json({ data: methods.map((m) => m.toJSON()) });
    }

    @Post('/methods')
    async createMethod(req: GaoRequest, res: GaoResponse) {
        const body = req.body as Record<string, unknown>;
        if (!body.name || !body.provider) return res.error(422, 'VALIDATION', 'name and provider are required');
        const method = await service.createMethod({
            name: body.name as string,
            provider: body.provider as string,
            config: body.config as Record<string, unknown> | undefined,
        });
        return res.status(201).json({ data: method.toJSON() });
    }

    @Get('/invoice/:invoiceId')
    async listByInvoice(req: GaoRequest, res: GaoResponse) {
        const payments = await service.listByInvoice(req.params.invoiceId);
        return res.json({ data: payments.map((p) => p.toJSON()) });
    }

    @Post('/')
    async record(req: GaoRequest, res: GaoResponse) {
        const body = req.body as Record<string, unknown>;
        if (!body.invoice_id || !body.amount) {
            return res.error(422, 'VALIDATION', 'invoice_id and amount are required');
        }
        const payment = await service.recordPayment({
            invoice_id: body.invoice_id as string,
            payment_method_id: body.payment_method_id as string | undefined,
            amount: body.amount as number,
            currency: body.currency as string | undefined,
            reference_number: body.reference_number as string | undefined,
            notes: body.notes as string | undefined,
        });
        return res.status(201).json({ data: payment.toJSON() });
    }

    @Patch('/:id/status')
    async updateStatus(req: GaoRequest, res: GaoResponse) {
        const body = req.body as { status?: string };
        if (!body.status) return res.error(422, 'VALIDATION', 'status is required');
        const payment = await service.updateStatus(req.params.id, body.status as PaymentStatus);
        if (!payment) return res.error(404, 'NOT_FOUND', 'Payment not found');
        return res.json({ data: payment.toJSON() });
    }
}
