import { Deal } from '../models/deal.model.js';
import { DealStage } from '../models/deal-stage.model.js';
import type { PaginationParams, PaginationMeta } from '../helpers/pagination.js';
export interface DealListResult {
    deals: Deal[];
    meta: PaginationMeta;
}
export declare class DealService {
    list(params: PaginationParams, stageId?: string, ownerId?: string): Promise<DealListResult>;
    findById(id: string): Promise<Deal | null>;
    create(data: Record<string, unknown>): Promise<Deal>;
    update(id: string, data: Record<string, unknown>): Promise<Deal | null>;
    moveToStage(id: string, stageId: string): Promise<Deal | null>;
    delete(id: string): Promise<boolean>;
    getStages(): Promise<DealStage[]>;
}
//# sourceMappingURL=deal.service.d.ts.map