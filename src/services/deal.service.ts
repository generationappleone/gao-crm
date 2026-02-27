import { Deal } from '../models/deal.model.js';
import { DealStage } from '../models/deal-stage.model.js';
import type { PaginationParams, PaginationMeta } from '../helpers/pagination.js';

export interface DealListResult {
    deals: Deal[];
    meta: PaginationMeta;
}

export class DealService {

    async list(params: PaginationParams, stageId?: string, ownerId?: string): Promise<DealListResult> {
        let query = Deal.where('deleted_at', 'IS', null);

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

    async findById(id: string): Promise<Deal | null> {
        return Deal.where('id', id).whereNull('deleted_at').first();
    }

    async create(data: Record<string, unknown>): Promise<Deal> {
        return Deal.create({
            ...data,
            currency: (data.currency as string) || 'IDR',
            probability: (data.probability as number) ?? 50,
        });
    }

    async update(id: string, data: Record<string, unknown>): Promise<Deal | null> {
        const deal = await this.findById(id);
        if (!deal) return null;

        deal.fill(data);
        await deal.save();
        return deal;
    }

    async moveToStage(id: string, stageId: string): Promise<Deal | null> {
        const deal = await this.findById(id);
        if (!deal) return null;

        const stage = await DealStage.find(stageId);
        if (!stage) return null;

        deal.stage_id = stageId;

        if (stage.is_won) {
            deal.won_at = new Date().toISOString();
            deal.probability = 100;
        } else if (stage.is_lost) {
            deal.lost_at = new Date().toISOString();
            deal.probability = 0;
        }

        await deal.save();
        return deal;
    }

    async delete(id: string): Promise<boolean> {
        const deal = await this.findById(id);
        if (!deal) return false;
        await deal.destroy();
        return true;
    }

    async getStages(): Promise<DealStage[]> {
        return DealStage.where('id', 'IS NOT', null).orderBy('display_order', 'ASC').get();
    }
}
