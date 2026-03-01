import { Model, Table, Column } from '@gao/orm';

export type LiveChatStatus = 'waiting' | 'active' | 'transferred' | 'ended' | 'missed';

@Table('live_chat_sessions')
export class LiveChatSession extends Model {
    @Column() declare id: string;
    @Column() visitor_id!: string;
    @Column() contact_id?: string;
    @Column() assigned_to?: string;
    @Column() status!: LiveChatStatus;
    @Column() channel!: string;
    @Column() visitor_name?: string;
    @Column() visitor_email?: string;
    @Column() visitor_ip?: string;
    @Column() visitor_user_agent?: string;
    @Column() page_url?: string;
    @Column() total_messages!: number;
    @Column() rating?: number;
    @Column() feedback?: string;
    @Column() started_at!: string;
    @Column() first_response_at?: string;
    @Column() ended_at?: string;
    @Column() declare created_at: string;
}
