import { Controller, Get, Post } from '@gao/http';
import type { GaoRequest, GaoResponse } from '@gao/http';
import { MessengerService } from '../../services/messenger.service.js';

const service = new MessengerService();

@Controller('/api/messenger')
export class MessengerApiController {
    @Get('/channels') async channels(req: GaoRequest, res: GaoResponse) { const uid = (req as any).user?.id as string; if (!uid) return res.error(401, 'UNAUTHORIZED', 'Auth required'); return res.json({ data: (await service.listChannels(uid)).map((c) => c.toJSON()) }); }
    @Post('/channels') async create(req: GaoRequest, res: GaoResponse) { const uid = (req as any).user?.id as string; if (!uid) return res.error(401, 'UNAUTHORIZED', 'Auth required'); const b = req.body as any; if (!b.name || !b.slug) return res.error(422, 'VALIDATION', 'name and slug required'); return res.status(201).json({ data: (await service.createChannel({ ...b, created_by: uid })).toJSON() }); }
    @Post('/channels/:id/join') async join(req: GaoRequest, res: GaoResponse) { const uid = (req as any).user?.id as string; if (!uid) return res.error(401, 'UNAUTHORIZED', 'Auth required'); return res.json({ data: (await service.joinChannel(req.params.id, uid)).toJSON() }); }
    @Get('/channels/:id/messages') async messages(req: GaoRequest, res: GaoResponse) { return res.json({ data: (await service.getMessages(req.params.id)).map((m) => m.toJSON()) }); }
    @Post('/channels/:id/messages') async send(req: GaoRequest, res: GaoResponse) { const uid = (req as any).user?.id as string; if (!uid) return res.error(401, 'UNAUTHORIZED', 'Auth required'); const b = req.body as any; if (!b.content) return res.error(422, 'VALIDATION', 'content required'); return res.status(201).json({ data: (await service.sendMessage({ channel_id: req.params.id, sender_id: uid, content: b.content, message_type: b.message_type, parent_id: b.parent_id })).toJSON() }); }
}
