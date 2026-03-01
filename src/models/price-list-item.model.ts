import { Model, Table, Column } from '@gao/orm';

@Table('price_list_items')
export class PriceListItem extends Model {
    @Column() declare id: string;
    @Column() price_list_id!: string;
    @Column() product_id!: string;
    @Column() custom_price!: number;
}
