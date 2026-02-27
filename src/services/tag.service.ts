import { Tag } from '../models/tag.model.js';

export class TagService {
    async list(): Promise<Tag[]> {
        return Tag.all();
    }

    async create(data: { name: string; color?: string }): Promise<Tag> {
        const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        return Tag.create({
            name: data.name,
            slug,
            color: data.color ?? '#6366f1',
        });
    }

    async update(id: string, data: { name?: string; color?: string }): Promise<Tag | null> {
        const tag = await Tag.where('id', id).first();
        if (!tag) return null;
        if (data.name) {
            tag.name = data.name;
            tag.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        }
        if (data.color) tag.color = data.color;
        await tag.save();
        return tag;
    }

    async delete(id: string): Promise<boolean> {
        const tag = await Tag.where('id', id).first();
        if (!tag) return false;
        await tag.destroy();
        return true;
    }
}
