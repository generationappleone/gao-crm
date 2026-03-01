import { Contact } from '../models/contact.model.js';
import type { PaginationParams, PaginationMeta } from '../helpers/pagination.js';

export interface ContactListResult {
    contacts: Contact[];
    meta: PaginationMeta;
}

export class ContactService {

    async list(params: PaginationParams, search?: string, status?: string, ownerId?: string): Promise<ContactListResult> {
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

    async findById(id: string): Promise<Contact | null> {
        return Contact.where('id', id).whereNull('deleted_at').first();
    }

    async create(data: Record<string, unknown>): Promise<Contact> {
        return Contact.create({
            ...data,
            status: (data.status as string) || 'lead',
        });
    }

    async update(id: string, data: Record<string, unknown>): Promise<Contact | null> {
        const contact = await this.findById(id);
        if (!contact) return null;

        contact.fill(data);
        await contact.save();
        return contact;
    }

    async delete(id: string): Promise<boolean> {
        const contact = await this.findById(id);
        if (!contact) return false;
        await contact.destroy();
        return true;
    }
}
