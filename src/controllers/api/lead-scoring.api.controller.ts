import { Controller, Get, Post, Put, Delete } from '@gao/http';
import type { GaoRequest, GaoResponse } from '@gao/http';
import { LeadScoringService } from '../../services/lead-scoring.service.js';

const service = new LeadScoringService();

@Controller('/api/scoring')
export class LeadScoringApiController {
    // ─── Rules ──────────────────────────────────────
    @Get('/rules')
    async listRules(req: GaoRequest, res: GaoResponse) {
        const entityType = req.query.entity_type as string | undefined;
        const rules = await service.listRules(entityType);
        return res.json({ data: rules.map((r) => r.toJSON()) });
    }

    @Post('/rules')
    async createRule(req: GaoRequest, res: GaoResponse) {
        const body = req.body as Record<string, unknown>;
        if (!body.name || typeof body.name !== 'string') return res.error(422, 'VALIDATION', 'name is required');
        if (!body.category || typeof body.category !== 'string') return res.error(422, 'VALIDATION', 'category is required');
        if (!body.condition_field || typeof body.condition_field !== 'string') return res.error(422, 'VALIDATION', 'condition_field is required');

        const rule = await service.createRule({
            name: body.name,
            description: body.description as string | undefined,
            entity_type: body.entity_type as 'contact' | 'company' | 'deal' | undefined,
            category: body.category as any,
            condition_field: body.condition_field,
            condition_operator: (body.condition_operator as string) ?? 'equals',
            condition_value: String(body.condition_value ?? ''),
            score_delta: Number(body.score_delta ?? 0),
        });
        return res.status(201).json({ data: rule.toJSON() });
    }

    @Put('/rules/:id')
    async updateRule(req: GaoRequest, res: GaoResponse) {
        const body = req.body as Record<string, unknown>;
        const rule = await service.updateRule(req.params.id, body as any);
        if (!rule) return res.error(404, 'NOT_FOUND', 'Rule not found');
        return res.json({ data: rule.toJSON() });
    }

    @Delete('/rules/:id')
    async deleteRule(req: GaoRequest, res: GaoResponse) {
        const deleted = await service.deleteRule(req.params.id);
        if (!deleted) return res.error(404, 'NOT_FOUND', 'Rule not found');
        return res.empty();
    }

    // ─── Scores ─────────────────────────────────────
    @Get('/scores/:entityType/:entityId')
    async getScore(req: GaoRequest, res: GaoResponse) {
        const score = await service.getScore(req.params.entityType, req.params.entityId);
        if (!score) return res.json({ data: null });
        return res.json({ data: score.toJSON() });
    }

    @Post('/scores/:entityType/:entityId/calculate')
    async calculateScore(req: GaoRequest, res: GaoResponse) {
        const body = req.body as { entity_data?: Record<string, unknown> };
        if (!body.entity_data || typeof body.entity_data !== 'object') {
            return res.error(422, 'VALIDATION', 'entity_data is required');
        }

        const score = await service.calculateScore(
            req.params.entityType as 'contact' | 'company' | 'deal',
            req.params.entityId,
            body.entity_data
        );
        return res.json({ data: score.toJSON() });
    }

    @Get('/leaderboard/:entityType')
    async leaderboard(req: GaoRequest, res: GaoResponse) {
        const limit = parseInt(req.query.limit as string) || 20;
        const scores = await service.getTopScores(req.params.entityType, limit);
        return res.json({ data: scores.map((s) => s.toJSON()) });
    }
}
