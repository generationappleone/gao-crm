import { Controller, Get, Post, Put, Delete } from '@gao/http';
import type { GaoRequest, GaoResponse } from '@gao/http';
import { FormBuilderService } from '../../services/form-builder.service.js';

const service = new FormBuilderService();

@Controller('/api/forms')
export class FormApiController {
    @Get('/')
    async list(req: GaoRequest, res: GaoResponse) {
        const ownerId = (req as any).user?.id as string | undefined;
        const forms = await service.listForms(ownerId ?? undefined);
        return res.json({ data: forms.map((f) => f.toJSON()) });
    }

    @Get('/:id')
    async show(req: GaoRequest, res: GaoResponse) {
        const form = await service.findById(req.params.id);
        if (!form) return res.error(404, 'NOT_FOUND', 'Form not found');
        const fields = await service.getFields(form.id);
        return res.json({ data: { ...form.toJSON(), fields: fields.map((f) => f.toJSON()) } });
    }

    @Post('/')
    async create(req: GaoRequest, res: GaoResponse) {
        const ownerId = (req as any).user?.id as string | undefined;
        if (!ownerId) return res.error(401, 'UNAUTHORIZED', 'Authentication required');

        const body = req.body as Record<string, unknown>;
        if (!body.name || typeof body.name !== 'string') return res.error(422, 'VALIDATION', 'name is required');
        if (!body.slug || typeof body.slug !== 'string') return res.error(422, 'VALIDATION', 'slug is required');

        const form = await service.create({
            name: body.name,
            slug: body.slug,
            description: body.description as string | undefined,
            owner_id: ownerId,
            redirect_url: body.redirect_url as string | undefined,
            success_message: body.success_message as string | undefined,
            notification_emails: body.notification_emails as string | undefined,
            submit_button_text: body.submit_button_text as string | undefined,
            style_config: body.style_config as Record<string, unknown> | undefined,
        });
        return res.status(201).json({ data: form.toJSON() });
    }

    @Put('/:id')
    async update(req: GaoRequest, res: GaoResponse) {
        const body = req.body as Record<string, unknown>;
        const form = await service.update(req.params.id, body as any);
        if (!form) return res.error(404, 'NOT_FOUND', 'Form not found');
        return res.json({ data: form.toJSON() });
    }

    @Put('/:id/fields')
    async setFields(req: GaoRequest, res: GaoResponse) {
        const body = req.body as { fields?: unknown[] };
        if (!Array.isArray(body.fields)) return res.error(422, 'VALIDATION', 'fields array is required');

        const fields = await service.setFields(req.params.id, body.fields as any);
        return res.json({ data: fields.map((f) => f.toJSON()) });
    }

    @Delete('/:id')
    async destroy(req: GaoRequest, res: GaoResponse) {
        const deleted = await service.delete(req.params.id);
        if (!deleted) return res.error(404, 'NOT_FOUND', 'Form not found');
        return res.empty();
    }

    // ─── Public Submission Endpoint ─────────────────
    @Post('/:id/submit')
    async submit(req: GaoRequest, res: GaoResponse) {
        const body = req.body as Record<string, unknown>;
        const ip = req.header('x-forwarded-for') ?? '';
        const userAgent = req.header('user-agent') ?? '';

        try {
            const submission = await service.submit(req.params.id, {
                data: body.data as Record<string, unknown> ?? body,
                ip_address: ip,
                user_agent: userAgent,
                referrer: body.referrer as string | undefined,
                utm_source: body.utm_source as string | undefined,
                utm_medium: body.utm_medium as string | undefined,
                utm_campaign: body.utm_campaign as string | undefined,
            });
            return res.status(201).json({ data: { id: submission.id } });
        } catch {
            return res.error(400, 'SUBMIT_FAILED', 'Form is not active or not found');
        }
    }

    @Get('/:id/submissions')
    async listSubmissions(req: GaoRequest, res: GaoResponse) {
        const submissions = await service.listSubmissions(req.params.id);
        return res.json({ data: submissions.map((s) => s.toJSON()) });
    }

    @Get('/:id/embed')
    async embedSnippet(req: GaoRequest, res: GaoResponse) {
        const form = await service.findById(req.params.id);
        if (!form) return res.error(404, 'NOT_FOUND', 'Form not found');
        const baseUrl = req.header('origin') ?? 'https://yourdomain.com';
        const snippet = service.generateEmbedSnippet(form.slug, baseUrl);
        return res.json({ data: { snippet } });
    }
}
