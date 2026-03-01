import { ClientPortalUser } from '../models/client-portal-user.model.js';
import { SharedDocument } from '../models/shared-document.model.js';
import { hashPassword, verifyPassword } from '@gao/security';

interface CreatePortalUserInput {
    contact_id: string;
    company_id?: string;
    email: string;
    password: string;
    name: string;
}

export class ClientPortalService {
    // ─── Portal Users ───────────────────────────────
    async listUsers(companyId?: string): Promise<ClientPortalUser[]> {
        let query = ClientPortalUser.where('is_active', true);
        if (companyId) query = query.where('company_id', companyId);
        return query.orderBy('name', 'ASC').get();
    }

    async createUser(data: CreatePortalUserInput): Promise<ClientPortalUser> {
        const hashedPassword = await hashPassword(data.password);
        return ClientPortalUser.create({
            contact_id: data.contact_id,
            company_id: data.company_id,
            email: data.email,
            password: hashedPassword,
            name: data.name,
            is_active: true,
        });
    }

    async authenticatePortalUser(email: string, password: string): Promise<ClientPortalUser | null> {
        const user = await ClientPortalUser.where('email', email).where('is_active', true).first();
        if (!user) return null;

        const isValid = await verifyPassword(user.password, password);
        if (!isValid) return null;

        user.last_login_at = new Date().toISOString();
        await user.save();
        return user;
    }

    async deactivateUser(id: string): Promise<boolean> {
        const user = await ClientPortalUser.where('id', id).first();
        if (!user) return false;
        user.is_active = false;
        await user.save();
        return true;
    }

    // ─── Shared Documents ───────────────────────────
    async listDocuments(contactId?: string, companyId?: string): Promise<SharedDocument[]> {
        let query = SharedDocument.where('deleted_at', 'IS', null).where('is_portal_visible', true);
        if (contactId) query = query.where('contact_id', contactId);
        if (companyId) query = query.where('company_id', companyId);
        return query.orderBy('created_at', 'DESC').get();
    }

    async uploadDocument(data: { uploaded_by: string; name: string; file_path: string; file_type?: string; file_size?: number; contact_id?: string; company_id?: string; deal_id?: string; is_portal_visible?: boolean; portal_expires_at?: string }): Promise<SharedDocument> {
        return SharedDocument.create({
            uploaded_by: data.uploaded_by,
            name: data.name,
            file_path: data.file_path,
            file_type: data.file_type,
            file_size: data.file_size,
            contact_id: data.contact_id,
            company_id: data.company_id,
            deal_id: data.deal_id,
            is_portal_visible: data.is_portal_visible ?? false,
            download_count: 0,
            portal_expires_at: data.portal_expires_at,
        });
    }

    async recordDownload(id: string): Promise<void> {
        const doc = await SharedDocument.where('id', id).whereNull('deleted_at').first();
        if (doc) {
            doc.download_count = (doc.download_count || 0) + 1;
            await doc.save();
        }
    }
}
