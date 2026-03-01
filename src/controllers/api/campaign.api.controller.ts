import { Controller, Get, Post, Put, Patch, Delete } from '@gao/http';
import type { GaoRequest, GaoResponse } from '@gao/http';
import { CampaignService } from '../../services/campaign.service.js';
import type { CampaignStatus } from '../../models/campaign.model.js';

const service = new CampaignService();
const VALID_STATUSES = ['draft', 'scheduled', 'sending', 'sent', 'paused', 'cancelled'];

@Controller('/api/campaigns')
export class CampaignApiController {
    @Get('/')
    async list(req: GaoRequest, res: GaoResponse) {
        const ownerId = (req as any).user?.id as string | undefined;
        const status = req.query.status as string | undefined;
        const campaigns = await service.list(
            ownerId ?? undefined,
            status && VALID_STATUSES.includes(status) ? status as CampaignStatus : undefined
        );
        return res.json({ data: campaigns.map((c) => c.toJSON()) });
    }

    @Get('/:id')
    async show(req: GaoRequest, res: GaoResponse) {
        const campaign = await service.findById(req.params.id);
        if (!campaign) return res.error(404, 'NOT_FOUND', 'Campaign not found');
        return res.json({ data: campaign.toJSON() });
    }

    @Post('/')
    async create(req: GaoRequest, res: GaoResponse) {
        const ownerId = (req as any).user?.id as string | undefined;
        if (!ownerId) return res.error(401, 'UNAUTHORIZED', 'Authentication required');

        const body = req.body as Record<string, unknown>;
        if (!body.name || typeof body.name !== 'string') return res.error(422, 'VALIDATION', 'name is required');

        const campaign = await service.create({
            name: body.name,
            owner_id: ownerId,
            type: body.type as 'email' | 'sms' | 'whatsapp' | undefined,
            template_id: body.template_id as string | undefined,
            subject: body.subject as string | undefined,
            body_html: body.body_html as string | undefined,
            from_email: body.from_email as string | undefined,
            from_name: body.from_name as string | undefined,
            source: body.source as string | undefined,
            medium: body.medium as string | undefined,
            scheduled_at: body.scheduled_at as string | undefined,
        });
        return res.status(201).json({ data: campaign.toJSON() });
    }

    @Put('/:id')
    async update(req: GaoRequest, res: GaoResponse) {
        const body = req.body as Record<string, unknown>;
        const campaign = await service.update(req.params.id, body as any);
        if (!campaign) return res.error(400, 'UPDATE_FAILED', 'Cannot update (not found or not a draft)');
        return res.json({ data: campaign.toJSON() });
    }

    @Post('/:id/recipients')
    async addRecipients(req: GaoRequest, res: GaoResponse) {
        const body = req.body as { contact_ids?: string[] };
        if (!Array.isArray(body.contact_ids) || body.contact_ids.length === 0) {
            return res.error(422, 'VALIDATION', 'contact_ids array is required');
        }
        const added = await service.addRecipients(req.params.id, body.contact_ids);
        return res.json({ data: { added } });
    }

    @Get('/:id/recipients')
    async getRecipients(req: GaoRequest, res: GaoResponse) {
        const recipients = await service.getRecipients(req.params.id);
        return res.json({ data: recipients.map((r) => r.toJSON()) });
    }

    @Post('/:id/send')
    async send(req: GaoRequest, res: GaoResponse) {
        const campaign = await service.send(req.params.id);
        if (!campaign) return res.error(400, 'SEND_FAILED', 'Cannot send campaign');
        return res.json({ data: campaign.toJSON() });
    }

    @Patch('/:id/status')
    async updateStatus(req: GaoRequest, res: GaoResponse) {
        const body = req.body as { status?: string };
        if (!body.status || !VALID_STATUSES.includes(body.status)) {
            return res.error(422, 'VALIDATION', `status must be: ${VALID_STATUSES.join(', ')}`);
        }
        const campaign = await service.updateStatus(req.params.id, body.status as CampaignStatus);
        if (!campaign) return res.error(404, 'NOT_FOUND', 'Campaign not found');
        return res.json({ data: campaign.toJSON() });
    }

    @Get('/:id/analytics')
    async analytics(req: GaoRequest, res: GaoResponse) {
        const analytics = await service.getAnalytics(req.params.id);
        if (!analytics) return res.error(404, 'NOT_FOUND', 'Campaign not found');
        return res.json({ data: analytics });
    }

    @Delete('/:id')
    async destroy(req: GaoRequest, res: GaoResponse) {
        const deleted = await service.delete(req.params.id);
        if (!deleted) return res.error(404, 'NOT_FOUND', 'Campaign not found');
        return res.empty();
    }
}
