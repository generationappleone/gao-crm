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
import { TagService } from '../../services/tag.service.js';
const tagService = new TagService();
let TagApiController = class TagApiController {
    async list(_req, res) {
        const tags = await tagService.list();
        return res.json(tags);
    }
    async create(req, res) {
        const body = req.body;
        if (!body.name)
            return res.error(422, 'VALIDATION', 'name is required');
        const tag = await tagService.create(body);
        return res.status(201).json(tag.toJSON());
    }
    async update(req, res) {
        const tag = await tagService.update(req.params.id, req.body);
        if (!tag)
            return res.error(404, 'NOT_FOUND', 'Tag not found');
        return res.json(tag.toJSON());
    }
    async destroy(req, res) {
        const deleted = await tagService.delete(req.params.id);
        if (!deleted)
            return res.error(404, 'NOT_FOUND', 'Tag not found');
        return res.empty();
    }
};
__decorate([
    Get('/'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function, Function]),
    __metadata("design:returntype", Promise)
], TagApiController.prototype, "list", null);
__decorate([
    Post('/'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function, Function]),
    __metadata("design:returntype", Promise)
], TagApiController.prototype, "create", null);
__decorate([
    Put('/:id'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function, Function]),
    __metadata("design:returntype", Promise)
], TagApiController.prototype, "update", null);
__decorate([
    Delete('/:id'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function, Function]),
    __metadata("design:returntype", Promise)
], TagApiController.prototype, "destroy", null);
TagApiController = __decorate([
    Controller('/api/tags')
], TagApiController);
export { TagApiController };
//# sourceMappingURL=tag.api.controller.js.map