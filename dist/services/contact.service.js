import { Contact } from '../models/contact.model.js';
export class ContactService {
    async list(params, search, status, ownerId) {
        let query = Contact.where('deleted_at', 'IS', null);
        if (status) {
            query = query.where('status', status);
        }
        if (ownerId) {
            query = query.where('owner_id', ownerId);
        }
        // If search is provided, do application-level multi-field filtering
        // because the ORM doesn't support OR queries
        if (search) {
            const term = search.toLowerCase();
            const allContacts = await query.orderBy('created_at', 'DESC').get();
            const filtered = allContacts.filter(c => {
                const fullName = `${c.first_name} ${c.last_name}`.toLowerCase();
                return fullName.includes(term)
                    || (c.email ?? '').toLowerCase().includes(term)
                    || (c.phone ?? '').toLowerCase().includes(term)
                    || (c.position ?? '').toLowerCase().includes(term);
            });
            const total = filtered.length;
            const start = (params.page - 1) * params.perPage;
            const paged = filtered.slice(start, start + params.perPage);
            return {
                contacts: paged,
                meta: {
                    page: params.page,
                    per_page: params.perPage,
                    total,
                    total_pages: Math.ceil(total / params.perPage),
                },
            };
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