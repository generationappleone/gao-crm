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
let Deal = class Deal extends Model {
    contact_id;
    company_id;
    owner_id;
    stage_id;
    title;
    value;
    currency;
    probability;
    expected_close_at;
    won_at;
    lost_at;
    lost_reason;
    description;
};
__decorate([
    Column(),
    __metadata("design:type", String)
], Deal.prototype, "id", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], Deal.prototype, "contact_id", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], Deal.prototype, "company_id", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], Deal.prototype, "owner_id", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], Deal.prototype, "stage_id", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], Deal.prototype, "title", void 0);
__decorate([
    Column(),
    __metadata("design:type", Number)
], Deal.prototype, "value", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], Deal.prototype, "currency", void 0);
__decorate([
    Column(),
    __metadata("design:type", Number)
], Deal.prototype, "probability", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], Deal.prototype, "expected_close_at", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], Deal.prototype, "won_at", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], Deal.prototype, "lost_at", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], Deal.prototype, "lost_reason", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], Deal.prototype, "description", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], Deal.prototype, "created_at", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], Deal.prototype, "updated_at", void 0);
__decorate([
    Column(),
    __metadata("design:type", Object)
], Deal.prototype, "deleted_at", void 0);
Deal = __decorate([
    Table('deals')
], Deal);
export { Deal };
//# sourceMappingURL=deal.model.js.map