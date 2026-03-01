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
let Company = class Company extends Model {
    name;
    industry;
    website;
    phone;
    email;
    address;
    city;
    state;
    country;
    employee_count;
    annual_revenue;
    notes;
};
__decorate([
    Column(),
    __metadata("design:type", String)
], Company.prototype, "id", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], Company.prototype, "name", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], Company.prototype, "industry", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], Company.prototype, "website", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], Company.prototype, "phone", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], Company.prototype, "email", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], Company.prototype, "address", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], Company.prototype, "city", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], Company.prototype, "state", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], Company.prototype, "country", void 0);
__decorate([
    Column(),
    __metadata("design:type", Number)
], Company.prototype, "employee_count", void 0);
__decorate([
    Column(),
    __metadata("design:type", Number)
], Company.prototype, "annual_revenue", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], Company.prototype, "notes", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], Company.prototype, "created_at", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], Company.prototype, "updated_at", void 0);
__decorate([
    Column(),
    __metadata("design:type", Object)
], Company.prototype, "deleted_at", void 0);
Company = __decorate([
    Table('companies')
], Company);
export { Company };
//# sourceMappingURL=company.model.js.map