import { Model, Table, Column } from '@gao/orm';

@Table('csat_responses')
export class CsatResponse extends Model {
    @Column() declare id: string;
    @Column() survey_id!: string;
    @Column() contact_id?: string;
    @Column() ticket_id?: string;
    @Column() chat_session_id?: string;
    @Column() score!: number;
    @Column() comment?: string;
    @Column() declare created_at: string;
}
