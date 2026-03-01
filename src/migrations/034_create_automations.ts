import type { Migration, DatabaseDriver } from '@gao/orm';

export const CreateAutomationsTable: Migration = {
    name: '034_create_automations',

    async up(driver: DatabaseDriver) {
        await driver.execute(`
            CREATE TABLE automations (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(255) NOT NULL,
                description TEXT,
                owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                trigger_type VARCHAR(30) NOT NULL,
                trigger_config JSONB NOT NULL DEFAULT '{}',
                status VARCHAR(20) NOT NULL DEFAULT 'draft',
                is_active BOOLEAN NOT NULL DEFAULT false,
                total_runs INTEGER NOT NULL DEFAULT 0,
                total_successes INTEGER NOT NULL DEFAULT 0,
                total_failures INTEGER NOT NULL DEFAULT 0,
                last_run_at TIMESTAMPTZ,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                deleted_at TIMESTAMPTZ,

                CONSTRAINT ck_auto_trigger CHECK (trigger_type IN (
                    'contact_created', 'contact_updated', 'deal_created', 'deal_stage_changed',
                    'deal_won', 'deal_lost', 'form_submitted', 'email_opened',
                    'email_clicked', 'tag_added', 'score_changed', 'manual', 'scheduled'
                )),
                CONSTRAINT ck_auto_status CHECK (status IN ('draft', 'active', 'paused', 'archived'))
            )
        `);
        await driver.execute('CREATE INDEX idx_auto_owner ON automations (owner_id) WHERE deleted_at IS NULL');
        await driver.execute('CREATE INDEX idx_auto_trigger ON automations (trigger_type) WHERE deleted_at IS NULL AND is_active = true');
        await driver.execute('CREATE INDEX idx_auto_status ON automations (status) WHERE deleted_at IS NULL');
    },

    async down(driver: DatabaseDriver) {
        await driver.execute('DROP TABLE IF EXISTS automations CASCADE');
    },
};
