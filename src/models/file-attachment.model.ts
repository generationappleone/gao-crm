import { Model, Table, Column } from '@gao/orm';
@Table('file_attachments') export class FileAttachment extends Model { @Column() declare id: string; @Column() file_id!: string; @Column() entity_type!: string; @Column() entity_id!: string; @Column() declare created_at: string; }
