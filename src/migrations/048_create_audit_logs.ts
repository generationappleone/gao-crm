import type { Migration, DatabaseDriver } from '@gao/orm';

export const CreateAuditLogsTable: Migration = {
    name: '048_create_audit_logs',

    async up(driver: DatabaseDriver) {
        await driver.execute(`
            CREATE TABLE audit_logs (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID REFERENCES users(id) ON DELETE SET NULL,
                action VARCHAR(30) NOT NULL,
                entity_type VARCHAR(30) NOT NULL,
                entity_id UUID,
                entity_name VARCHAR(255),
                old_values JSONB,
                new_values JSONB,
                ip_address VARCHAR(45),
                user_agent TEXT,
                metadata JSONB,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

                CONSTRAINT ck_al_action CHECK (action IN ('create', 'update', 'delete', 'restore', 'login', 'logout', 'export', 'import', 'assign', 'status_change'))
            )
        `);
        await driver.execute('CREATE INDEX idx_al_user ON audit_logs (user_id, created_at DESC)');
        await driver.execute('CREATE INDEX idx_audit_entity ON audit_logs (entity_type, entity_id)');
        await driver.execute('CREATE INDEX idx_al_action ON audit_logs (action)');
        await driver.execute('CREATE INDEX idx_al_created ON audit_logs (created_at DESC)');
    },

    async down(driver: DatabaseDriver) {
        await driver.execute('DROP TABLE IF EXISTS audit_logs CASCADE');
    },
};
