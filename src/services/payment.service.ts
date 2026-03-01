import { Payment, type PaymentStatus } from '../models/payment.model.js';
import { PaymentMethod } from '../models/payment-method.model.js';
import { InvoiceService } from './invoice.service.js';

interface RecordPaymentInput {
    invoice_id: string;
    payment_method_id?: string;
    amount: number;
    currency?: string;
    reference_number?: string;
    notes?: string;
}

const invoiceService = new InvoiceService();

export class PaymentService {
    // ─── Payment Methods ────────────────────────────
    async listMethods(): Promise<PaymentMethod[]> {
        return PaymentMethod.where('is_active', true).orderBy('display_order', 'ASC').get();
    }

    async createMethod(data: { name: string; provider: string; config?: Record<string, unknown> }): Promise<PaymentMethod> {
        return PaymentMethod.create({
            name: data.name,
            provider: data.provider,
            config: JSON.stringify(data.config ?? {}),
            is_active: true,
            display_order: 0,
        });
    }

    // ─── Payments ───────────────────────────────────
    async listByInvoice(invoiceId: string): Promise<Payment[]> {
        return Payment.where('invoice_id', invoiceId).orderBy('created_at', 'DESC').get();
    }

    async recordPayment(data: RecordPaymentInput): Promise<Payment> {
        const payment = await Payment.create({
            invoice_id: data.invoice_id,
            payment_method_id: data.payment_method_id,
            amount: data.amount,
            currency: data.currency ?? 'IDR',
            status: 'completed',
            reference_number: data.reference_number,
            notes: data.notes,
            paid_at: new Date().toISOString(),
        });

        // Update invoice totals
        await invoiceService.recordPayment(data.invoice_id, data.amount);

        return payment;
    }

    async updateStatus(id: string, status: PaymentStatus): Promise<Payment | null> {
        const payment = await Payment.where('id', id).first();
        if (!payment) return null;
        payment.status = status;
        await payment.save();
        return payment;
    }
}
