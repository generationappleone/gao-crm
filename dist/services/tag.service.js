import { Tag } from '../models/tag.model.js';
export class TagService {
    async list() {
        return Tag.all();
    }
    async create(data) {
        const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        return Tag.create({
            name: data.name,
            slug,
            color: data.color ?? '#6366f1',
        });
    }
    async update(id, data) {
        const tag = await Tag.where('id', id).first();
        if (!tag)
            return null;
        if (data.name) {
            tag.name = data.name;
            tag.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        }
        if (data.color)
            tag.color = data.color;
        await tag.save();
        return tag;
    }
    async delete(id) {
        const tag = await Tag.where('id', id).first();
        if (!tag)
            return false;
        await tag.destroy();
        return true;
    }
}
//# sourceMappingURL=tag.service.js.map