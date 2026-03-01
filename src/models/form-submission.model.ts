import { Model, Table, Column } from '@gao/orm';

@Table('form_submissions')
export class FormSubmission extends Model {
    @Column() declare id: string;
    @Column() form_id!: string;
    @Column() contact_id?: string;
    @Column() data!: string; // JSONB
    @Column() ip_address?: string;
    @Column() user_agent?: string;
    @Column() referrer?: string;
    @Column() utm_source?: string;
    @Column() utm_medium?: string;
    @Column() utm_campaign?: string;
    @Column() declare created_at: string;
}
