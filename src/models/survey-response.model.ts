import { Model, Table, Column } from '@gao/orm';

@Table('survey_responses')
export class SurveyResponse extends Model {
    @Column() declare id: string;
    @Column() landing_page_id!: string;
    @Column() respondent_name?: string;
    @Column() respondent_email?: string;
    @Column() answers!: string; // JSONB
    @Column() declare created_at: string;
}
