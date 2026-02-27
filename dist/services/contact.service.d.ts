import { Contact } from '../models/contact.model.js';
import type { PaginationParams, PaginationMeta } from '../helpers/pagination.js';
export interface ContactListResult {
    contacts: Contact[];
    meta: PaginationMeta;
}
export declare class ContactService {
    list(params: PaginationParams, search?: string, status?: string, ownerId?: string): Promise<ContactListResult>;
    findById(id: string): Promise<Contact | null>;
    create(data: Record<string, unknown>): Promise<Contact>;
    update(id: string, data: Record<string, unknown>): Promise<Contact | null>;
    delete(id: string): Promise<boolean>;
}
//# sourceMappingURL=contact.service.d.ts.map