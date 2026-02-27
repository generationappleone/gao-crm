import { Model, Table, Column } from '@gao/orm';

@Table('contacts')
export class Contact extends Model {
    @Column() declare id: string;
    @Column() company_id?: string;
    @Column() owner_id!: string;
    @Column() first_name!: string;
    @Column() last_name!: string;
    @Column() email?: string;
    @Column() phone?: string;
    @Column() position?: string;
    @Column() city?: string;
    @Column() source?: string;
    @Column() status!: 'lead' | 'prospect' | 'customer' | 'churned';
    @Column() notes?: string;
    @Column() last_contacted_at?: string;
    @Column() declare created_at: string;
    @Column() declare updated_at: string;
    @Column() declare deleted_at: string | undefined;
}
