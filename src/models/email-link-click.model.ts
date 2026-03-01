import { Model, Table, Column } from '@gao/orm';

@Table('email_link_clicks')
export class EmailLinkClick extends Model {
    @Column() declare id: string;
    @Column() email_message_id!: string;
    @Column() original_url!: string;
    @Column() clicked_at!: string;
    @Column() ip_address?: string;
    @Column() user_agent?: string;
}
