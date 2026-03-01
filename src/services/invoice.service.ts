import { Invoice, type InvoiceStatus } from '../models/invoice.model.js';
import { InvoiceItem } from '../models/invoice-item.model.js';

interface CreateInvoiceInput {
    quotation_id?: string;
    deal_id?: string;
    contact_id?: string;
    company_id?: string;
    issued_by: string;
    status?: string;
    currency?: string;
    tax_rate?: number;
    discount_amount?: number;
    notes?: string;
    terms?: string;
    due_at?: string;
    is_recurring?: boolean;
    recurring_day?: number;
    is_prorated?: boolean;
    items: Array<{
        product_id?: string;
        description: string;
        quantity: number;
        unit_price: number;
        discount_percent?: number;
        tax_rate?: number;
    }>;
}

export class InvoiceService {
    async list(filters?: { status?: InvoiceStatus; contact_id?: string; company_id?: string }): Promise<Invoice[]> {
        let query = Invoice.where('deleted_at', 'IS', null);
        if (filters?.status) query = query.where('status', filters.status);
        if (filters?.contact_id) query = query.where('contact_id', filters.contact_id);
        if (filters?.company_id) query = query.where('company_id', filters.company_id);
        return query.orderBy('created_at', 'DESC').get();
    }

    async findById(id: string): Promise<Invoice | null> {
        return Invoice.where('id', id).whereNull('deleted_at').first() ?? null;
    }

    async create(data: CreateInvoiceInput): Promise<Invoice> {
        const rand = crypto.randomUUID().slice(0, 4).toUpperCase();
        const invoiceNumber = `INV-${Date.now().toString(36).toUpperCase()}-${rand}`;

        // Calculate totals
        let subtotal = 0;
        for (const item of data.items) {
            const discount = item.discount_percent ? (item.unit_price * item.quantity * item.discount_percent) / 100 : 0;
            subtotal += item.unit_price * item.quantity - discount;
        }

        const discountAmount = data.discount_amount ?? 0;
        const taxableAmount = subtotal - discountAmount;
        const taxRate = data.tax_rate ?? 0;
        const taxAmount = Math.round((taxableAmount * taxRate) / 100 * 100) / 100;
        let total = Math.round((taxableAmount + taxAmount) * 100) / 100;

        // Prorate calculation: adjust total based on remaining days in the month
        let originalTotal: number | undefined;
        if (data.is_prorated) {
            originalTotal = total;
            const now = new Date();
            const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
            const remainingDays = daysInMonth - now.getDate() + 1; // include today
            total = Math.round((total * remainingDays / daysInMonth) * 100) / 100;
        }

        // Determine initial status
        const validStatuses = ['draft', 'pending', 'sent', 'viewed', 'partial', 'paid', 'overdue', 'cancelled', 'refunded'];
        const initialStatus = (data.status && validStatuses.includes(data.status)) ? data.status : 'draft';

        const invoice = await Invoice.create({
            invoice_number: invoiceNumber,
            quotation_id: data.quotation_id,
            deal_id: data.deal_id,
            contact_id: data.contact_id,
            company_id: data.company_id,
            issued_by: data.issued_by,
            status: initialStatus,
            currency: data.currency ?? 'IDR',
            subtotal,
            tax_rate: taxRate,
            tax_amount: taxAmount,
            discount_amount: discountAmount,
            total,
            original_total: originalTotal,
            amount_paid: 0,
            amount_due: total,
            is_recurring: data.is_recurring ?? false,
            recurring_day: data.is_recurring ? (data.recurring_day ?? 1) : undefined,
            is_prorated: data.is_prorated ?? false,
            notes: data.notes,
            terms: data.terms,
            due_at: data.due_at,
        });

        // Create line items
        for (let i = 0; i < data.items.length; i++) {
            const item = data.items[i]!;
            const discountPct = item.discount_percent ?? 0;
            const discount = (item.unit_price * item.quantity * discountPct) / 100;
            const amount = item.unit_price * item.quantity - discount;

            await InvoiceItem.create({
                invoice_id: invoice.id,
                product_id: item.product_id,
                description: item.description,
                quantity: item.quantity,
                unit_price: item.unit_price,
                discount_percent: discountPct,
                tax_rate: item.tax_rate ?? 0,
                amount: Math.round(amount * 100) / 100,
                sort_order: i,
            });
        }

        return invoice;
    }

    async updateStatus(id: string, status: InvoiceStatus): Promise<Invoice | null> {
        const invoice = await Invoice.where('id', id).whereNull('deleted_at').first();
        if (!invoice) return null;

        invoice.status = status;
        const now = new Date().toISOString();
        if (status === 'sent' && !invoice.issued_at) invoice.issued_at = now;
        if (status === 'paid') invoice.paid_at = now;
        if (status === 'cancelled') invoice.cancelled_at = now;

        await invoice.save();
        return invoice;
    }

    async recordPayment(invoiceId: string, amount: number): Promise<Invoice | null> {
        const invoice = await Invoice.where('id', invoiceId).whereNull('deleted_at').first();
        if (!invoice) return null;

        invoice.amount_paid = (invoice.amount_paid || 0) + amount;
        invoice.amount_due = Math.max(0, invoice.total - invoice.amount_paid);

        if (invoice.amount_due <= 0) {
            invoice.status = 'paid';
            invoice.paid_at = new Date().toISOString();
        } else {
            invoice.status = 'partial';
        }

        await invoice.save();
        return invoice;
    }

    async getItems(invoiceId: string): Promise<InvoiceItem[]> {
        return InvoiceItem.where('invoice_id', invoiceId).orderBy('sort_order', 'ASC').get();
    }

    async delete(id: string): Promise<boolean> {
        const invoice = await Invoice.where('id', id).whereNull('deleted_at').first();
        if (!invoice) return false;
        await invoice.destroy();
        return true;
    }
}
