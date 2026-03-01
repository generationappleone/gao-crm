import { Model, Table, Column } from '@gao/orm';

@Table('pipelines')
export class Pipeline extends Model {
    @Column() declare id: string;
    @Column() name!: string;
    @Column() slug!: string;
    @Column() description?: string;
    @Column() is_default!: boolean;
    @Column() display_order!: number;
    @Column() declare created_at: string;
    @Column() declare updated_at: string;
    @Column() declare deleted_at: string | undefined;
}
