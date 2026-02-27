import { Model } from '@gao/orm';
export declare class Deal extends Model {
    id: string;
    contact_id: string;
    company_id?: string;
    owner_id: string;
    stage_id: string;
    title: string;
    value: number;
    currency: string;
    probability: number;
    expected_close_at?: string;
    won_at?: string;
    lost_at?: string;
    lost_reason?: string;
    description?: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | undefined;
}
//# sourceMappingURL=deal.model.d.ts.map