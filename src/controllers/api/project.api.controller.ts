import { Controller, Get, Post, Patch } from '@gao/http';
import type { GaoRequest, GaoResponse } from '@gao/http';
import { ProjectService } from '../../services/project.service.js';

const service = new ProjectService();

@Controller('/api/projects')
export class ProjectApiController {
    @Get('/') async list(req: GaoRequest, res: GaoResponse) { const ownerId = req.query.owner_id as string | undefined; return res.json({ data: (await service.list(ownerId ?? undefined)).map((p) => p.toJSON()) }); }
    @Get('/:id') async show(req: GaoRequest, res: GaoResponse) { const p = await service.findById(req.params.id); if (!p) return res.error(404, 'NOT_FOUND', 'Project not found'); const tasks = await service.getTasks(req.params.id); return res.json({ data: { ...p.toJSON(), tasks: tasks.map(t => t.toJSON()) } }); }
    @Post('/') async create(req: GaoRequest, res: GaoResponse) { const uid = (req as any).user?.id as string; if (!uid) return res.error(401, 'UNAUTHORIZED', 'Auth required'); const b = req.body as any; if (!b.name) return res.error(422, 'VALIDATION', 'name required'); return res.status(201).json({ data: (await service.create({ ...b, owner_id: uid })).toJSON() }); }
    @Patch('/:id/status') async updateStatus(req: GaoRequest, res: GaoResponse) { const b = req.body as { status?: string }; if (!b.status) return res.error(422, 'VALIDATION', 'status required'); const p = await service.updateStatus(req.params.id, b.status); if (!p) return res.error(404, 'NOT_FOUND', 'Project not found'); return res.json({ data: p.toJSON() }); }
    @Post('/:id/tasks') async createTask(req: GaoRequest, res: GaoResponse) { const b = req.body as any; if (!b.title) return res.error(422, 'VALIDATION', 'title required'); return res.status(201).json({ data: (await service.createTask({ ...b, project_id: req.params.id })).toJSON() }); }
    @Patch('/tasks/:taskId/status') async updateTaskStatus(req: GaoRequest, res: GaoResponse) { const b = req.body as { status?: string }; if (!b.status) return res.error(422, 'VALIDATION', 'status required'); const t = await service.updateTaskStatus(req.params.taskId, b.status); if (!t) return res.error(404, 'NOT_FOUND', 'Task not found'); return res.json({ data: t.toJSON() }); }
}
