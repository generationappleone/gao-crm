import { Notification, type NotificationType } from '../models/notification.model.js';

interface CreateNotificationInput {
    user_id: string;
    type: NotificationType;
    title: string;
    message?: string;
    entity_type?: string;
    entity_id?: string;
    action_url?: string;
}

export class NotificationService {
    async create(data: CreateNotificationInput): Promise<Notification> {
        return Notification.create({
            user_id: data.user_id,
            type: data.type,
            title: data.title,
            message: data.message,
            entity_type: data.entity_type,
            entity_id: data.entity_id,
            action_url: data.action_url,
            is_read: false,
        });
    }

    async listForUser(userId: string, unreadOnly = false): Promise<Notification[]> {
        let query = Notification.where('user_id', userId);
        if (unreadOnly) query = query.where('is_read', false);
        return query.orderBy('created_at', 'DESC').limit(50).get();
    }

    async markAsRead(id: string): Promise<void> {
        const notification = await Notification.where('id', id).first();
        if (notification) {
            notification.is_read = true;
            notification.read_at = new Date().toISOString();
            await notification.save();
        }
    }

    async markAllAsRead(userId: string): Promise<void> {
        const unread = await Notification.where('user_id', userId).where('is_read', false).get();
        const now = new Date().toISOString();
        for (const n of unread) {
            n.is_read = true;
            n.read_at = now;
            await n.save();
        }
    }

    async getUnreadCount(userId: string): Promise<number> {
        const unread = await Notification.where('user_id', userId).where('is_read', false).get();
        return unread.length;
    }

    async delete(id: string): Promise<boolean> {
        const notification = await Notification.where('id', id).first();
        if (!notification) return false;
        await notification.destroy();
        return true;
    }
}
