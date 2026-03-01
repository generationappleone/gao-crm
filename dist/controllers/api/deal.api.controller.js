var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Controller, Get, Post, Put, Patch, Delete } from '@gao/http';
import { DealService } from '../../services/deal.service.js';
import { parsePagination } from '../../helpers/pagination.js';
const dealService = new DealService();
let DealApiController = class DealApiController {
    async list(req, res) {
        const pagination = parsePagination(req.query);
        const result = await dealService.list(pagination, req.query.stage_id, req.query.owner_id);
        return res.json(result.deals, result.meta);
    }
    async stages(_req, res) {
        const stages = await dealService.getStages();
        return res.json(stages);
    }
    async show(req, res) {
        const deal = await dealService.findById(req.params.id);
        if (!deal)
            return res.error(404, 'NOT_FOUND', 'Deal not found');
        return res.json(deal.toJSON());
    }
    async create(req, res) {
        const body = req.body;
        if (!body.title || !body.stage_id) {
            return res.error(422, 'VALIDATION', 'title and stage_id are required');
        }
        // Auto-set owner_id from logged-in user if not provided
        if (!body.owner_id) {
            const user = req.user;
            body.owner_id = user?.id ?? null;
        }
        const deal = await dealService.create(body);
        return res.status(201).json(deal.toJSON());
    }
    async update(req, res) {
        const deal = await dealService.update(req.params.id, req.body);
        if (!deal)
            return res.error(404, 'NOT_FOUND', 'Deal not found');
        return res.json(deal.toJSON());
    }
    async moveStage(req, res) {
        const { stage_id } = req.body;
        if (!stage_id)
            return res.error(422, 'VALIDATION', 'stage_id is required');
        const deal = await dealService.moveToStage(req.params.id, stage_id);
        if (!deal)
            return res.error(404, 'NOT_FOUND', 'Deal or stage not found');
        return res.json(deal.toJSON());
    }
    async destroy(req, res) {
        const deleted = await dealService.delete(req.params.id);
        if (!deleted)
            return res.error(404, 'NOT_FOUND', 'Deal not found');
        return res.empty();
    }
};
__decorate([
    Get('/'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function, Function]),
    __metadata("design:returntype", Promise)
], DealApiController.prototype, "list", null);
__decorate([
    Get('/stages'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function, Function]),
    __metadata("design:returntype", Promise)
], DealApiController.prototype, "stages", null);
__decorate([
    Get('/:id'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function, Function]),
    __metadata("design:returntype", Promise)
], DealApiController.prototype, "show", null);
__decorate([
    Post('/'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function, Function]),
    __metadata("design:returntype", Promise)
], DealApiController.prototype, "create", null);
__decorate([
    Put('/:id'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function, Function]),
    __metadata("design:returntype", Promise)
], DealApiController.prototype, "update", null);
__decorate([
    Patch('/:id/stage'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function, Function]),
    __metadata("design:returntype", Promise)
], DealApiController.prototype, "moveStage", null);
__decorate([
    Delete('/:id'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function, Function]),
    __metadata("design:returntype", Promise)
], DealApiController.prototype, "destroy", null);
DealApiController = __decorate([
    Controller('/api/deals')
], DealApiController);
export { DealApiController };
//# sourceMappingURL=deal.api.controller.js.map