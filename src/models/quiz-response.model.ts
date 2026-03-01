import { Model, Table, Column } from '@gao/orm';

@Table('quiz_responses')
export class QuizResponse extends Model {
    @Column() declare id: string;
    @Column() landing_page_id!: string;
    @Column() participant_name!: string;
    @Column() participant_email?: string;
    @Column() answers!: string; // JSONB
    @Column() score!: number;
    @Column() total_questions!: number;
    @Column() time_taken_ms?: number;
    @Column() declare created_at: string;
}
