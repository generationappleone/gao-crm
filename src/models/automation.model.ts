import { Model, Table, Column } from '@gao/orm';

export type AutomationTrigger = 'contact_created' | 'contact_updated' | 'deal_created' | 'deal_stage_changed' | 'deal_won' | 'deal_lost' | 'form_submitted' | 'email_opened' | 'email_clicked' | 'tag_added' | 'score_changed' | 'manual' | 'scheduled';
export type AutomationStatus = 'draft' | 'active' | 'paused' | 'archived';

@Table('automations')
export class Automation extends Model {
    @Column() declare id: string;
    @Column() name!: string;
    @Column() description?: string;
    @Column() owner_id!: string;
    @Column() trigger_type!: AutomationTrigger;
    @Column() trigger_config!: string; // JSONB
    @Column() status!: AutomationStatus;
    @Column() is_active!: boolean;
    @Column() total_runs!: number;
    @Column() total_successes!: number;
    @Column() total_failures!: number;
    @Column() last_run_at?: string;
    @Column() declare created_at: string;
    @Column() declare updated_at: string;
    @Column() declare deleted_at: string | undefined;
}
