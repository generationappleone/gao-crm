import { Model, Table, Column } from '@gao/orm';

@Table('quotation_items')
export class QuotationItem extends Model {
    @Column() declare id: string;
    @Column() quotation_id!: string;
    @Column() product_id?: string;
    @Column() description!: string;
    @Column() quantity!: number;
    @Column() unit_price!: number;
    @Column() discount_percent!: number;
    @Column() tax_rate!: number;
    @Column() total!: number;
    @Column() display_order!: number;
    @Column() declare created_at: string;
    @Column() declare updated_at: string;
}
