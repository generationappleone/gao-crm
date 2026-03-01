import { Controller, Get, Post, Delete } from '@gao/http';
import type { GaoRequest, GaoResponse } from '@gao/http';
import { AnnouncementService } from '../../services/announcement.service.js';

const service = new AnnouncementService();

@Controller('/api/announcements')
export class AnnouncementApiController {
    @Get('/') async list(_req: GaoRequest, res: GaoResponse) { return res.json({ data: (await service.list()).map((a) => a.toJSON()) }); }
    @Post('/') async create(req: GaoRequest, res: GaoResponse) { const uid = (req as any).user?.id as string; if (!uid) return res.error(401, 'UNAUTHORIZED', 'Auth required'); const b = req.body as any; if (!b.title || !b.content) return res.error(422, 'VALIDATION', 'title and content required'); return res.status(201).json({ data: (await service.create({ ...b, author_id: uid })).toJSON() }); }
    @Delete('/:id') async destroy(req: GaoRequest, res: GaoResponse) { const ok = await service.delete(req.params.id); if (!ok) return res.error(404, 'NOT_FOUND', 'Announcement not found'); return res.empty(); }
}
