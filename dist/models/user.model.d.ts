import { Model } from '@gao/orm';
export declare class User extends Model {
    id: string;
    email: string;
    name: string;
    password: string;
    role: 'admin' | 'sales_manager' | 'sales_rep';
    is_active: boolean;
    avatar_url?: string;
    last_login_at?: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | undefined;
}
//# sourceMappingURL=user.model.d.ts.map