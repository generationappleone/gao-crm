import { Model, Table, Column } from '@gao/orm';

export type StepType = 'action' | 'condition' | 'delay' | 'branch';
export type ActionType = 'send_email' | 'create_task' | 'update_field' | 'add_tag' | 'remove_tag' | 'assign_owner' | 'move_deal_stage' | 'create_note' | 'send_notification' | 'webhook' | 'wait' | 'if_else' | 'score_adjust' | 'create_activity';

@Table('automation_steps')
export class AutomationStep extends Model {
    @Column() declare id: string;
    @Column() automation_id!: string;
    @Column() step_type!: StepType;
    @Column() action_type!: ActionType;
    @Column() action_config!: string; // JSONB
    @Column() delay_minutes!: number;
    @Column() condition_config?: string; // JSONB
    @Column() on_success_step_id?: string;
    @Column() on_failure_step_id?: string;
    @Column() display_order!: number;
    @Column() declare created_at: string;
    @Column() declare updated_at: string;
}
