import { Model, Table, Column } from '@gao/orm';

@Table('web_tracking_sessions')
export class WebTrackingSession extends Model {
    @Column() declare id: string;
    @Column() visitor_id!: string;
    @Column() contact_id?: string;
    @Column() ip_address?: string;
    @Column() user_agent?: string;
    @Column() referrer?: string;
    @Column() utm_source?: string;
    @Column() utm_medium?: string;
    @Column() utm_campaign?: string;
    @Column() utm_content?: string;
    @Column() utm_term?: string;
    @Column() country?: string;
    @Column() city?: string;
    @Column() device_type?: string;
    @Column() browser?: string;
    @Column() os?: string;
    @Column() total_pageviews!: number;
    @Column() total_events!: number;
    @Column() duration_seconds!: number;
    @Column() started_at!: string;
    @Column() last_activity_at!: string;
    @Column() declare created_at: string;
}
