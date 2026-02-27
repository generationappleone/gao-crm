import { Activity } from '../models/activity.model.js';
import type { PaginationParams, PaginationMeta } from '../helpers/pagination.js';

export interface ActivityListResult {
    activities: Activity[];
    meta: PaginationMeta;
}

export class ActivityService {

    async list(params: PaginationParams, type?: string, contactId?: string, dealId?: string): Promise<ActivityListResult> {
        let query = Activity.where('deleted_at', 'IS', null);

        if (type) {
            query = query.where('type', type);
        }
        if (contactId) {
            query = query.where('contact_id', contactId);
        }
        if (dealId) {
            query = query.where('deal_id', dealId);
        }

        const result = await query.orderBy('created_at', 'DESC').paginate(params.page, params.perPage);

        return {
            activities: result.data,
            meta: {
                page: result.meta.page,
                per_page: result.meta.perPage,
                total: result.meta.total,
                total_pages: result.meta.totalPages,
            },
        };
    }

    async findById(id: string): Promise<Activity | null> {
        return Activity.where('id', id).whereNull('deleted_at').first();
    }

    async create(data: Record<string, unknown>): Promise<Activity> {
        return Activity.create({
            ...data,
            is_completed: false,
        });
    }

    async update(id: string, data: Record<string, unknown>): Promise<Activity | null> {
        const activity = await this.findById(id);
        if (!activity) return null;

        activity.fill(data);
        await activity.save();
        return activity;
    }

    async markComplete(id: string): Promise<Activity | null> {
        const activity = await this.findById(id);
        if (!activity) return null;

        activity.is_completed = true;
        activity.completed_at = new Date().toISOString();
        await activity.save();
        return activity;
    }

    async delete(id: string): Promise<boolean> {
        const activity = await this.findById(id);
        if (!activity) return false;
        await activity.destroy();
        return true;
    }

    async getRecent(limit = 10): Promise<Activity[]> {
        return Activity.where('deleted_at', 'IS', null)
            .orderBy('created_at', 'DESC')
            .limit(limit)
            .get();
    }
}
