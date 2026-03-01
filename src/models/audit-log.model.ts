import { Model, Table, Column } from '@gao/orm';

export type AuditAction = 'create' | 'update' | 'delete' | 'restore' | 'login' | 'logout' | 'export' | 'import' | 'assign' | 'status_change';

@Table('audit_logs')
export class AuditLog extends Model {
    @Column() declare id: string;
    @Column() user_id?: string;
    @Column() action!: AuditAction;
    @Column() entity_type!: string;
    @Column() entity_id?: string;
    @Column() entity_name?: string;
    @Column() old_values?: string; // JSONB
    @Column() new_values?: string; // JSONB
    @Column() ip_address?: string;
    @Column() user_agent?: string;
    @Column() metadata?: string; // JSONB
    @Column() declare created_at: string;
}
