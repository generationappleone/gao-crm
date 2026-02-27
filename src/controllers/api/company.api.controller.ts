import { Controller, Get, Post, Put, Delete } from '@gao/http';
import type { GaoRequest, GaoResponse } from '@gao/http';
import { CompanyService } from '../../services/company.service.js';
import { parsePagination } from '../../helpers/pagination.js';

const companyService = new CompanyService();

@Controller('/api/companies')
export class CompanyApiController {
    @Get('/')
    async list(req: GaoRequest, res: GaoResponse) {
        const pagination = parsePagination(req.query);
        const result = await companyService.list(pagination, req.query.search);
        return res.json(result.companies, result.meta);
    }

    @Get('/:id')
    async show(req: GaoRequest, res: GaoResponse) {
        const company = await companyService.findById(req.params.id);
        if (!company) return res.error(404, 'NOT_FOUND', 'Company not found');
        return res.json(company.toJSON());
    }

    @Post('/')
    async create(req: GaoRequest, res: GaoResponse) {
        const body = req.body as Record<string, unknown>;
        if (!body.name) return res.error(422, 'VALIDATION', 'name is required');
        const company = await companyService.create(body);
        return res.status(201).json(company.toJSON());
    }

    @Put('/:id')
    async update(req: GaoRequest, res: GaoResponse) {
        const company = await companyService.update(req.params.id, req.body as Record<string, unknown>);
        if (!company) return res.error(404, 'NOT_FOUND', 'Company not found');
        return res.json(company.toJSON());
    }

    @Delete('/:id')
    async destroy(req: GaoRequest, res: GaoResponse) {
        const deleted = await companyService.delete(req.params.id);
        if (!deleted) return res.error(404, 'NOT_FOUND', 'Company not found');
        return res.empty();
    }
}
