import { Controller, Get, Post, Delete } from '@gao/http';
import type { GaoRequest, GaoResponse } from '@gao/http';
import { AiCopilotService } from '../../services/ai-copilot.service.js';

const service = new AiCopilotService();

@Controller('/api/ai')
export class AiCopilotApiController {
    @Get('/conversations')
    async list(req: GaoRequest, res: GaoResponse) {
        const userId = (req as any).user?.id as string | undefined;
        if (!userId) return res.error(401, 'UNAUTHORIZED', 'Authentication required');
        const conversations = await service.listConversations(userId);
        return res.json({ data: conversations.map((c) => c.toJSON()) });
    }

    @Get('/conversations/:id')
    async show(req: GaoRequest, res: GaoResponse) {
        const result = await service.getConversation(req.params.id);
        if (!result) return res.error(404, 'NOT_FOUND', 'Conversation not found');
        return res.json({
            data: {
                ...result.conversation.toJSON(),
                messages: result.messages.map((m) => m.toJSON()),
            },
        });
    }

    @Post('/conversations')
    async startConversation(req: GaoRequest, res: GaoResponse) {
        const userId = (req as any).user?.id as string | undefined;
        if (!userId) return res.error(401, 'UNAUTHORIZED', 'Authentication required');

        const body = req.body as Record<string, unknown>;
        const conversation = await service.startConversation({
            user_id: userId,
            title: body.title as string | undefined,
            context_type: body.context_type as any,
            context_id: body.context_id as string | undefined,
            model: body.model as string | undefined,
        });
        return res.status(201).json({ data: conversation.toJSON() });
    }

    @Post('/conversations/:id/messages')
    async sendMessage(req: GaoRequest, res: GaoResponse) {
        const body = req.body as { content?: string };
        if (!body.content || typeof body.content !== 'string') {
            return res.error(422, 'VALIDATION', 'content is required');
        }

        try {
            const result = await service.sendMessage({
                conversation_id: req.params.id,
                content: body.content,
            });
            return res.json({
                data: {
                    message: result.message.toJSON(),
                    conversation: result.conversation.toJSON(),
                },
            });
        } catch {
            return res.error(404, 'NOT_FOUND', 'Conversation not found');
        }
    }

    @Delete('/conversations/:id')
    async deleteConversation(req: GaoRequest, res: GaoResponse) {
        const deleted = await service.deleteConversation(req.params.id);
        if (!deleted) return res.error(404, 'NOT_FOUND', 'Conversation not found');
        return res.empty();
    }
}
