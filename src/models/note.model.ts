import { Model, Table, Column } from '@gao/orm';

@Table('notes')
export class Note extends Model {
    @Column() declare id: string;
    @Column() notable_type!: string;
    @Column() notable_id!: string;
    @Column() author_id!: string;
    @Column() content!: string;
    @Column() declare created_at: string;
    @Column() declare updated_at: string;
    @Column() declare deleted_at: string | undefined;
}
