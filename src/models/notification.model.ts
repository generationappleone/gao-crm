import { Model, Table, Column } from '@gao/orm';

export type NotificationType = 'deal_assigned' | 'deal_won' | 'deal_lost' | 'ticket_assigned' | 'ticket_reply' | 'chat_waiting' | 'mention' | 'task_due' | 'form_submitted' | 'campaign_completed' | 'system' | 'custom';

@Table('notifications')
export class Notification extends Model {
    @Column() declare id: string;
    @Column() user_id!: string;
    @Column() type!: NotificationType;
    @Column() title!: string;
    @Column() message?: string;
    @Column() entity_type?: string;
    @Column() entity_id?: string;
    @Column() action_url?: string;
    @Column() is_read!: boolean;
    @Column() read_at?: string;
    @Column() declare created_at: string;
}
