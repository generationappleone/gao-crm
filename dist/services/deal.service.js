import { Deal } from '../models/deal.model.js';
import { DealStage } from '../models/deal-stage.model.js';
export class DealService {
    async list(params, stageId, ownerId) {
        let query = Deal.where('id', '!=', '').whereNull('deleted_at');
        if (stageId) {
            query = query.where('stage_id', stageId);
        }
        if (ownerId) {
            query = query.where('owner_id', ownerId);
        }
        const result = await query.orderBy('created_at', 'DESC').paginate(params.page, params.perPage);
        return {
            deals: result.data,
            meta: {
                page: result.meta.page,
                per_page: result.meta.perPage,
                total: result.meta.total,
                total_pages: result.meta.totalPages,
            },
        };
    }
    async findById(id) {
        return Deal.where('id', id).whereNull('deleted_at').first();
    }
    async create(data) {
        return Deal.create({
            ...data,
            currency: data.currency || 'IDR',
            probability: data.probability ?? 50,
        });
    }
    async update(id, data) {
        const deal = await this.findById(id);
        if (!deal)
            return null;
        deal.fill(data);
        await deal.save();
        return deal;
    }
    async moveToStage(id, stageId) {
        const deal = await this.findById(id);
        if (!deal)
            return null;
        const stage = await DealStage.find(stageId);
        if (!stage)
            return null;
        deal.stage_id = stageId;
        if (stage.is_won) {
            deal.won_at = new Date().toISOString();
            deal.probability = 100;
        }
        else if (stage.is_lost) {
            deal.lost_at = new Date().toISOString();
            deal.probability = 0;
        }
        await deal.save();
        return deal;
    }
    async delete(id) {
        const deal = await this.findById(id);
        if (!deal)
            return false;
        await deal.destroy();
        return true;
    }
    async getStages() {
        return DealStage.where('id', '!=', '').orderBy('display_order', 'ASC').get();
    }
}
//# sourceMappingURL=deal.service.js.map