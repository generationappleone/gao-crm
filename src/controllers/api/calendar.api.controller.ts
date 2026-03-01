import { Controller, Get, Post, Put, Patch, Delete } from '@gao/http';
import type { GaoRequest, GaoResponse } from '@gao/http';
import { CalendarService } from '../../services/calendar.service.js';
import type { CalendarEventStatus } from '../../models/calendar-event.model.js';
import type { RsvpStatus } from '../../models/calendar-event-attendee.model.js';

const service = new CalendarService();

@Controller('/api/calendar')
export class CalendarApiController {
    /**
     * GET /api/calendar/events?start=...&end=...
     */
    @Get('/events')
    async listEvents(req: GaoRequest, res: GaoResponse) {
        const ownerId = (req as any).user?.id as string | undefined;
        if (!ownerId) return res.error(401, 'UNAUTHORIZED', 'Authentication required');

        const start = req.query.start as string;
        const end = req.query.end as string;

        if (!start || !end) {
            return res.error(400, 'VALIDATION', 'start and end date parameters are required');
        }

        const events = await service.listEvents(ownerId, start, end);
        return res.json({ data: events.map((e) => e.toJSON()) });
    }

    /**
     * GET /api/calendar/events/upcoming — Next 7 day events
     */
    @Get('/events/upcoming')
    async upcoming(req: GaoRequest, res: GaoResponse) {
        const ownerId = (req as any).user?.id as string | undefined;
        if (!ownerId) return res.error(401, 'UNAUTHORIZED', 'Authentication required');

        const limit = parseInt(req.query.limit as string) || 5;
        const events = await service.getUpcoming(ownerId, limit);
        return res.json({ data: events.map((e) => e.toJSON()) });
    }

    /**
     * GET /api/calendar/events/:id — Single event with attendees
     */
    @Get('/events/:id')
    async show(req: GaoRequest, res: GaoResponse) {
        const result = await service.findById(req.params.id);
        if (!result) return res.error(404, 'NOT_FOUND', 'Event not found');

        return res.json({
            data: {
                ...result.event.toJSON(),
                attendees: result.attendees.map((a) => a.toJSON()),
            },
        });
    }

    /**
     * POST /api/calendar/events — Create event
     */
    @Post('/events')
    async create(req: GaoRequest, res: GaoResponse) {
        const ownerId = (req as any).user?.id as string | undefined;
        if (!ownerId) return res.error(401, 'UNAUTHORIZED', 'Authentication required');

        const body = req.body as Record<string, unknown>;
        if (!body.title || typeof body.title !== 'string') {
            return res.error(422, 'VALIDATION', 'title is required');
        }
        if (!body.start_at || typeof body.start_at !== 'string') {
            return res.error(422, 'VALIDATION', 'start_at is required');
        }
        if (!body.end_at || typeof body.end_at !== 'string') {
            return res.error(422, 'VALIDATION', 'end_at is required');
        }

        const result = await service.create({
            owner_id: ownerId,
            contact_id: body.contact_id as string | undefined,
            deal_id: body.deal_id as string | undefined,
            title: body.title,
            description: body.description as string | undefined,
            event_type: body.event_type as any,
            location: body.location as string | undefined,
            meeting_url: body.meeting_url as string | undefined,
            start_at: body.start_at,
            end_at: body.end_at,
            is_all_day: body.is_all_day as boolean | undefined,
            color: body.color as string | undefined,
            reminder_minutes: body.reminder_minutes as number | undefined,
            recurrence_rule: body.recurrence_rule as string | undefined,
            attendees: body.attendees as any[] | undefined,
        });

        return res.status(201).json({
            data: {
                ...result.event.toJSON(),
                attendees: result.attendees.map((a) => a.toJSON()),
            },
        });
    }

    /**
     * PUT /api/calendar/events/:id — Update event
     */
    @Put('/events/:id')
    async update(req: GaoRequest, res: GaoResponse) {
        const body = req.body as Record<string, unknown>;
        const event = await service.update(req.params.id, {
            title: body.title as string | undefined,
            description: body.description as string | undefined,
            event_type: body.event_type as any,
            location: body.location as string | undefined,
            meeting_url: body.meeting_url as string | undefined,
            start_at: body.start_at as string | undefined,
            end_at: body.end_at as string | undefined,
            is_all_day: body.is_all_day as boolean | undefined,
            color: body.color as string | undefined,
            reminder_minutes: body.reminder_minutes as number | undefined,
            contact_id: body.contact_id as string | undefined,
            deal_id: body.deal_id as string | undefined,
        });
        if (!event) return res.error(404, 'NOT_FOUND', 'Event not found');
        return res.json({ data: event.toJSON() });
    }

    /**
     * PATCH /api/calendar/events/:id/status — Update event status
     */
    @Patch('/events/:id/status')
    async updateStatus(req: GaoRequest, res: GaoResponse) {
        const body = req.body as { status?: string };
        const validStatuses = ['scheduled', 'confirmed', 'cancelled', 'completed'];
        if (!body.status || !validStatuses.includes(body.status)) {
            return res.error(422, 'VALIDATION', `status must be: ${validStatuses.join(', ')}`);
        }

        const event = await service.updateStatus(req.params.id, body.status as CalendarEventStatus);
        if (!event) return res.error(404, 'NOT_FOUND', 'Event not found');
        return res.json({ data: event.toJSON() });
    }

    /**
     * PATCH /api/calendar/attendees/:id/rsvp — Update attendee RSVP
     */
    @Patch('/attendees/:id/rsvp')
    async updateRsvp(req: GaoRequest, res: GaoResponse) {
        const body = req.body as { rsvp_status?: string };
        const validRsvp = ['pending', 'accepted', 'declined', 'tentative'];
        if (!body.rsvp_status || !validRsvp.includes(body.rsvp_status)) {
            return res.error(422, 'VALIDATION', `rsvp_status must be: ${validRsvp.join(', ')}`);
        }

        const attendee = await service.updateRsvp(req.params.id, body.rsvp_status as RsvpStatus);
        if (!attendee) return res.error(404, 'NOT_FOUND', 'Attendee not found');
        return res.json({ data: attendee.toJSON() });
    }

    /**
     * DELETE /api/calendar/events/:id — Delete event
     */
    @Delete('/events/:id')
    async destroy(req: GaoRequest, res: GaoResponse) {
        const deleted = await service.delete(req.params.id);
        if (!deleted) return res.error(404, 'NOT_FOUND', 'Event not found');
        return res.empty();
    }
}
