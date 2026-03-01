import { Controller, Get, Post, Put, Delete } from '@gao/http';
import type { GaoRequest, GaoResponse } from '@gao/http';
import { CsatService } from '../../services/csat.service.js';

const service = new CsatService();

@Controller('/api/csat')
export class CsatApiController {
    @Get('/surveys')
    async listSurveys(_req: GaoRequest, res: GaoResponse) {
        const surveys = await service.listSurveys();
        return res.json({ data: surveys.map((s) => s.toJSON()) });
    }

    @Get('/surveys/:id')
    async showSurvey(req: GaoRequest, res: GaoResponse) {
        const survey = await service.findById(req.params.id);
        if (!survey) return res.error(404, 'NOT_FOUND', 'Survey not found');
        return res.json({ data: survey.toJSON() });
    }

    @Post('/surveys')
    async createSurvey(req: GaoRequest, res: GaoResponse) {
        const body = req.body as Record<string, unknown>;
        if (!body.name || typeof body.name !== 'string') return res.error(422, 'VALIDATION', 'name is required');
        const survey = await service.createSurvey(body as any);
        return res.status(201).json({ data: survey.toJSON() });
    }

    @Put('/surveys/:id')
    async updateSurvey(req: GaoRequest, res: GaoResponse) {
        const body = req.body as Record<string, unknown>;
        const survey = await service.updateSurvey(req.params.id, body as any);
        if (!survey) return res.error(404, 'NOT_FOUND', 'Survey not found');
        return res.json({ data: survey.toJSON() });
    }

    @Delete('/surveys/:id')
    async deleteSurvey(req: GaoRequest, res: GaoResponse) {
        const deleted = await service.deleteSurvey(req.params.id);
        if (!deleted) return res.error(404, 'NOT_FOUND', 'Survey not found');
        return res.empty();
    }

    // ─── Responses (public endpoint) ────────────────
    @Post('/surveys/:id/respond')
    async respond(req: GaoRequest, res: GaoResponse) {
        const body = req.body as Record<string, unknown>;
        if (body.score === undefined || typeof body.score !== 'number') {
            return res.error(422, 'VALIDATION', 'score is required (0-10)');
        }

        const response = await service.submitResponse({
            survey_id: req.params.id,
            contact_id: body.contact_id as string | undefined,
            ticket_id: body.ticket_id as string | undefined,
            chat_session_id: body.chat_session_id as string | undefined,
            score: body.score,
            comment: body.comment as string | undefined,
        });
        return res.status(201).json({ data: response.toJSON() });
    }

    @Get('/surveys/:id/responses')
    async responses(req: GaoRequest, res: GaoResponse) {
        const responses = await service.getResponses(req.params.id);
        return res.json({ data: responses.map((r) => r.toJSON()) });
    }

    @Get('/surveys/:id/analytics')
    async analytics(req: GaoRequest, res: GaoResponse) {
        const analytics = await service.getAnalytics(req.params.id);
        return res.json({ data: analytics });
    }
}
