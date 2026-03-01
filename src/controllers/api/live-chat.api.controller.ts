import { Controller, Get, Post, Patch } from '@gao/http';
import type { GaoRequest, GaoResponse } from '@gao/http';
import { LiveChatService } from '../../services/live-chat.service.js';

const service = new LiveChatService();

@Controller('/api/chat')
export class LiveChatApiController {
    @Post('/sessions')
    async startSession(req: GaoRequest, res: GaoResponse) {
        const body = req.body as Record<string, unknown>;
        if (!body.visitor_id || typeof body.visitor_id !== 'string') {
            return res.error(422, 'VALIDATION', 'visitor_id is required');
        }

        const ip = req.header('x-forwarded-for')?.split(',')[0]?.trim() ?? '';
        const ua = req.header('user-agent') ?? '';

        const session = await service.startSession({
            visitor_id: body.visitor_id,
            visitor_name: body.visitor_name as string | undefined,
            visitor_email: body.visitor_email as string | undefined,
            visitor_ip: ip,
            visitor_user_agent: ua,
            page_url: body.page_url as string | undefined,
            channel: body.channel as string | undefined,
        });
        return res.status(201).json({ data: session.toJSON() });
    }

    @Get('/sessions/waiting')
    async waiting(_req: GaoRequest, res: GaoResponse) {
        const sessions = await service.getWaitingSessions();
        return res.json({ data: sessions.map((s) => s.toJSON()) });
    }

    @Get('/sessions/active')
    async active(req: GaoRequest, res: GaoResponse) {
        const agentId = (req as any).user?.id as string | undefined;
        const sessions = await service.getActiveSessions(agentId ?? undefined);
        return res.json({ data: sessions.map((s) => s.toJSON()) });
    }

    @Patch('/sessions/:id/assign')
    async assign(req: GaoRequest, res: GaoResponse) {
        const agentId = (req as any).user?.id as string;
        if (!agentId) return res.error(401, 'UNAUTHORIZED', 'Authentication required');
        const session = await service.assignAgent(req.params.id, agentId);
        if (!session) return res.error(404, 'NOT_FOUND', 'Session not found');
        return res.json({ data: session.toJSON() });
    }

    @Post('/sessions/:id/messages')
    async sendMessage(req: GaoRequest, res: GaoResponse) {
        const body = req.body as Record<string, unknown>;
        if (!body.content || typeof body.content !== 'string') {
            return res.error(422, 'VALIDATION', 'content is required');
        }

        const message = await service.sendMessage({
            session_id: req.params.id,
            sender_type: (body.sender_type as any) ?? 'visitor',
            sender_id: body.sender_id as string | undefined,
            content: body.content,
            message_type: body.message_type as any,
        });
        return res.json({ data: message.toJSON() });
    }

    @Get('/sessions/:id/messages')
    async getMessages(req: GaoRequest, res: GaoResponse) {
        const messages = await service.getMessages(req.params.id);
        return res.json({ data: messages.map((m) => m.toJSON()) });
    }

    @Patch('/sessions/:id/end')
    async endSession(req: GaoRequest, res: GaoResponse) {
        const body = req.body as { rating?: number; feedback?: string };
        const session = await service.endSession(req.params.id, body.rating, body.feedback);
        if (!session) return res.error(404, 'NOT_FOUND', 'Session not found');
        return res.json({ data: session.toJSON() });
    }
}
