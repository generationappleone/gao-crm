import { Model, Table, Column } from '@gao/orm';

@Table('product_bundles')
export class ProductBundle extends Model {
    @Column() declare id: string;
    @Column() name!: string;
    @Column() description?: string;
    @Column() bundle_price!: number;
    @Column() currency!: string;
    @Column() is_active!: boolean;
    @Column() created_by?: string;
    @Column() declare created_at: string;
    @Column() declare updated_at: string;
    @Column() declare deleted_at: string;
}
