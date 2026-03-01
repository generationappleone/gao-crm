import type { Migration, DatabaseDriver } from '@gao/orm';

export const CreateEmailTemplatesTable: Migration = {
    name: '015_create_email_templates',

    async up(driver: DatabaseDriver) {
        await driver.execute(`
            CREATE TABLE email_templates (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(255) NOT NULL,
                subject VARCHAR(500) NOT NULL,
                body_html TEXT NOT NULL,
                body_text TEXT,
                category VARCHAR(50),
                owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                is_shared BOOLEAN NOT NULL DEFAULT false,
                variables JSONB,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                deleted_at TIMESTAMPTZ,

                CONSTRAINT ck_email_templates_category CHECK (
                    category IS NULL OR category IN ('follow_up', 'introduction', 'proposal', 'thank_you', 'meeting', 'general')
                )
            )
        `);
        await driver.execute('CREATE INDEX idx_email_templates_owner ON email_templates (owner_id) WHERE deleted_at IS NULL');
        await driver.execute('CREATE INDEX idx_email_templates_category ON email_templates (category) WHERE deleted_at IS NULL');
        await driver.execute('CREATE INDEX idx_email_templates_name ON email_templates (name) WHERE deleted_at IS NULL');
    },

    async down(driver: DatabaseDriver) {
        await driver.execute('DROP TABLE IF EXISTS email_templates CASCADE');
    },
};
