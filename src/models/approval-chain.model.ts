import { Model, Table, Column } from '@gao/orm';
@Table('approval_chains') export class ApprovalChain extends Model { @Column() declare id: string; @Column() name!: string; @Column() entity_type!: string; @Column() conditions!: string; @Column() steps!: string; @Column() is_active!: boolean; @Column() declare created_at: string; @Column() declare updated_at: string; }
