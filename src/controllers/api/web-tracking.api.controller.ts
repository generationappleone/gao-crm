import { Controller, Get, Post } from '@gao/http';
import type { GaoRequest, GaoResponse } from '@gao/http';
import { WebTrackingService } from '../../services/web-tracking.service.js';
import type { WebTrackingEventType } from '../../models/web-tracking-event.model.js';

const service = new WebTrackingService();

@Controller('/api/tracking')
export class WebTrackingApiController {
    /**
     * POST /api/tracking/event — Track a web event (public endpoint)
     */
    @Post('/event')
    async trackEvent(req: GaoRequest, res: GaoResponse) {
        const body = req.body as Record<string, unknown>;
        if (!body.visitor_id || typeof body.visitor_id !== 'string') {
            return res.error(422, 'VALIDATION', 'visitor_id is required');
        }
        if (!body.event_type || typeof body.event_type !== 'string') {
            return res.error(422, 'VALIDATION', 'event_type is required');
        }

        const ip = req.header('x-forwarded-for') ?? '';
        const userAgent = req.header('user-agent') ?? '';

        const result = await service.track({
            visitor_id: body.visitor_id,
            event_type: body.event_type as WebTrackingEventType,
            page_url: body.page_url as string | undefined,
            page_title: body.page_title as string | undefined,
            element_id: body.element_id as string | undefined,
            element_text: body.element_text as string | undefined,
            custom_data: body.custom_data as Record<string, unknown> | undefined,
            ip_address: ip,
            user_agent: userAgent,
            referrer: body.referrer as string | undefined,
            utm_source: body.utm_source as string | undefined,
            utm_medium: body.utm_medium as string | undefined,
            utm_campaign: body.utm_campaign as string | undefined,
            utm_content: body.utm_content as string | undefined,
            utm_term: body.utm_term as string | undefined,
        });

        return res.json({ data: result });
    }

    /**
     * POST /api/tracking/identify — Link visitor to CRM contact
     */
    @Post('/identify')
    async identify(req: GaoRequest, res: GaoResponse) {
        const body = req.body as { visitor_id?: string; contact_id?: string };
        if (!body.visitor_id) return res.error(422, 'VALIDATION', 'visitor_id is required');
        if (!body.contact_id) return res.error(422, 'VALIDATION', 'contact_id is required');

        await service.identifyVisitor(body.visitor_id, body.contact_id);
        return res.json({ data: { identified: true } });
    }

    /**
     * GET /api/tracking/contacts/:contactId/sessions — Get contact web sessions
     */
    @Get('/contacts/:contactId/sessions')
    async contactSessions(req: GaoRequest, res: GaoResponse) {
        const sessions = await service.getContactSessions(req.params.contactId);
        return res.json({ data: sessions.map((s) => s.toJSON()) });
    }

    /**
     * GET /api/tracking/sessions/:sessionId/events — Get session events
     */
    @Get('/sessions/:sessionId/events')
    async sessionEvents(req: GaoRequest, res: GaoResponse) {
        const events = await service.getSessionEvents(req.params.sessionId);
        return res.json({ data: events.map((e) => e.toJSON()) });
    }

    /**
     * GET /api/tracking/analytics/pages — Top pages
     */
    @Get('/analytics/pages')
    async topPages(req: GaoRequest, res: GaoResponse) {
        const days = parseInt(req.query.days as string) || 30;
        const limit = parseInt(req.query.limit as string) || 20;
        const pages = await service.getTopPages(days, limit);
        return res.json({ data: pages });
    }
}
