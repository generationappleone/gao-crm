import { Model, Table, Column } from '@gao/orm';

export type CampaignRecipientStatus = 'pending' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'unsubscribed' | 'failed';

@Table('campaign_recipients')
export class CampaignRecipient extends Model {
    @Column() declare id: string;
    @Column() campaign_id!: string;
    @Column() contact_id!: string;
    @Column() email!: string;
    @Column() status!: CampaignRecipientStatus;
    @Column() sent_at?: string;
    @Column() opened_at?: string;
    @Column() clicked_at?: string;
    @Column() bounced_at?: string;
    @Column() unsubscribed_at?: string;
    @Column() open_count!: number;
    @Column() click_count!: number;
    @Column() declare created_at: string;
}
