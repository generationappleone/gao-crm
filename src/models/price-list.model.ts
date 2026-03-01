import { Model, Table, Column } from '@gao/orm';

@Table('price_lists')
export class PriceList extends Model {
    @Column() declare id: string;
    @Column() name!: string;
    @Column() description?: string;
    @Column() discount_percent!: number;
    @Column() is_default!: boolean;
    @Column() is_active!: boolean;
    @Column() declare created_at: string;
    @Column() declare updated_at: string;
    @Column() declare deleted_at: string;
}
