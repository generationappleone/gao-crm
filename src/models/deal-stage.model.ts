import { Model, Table, Column } from '@gao/orm';

@Table('deal_stages')
export class DealStage extends Model {
    @Column() declare id: string;
    @Column() name!: string;
    @Column() slug!: string;
    @Column() display_order!: number;
    @Column() color!: string;
    @Column() is_won!: boolean;
    @Column() is_lost!: boolean;
    @Column() declare created_at: string;
    @Column() declare updated_at: string;
}
