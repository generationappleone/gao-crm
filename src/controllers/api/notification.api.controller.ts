import { Controller, Get, Post, Patch, Delete } from '@gao/http';
import type { GaoRequest, GaoResponse } from '@gao/http';
import { NotificationService } from '../../services/notification.service.js';

const service = new NotificationService();

@Controller('/api/notifications')
export class NotificationApiController {
    @Get('/')
    async list(req: GaoRequest, res: GaoResponse) {
        const userId = (req as any).user?.id as string;
        if (!userId) return res.error(401, 'UNAUTHORIZED', 'Authentication required');
        const unreadOnly = req.query.unread === 'true';
        const notifications = await service.listForUser(userId, unreadOnly);
        return res.json({ data: notifications.map((n) => n.toJSON()) });
    }

    @Get('/count')
    async unreadCount(req: GaoRequest, res: GaoResponse) {
        const userId = (req as any).user?.id as string;
        if (!userId) return res.error(401, 'UNAUTHORIZED', 'Authentication required');
        const count = await service.getUnreadCount(userId);
        return res.json({ data: { unread: count } });
    }

    @Patch('/:id/read')
    async markAsRead(req: GaoRequest, res: GaoResponse) {
        await service.markAsRead(req.params.id);
        return res.json({ data: { read: true } });
    }

    @Post('/read-all')
    async markAllAsRead(req: GaoRequest, res: GaoResponse) {
        const userId = (req as any).user?.id as string;
        if (!userId) return res.error(401, 'UNAUTHORIZED', 'Authentication required');
        await service.markAllAsRead(userId);
        return res.json({ data: { read_all: true } });
    }

    @Delete('/:id')
    async destroy(req: GaoRequest, res: GaoResponse) {
        const deleted = await service.delete(req.params.id);
        if (!deleted) return res.error(404, 'NOT_FOUND', 'Notification not found');
        return res.empty();
    }
}
