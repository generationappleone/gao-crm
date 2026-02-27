import { Model, Table, Column, Encrypted } from '@gao/orm';

@Table('users')
export class User extends Model {
    @Column() declare id: string;
    @Column() email!: string;
    @Column() name!: string;
    @Encrypted() password!: string;
    @Column() role!: 'admin' | 'sales_manager' | 'sales_rep';
    @Column() is_active!: boolean;
    @Column() avatar_url?: string;
    @Column() last_login_at?: string;
    @Column() declare created_at: string;
    @Column() declare updated_at: string;
    @Column() declare deleted_at: string | undefined;
}
