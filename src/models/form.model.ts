import { Model, Table, Column } from '@gao/orm';

export type FormStatus = 'draft' | 'active' | 'paused' | 'archived';

@Table('forms')
export class Form extends Model {
    @Column() declare id: string;
    @Column() name!: string;
    @Column() slug!: string;
    @Column() description?: string;
    @Column() owner_id!: string;
    @Column() status!: FormStatus;
    @Column() redirect_url?: string;
    @Column() success_message?: string;
    @Column() notification_emails?: string;
    @Column() submit_button_text!: string;
    @Column() style_config?: string; // JSONB
    @Column() total_submissions!: number;
    @Column() declare created_at: string;
    @Column() declare updated_at: string;
    @Column() declare deleted_at: string | undefined;
}
