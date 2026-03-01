/**
 * GAO CRM — Contact Controller (REDIRECT ONLY)
 *
 * All contact pages have been consolidated into the CRM Workspace.
 * This controller provides backward-compatible redirects from old URLs.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Controller, Get } from '@gao/http';
import { url } from '../helpers/url.js';
let ContactController = class ContactController {
    async list(req, res) {
        const qs = req.query ? '?' + new URLSearchParams(req.query).toString() : '';
        return res.redirect(url(`/crm/contacts${qs}`));
    }
    async createForm(_req, res) {
        return res.redirect(url('/crm/contacts/create'));
    }
    async detail(req, res) {
        return res.redirect(url(`/crm/contacts/${req.params.id}`));
    }
    async editForm(req, res) {
        return res.redirect(url(`/crm/contacts/${req.params.id}/edit`));
    }
};
__decorate([
    Get('/'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function, Function]),
    __metadata("design:returntype", Promise)
], ContactController.prototype, "list", null);
__decorate([
    Get('/create'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function, Function]),
    __metadata("design:returntype", Promise)
], ContactController.prototype, "createForm", null);
__decorate([
    Get('/:id'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function, Function]),
    __metadata("design:returntype", Promise)
], ContactController.prototype, "detail", null);
__decorate([
    Get('/:id/edit'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function, Function]),
    __metadata("design:returntype", Promise)
], ContactController.prototype, "editForm", null);
ContactController = __decorate([
    Controller('/contacts')
], ContactController);
export { ContactController };
//# sourceMappingURL=contact.controller.js.map