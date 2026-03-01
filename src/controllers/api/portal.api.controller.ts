import { Controller, Get, Post, Patch } from '@gao/http';
import type { GaoRequest, GaoResponse } from '@gao/http';
import { ClientPortalService } from '../../services/client-portal.service.js';

const service = new ClientPortalService();

@Controller('/api/portal')
export class PortalApiController {
    @Get('/users')
    async listUsers(req: GaoRequest, res: GaoResponse) {
        const companyId = req.query.company_id as string | undefined;
        const users = await service.listUsers(companyId ?? undefined);
        // Never expose password hash
        return res.json({ data: users.map((u) => { const j = u.toJSON(); delete (j as any).password; return j; }) });
    }

    @Post('/users')
    async createUser(req: GaoRequest, res: GaoResponse) {
        const body = req.body as Record<string, unknown>;
        if (!body.contact_id || !body.email || !body.password || !body.name) {
            return res.error(422, 'VALIDATION', 'contact_id, email, password, name are required');
        }
        const user = await service.createUser({
            contact_id: body.contact_id as string,
            company_id: body.company_id as string | undefined,
            email: body.email as string,
            password: body.password as string,
            name: body.name as string,
        });
        const json = user.toJSON();
        delete (json as any).password;
        return res.status(201).json({ data: json });
    }

    @Post('/auth/login')
    async login(req: GaoRequest, res: GaoResponse) {
        const body = req.body as { email?: string; password?: string };
        if (!body.email || !body.password) return res.error(422, 'VALIDATION', 'email and password required');
        const user = await service.authenticatePortalUser(body.email, body.password);
        if (!user) return res.error(401, 'UNAUTHORIZED', 'Invalid credentials');
        const json = user.toJSON();
        delete (json as any).password;
        return res.json({ data: json });
    }

    @Patch('/users/:id/deactivate')
    async deactivate(req: GaoRequest, res: GaoResponse) {
        const success = await service.deactivateUser(req.params.id);
        if (!success) return res.error(404, 'NOT_FOUND', 'Portal user not found');
        return res.json({ data: { deactivated: true } });
    }

    @Get('/documents')
    async listDocuments(req: GaoRequest, res: GaoResponse) {
        const contactId = req.query.contact_id as string | undefined;
        const companyId = req.query.company_id as string | undefined;
        const docs = await service.listDocuments(contactId ?? undefined, companyId ?? undefined);
        return res.json({ data: docs.map((d) => d.toJSON()) });
    }

    @Post('/documents')
    async uploadDocument(req: GaoRequest, res: GaoResponse) {
        const userId = (req as any).user?.id as string | undefined;
        if (!userId) return res.error(401, 'UNAUTHORIZED', 'Authentication required');
        const body = req.body as Record<string, unknown>;
        if (!body.name || !body.file_path) return res.error(422, 'VALIDATION', 'name and file_path required');
        const doc = await service.uploadDocument({
            uploaded_by: userId,
            name: body.name as string,
            file_path: body.file_path as string,
            file_type: body.file_type as string | undefined,
            file_size: body.file_size as number | undefined,
            contact_id: body.contact_id as string | undefined,
            company_id: body.company_id as string | undefined,
            deal_id: body.deal_id as string | undefined,
            is_portal_visible: body.is_portal_visible as boolean | undefined,
            portal_expires_at: body.portal_expires_at as string | undefined,
        });
        return res.status(201).json({ data: doc.toJSON() });
    }

    @Post('/documents/:id/download')
    async download(req: GaoRequest, res: GaoResponse) {
        await service.recordDownload(req.params.id);
        return res.json({ data: { recorded: true } });
    }
}
