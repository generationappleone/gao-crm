import { Controller, Get, Post, Put, Delete } from '@gao/http';
import type { GaoRequest, GaoResponse } from '@gao/http';
import { LandingPageService } from '../../services/landing-page.service.js';

const service = new LandingPageService();

@Controller('/api/landing-pages')
export class LandingPageApiController {
    @Get('/')
    async list(_req: GaoRequest, res: GaoResponse) {
        const pages = await service.list();
        return res.json(pages.map(p => p.toJSON()));
    }

    @Get('/:id')
    async get(req: GaoRequest, res: GaoResponse) {
        const page = await service.findById(req.params.id);
        if (!page) return res.error(404, 'NOT_FOUND', 'Landing page not found');
        return res.json(page.toJSON());
    }

    @Post('/')
    async create(req: GaoRequest, res: GaoResponse) {
        const body = req.body as Record<string, unknown>;
        const user = req.user as Record<string, unknown>;
        if (!body.title || !body.slug || !body.template) {
            return res.error(400, 'VALIDATION', 'title, slug, and template are required');
        }

        // Auto-populate default sections for quiz & survey templates
        let sections: string | undefined = body.sections as string | undefined;
        const template = body.template as string;

        if (!sections && template === 'quiz-leaderboard') {
            sections = JSON.stringify([
                { type: 'hero', title: body.title as string, subtitle: 'Test your knowledge and see how you rank!' },
                {
                    type: 'quiz', questions: [
                        { question: 'What is the capital of Indonesia?', options: ['Jakarta', 'Surabaya', 'Bandung', 'Bali'], correct: 0 },
                        { question: 'Which planet is closest to the Sun?', options: ['Venus', 'Mercury', 'Mars', 'Earth'], correct: 1 },
                        { question: 'What year did Indonesia gain independence?', options: ['1942', '1945', '1949', '1950'], correct: 1 },
                    ], collect_name: true, collect_email: true, show_leaderboard: true
                },
                { type: 'leaderboard', title: '🏆 Leaderboard', max_entries: 20 },
            ]);
        } else if (!sections && template === 'survey-form') {
            sections = JSON.stringify([
                { type: 'hero', title: body.title as string, subtitle: 'Help us improve by sharing your thoughts' },
                {
                    type: 'survey', questions: [
                        { type: 'text', label: 'What is your name?', required: true, placeholder: 'Your name' },
                        { type: 'email', label: 'Email address', required: true, placeholder: 'you@example.com' },
                        { type: 'radio', label: 'How did you hear about us?', options: ['Search Engine', 'Social Media', 'Friend/Referral', 'Advertisement', 'Other'], required: true },
                        { type: 'scale', label: 'How satisfied are you with our service?', min: 1, max: 5, min_label: 'Not satisfied', max_label: 'Very satisfied' },
                        { type: 'textarea', label: 'Any additional feedback?', required: false, placeholder: 'Share your thoughts...' },
                    ], success_message: 'Thank you for your feedback! 🙏'
                },
            ]);
        }

        const page = await service.create({
            title: body.title as string,
            slug: body.slug as string,
            template: template,
            description: body.description as string | undefined,
            sections: sections,
            seo_title: body.seo_title as string | undefined,
            seo_description: body.seo_description as string | undefined,
            chat_enabled: false,
            created_by: user?.id as string | undefined,
        });
        return res.json(page.toJSON());
    }

    @Put('/:id')
    async update(req: GaoRequest, res: GaoResponse) {
        const body = req.body as Record<string, unknown>;
        const page = await service.update(req.params.id, {
            title: body.title as string | undefined,
            slug: body.slug as string | undefined,
            description: body.description as string | undefined,
            seo_title: body.seo_title as string | undefined,
            seo_description: body.seo_description as string | undefined,
            custom_css: body.custom_css as string | undefined,
            chat_enabled: body.chat_enabled as boolean | undefined,
            status: body.status as 'draft' | 'published' | 'archived' | undefined,
        });
        if (!page) return res.error(404, 'NOT_FOUND', 'Landing page not found');
        return res.json(page.toJSON());
    }

    @Delete('/:id')
    async delete(req: GaoRequest, res: GaoResponse) {
        const ok = await service.delete(req.params.id);
        if (!ok) return res.error(404, 'NOT_FOUND', 'Landing page not found');
        return res.json({ deleted: true });
    }
}
