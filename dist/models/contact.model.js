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
let Contact = class Contact extends Model {
    company_id;
    owner_id;
    first_name;
    last_name;
    email;
    phone;
    position;
    city;
    source;
    status;
    notes;
    last_contacted_at;
};
__decorate([
    Column(),
    __metadata("design:type", String)
], Contact.prototype, "id", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], Contact.prototype, "company_id", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], Contact.prototype, "owner_id", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], Contact.prototype, "first_name", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], Contact.prototype, "last_name", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], Contact.prototype, "email", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], Contact.prototype, "phone", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], Contact.prototype, "position", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], Contact.prototype, "city", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], Contact.prototype, "source", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], Contact.prototype, "status", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], Contact.prototype, "notes", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], Contact.prototype, "last_contacted_at", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], Contact.prototype, "created_at", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], Contact.prototype, "updated_at", void 0);
__decorate([
    Column(),
    __metadata("design:type", Object)
], Contact.prototype, "deleted_at", void 0);
Contact = __decorate([
    Table('contacts')
], Contact);
export { Contact };
//# sourceMappingURL=contact.model.js.map