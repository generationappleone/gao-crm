import type { Migration, DatabaseDriver } from '@gao/orm';

export const CreateAutomationLogsTable: Migration = {
    name: '036_create_automation_logs',

    async up(driver: DatabaseDriver) {
        await driver.execute(`
            CREATE TABLE automation_logs (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                automation_id UUID NOT NULL REFERENCES automations(id) ON DELETE CASCADE,
                step_id UUID REFERENCES automation_steps(id) ON DELETE SET NULL,
                entity_type VARCHAR(30),
                entity_id UUID,
                status VARCHAR(20) NOT NULL,
                input_data JSONB,
                output_data JSONB,
                error_message TEXT,
                duration_ms INTEGER,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

                CONSTRAINT ck_al_status CHECK (status IN ('started', 'running', 'success', 'failed', 'skipped'))
            )
        `);
        await driver.execute('CREATE INDEX idx_al_automation ON automation_logs (automation_id, created_at DESC)');
        await driver.execute('CREATE INDEX idx_al_step ON automation_logs (step_id)');
        await driver.execute('CREATE INDEX idx_al_entity ON automation_logs (entity_type, entity_id)');
        await driver.execute('CREATE INDEX idx_al_status ON automation_logs (status)');
    },

    async down(driver: DatabaseDriver) {
        await driver.execute('DROP TABLE IF EXISTS automation_logs CASCADE');
    },
};
