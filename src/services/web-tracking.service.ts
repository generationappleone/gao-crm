import { WebTrackingSession } from '../models/web-tracking-session.model.js';
import { WebTrackingEvent, type WebTrackingEventType } from '../models/web-tracking-event.model.js';

interface TrackEventInput {
    visitor_id: string;
    event_type: WebTrackingEventType;
    page_url?: string;
    page_title?: string;
    element_id?: string;
    element_text?: string;
    custom_data?: Record<string, unknown>;
    ip_address?: string;
    user_agent?: string;
    referrer?: string;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_content?: string;
    utm_term?: string;
}

export class WebTrackingService {
    /**
     * Track a web event. Automatically creates/resumes session.
     */
    async track(input: TrackEventInput): Promise<{ session_id: string; event_id: string }> {
        // Find or create session for this visitor
        let session = await WebTrackingSession
            .where('visitor_id', input.visitor_id)
            .orderBy('last_activity_at', 'DESC')
            .first();

        const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();

        // Create new session if none exists or last activity was 30+ min ago
        if (!session || session.last_activity_at < thirtyMinutesAgo) {
            session = await WebTrackingSession.create({
                visitor_id: input.visitor_id,
                ip_address: input.ip_address,
                user_agent: input.user_agent,
                referrer: input.referrer,
                utm_source: input.utm_source,
                utm_medium: input.utm_medium,
                utm_campaign: input.utm_campaign,
                utm_content: input.utm_content,
                utm_term: input.utm_term,
                total_pageviews: 0,
                total_events: 0,
                duration_seconds: 0,
                started_at: new Date().toISOString(),
                last_activity_at: new Date().toISOString(),
            });
        }

        // Create event
        const event = await WebTrackingEvent.create({
            session_id: session.id,
            event_type: input.event_type,
            page_url: input.page_url,
            page_title: input.page_title,
            element_id: input.element_id,
            element_text: input.element_text,
            custom_data: input.custom_data ? JSON.stringify(input.custom_data) : undefined,
        });

        // Update session counters
        session.total_events = (session.total_events || 0) + 1;
        if (input.event_type === 'pageview') {
            session.total_pageviews = (session.total_pageviews || 0) + 1;
        }
        session.last_activity_at = new Date().toISOString();

        // Calculate duration
        const started = new Date(session.started_at).getTime();
        session.duration_seconds = Math.floor((Date.now() - started) / 1000);

        await session.save();

        return { session_id: session.id, event_id: event.id };
    }

    /**
     * Link a visitor to a CRM contact (when they fill a form or log in).
     */
    async identifyVisitor(visitorId: string, contactId: string): Promise<void> {
        const sessions = await WebTrackingSession.where('visitor_id', visitorId).get();
        for (const session of sessions) {
            if (!session.contact_id) {
                session.contact_id = contactId;
                await session.save();
            }
        }
    }

    /**
     * Get sessions by contact.
     */
    async getContactSessions(contactId: string): Promise<WebTrackingSession[]> {
        return WebTrackingSession
            .where('contact_id', contactId)
            .orderBy('created_at', 'DESC')
            .limit(20)
            .get();
    }

    /**
     * Get events for a session.
     */
    async getSessionEvents(sessionId: string): Promise<WebTrackingEvent[]> {
        return WebTrackingEvent
            .where('session_id', sessionId)
            .orderBy('created_at', 'ASC')
            .get();
    }

    /**
     * Get page view stats (top pages).
     */
    async getTopPages(days = 30, limit = 20): Promise<Array<{ page_url: string; views: number }>> {
        // In production, this would use GROUP BY. For now, count in-app.
        const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
        const events = await WebTrackingEvent
            .where('event_type', 'pageview')
            .where('created_at', '>=', since)
            .get();

        const pageCounts = new Map<string, number>();
        for (const event of events) {
            if (event.page_url) {
                pageCounts.set(event.page_url, (pageCounts.get(event.page_url) || 0) + 1);
            }
        }

        return Array.from(pageCounts.entries())
            .map(([page_url, views]) => ({ page_url, views }))
            .sort((a, b) => b.views - a.views)
            .slice(0, limit);
    }

    /**
     * Get recent visitor sessions.
     */
    async getRecentVisitors(limit = 30): Promise<WebTrackingSession[]> {
        return WebTrackingSession
            .where('id', 'IS NOT', null)
            .orderBy('last_activity_at', 'DESC')
            .limit(limit)
            .get();
    }
}
