import { Controller, Get, Post, Put, Delete } from '@gao/http';
import type { GaoRequest, GaoResponse } from '@gao/http';
import { ReportBuilderService } from '../../services/report-builder.service.js';

const service = new ReportBuilderService();

@Controller('/api/reports')
export class ReportApiController {
    @Get('/')
    async list(req: GaoRequest, res: GaoResponse) {
        const ownerId = (req as any).user?.id as string | undefined;
        const reports = await service.list(ownerId ?? undefined);
        return res.json({ data: reports.map((r) => r.toJSON()) });
    }

    @Get('/public')
    async publicReports(_req: GaoRequest, res: GaoResponse) {
        const reports = await service.getPublicReports();
        return res.json({ data: reports.map((r) => r.toJSON()) });
    }

    @Get('/:id')
    async show(req: GaoRequest, res: GaoResponse) {
        const report = await service.findById(req.params.id);
        if (!report) return res.error(404, 'NOT_FOUND', 'Report not found');
        return res.json({ data: report.toJSON() });
    }

    @Post('/')
    async create(req: GaoRequest, res: GaoResponse) {
        const userId = (req as any).user?.id as string | undefined;
        if (!userId) return res.error(401, 'UNAUTHORIZED', 'Authentication required');
        const body = req.body as Record<string, unknown>;
        if (!body.name || !body.report_type || !body.entity_type) {
            return res.error(422, 'VALIDATION', 'name, report_type, entity_type are required');
        }
        const report = await service.create({ ...body as any, owner_id: userId });
        return res.status(201).json({ data: report.toJSON() });
    }

    @Put('/:id')
    async update(req: GaoRequest, res: GaoResponse) {
        const body = req.body as Record<string, unknown>;
        const report = await service.update(req.params.id, body as any);
        if (!report) return res.error(404, 'NOT_FOUND', 'Report not found');
        return res.json({ data: report.toJSON() });
    }

    @Post('/:id/execute')
    async execute(req: GaoRequest, res: GaoResponse) {
        try {
            const result = await service.execute(req.params.id);
            return res.json({ data: result });
        } catch {
            return res.error(404, 'NOT_FOUND', 'Report not found');
        }
    }

    @Delete('/:id')
    async destroy(req: GaoRequest, res: GaoResponse) {
        const deleted = await service.delete(req.params.id);
        if (!deleted) return res.error(404, 'NOT_FOUND', 'Report not found');
        return res.empty();
    }
}
