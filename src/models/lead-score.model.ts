import { Model, Table, Column } from '@gao/orm';

export type LeadGrade = 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F';

@Table('lead_scores')
export class LeadScore extends Model {
    @Column() declare id: string;
    @Column() entity_type!: 'contact' | 'company' | 'deal';
    @Column() entity_id!: string;
    @Column() total_score!: number;
    @Column() demographic_score!: number;
    @Column() behavioral_score!: number;
    @Column() engagement_score!: number;
    @Column() grade?: LeadGrade;
    @Column() last_calculated_at!: string;
    @Column() score_breakdown?: string; // JSONB
    @Column() declare created_at: string;
    @Column() declare updated_at: string;
}
