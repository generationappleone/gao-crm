import { Model, Table, Column } from '@gao/orm';

export type SurveyType = 'csat' | 'nps' | 'ces';

@Table('csat_surveys')
export class CsatSurvey extends Model {
    @Column() declare id: string;
    @Column() name!: string;
    @Column() type!: SurveyType;
    @Column() trigger_event!: string;
    @Column() question!: string;
    @Column() is_active!: boolean;
    @Column() total_responses!: number;
    @Column() average_score!: number;
    @Column() declare created_at: string;
    @Column() declare updated_at: string;
    @Column() declare deleted_at: string | undefined;
}
