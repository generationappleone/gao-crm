import { Model } from '@gao/orm';
export declare class DealStage extends Model {
    id: string;
    pipeline_id: string;
    name: string;
    slug: string;
    display_order: number;
    color: string;
    is_won: boolean;
    is_lost: boolean;
    created_at: string;
    updated_at: string;
    deleted_at: string | undefined;
}
//# sourceMappingURL=deal-stage.model.d.ts.map