import { Ticket, type TicketStatus, type TicketPriority, type TicketChannel } from '../models/ticket.model.js';
import { TicketMessage, type TicketMessageSender } from '../models/ticket-message.model.js';
import { TicketCategory } from '../models/ticket-category.model.js';

interface CreateTicketInput {
    contact_id?: string;
    company_id?: string;
    category_id?: string;
    assigned_to?: string;
    created_by: string;
    subject: string;
    description?: string;
    priority?: TicketPriority;
    channel?: TicketChannel;
    tags?: string;
    sla_deadline?: string;
}

interface ReplyInput {
    ticket_id: string;
    sender_type: TicketMessageSender;
    sender_id?: string;
    content: string;
    is_internal?: boolean;
    attachments?: unknown[];
}

export class TicketService {
    // ─── Categories ────────────────────────────────
    async listCategories(): Promise<TicketCategory[]> {
        return TicketCategory.where('deleted_at', 'IS', null).where('is_active', true).orderBy('display_order', 'ASC').get();
    }

    async createCategory(data: { name: string; slug: string; description?: string; color?: string }): Promise<TicketCategory> {
        return TicketCategory.create({
            name: data.name,
            slug: data.slug,
            description: data.description,
            color: data.color ?? '#6366f1',
            display_order: 0,
            is_active: true,
        });
    }

    // ─── Tickets ───────────────────────────────────
    async list(filters?: { status?: TicketStatus; priority?: TicketPriority; assigned_to?: string }): Promise<Ticket[]> {
        let query = Ticket.where('deleted_at', 'IS', null);
        if (filters?.status) query = query.where('status', filters.status);
        if (filters?.priority) query = query.where('priority', filters.priority);
        if (filters?.assigned_to) query = query.where('assigned_to', filters.assigned_to);
        return query.orderBy('created_at', 'DESC').get();
    }

    async findById(id: string): Promise<Ticket | null> {
        return Ticket.where('id', id).whereNull('deleted_at').first() ?? null;
    }

    async create(data: CreateTicketInput): Promise<Ticket> {
        const rand = crypto.randomUUID().slice(0, 4).toUpperCase();
        const ticketNumber = `TKT-${Date.now().toString(36).toUpperCase()}-${rand}`;

        return Ticket.create({
            ticket_number: ticketNumber,
            contact_id: data.contact_id,
            company_id: data.company_id,
            category_id: data.category_id,
            assigned_to: data.assigned_to,
            created_by: data.created_by,
            subject: data.subject,
            description: data.description,
            status: 'open',
            priority: data.priority ?? 'medium',
            channel: data.channel ?? 'web',
            tags: data.tags,
            sla_deadline: data.sla_deadline,
            total_messages: 0,
        });
    }

    async updateStatus(id: string, status: TicketStatus): Promise<Ticket | null> {
        const ticket = await Ticket.where('id', id).whereNull('deleted_at').first();
        if (!ticket) return null;

        ticket.status = status;
        if (status === 'resolved') ticket.resolved_at = new Date().toISOString();
        if (status === 'closed') ticket.closed_at = new Date().toISOString();

        await ticket.save();
        return ticket;
    }

    async assign(id: string, userId: string): Promise<Ticket | null> {
        const ticket = await Ticket.where('id', id).whereNull('deleted_at').first();
        if (!ticket) return null;
        ticket.assigned_to = userId;
        if (ticket.status === 'open') ticket.status = 'in_progress';
        await ticket.save();
        return ticket;
    }

    async delete(id: string): Promise<boolean> {
        const ticket = await Ticket.where('id', id).whereNull('deleted_at').first();
        if (!ticket) return false;
        await ticket.destroy();
        return true;
    }

    // ─── Messages ──────────────────────────────────
    async getMessages(ticketId: string, includeInternal = false): Promise<TicketMessage[]> {
        let query = TicketMessage.where('ticket_id', ticketId);
        if (!includeInternal) query = query.where('is_internal', false);
        return query.orderBy('created_at', 'ASC').get();
    }

    async reply(data: ReplyInput): Promise<TicketMessage> {
        const message = await TicketMessage.create({
            ticket_id: data.ticket_id,
            sender_type: data.sender_type,
            sender_id: data.sender_id,
            content: data.content,
            is_internal: data.is_internal ?? false,
            attachments: data.attachments ? JSON.stringify(data.attachments) : undefined,
        });

        // Update ticket counters and first response
        const ticket = await Ticket.where('id', data.ticket_id).first();
        if (ticket) {
            ticket.total_messages = (ticket.total_messages || 0) + 1;
            if (!ticket.first_response_at && data.sender_type === 'agent') {
                ticket.first_response_at = new Date().toISOString();
            }
            await ticket.save();
        }

        return message;
    }

    // ─── Stats ─────────────────────────────────────
    async getStats(): Promise<Record<string, number>> {
        const all = await Ticket.where('deleted_at', 'IS', null).get();
        const open = all.filter((t) => t.status === 'open' || t.status === 'in_progress' || t.status === 'reopened').length;
        const waiting = all.filter((t) => t.status === 'waiting').length;
        const resolved = all.filter((t) => t.status === 'resolved' || t.status === 'closed').length;
        const urgent = all.filter((t) => t.priority === 'urgent' && t.status !== 'closed' && t.status !== 'resolved').length;

        return { total: all.length, open, waiting, resolved, urgent };
    }
}
