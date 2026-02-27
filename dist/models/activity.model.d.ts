import { Model } from '@gao/orm';
export declare class Activity extends Model {
    id: string;
    contact_id?: string;
    deal_id?: string;
    owner_id: string;
    type: 'call' | 'meeting' | 'email' | 'task' | 'note';
    subject: string;
    description?: string;
    due_at?: string;
    completed_at?: string;
    is_completed: boolean;
    created_at: string;
    updated_at: string;
    deleted_at: string | undefined;
}
//# sourceMappingURL=activity.model.d.ts.map