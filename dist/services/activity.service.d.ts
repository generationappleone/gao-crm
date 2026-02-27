import { Activity } from '../models/activity.model.js';
import type { PaginationParams, PaginationMeta } from '../helpers/pagination.js';
export interface ActivityListResult {
    activities: Activity[];
    meta: PaginationMeta;
}
export declare class ActivityService {
    list(params: PaginationParams, type?: string, contactId?: string, dealId?: string): Promise<ActivityListResult>;
    findById(id: string): Promise<Activity | null>;
    create(data: Record<string, unknown>): Promise<Activity>;
    update(id: string, data: Record<string, unknown>): Promise<Activity | null>;
    markComplete(id: string): Promise<Activity | null>;
    delete(id: string): Promise<boolean>;
    getRecent(limit?: number): Promise<Activity[]>;
}
//# sourceMappingURL=activity.service.d.ts.map