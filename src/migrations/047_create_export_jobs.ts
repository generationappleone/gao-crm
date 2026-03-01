import type { Migration, DatabaseDriver } from '@gao/orm';

export const CreateExportJobsTable: Migration = {
    name: '047_create_export_jobs',

    async up(driver: DatabaseDriver) {
        await driver.execute(`
            CREATE TABLE export_jobs (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                export_type VARCHAR(10) NOT NULL,
                entity_type VARCHAR(30) NOT NULL,
                filters JSONB NOT NULL DEFAULT '{}',
                columns JSONB NOT NULL DEFAULT '[]',
                status VARCHAR(20) NOT NULL DEFAULT 'pending',
                file_path VARCHAR(500),
                file_size INTEGER,
                total_rows INTEGER,
                error_message TEXT,
                started_at TIMESTAMPTZ,
                completed_at TIMESTAMPTZ,
                expires_at TIMESTAMPTZ,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

                CONSTRAINT ck_ej_type CHECK (export_type IN ('csv', 'xlsx', 'pdf', 'json')),
                CONSTRAINT ck_ej_entity CHECK (entity_type IN ('contact', 'company', 'deal', 'ticket', 'activity', 'campaign', 'report')),
                CONSTRAINT ck_ej_status CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'expired'))
            )
        `);
        await driver.execute('CREATE INDEX idx_ej_user ON export_jobs (user_id, created_at DESC)');
        await driver.execute('CREATE INDEX idx_ej_status ON export_jobs (status)');
    },

    async down(driver: DatabaseDriver) {
        await driver.execute('DROP TABLE IF EXISTS export_jobs CASCADE');
    },
};
