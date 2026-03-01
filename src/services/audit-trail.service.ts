import { AuditLog, type AuditAction } from '../models/audit-log.model.js';

interface LogInput {
    user_id?: string;
    action: AuditAction;
    entity_type: string;
    entity_id?: string;
    entity_name?: string;
    old_values?: Record<string, unknown>;
    new_values?: Record<string, unknown>;
    ip_address?: string;
    user_agent?: string;
    metadata?: Record<string, unknown>;
}

export class AuditTrailService {
    async log(data: LogInput): Promise<AuditLog> {
        return AuditLog.create({
            user_id: data.user_id,
            action: data.action,
            entity_type: data.entity_type,
            entity_id: data.entity_id,
            entity_name: data.entity_name,
            old_values: data.old_values ? JSON.stringify(data.old_values) : undefined,
            new_values: data.new_values ? JSON.stringify(data.new_values) : undefined,
            ip_address: data.ip_address,
            user_agent: data.user_agent,
            metadata: data.metadata ? JSON.stringify(data.metadata) : undefined,
        });
    }

    async getByEntity(entityType: string, entityId: string): Promise<AuditLog[]> {
        return AuditLog.where('entity_type', entityType).where('entity_id', entityId).orderBy('created_at', 'DESC').limit(100).get();
    }

    async getByUser(userId: string, limit = 50): Promise<AuditLog[]> {
        return AuditLog.where('user_id', userId).orderBy('created_at', 'DESC').limit(limit).get();
    }

    async getRecent(limit = 100): Promise<AuditLog[]> {
        return AuditLog.where('id', 'IS NOT', null).orderBy('created_at', 'DESC').limit(limit).get();
    }

    async search(filters: { action?: AuditAction; entity_type?: string; user_id?: string; from?: string; to?: string }): Promise<AuditLog[]> {
        let query = AuditLog.where('id', 'IS NOT', null).orderBy('created_at', 'DESC');

        if (filters.action) query = query.where('action', filters.action);
        if (filters.entity_type) query = query.where('entity_type', filters.entity_type);
        if (filters.user_id) query = query.where('user_id', filters.user_id);
        if (filters.from) query = query.where('created_at', '>=', filters.from);
        if (filters.to) query = query.where('created_at', '<=', filters.to);

        return query.limit(200).get();
    }
}
