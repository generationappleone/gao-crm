import { Model, Table, Column } from '@gao/orm';
@Table('exchange_rates') export class ExchangeRate extends Model { @Column() declare id: string; @Column() from_currency!: string; @Column() to_currency!: string; @Column() rate!: number; @Column() effective_at!: string; @Column() declare created_at: string; }
