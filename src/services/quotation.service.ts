import { Quotation, type QuotationStatus } from '../models/quotation.model.js';
import { QuotationItem } from '../models/quotation-item.model.js';

interface QuotationItemInput {
    product_id?: string;
    description: string;
    quantity: number;
    unit_price: number;
    discount_percent?: number;
    tax_rate?: number;
}

interface CreateQuotationInput {
    deal_id?: string;
    contact_id: string;
    company_id?: string;
    owner_id: string;
    title: string;
    currency?: string;
    notes?: string;
    terms?: string;
    valid_until?: string;
    discount_type?: 'percentage' | 'fixed';
    discount_value?: number;
    items: QuotationItemInput[];
}

interface UpdateQuotationInput {
    title?: string;
    notes?: string;
    terms?: string;
    valid_until?: string;
    discount_type?: 'percentage' | 'fixed';
    discount_value?: number;
}

export class QuotationService {

    async list(ownerId?: string, status?: QuotationStatus): Promise<Quotation[]> {
        let query = Quotation.where('deleted_at', 'IS', null);
        if (ownerId) query = query.where('owner_id', ownerId);
        if (status) query = query.where('status', status);
        return query.orderBy('created_at', 'DESC').get();
    }

    async findById(id: string): Promise<Quotation | null> {
        return Quotation.where('id', id).whereNull('deleted_at').first() ?? null;
    }

    async getItems(quotationId: string): Promise<QuotationItem[]> {
        return QuotationItem
            .where('quotation_id', quotationId)
            .orderBy('display_order', 'ASC')
            .get();
    }

    async create(data: CreateQuotationInput): Promise<{ quotation: Quotation; items: QuotationItem[] }> {
        const quoteNumber = await this.generateQuoteNumber();

        // Calculate totals from items
        const calculatedItems = data.items.map((item, index) => {
            const lineSubtotal = item.quantity * item.unit_price;
            const discountAmount = lineSubtotal * ((item.discount_percent ?? 0) / 100);
            const afterDiscount = lineSubtotal - discountAmount;
            const taxAmount = afterDiscount * ((item.tax_rate ?? 0) / 100);
            const total = afterDiscount + taxAmount;
            return { ...item, total, display_order: index };
        });

        const subtotal = calculatedItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);

        // Apply quote-level discount
        let discountAmount = 0;
        if (data.discount_type === 'percentage') {
            discountAmount = subtotal * ((data.discount_value ?? 0) / 100);
        } else if (data.discount_type === 'fixed') {
            discountAmount = data.discount_value ?? 0;
        }

        const afterDiscount = subtotal - discountAmount;
        const taxAmount = calculatedItems.reduce((sum, item) => {
            const lineSubtotal = item.quantity * item.unit_price;
            const lineDiscountAmount = lineSubtotal * ((item.discount_percent ?? 0) / 100);
            return sum + ((lineSubtotal - lineDiscountAmount) * ((item.tax_rate ?? 0) / 100));
        }, 0);
        const totalAmount = afterDiscount + taxAmount;

        const quotation = await Quotation.create({
            quote_number: quoteNumber,
            deal_id: data.deal_id,
            contact_id: data.contact_id,
            company_id: data.company_id,
            owner_id: data.owner_id,
            title: data.title,
            status: 'draft',
            subtotal,
            discount_type: data.discount_type,
            discount_value: data.discount_value ?? 0,
            tax_amount: taxAmount,
            total_amount: totalAmount,
            currency: data.currency ?? 'IDR',
            notes: data.notes,
            terms: data.terms,
            valid_until: data.valid_until,
        });

        // Create line items
        const items: QuotationItem[] = [];
        for (const calcItem of calculatedItems) {
            const item = await QuotationItem.create({
                quotation_id: quotation.id,
                product_id: calcItem.product_id,
                description: calcItem.description,
                quantity: calcItem.quantity,
                unit_price: calcItem.unit_price,
                discount_percent: calcItem.discount_percent ?? 0,
                tax_rate: calcItem.tax_rate ?? 0,
                total: calcItem.total,
                display_order: calcItem.display_order,
            });
            items.push(item);
        }

        return { quotation, items };
    }

    async update(id: string, data: UpdateQuotationInput): Promise<Quotation | null> {
        const quotation = await Quotation.where('id', id).whereNull('deleted_at').first();
        if (!quotation) return null;
        if (quotation.status !== 'draft') return null; // Can only edit drafts

        if (data.title !== undefined) quotation.title = data.title;
        if (data.notes !== undefined) quotation.notes = data.notes;
        if (data.terms !== undefined) quotation.terms = data.terms;
        if (data.valid_until !== undefined) quotation.valid_until = data.valid_until;
        if (data.discount_type !== undefined) quotation.discount_type = data.discount_type;
        if (data.discount_value !== undefined) quotation.discount_value = data.discount_value;

        await quotation.save();
        return quotation;
    }

    async updateStatus(id: string, status: QuotationStatus): Promise<Quotation | null> {
        const quotation = await Quotation.where('id', id).whereNull('deleted_at').first();
        if (!quotation) return null;

        quotation.status = status;

        if (status === 'sent' && !quotation.sent_at) {
            quotation.sent_at = new Date().toISOString();
        } else if (status === 'accepted') {
            quotation.accepted_at = new Date().toISOString();
        } else if (status === 'rejected') {
            quotation.rejected_at = new Date().toISOString();
        }

        await quotation.save();
        return quotation;
    }

    async delete(id: string): Promise<boolean> {
        const quotation = await Quotation.where('id', id).whereNull('deleted_at').first();
        if (!quotation) return false;
        await quotation.destroy();
        return true;
    }

    /**
     * Auto-generate quote number: QUO-YYYYMM-NNNN
     * Queries the database for the highest existing number in the current month
     * to prevent duplicate key violations across restarts.
     */
    private async generateQuoteNumber(): Promise<string> {
        const now = new Date();
        const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
        const prefix = `QUO-${yearMonth}-`;

        // Find the last quotation number for this month
        const lastQuote = await Quotation.where('quote_number', 'LIKE', `${prefix}%`)
            .orderBy('quote_number', 'DESC')
            .first();

        let nextSeq = 1;
        if (lastQuote) {
            const lastSeqStr = lastQuote.quote_number.replace(prefix, '');
            const lastSeq = parseInt(lastSeqStr, 10);
            if (!isNaN(lastSeq)) {
                nextSeq = lastSeq + 1;
            }
        }

        return `${prefix}${String(nextSeq).padStart(4, '0')}`;
    }
}
