import { Model, Table, Column } from '@gao/orm';

@Table('activities')
export class Activity extends Model {
    @Column() declare id: string;
    @Column() contact_id?: string;
    @Column() deal_id?: string;
    @Column() owner_id!: string;
    @Column() type!: 'call' | 'meeting' | 'email' | 'task' | 'note';
    @Column() subject!: string;
    @Column() description?: string;
    @Column() due_at?: string;
    @Column() completed_at?: string;
    @Column() is_completed!: boolean;
    @Column() declare created_at: string;
    @Column() declare updated_at: string;
    @Column() declare deleted_at: string | undefined;
}
