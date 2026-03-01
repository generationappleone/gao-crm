import { Model, Table, Column } from '@gao/orm';

export type TicketStatus = 'open' | 'in_progress' | 'waiting' | 'resolved' | 'closed' | 'reopened';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TicketChannel = 'web' | 'email' | 'chat' | 'phone' | 'whatsapp' | 'api';

@Table('tickets')
export class Ticket extends Model {
    @Column() declare id: string;
    @Column() ticket_number!: string;
    @Column() contact_id?: string;
    @Column() company_id?: string;
    @Column() category_id?: string;
    @Column() assigned_to?: string;
    @Column() created_by!: string;
    @Column() subject!: string;
    @Column() description?: string;
    @Column() status!: TicketStatus;
    @Column() priority!: TicketPriority;
    @Column() channel!: TicketChannel;
    @Column() tags?: string;
    @Column() first_response_at?: string;
    @Column() resolved_at?: string;
    @Column() closed_at?: string;
    @Column() sla_deadline?: string;
    @Column() total_messages!: number;
    @Column() declare created_at: string;
    @Column() declare updated_at: string;
    @Column() declare deleted_at: string | undefined;
}
