import { Model, Table, Column } from '@gao/orm';
@Table('translations') export class Translation extends Model { @Column() declare id: string; @Column() locale!: string; @Column() namespace!: string; @Column() key!: string; @Column() value!: string; @Column() declare created_at: string; @Column() declare updated_at: string; }
