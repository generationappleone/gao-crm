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
let Activity = class Activity extends Model {
    contact_id;
    deal_id;
    owner_id;
    type;
    subject;
    description;
    due_at;
    completed_at;
    is_completed;
};
__decorate([
    Column(),
    __metadata("design:type", String)
], Activity.prototype, "id", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], Activity.prototype, "contact_id", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], Activity.prototype, "deal_id", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], Activity.prototype, "owner_id", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], Activity.prototype, "type", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], Activity.prototype, "subject", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], Activity.prototype, "description", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], Activity.prototype, "due_at", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], Activity.prototype, "completed_at", void 0);
__decorate([
    Column(),
    __metadata("design:type", Boolean)
], Activity.prototype, "is_completed", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], Activity.prototype, "created_at", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], Activity.prototype, "updated_at", void 0);
__decorate([
    Column(),
    __metadata("design:type", Object)
], Activity.prototype, "deleted_at", void 0);
Activity = __decorate([
    Table('activities')
], Activity);
export { Activity };
//# sourceMappingURL=activity.model.js.map