import { Announcement } from '../models/announcement.model.js';

export class AnnouncementService {
    async list(): Promise<Announcement[]> {
        return Announcement.where('deleted_at', 'IS', null).orderBy('created_at', 'DESC').get();
    }

    async create(data: { author_id: string; title: string; content: string; is_pinned?: boolean; published_at?: string; expires_at?: string }): Promise<Announcement> {
        return Announcement.create({ author_id: data.author_id, title: data.title, content: data.content, is_pinned: data.is_pinned ?? false, published_at: data.published_at ?? new Date().toISOString() });
    }

    async delete(id: string): Promise<boolean> {
        const ann = await Announcement.where('id', id).whereNull('deleted_at').first();
        if (!ann) return false;
        await ann.destroy();
        return true;
    }
}
