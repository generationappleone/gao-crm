import { Controller, Get, Post, Put, Delete } from '@gao/http';
import type { GaoRequest, GaoResponse } from '@gao/http';
import { ContactService } from '../../services/contact.service.js';
import { parsePagination } from '../../helpers/pagination.js';

const contactService = new ContactService();

@Controller('/api/contacts')
export class ContactApiController {

    @Get('/')
    async list(req: GaoRequest, res: GaoResponse) {
        const pagination = parsePagination(req.query);
        const { search, status, owner_id } = req.query;
        const result = await contactService.list(pagination, search, status, owner_id);
        return res.json(result.contacts, result.meta);
    }

    @Get('/:id')
    async show(req: GaoRequest, res: GaoResponse) {
        const contact = await contactService.findById(req.params.id);
        if (!contact) {
            return res.error(404, 'NOT_FOUND', 'Contact not found');
        }
        return res.json(contact.toJSON());
    }

    @Post('/')
    async create(req: GaoRequest, res: GaoResponse) {
        const body = req.body as Record<string, unknown>;
        if (!body.first_name || !body.last_name || !body.owner_id) {
            return res.error(422, 'VALIDATION', 'first_name, last_name, and owner_id are required');
        }
        const contact = await contactService.create(body);
        return res.status(201).json(contact.toJSON());
    }

    @Put('/:id')
    async update(req: GaoRequest, res: GaoResponse) {
        const contact = await contactService.update(req.params.id, req.body as Record<string, unknown>);
        if (!contact) {
            return res.error(404, 'NOT_FOUND', 'Contact not found');
        }
        return res.json(contact.toJSON());
    }

    @Delete('/:id')
    async destroy(req: GaoRequest, res: GaoResponse) {
        const deleted = await contactService.delete(req.params.id);
        if (!deleted) {
            return res.error(404, 'NOT_FOUND', 'Contact not found');
        }
        return res.empty();
    }
}
