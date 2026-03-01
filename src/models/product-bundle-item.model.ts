import { Model, Table, Column } from '@gao/orm';

@Table('product_bundle_items')
export class ProductBundleItem extends Model {
    @Column() declare id: string;
    @Column() bundle_id!: string;
    @Column() product_id!: string;
    @Column() quantity!: number;
    @Column() display_order!: number;
}
