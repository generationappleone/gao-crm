import { Model, Table, Column } from '@gao/orm';
@Table('currencies') export class Currency extends Model { @Column() declare id: string; @Column() code!: string; @Column() name!: string; @Column() symbol!: string; @Column() decimal_places!: number; @Column() is_default!: boolean; @Column() is_active!: boolean; @Column() declare created_at: string; }
