import { Model, Table, Column } from '@gao/orm';
@Table('channels') export class Channel extends Model { @Column() declare id: string; @Column() name!: string; @Column() slug!: string; @Column() description?: string; @Column() type!: string; @Column() created_by!: string; @Column() is_archived!: boolean; @Column() declare created_at: string; @Column() declare updated_at: string; }
