import { Model, Table, Column } from '@gao/orm';

export type TicketMessageSender = 'agent' | 'contact' | 'system';

@Table('ticket_messages')
export class TicketMessage extends Model {
    @Column() declare id: string;
    @Column() ticket_id!: string;
    @Column() sender_type!: TicketMessageSender;
    @Column() sender_id?: string;
    @Column() content!: string;
    @Column() is_internal!: boolean;
    @Column() attachments?: string; // JSONB
    @Column() declare created_at: string;
}
