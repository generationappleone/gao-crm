import { Model } from '@gao/orm';
export declare class Contact extends Model {
    id: string;
    company_id?: string;
    owner_id: string;
    first_name: string;
    last_name: string;
    email?: string;
    phone?: string;
    position?: string;
    city?: string;
    source?: string;
    status: 'lead' | 'prospect' | 'customer' | 'churned';
    notes?: string;
    last_contacted_at?: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | undefined;
}
//# sourceMappingURL=contact.model.d.ts.map