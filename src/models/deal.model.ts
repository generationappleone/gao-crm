import { Model, Table, Column } from '@gao/orm';

@Table('deals')
export class Deal extends Model {
    @Column() declare id: string;
    @Column() contact_id!: string;
    @Column() company_id?: string;
    @Column() owner_id!: string;
    @Column() stage_id!: string;
    @Column() title!: string;
    @Column() value!: number;
    @Column() currency!: string;
    @Column() probability!: number;
    @Column() expected_close_at?: string;
    @Column() won_at?: string;
    @Column() lost_at?: string;
    @Column() lost_reason?: string;
    @Column() description?: string;
    @Column() notes?: string;
    @Column() declare created_at: string;
    @Column() declare updated_at: string;
    @Column() declare deleted_at: string | undefined;
}
