var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Model, Table, Column } from '@gao/orm';
let DealStage = class DealStage extends Model {
    name;
    slug;
    display_order;
    color;
    is_won;
    is_lost;
};
__decorate([
    Column(),
    __metadata("design:type", String)
], DealStage.prototype, "id", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], DealStage.prototype, "name", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], DealStage.prototype, "slug", void 0);
__decorate([
    Column(),
    __metadata("design:type", Number)
], DealStage.prototype, "display_order", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], DealStage.prototype, "color", void 0);
__decorate([
    Column(),
    __metadata("design:type", Boolean)
], DealStage.prototype, "is_won", void 0);
__decorate([
    Column(),
    __metadata("design:type", Boolean)
], DealStage.prototype, "is_lost", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], DealStage.prototype, "created_at", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], DealStage.prototype, "updated_at", void 0);
DealStage = __decorate([
    Table('deal_stages')
], DealStage);
export { DealStage };
//# sourceMappingURL=deal-stage.model.js.map