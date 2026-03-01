import { Controller, Get, Post } from '@gao/http';
import type { GaoRequest, GaoResponse } from '@gao/http';
import { ExportService } from '../../services/export.service.js';
import type { ExportFormat } from '../../models/export-job.model.js';

const service = new ExportService();

@Controller('/api/exports')
export class ExportApiController {
    @Get('/')
    async list(req: GaoRequest, res: GaoResponse) {
        const userId = (req as any).user?.id as string;
        if (!userId) return res.error(401, 'UNAUTHORIZED', 'Authentication required');
        const jobs = await service.list(userId);
        return res.json({ data: jobs.map((j) => j.toJSON()) });
    }

    @Get('/:id')
    async show(req: GaoRequest, res: GaoResponse) {
        const job = await service.findById(req.params.id);
        if (!job) return res.error(404, 'NOT_FOUND', 'Export job not found');
        return res.json({ data: job.toJSON() });
    }

    @Post('/')
    async create(req: GaoRequest, res: GaoResponse) {
        const userId = (req as any).user?.id as string;
        if (!userId) return res.error(401, 'UNAUTHORIZED', 'Authentication required');

        const body = req.body as Record<string, unknown>;
        if (!body.export_type || !body.entity_type) {
            return res.error(422, 'VALIDATION', 'export_type and entity_type are required');
        }

        const job = await service.create({
            user_id: userId,
            export_type: body.export_type as ExportFormat,
            entity_type: body.entity_type as string,
            filters: body.filters as Record<string, unknown> | undefined,
            columns: body.columns as string[] | undefined,
        });

        // Auto-process (in production this would be queued)
        await service.process(job.id);

        const updated = await service.findById(job.id);
        return res.status(201).json({ data: updated?.toJSON() ?? job.toJSON() });
    }
}
