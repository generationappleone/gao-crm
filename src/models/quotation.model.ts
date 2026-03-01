import { Model, Table, Column } from '@gao/orm';

export type QuotationStatus = 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired';

@Table('quotations')
export class Quotation extends Model {
    @Column() declare id: string;
    @Column() quote_number!: string;
    @Column() deal_id?: string;
    @Column() contact_id!: string;
    @Column() company_id?: string;
    @Column() owner_id!: string;
    @Column() title!: string;
    @Column() status!: QuotationStatus;
    @Column() subtotal!: number;
    @Column() discount_type?: 'percentage' | 'fixed';
    @Column() discount_value!: number;
    @Column() tax_amount!: number;
    @Column() total_amount!: number;
    @Column() currency!: string;
    @Column() notes?: string;
    @Column() terms?: string;
    @Column() valid_until?: string;
    @Column() accepted_at?: string;
    @Column() rejected_at?: string;
    @Column() sent_at?: string;
    @Column() declare created_at: string;
    @Column() declare updated_at: string;
    @Column() declare deleted_at: string | undefined;
}
