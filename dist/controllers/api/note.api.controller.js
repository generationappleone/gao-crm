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
import { NoteService } from '../../services/note.service.js';
const noteService = new NoteService();
let NoteApiController = class NoteApiController {
    async list(req, res) {
        const { notable_type, notable_id } = req.query;
        if (!notable_type || !notable_id) {
            return res.error(422, 'VALIDATION', 'notable_type and notable_id are required');
        }
        const notes = await noteService.listByNotable(notable_type, notable_id);
        return res.json(notes);
    }
    async create(req, res) {
        const body = req.body;
        if (!body.notable_type || !body.notable_id || !body.content || !body.author_id) {
            return res.error(422, 'VALIDATION', 'notable_type, notable_id, author_id, and content are required');
        }
        const note = await noteService.create(body);
        return res.status(201).json(note.toJSON());
    }
    async update(req, res) {
        const { content } = req.body;
        if (!content)
            return res.error(422, 'VALIDATION', 'content is required');
        const note = await noteService.update(req.params.id, { content });
        if (!note)
            return res.error(404, 'NOT_FOUND', 'Note not found');
        return res.json(note.toJSON());
    }
    async destroy(req, res) {
        const deleted = await noteService.delete(req.params.id);
        if (!deleted)
            return res.error(404, 'NOT_FOUND', 'Note not found');
        return res.empty();
    }
};
__decorate([
    Get('/'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function, Function]),
    __metadata("design:returntype", Promise)
], NoteApiController.prototype, "list", null);
__decorate([
    Post('/'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function, Function]),
    __metadata("design:returntype", Promise)
], NoteApiController.prototype, "create", null);
__decorate([
    Put('/:id'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function, Function]),
    __metadata("design:returntype", Promise)
], NoteApiController.prototype, "update", null);
__decorate([
    Delete('/:id'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function, Function]),
    __metadata("design:returntype", Promise)
], NoteApiController.prototype, "destroy", null);
NoteApiController = __decorate([
    Controller('/api/notes')
], NoteApiController);
export { NoteApiController };
//# sourceMappingURL=note.api.controller.js.map