import { Model, Table, Column } from '@gao/orm';

export type EmailMessageStatus = 'draft' | 'queued' | 'sent' | 'delivered' | 'bounced' | 'failed';

@Table('email_messages')
export class EmailMessage extends Model {
    @Column() declare id: string;
    @Column() contact_id?: string;
    @Column() deal_id?: string;
    @Column() owner_id!: string;
    @Column() template_id?: string;
    @Column() from_email!: string;
    @Column() to_email!: string;
    @Column() cc?: string;
    @Column() bcc?: string;
    @Column() subject!: string;
    @Column() body_html!: string;
    @Column() status!: EmailMessageStatus;
    @Column() tracking_id?: string;
    @Column() opened_at?: string;
    @Column() open_count!: number;
    @Column() clicked_at?: string;
    @Column() click_count!: number;
    @Column() sent_at?: string;
    @Column() scheduled_at?: string;
    @Column() declare created_at: string;
    @Column() declare updated_at: string;
    @Column() declare deleted_at: string | undefined;
}
