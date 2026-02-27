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
let Tag = class Tag extends Model {
    name;
    slug;
    color;
};
__decorate([
    Column(),
    __metadata("design:type", String)
], Tag.prototype, "id", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], Tag.prototype, "name", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], Tag.prototype, "slug", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], Tag.prototype, "color", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], Tag.prototype, "created_at", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], Tag.prototype, "updated_at", void 0);
Tag = __decorate([
    Table('tags')
], Tag);
export { Tag };
//# sourceMappingURL=tag.model.js.map