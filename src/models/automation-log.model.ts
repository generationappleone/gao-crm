import { Model, Table, Column } from '@gao/orm';

export type AutomationLogStatus = 'started' | 'running' | 'success' | 'failed' | 'skipped';

@Table('automation_logs')
export class AutomationLog extends Model {
    @Column() declare id: string;
    @Column() automation_id!: string;
    @Column() step_id?: string;
    @Column() entity_type?: string;
    @Column() entity_id?: string;
    @Column() status!: AutomationLogStatus;
    @Column() input_data?: string; // JSONB
    @Column() output_data?: string; // JSONB
    @Column() error_message?: string;
    @Column() duration_ms?: number;
    @Column() declare created_at: string;
}
