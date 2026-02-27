import { Contact } from '../models/contact.model.js';
export class ContactService {
    async list(params, search, status, ownerId) {
        let query = Contact.where('id', '!=', '').whereNull('deleted_at');
        if (search) {
            query = query.where('first_name', 'LIKE', `%${search}%`);
        }
        if (status) {
            query = query.where('status', status);
        }
        if (ownerId) {
            query = query.where('owner_id', ownerId);
        }
        const result = await query.orderBy('created_at', 'DESC').paginate(params.page, params.perPage);
        return {
            contacts: result.data,
            meta: {
                page: result.meta.page,
                per_page: result.meta.perPage,
                total: result.meta.total,
                total_pages: result.meta.totalPages,
            },
        };
    }
    async findById(id) {
        return Contact.where('id', id).whereNull('deleted_at').first();
    }
    async create(data) {
        return Contact.create({
            ...data,
            status: data.status || 'lead',
        });
    }
    async update(id, data) {
        const contact = await this.findById(id);
        if (!contact)
            return null;
        contact.fill(data);
        await contact.save();
        return contact;
    }
    async delete(id) {
        const contact = await this.findById(id);
        if (!contact)
            return false;
        await contact.destroy();
        return true;
    }
}
//# sourceMappingURL=contact.service.js.map