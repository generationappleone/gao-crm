import { Controller, Get, Post, Patch, Delete } from '@gao/http';
import type { GaoRequest, GaoResponse } from '@gao/http';
import { TicketService } from '../../services/ticket.service.js';
import type { TicketStatus, TicketPriority } from '../../models/ticket.model.js';

const service = new TicketService();

@Controller('/api/tickets')
export class TicketApiController {
    @Get('/categories')
    async categories(_req: GaoRequest, res: GaoResponse) {
        const cats = await service.listCategories();
        return res.json({ data: cats.map((c) => c.toJSON()) });
    }

    @Post('/categories')
    async createCategory(req: GaoRequest, res: GaoResponse) {
        const body = req.body as Record<string, unknown>;
        if (!body.name || !body.slug) return res.error(422, 'VALIDATION', 'name and slug are required');
        const cat = await service.createCategory(body as any);
        return res.status(201).json({ data: cat.toJSON() });
    }

    @Get('/')
    async list(req: GaoRequest, res: GaoResponse) {
        const status = req.query.status as TicketStatus | undefined;
        const priority = req.query.priority as TicketPriority | undefined;
        const assigned = req.query.assigned_to as string | undefined;
        const tickets = await service.list({ status, priority, assigned_to: assigned });
        return res.json({ data: tickets.map((t) => t.toJSON()) });
    }

    @Get('/stats')
    async stats(_req: GaoRequest, res: GaoResponse) {
        const stats = await service.getStats();
        return res.json({ data: stats });
    }

    @Get('/:id')
    async show(req: GaoRequest, res: GaoResponse) {
        const ticket = await service.findById(req.params.id);
        if (!ticket) return res.error(404, 'NOT_FOUND', 'Ticket not found');
        return res.json({ data: ticket.toJSON() });
    }

    @Post('/')
    async create(req: GaoRequest, res: GaoResponse) {
        const userId = (req as any).user?.id as string | undefined;
        if (!userId) return res.error(401, 'UNAUTHORIZED', 'Authentication required');

        const body = req.body as Record<string, unknown>;
        if (!body.subject || typeof body.subject !== 'string') return res.error(422, 'VALIDATION', 'subject is required');

        const ticket = await service.create({
            contact_id: body.contact_id as string | undefined,
            company_id: body.company_id as string | undefined,
            category_id: body.category_id as string | undefined,
            assigned_to: body.assigned_to as string | undefined,
            created_by: userId,
            subject: body.subject,
            description: body.description as string | undefined,
            priority: body.priority as any,
            channel: body.channel as any,
            tags: body.tags as string | undefined,
            sla_deadline: body.sla_deadline as string | undefined,
        });
        return res.status(201).json({ data: ticket.toJSON() });
    }

    @Patch('/:id/status')
    async updateStatus(req: GaoRequest, res: GaoResponse) {
        const body = req.body as { status?: string };
        if (!body.status) return res.error(422, 'VALIDATION', 'status is required');
        const ticket = await service.updateStatus(req.params.id, body.status as TicketStatus);
        if (!ticket) return res.error(404, 'NOT_FOUND', 'Ticket not found');
        return res.json({ data: ticket.toJSON() });
    }

    @Patch('/:id/assign')
    async assign(req: GaoRequest, res: GaoResponse) {
        const body = req.body as { user_id?: string };
        if (!body.user_id) return res.error(422, 'VALIDATION', 'user_id is required');
        const ticket = await service.assign(req.params.id, body.user_id);
        if (!ticket) return res.error(404, 'NOT_FOUND', 'Ticket not found');
        return res.json({ data: ticket.toJSON() });
    }

    @Get('/:id/messages')
    async messages(req: GaoRequest, res: GaoResponse) {
        const includeInternal = req.query.internal === 'true';
        const messages = await service.getMessages(req.params.id, includeInternal);
        return res.json({ data: messages.map((m) => m.toJSON()) });
    }

    @Post('/:id/messages')
    async reply(req: GaoRequest, res: GaoResponse) {
        const userId = (req as any).user?.id as string | undefined;
        const body = req.body as Record<string, unknown>;
        if (!body.content || typeof body.content !== 'string') return res.error(422, 'VALIDATION', 'content is required');

        const message = await service.reply({
            ticket_id: req.params.id,
            sender_type: (body.sender_type as any) ?? 'agent',
            sender_id: userId,
            content: body.content,
            is_internal: body.is_internal === true,
        });
        return res.status(201).json({ data: message.toJSON() });
    }

    @Delete('/:id')
    async destroy(req: GaoRequest, res: GaoResponse) {
        const deleted = await service.delete(req.params.id);
        if (!deleted) return res.error(404, 'NOT_FOUND', 'Ticket not found');
        return res.empty();
    }
}
