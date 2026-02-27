import { Activity } from '../models/activity.model.js';
export class ActivityService {
    async list(params, type, contactId, dealId) {
        let query = Activity.where('id', '!=', '').whereNull('deleted_at');
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
    async findById(id) {
        return Activity.where('id', id).whereNull('deleted_at').first();
    }
    async create(data) {
        return Activity.create({
            ...data,
            is_completed: false,
        });
    }
    async update(id, data) {
        const activity = await this.findById(id);
        if (!activity)
            return null;
        activity.fill(data);
        await activity.save();
        return activity;
    }
    async markComplete(id) {
        const activity = await this.findById(id);
        if (!activity)
            return null;
        activity.is_completed = true;
        activity.completed_at = new Date().toISOString();
        await activity.save();
        return activity;
    }
    async delete(id) {
        const activity = await this.findById(id);
        if (!activity)
            return false;
        await activity.destroy();
        return true;
    }
    async getRecent(limit = 10) {
        return Activity.where('id', '!=', '').whereNull('deleted_at')
            .orderBy('created_at', 'DESC')
            .limit(limit)
            .get();
    }
}
//# sourceMappingURL=activity.service.js.map