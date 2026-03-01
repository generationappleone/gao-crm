import { Controller, Get, Post, Put, Delete } from '@gao/http';
import type { GaoRequest, GaoResponse } from '@gao/http';
import { EmailHubService } from '../../services/email-hub.service.js';

const service = new EmailHubService();

@Controller('/api/email')
export class EmailApiController {
    /**
     * GET /api/email/templates — List email templates
     */
    @Get('/templates')
    async listTemplates(req: GaoRequest, res: GaoResponse) {
        const ownerId = (req as any).user?.id as string | undefined;
        if (!ownerId) return res.error(401, 'UNAUTHORIZED', 'Authentication required');
        const templates = await service.listTemplates(ownerId);
        return res.json({ data: templates.map((t) => t.toJSON()) });
    }

    /**
     * POST /api/email/templates — Create email template
     */
    @Post('/templates')
    async createTemplate(req: GaoRequest, res: GaoResponse) {
        const ownerId = (req as any).user?.id as string | undefined;
        if (!ownerId) return res.error(401, 'UNAUTHORIZED', 'Authentication required');

        const body = req.body as Record<string, unknown>;
        if (!body.name || typeof body.name !== 'string') {
            return res.error(422, 'VALIDATION', 'name is required');
        }
        if (!body.subject || typeof body.subject !== 'string') {
            return res.error(422, 'VALIDATION', 'subject is required');
        }
        if (!body.body_html || typeof body.body_html !== 'string') {
            return res.error(422, 'VALIDATION', 'body_html is required');
        }

        const template = await service.createTemplate({
            name: body.name,
            subject: body.subject,
            body_html: body.body_html,
            body_text: body.body_text as string | undefined,
            category: body.category as string | undefined,
            owner_id: ownerId,
            is_shared: body.is_shared as boolean | undefined,
            variables: body.variables as string[] | undefined,
        });

        return res.status(201).json({ data: template.toJSON() });
    }

    /**
     * PUT /api/email/templates/:id — Update email template
     */
    @Put('/templates/:id')
    async updateTemplate(req: GaoRequest, res: GaoResponse) {
        const body = req.body as Record<string, unknown>;
        const template = await service.updateTemplate(req.params.id, {
            name: body.name as string | undefined,
            subject: body.subject as string | undefined,
            body_html: body.body_html as string | undefined,
            body_text: body.body_text as string | undefined,
            category: body.category as string | undefined,
            is_shared: body.is_shared as boolean | undefined,
            variables: body.variables as string[] | undefined,
        });
        if (!template) return res.error(404, 'NOT_FOUND', 'Template not found');
        return res.json({ data: template.toJSON() });
    }

    /**
     * DELETE /api/email/templates/:id — Delete email template
     */
    @Delete('/templates/:id')
    async deleteTemplate(req: GaoRequest, res: GaoResponse) {
        const deleted = await service.deleteTemplate(req.params.id);
        if (!deleted) return res.error(404, 'NOT_FOUND', 'Template not found');
        return res.empty();
    }

    /**
     * GET /api/email/messages — List email messages
     */
    @Get('/messages')
    async listMessages(req: GaoRequest, res: GaoResponse) {
        const ownerId = (req as any).user?.id as string | undefined;
        if (!ownerId) return res.error(401, 'UNAUTHORIZED', 'Authentication required');
        const status = req.query.status as string | undefined;
        const messages = await service.listMessages(ownerId, status as 'draft' | 'sent' | undefined);
        return res.json({ data: messages.map((m) => m.toJSON()) });
    }

    /**
     * POST /api/email/messages — Compose new email
     */
    @Post('/messages')
    async compose(req: GaoRequest, res: GaoResponse) {
        const ownerId = (req as any).user?.id as string | undefined;
        if (!ownerId) return res.error(401, 'UNAUTHORIZED', 'Authentication required');

        const body = req.body as Record<string, unknown>;
        if (!body.to_email || typeof body.to_email !== 'string') {
            return res.error(422, 'VALIDATION', 'to_email is required');
        }
        if (!body.subject || typeof body.subject !== 'string') {
            return res.error(422, 'VALIDATION', 'subject is required');
        }
        if (!body.body_html || typeof body.body_html !== 'string') {
            return res.error(422, 'VALIDATION', 'body_html is required');
        }

        const message = await service.composeEmail({
            contact_id: body.contact_id as string | undefined,
            deal_id: body.deal_id as string | undefined,
            owner_id: ownerId,
            template_id: body.template_id as string | undefined,
            from_email: (body.from_email as string) || 'noreply@gaocrm.local',
            to_email: body.to_email,
            cc: body.cc as string | undefined,
            bcc: body.bcc as string | undefined,
            subject: body.subject,
            body_html: body.body_html,
            scheduled_at: body.scheduled_at as string | undefined,
        });

        return res.status(201).json({ data: message.toJSON() });
    }

    /**
     * POST /api/email/messages/:id/send — Send email
     */
    @Post('/messages/:id/send')
    async send(req: GaoRequest, res: GaoResponse) {
        const message = await service.sendEmail(req.params.id);
        if (!message) return res.error(400, 'SEND_FAILED', 'Cannot send this message');
        return res.json({ data: message.toJSON() });
    }

    /**
     * GET /api/email/messages/:id — Get single message
     */
    @Get('/messages/:id')
    async getMessage(req: GaoRequest, res: GaoResponse) {
        const message = await service.getMessage(req.params.id);
        if (!message) return res.error(404, 'NOT_FOUND', 'Message not found');
        return res.json({ data: message.toJSON() });
    }

    /**
     * DELETE /api/email/messages/:id — Delete message
     */
    @Delete('/messages/:id')
    async deleteMessage(req: GaoRequest, res: GaoResponse) {
        const deleted = await service.deleteMessage(req.params.id);
        if (!deleted) return res.error(404, 'NOT_FOUND', 'Message not found');
        return res.empty();
    }

    /**
     * GET /api/email/track/open/:trackingId — Tracking pixel endpoint (1x1 transparent GIF)
     */
    @Get('/track/open/:trackingId')
    async trackOpen(req: GaoRequest, res: GaoResponse) {
        await service.trackOpen(req.params.trackingId);
        // Return 1x1 transparent GIF
        const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
        const stream = new ReadableStream({
            start(controller) {
                controller.enqueue(pixel);
                controller.close();
            },
        });
        return res.header('Cache-Control', 'no-store, no-cache, must-revalidate')
            .stream(stream, 'image/gif');
    }

    /**
     * GET /api/email/track/click/:trackingId — Link click redirect
     */
    @Get('/track/click/:trackingId')
    async trackClick(req: GaoRequest, res: GaoResponse) {
        const url = req.query.url as string;
        if (!url) return res.error(400, 'VALIDATION', 'url query parameter is required');

        const ip = req.header('x-forwarded-for') ?? '';
        const userAgent = req.header('user-agent') ?? '';

        await service.trackClick(req.params.trackingId, url, ip, userAgent);
        return res.redirect(url);
    }
}
