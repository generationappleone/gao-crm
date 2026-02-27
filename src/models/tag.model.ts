import { Model, Table, Column } from '@gao/orm';

@Table('tags')
export class Tag extends Model {
    @Column() declare id: string;
    @Column() name!: string;
    @Column() slug!: string;
    @Column() color!: string;
    @Column() declare created_at: string;
    @Column() declare updated_at: string;
}
