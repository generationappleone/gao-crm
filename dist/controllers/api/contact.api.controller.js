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
import { ContactService } from '../../services/contact.service.js';
import { parsePagination } from '../../helpers/pagination.js';
const contactService = new ContactService();
let ContactApiController = class ContactApiController {
    async list(req, res) {
        const pagination = parsePagination(req.query);
        const { search, status, owner_id } = req.query;
        const result = await contactService.list(pagination, search, status, owner_id);
        return res.json(result.contacts, result.meta);
    }
    async show(req, res) {
        const contact = await contactService.findById(req.params.id);
        if (!contact) {
            return res.error(404, 'NOT_FOUND', 'Contact not found');
        }
        return res.json(contact.toJSON());
    }
    async create(req, res) {
        const body = req.body;
        if (!body.first_name || !body.last_name || !body.owner_id) {
            return res.error(422, 'VALIDATION', 'first_name, last_name, and owner_id are required');
        }
        const contact = await contactService.create(body);
        return res.status(201).json(contact.toJSON());
    }
    async update(req, res) {
        const contact = await contactService.update(req.params.id, req.body);
        if (!contact) {
            return res.error(404, 'NOT_FOUND', 'Contact not found');
        }
        return res.json(contact.toJSON());
    }
    async destroy(req, res) {
        const deleted = await contactService.delete(req.params.id);
        if (!deleted) {
            return res.error(404, 'NOT_FOUND', 'Contact not found');
        }
        return res.empty();
    }
};
__decorate([
    Get('/'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function, Function]),
    __metadata("design:returntype", Promise)
], ContactApiController.prototype, "list", null);
__decorate([
    Get('/:id'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function, Function]),
    __metadata("design:returntype", Promise)
], ContactApiController.prototype, "show", null);
__decorate([
    Post('/'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function, Function]),
    __metadata("design:returntype", Promise)
], ContactApiController.prototype, "create", null);
__decorate([
    Put('/:id'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function, Function]),
    __metadata("design:returntype", Promise)
], ContactApiController.prototype, "update", null);
__decorate([
    Delete('/:id'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function, Function]),
    __metadata("design:returntype", Promise)
], ContactApiController.prototype, "destroy", null);
ContactApiController = __decorate([
    Controller('/api/contacts')
], ContactApiController);
export { ContactApiController };
//# sourceMappingURL=contact.api.controller.js.map