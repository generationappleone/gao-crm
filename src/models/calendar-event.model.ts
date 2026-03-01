import { Model, Table, Column } from '@gao/orm';

export type CalendarEventType = 'meeting' | 'call' | 'task' | 'deadline' | 'follow_up' | 'demo' | 'other';
export type CalendarEventStatus = 'scheduled' | 'confirmed' | 'cancelled' | 'completed';

@Table('calendar_events')
export class CalendarEvent extends Model {
    @Column() declare id: string;
    @Column() owner_id!: string;
    @Column() contact_id?: string;
    @Column() deal_id?: string;
    @Column() title!: string;
    @Column() description?: string;
    @Column() event_type!: CalendarEventType;
    @Column() location?: string;
    @Column() meeting_url?: string;
    @Column() start_at!: string;
    @Column() end_at!: string;
    @Column() is_all_day!: boolean;
    @Column() color?: string;
    @Column() reminder_minutes?: number;
    @Column() recurrence_rule?: string;
    @Column() status!: CalendarEventStatus;
    @Column() declare created_at: string;
    @Column() declare updated_at: string;
    @Column() declare deleted_at: string | undefined;
}
