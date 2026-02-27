var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Get } from '@gao/http';
import { DashboardService } from '../../services/dashboard.service.js';
const dashboardService = new DashboardService();
export class DashboardApiController {
    async stats(_req, res) {
        const stats = await dashboardService.getStats();
        return res.json(stats);
    }
}
__decorate([
    Get('/api/dashboard/stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function, Function]),
    __metadata("design:returntype", Promise)
], DashboardApiController.prototype, "stats", null);
//# sourceMappingURL=dashboard.api.controller.js.map