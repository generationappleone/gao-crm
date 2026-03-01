import { Model, Table, Column } from '@gao/orm';

export type WebTrackingEventType = 'pageview' | 'click' | 'scroll' | 'form_start' | 'form_submit' | 'video_play' | 'download' | 'outbound_click' | 'custom';

@Table('web_tracking_events')
export class WebTrackingEvent extends Model {
    @Column() declare id: string;
    @Column() session_id!: string;
    @Column() event_type!: WebTrackingEventType;
    @Column() page_url?: string;
    @Column() page_title?: string;
    @Column() element_id?: string;
    @Column() element_text?: string;
    @Column() custom_data?: string; // JSONB
    @Column() declare created_at: string;
}
