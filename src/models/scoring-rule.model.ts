import { Model, Table, Column } from '@gao/orm';

export type ScoringCategory = 'demographic' | 'behavioral' | 'engagement' | 'firmographic' | 'custom';
export type ScoringOperator = 'equals' | 'not_equals' | 'contains' | 'gt' | 'lt' | 'gte' | 'lte' | 'is_set' | 'is_not_set' | 'in';

@Table('scoring_rules')
export class ScoringRule extends Model {
    @Column() declare id: string;
    @Column() name!: string;
    @Column() description?: string;
    @Column() entity_type!: 'contact' | 'company' | 'deal';
    @Column() category!: ScoringCategory;
    @Column() condition_field!: string;
    @Column() condition_operator!: ScoringOperator;
    @Column() condition_value!: string;
    @Column() score_delta!: number;
    @Column() is_active!: boolean;
    @Column() display_order!: number;
    @Column() declare created_at: string;
    @Column() declare updated_at: string;
    @Column() declare deleted_at: string | undefined;
}
