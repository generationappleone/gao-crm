var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Controller, Get, Post, Put, Delete } from '@gao/http';
import { CompanyService } from '../../services/company.service.js';
import { parsePagination } from '../../helpers/pagination.js';
const companyService = new CompanyService();
let CompanyApiController = class CompanyApiController {
    async list(req, res) {
        const pagination = parsePagination(req.query);
        const result = await companyService.list(pagination, req.query.search);
        return res.json(result.companies, result.meta);
    }
    async show(req, res) {
        const company = await companyService.findById(req.params.id);
        if (!company)
            return res.error(404, 'NOT_FOUND', 'Company not found');
        return res.json(company.toJSON());
    }
    async create(req, res) {
        const body = req.body;
        if (!body.name)
            return res.error(422, 'VALIDATION', 'name is required');
        const company = await companyService.create(body);
        return res.status(201).json(company.toJSON());
    }
    async update(req, res) {
        const company = await companyService.update(req.params.id, req.body);
        if (!company)
            return res.error(404, 'NOT_FOUND', 'Company not found');
        return res.json(company.toJSON());
    }
    async destroy(req, res) {
        const deleted = await companyService.delete(req.params.id);
        if (!deleted)
            return res.error(404, 'NOT_FOUND', 'Company not found');
        return res.empty();
    }
};
__decorate([
    Get('/'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function, Function]),
    __metadata("design:returntype", Promise)
], CompanyApiController.prototype, "list", null);
__decorate([
    Get('/:id'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function, Function]),
    __metadata("design:returntype", Promise)
], CompanyApiController.prototype, "show", null);
__decorate([
    Post('/'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function, Function]),
    __metadata("design:returntype", Promise)
], CompanyApiController.prototype, "create", null);
__decorate([
    Put('/:id'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function, Function]),
    __metadata("design:returntype", Promise)
], CompanyApiController.prototype, "update", null);
__decorate([
    Delete('/:id'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function, Function]),
    __metadata("design:returntype", Promise)
], CompanyApiController.prototype, "destroy", null);
CompanyApiController = __decorate([
    Controller('/api/companies')
], CompanyApiController);
export { CompanyApiController };
//# sourceMappingURL=company.api.controller.js.map