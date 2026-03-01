import { Model, Table, Column } from '@gao/orm';

@Table('client_portal_users')
export class ClientPortalUser extends Model {
    @Column() declare id: string;
    @Column() contact_id!: string;
    @Column() company_id?: string;
    @Column() email!: string;
    @Column() password!: string;
    @Column() name!: string;
    @Column() is_active!: boolean;
    @Column() last_login_at?: string;
    @Column() declare created_at: string;
    @Column() declare updated_at: string;
}
