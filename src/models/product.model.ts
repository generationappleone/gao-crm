import { Model, Table, Column } from '@gao/orm';

@Table('products')
export class Product extends Model {
    @Column() declare id: string;
    @Column() name!: string;
    @Column() sku?: string;
    @Column() description?: string;
    @Column() unit_price!: number;
    @Column() currency!: string;
    @Column() unit!: string;
    @Column() tax_rate!: number;
    @Column() is_active!: boolean;
    @Column() declare created_at: string;
    @Column() declare updated_at: string;
    @Column() declare deleted_at: string | undefined;
}
