/**
 * GAO CRM — Contact Controller (REDIRECT ONLY)
 *
 * All contact pages have been consolidated into the CRM Workspace.
 * This controller provides backward-compatible redirects from old URLs.
 */

import { Controller, Get } from '@gao/http';
import type { GaoRequest, GaoResponse } from '@gao/http';
import { url } from '../helpers/url.js';

@Controller('/contacts')
export class ContactController {
    @Get('/')
    async list(req: GaoRequest, res: GaoResponse) {
        const qs = req.query ? '?' + new URLSearchParams(req.query as Record<string, string>).toString() : '';
        return res.redirect(url(`/crm/contacts${qs}`));
    }

    @Get('/create')
    async createForm(_req: GaoRequest, res: GaoResponse) {
        return res.redirect(url('/crm/contacts/create'));
    }

    @Get('/:id')
    async detail(req: GaoRequest, res: GaoResponse) {
        return res.redirect(url(`/crm/contacts/${req.params.id}`));
    }

    @Get('/:id/edit')
    async editForm(req: GaoRequest, res: GaoResponse) {
        return res.redirect(url(`/crm/contacts/${req.params.id}/edit`));
    }
}
