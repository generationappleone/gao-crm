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
import { ActivityService } from '../../services/activity.service.js';
import { parsePagination } from '../../helpers/pagination.js';
const activityService = new ActivityService();
let ActivityApiController = class ActivityApiController {
    async list(req, res) {
        const pagination = parsePagination(req.query);
        const result = await activityService.list(pagination, req.query.type, req.query.contact_id, req.query.deal_id);
        return res.json(result.activities, result.meta);
    }
    async show(req, res) {
        const activity = await activityService.findById(req.params.id);
        if (!activity)
            return res.error(404, 'NOT_FOUND', 'Activity not found');
        return res.json(activity.toJSON());
    }
    async create(req, res) {
        const body = req.body;
        if (!body.type || !body.subject || !body.owner_id) {
            return res.error(422, 'VALIDATION', 'type, subject, and owner_id are required');
        }
        const activity = await activityService.create(body);
        return res.status(201).json(activity.toJSON());
    }
    async update(req, res) {
        const activity = await activityService.update(req.params.id, req.body);
        if (!activity)
            return res.error(404, 'NOT_FOUND', 'Activity not found');
        return res.json(activity.toJSON());
    }
    async complete(req, res) {
        const activity = await activityService.markComplete(req.params.id);
        if (!activity)
            return res.error(404, 'NOT_FOUND', 'Activity not found');
        return res.json(activity.toJSON());
    }
    async destroy(req, res) {
        const deleted = await activityService.delete(req.params.id);
        if (!deleted)
            return res.error(404, 'NOT_FOUND', 'Activity not found');
        return res.empty();
    }
};
__decorate([
    Get('/'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function, Function]),
    __metadata("design:returntype", Promise)
], ActivityApiController.prototype, "list", null);
__decorate([
    Get('/:id'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function, Function]),
    __metadata("design:returntype", Promise)
], ActivityApiController.prototype, "show", null);
__decorate([
    Post('/'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function, Function]),
    __metadata("design:returntype", Promise)
], ActivityApiController.prototype, "create", null);
__decorate([
    Put('/:id'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function, Function]),
    __metadata("design:returntype", Promise)
], ActivityApiController.prototype, "update", null);
__decorate([
    Patch('/:id/complete'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function, Function]),
    __metadata("design:returntype", Promise)
], ActivityApiController.prototype, "complete", null);
__decorate([
    Delete('/:id'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function, Function]),
    __metadata("design:returntype", Promise)
], ActivityApiController.prototype, "destroy", null);
ActivityApiController = __decorate([
    Controller('/api/activities')
], ActivityApiController);
export { ActivityApiController };
//# sourceMappingURL=activity.api.controller.js.map