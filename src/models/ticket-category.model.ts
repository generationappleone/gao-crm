import { Model, Table, Column } from '@gao/orm';

@Table('ticket_categories')
export class TicketCategory extends Model {
    @Column() declare id: string;
    @Column() name!: string;
    @Column() slug!: string;
    @Column() description?: string;
    @Column() color!: string;
    @Column() display_order!: number;
    @Column() is_active!: boolean;
    @Column() declare created_at: string;
    @Column() declare updated_at: string;
    @Column() declare deleted_at: string | undefined;
}
