import { Model, Table, Column } from '@gao/orm';

@Table('invoice_items')
export class InvoiceItem extends Model {
    @Column() declare id: string;
    @Column() invoice_id!: string;
    @Column() product_id?: string;
    @Column() description!: string;
    @Column() quantity!: number;
    @Column() unit_price!: number;
    @Column() discount_percent!: number;
    @Column() tax_rate!: number;
    @Column() amount!: number;
    @Column() sort_order!: number;
    @Column() declare created_at: string;
}
