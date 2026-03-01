import { CalendarEvent, type CalendarEventType, type CalendarEventStatus } from '../models/calendar-event.model.js';
import { CalendarEventAttendee, type AttendeeType, type RsvpStatus } from '../models/calendar-event-attendee.model.js';

interface CreateEventInput {
    owner_id: string;
    contact_id?: string;
    deal_id?: string;
    title: string;
    description?: string;
    event_type?: CalendarEventType;
    location?: string;
    meeting_url?: string;
    start_at: string;
    end_at: string;
    is_all_day?: boolean;
    color?: string;
    reminder_minutes?: number;
    recurrence_rule?: string;
    attendees?: AttendeeInput[];
}

interface AttendeeInput {
    attendee_type: AttendeeType;
    user_id?: string;
    contact_id?: string;
    email?: string;
    name?: string;
}

interface EventWithAttendees {
    event: CalendarEvent;
    attendees: CalendarEventAttendee[];
}

export class CalendarService {
    /**
     * List events in a date range for a user.
     */
    async listEvents(ownerId: string, startDate: string, endDate: string): Promise<CalendarEvent[]> {
        return CalendarEvent
            .where('owner_id', ownerId)
            .where('deleted_at', 'IS', null)
            .where('start_at', '>=', startDate)
            .where('end_at', '<=', endDate)
            .orderBy('start_at', 'ASC')
            .get();
    }

    /**
     * Get a single event with attendees.
     */
    async findById(id: string): Promise<EventWithAttendees | null> {
        const event = await CalendarEvent.where('id', id).whereNull('deleted_at').first();
        if (!event) return null;

        const attendees = await CalendarEventAttendee.where('event_id', id).get();
        return { event, attendees };
    }

    /**
     * Create a calendar event with optional attendees.
     */
    async create(data: CreateEventInput): Promise<EventWithAttendees> {
        const event = await CalendarEvent.create({
            owner_id: data.owner_id,
            contact_id: data.contact_id,
            deal_id: data.deal_id,
            title: data.title,
            description: data.description,
            event_type: data.event_type ?? 'meeting',
            location: data.location,
            meeting_url: data.meeting_url,
            start_at: data.start_at,
            end_at: data.end_at,
            is_all_day: data.is_all_day ?? false,
            color: data.color,
            reminder_minutes: data.reminder_minutes,
            recurrence_rule: data.recurrence_rule,
            status: 'scheduled',
        });

        const attendees: CalendarEventAttendee[] = [];
        if (data.attendees) {
            for (const att of data.attendees) {
                const attendee = await CalendarEventAttendee.create({
                    event_id: event.id,
                    attendee_type: att.attendee_type,
                    user_id: att.user_id,
                    contact_id: att.contact_id,
                    email: att.email,
                    name: att.name,
                    rsvp_status: 'pending',
                });
                attendees.push(attendee);
            }
        }

        return { event, attendees };
    }

    /**
     * Update a calendar event.
     */
    async update(id: string, data: Partial<CreateEventInput>): Promise<CalendarEvent | null> {
        const event = await CalendarEvent.where('id', id).whereNull('deleted_at').first();
        if (!event) return null;

        if (data.title !== undefined) event.title = data.title;
        if (data.description !== undefined) event.description = data.description;
        if (data.event_type !== undefined) event.event_type = data.event_type;
        if (data.location !== undefined) event.location = data.location;
        if (data.meeting_url !== undefined) event.meeting_url = data.meeting_url;
        if (data.start_at !== undefined) event.start_at = data.start_at;
        if (data.end_at !== undefined) event.end_at = data.end_at;
        if (data.is_all_day !== undefined) event.is_all_day = data.is_all_day;
        if (data.color !== undefined) event.color = data.color;
        if (data.reminder_minutes !== undefined) event.reminder_minutes = data.reminder_minutes;
        if (data.contact_id !== undefined) event.contact_id = data.contact_id;
        if (data.deal_id !== undefined) event.deal_id = data.deal_id;

        await event.save();
        return event;
    }

    /**
     * Update event status.
     */
    async updateStatus(id: string, status: CalendarEventStatus): Promise<CalendarEvent | null> {
        const event = await CalendarEvent.where('id', id).whereNull('deleted_at').first();
        if (!event) return null;
        event.status = status;
        await event.save();
        return event;
    }

    /**
     * Update attendee RSVP status.
     */
    async updateRsvp(attendeeId: string, status: RsvpStatus): Promise<CalendarEventAttendee | null> {
        const attendee = await CalendarEventAttendee.where('id', attendeeId).first();
        if (!attendee) return null;
        attendee.rsvp_status = status;
        await attendee.save();
        return attendee;
    }

    /**
     * Delete a calendar event (soft delete).
     */
    async delete(id: string): Promise<boolean> {
        const event = await CalendarEvent.where('id', id).whereNull('deleted_at').first();
        if (!event) return false;
        await event.destroy();
        return true;
    }

    /**
     * Get upcoming events for a user (next 7 days).
     */
    async getUpcoming(ownerId: string, limit = 5): Promise<CalendarEvent[]> {
        const now = new Date().toISOString();
        const sevenDays = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
        return CalendarEvent
            .where('owner_id', ownerId)
            .where('deleted_at', 'IS', null)
            .where('start_at', '>=', now)
            .where('start_at', '<=', sevenDays)
            .where('status', '!=', 'cancelled')
            .orderBy('start_at', 'ASC')
            .limit(limit)
            .get();
    }
}
