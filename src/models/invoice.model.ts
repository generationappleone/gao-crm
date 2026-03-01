import { Model, Table, Column } from '@gao/orm';

export type InvoiceStatus = 'draft' | 'pending' | 'sent' | 'viewed' | 'partial' | 'paid' | 'overdue' | 'cancelled' | 'refunded';

@Table('invoices')
export class Invoice extends Model {
    @Column() declare id: string;
    @Column() invoice_number!: string;
    @Column() quotation_id?: string;
    @Column() deal_id?: string;
    @Column() contact_id?: string;
    @Column() company_id?: string;
    @Column() issued_by!: string;
    @Column() status!: InvoiceStatus;
    @Column() currency!: string;
    @Column() subtotal!: number;
    @Column() tax_rate!: number;
    @Column() tax_amount!: number;
    @Column() discount_amount!: number;
    @Column() total!: number;
    @Column() amount_paid!: number;
    @Column() amount_due!: number;
    @Column() is_recurring!: boolean;
    @Column() recurring_day?: number;
    @Column() is_prorated!: boolean;
    @Column() original_total?: number;
    @Column() notes?: string;
    @Column() terms?: string;
    @Column() issued_at?: string;
    @Column() due_at?: string;
    @Column() paid_at?: string;
    @Column() cancelled_at?: string;
    @Column() declare created_at: string;
    @Column() declare updated_at: string;
    @Column() declare deleted_at: string | undefined;
}

