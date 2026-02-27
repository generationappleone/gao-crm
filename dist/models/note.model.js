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
let Note = class Note extends Model {
    notable_type;
    notable_id;
    author_id;
    content;
};
__decorate([
    Column(),
    __metadata("design:type", String)
], Note.prototype, "id", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], Note.prototype, "notable_type", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], Note.prototype, "notable_id", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], Note.prototype, "author_id", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], Note.prototype, "content", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], Note.prototype, "created_at", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], Note.prototype, "updated_at", void 0);
__decorate([
    Column(),
    __metadata("design:type", Object)
], Note.prototype, "deleted_at", void 0);
Note = __decorate([
    Table('notes')
], Note);
export { Note };
//# sourceMappingURL=note.model.js.map