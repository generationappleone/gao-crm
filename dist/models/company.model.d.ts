import { Model } from '@gao/orm';
export declare class Company extends Model {
    id: string;
    name: string;
    industry?: string;
    website?: string;
    phone?: string;
    email?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    employee_count?: number;
    annual_revenue?: number;
    notes?: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | undefined;
}
//# sourceMappingURL=company.model.d.ts.map