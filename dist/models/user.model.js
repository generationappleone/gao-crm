var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Model, Table, Column, Encrypted } from '@gao/orm';
let User = class User extends Model {
    email;
    name;
    password;
    role;
    is_active;
    avatar_url;
    last_login_at;
};
__decorate([
    Column(),
    __metadata("design:type", String)
], User.prototype, "id", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], User.prototype, "name", void 0);
__decorate([
    Encrypted(),
    __metadata("design:type", String)
], User.prototype, "password", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], User.prototype, "role", void 0);
__decorate([
    Column(),
    __metadata("design:type", Boolean)
], User.prototype, "is_active", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], User.prototype, "avatar_url", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], User.prototype, "last_login_at", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], User.prototype, "created_at", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], User.prototype, "updated_at", void 0);
__decorate([
    Column(),
    __metadata("design:type", Object)
], User.prototype, "deleted_at", void 0);
User = __decorate([
    Table('users')
], User);
export { User };
//# sourceMappingURL=user.model.js.map