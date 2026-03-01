import { Model, Table, Column } from '@gao/orm';

export type CampaignStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'cancelled';

@Table('campaigns')
export class Campaign extends Model {
    @Column() declare id: string;
    @Column() name!: string;
    @Column() owner_id!: string;
    @Column() type!: 'email' | 'sms' | 'whatsapp';
    @Column() status!: CampaignStatus;
    @Column() template_id?: string;
    @Column() subject?: string;
    @Column() body_html?: string;
    @Column() from_email?: string;
    @Column() from_name?: string;
    @Column() source?: string;
    @Column() medium?: string;
    @Column() scheduled_at?: string;
    @Column() sent_at?: string;
    @Column() completed_at?: string;
    @Column() total_recipients!: number;
    @Column() total_sent!: number;
    @Column() total_opens!: number;
    @Column() total_clicks!: number;
    @Column() total_bounces!: number;
    @Column() total_unsubscribes!: number;
    @Column() declare created_at: string;
    @Column() declare updated_at: string;
    @Column() declare deleted_at: string | undefined;
}
