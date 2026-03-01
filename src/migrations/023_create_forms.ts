import type { Migration, DatabaseDriver } from '@gao/orm';

export const CreateFormsTable: Migration = {
    name: '023_create_forms',

    async up(driver: DatabaseDriver) {
        await driver.execute(`
            CREATE TABLE forms (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(255) NOT NULL,
                slug VARCHAR(120) NOT NULL,
                description TEXT,
                owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                status VARCHAR(20) NOT NULL DEFAULT 'draft',
                redirect_url VARCHAR(500),
                success_message TEXT DEFAULT 'Thank you for your submission!',
                notification_emails TEXT,
                submit_button_text VARCHAR(100) NOT NULL DEFAULT 'Submit',
                style_config JSONB,
                total_submissions INTEGER NOT NULL DEFAULT 0,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                deleted_at TIMESTAMPTZ,

                CONSTRAINT uq_forms_slug UNIQUE (slug),
                CONSTRAINT ck_forms_status CHECK (status IN ('draft', 'active', 'paused', 'archived'))
            )
        `);
        await driver.execute('CREATE INDEX idx_forms_owner ON forms (owner_id) WHERE deleted_at IS NULL');
        await driver.execute('CREATE INDEX idx_forms_status ON forms (status) WHERE deleted_at IS NULL');
        await driver.execute('CREATE INDEX idx_forms_slug ON forms (slug) WHERE deleted_at IS NULL');
    },

    async down(driver: DatabaseDriver) {
        await driver.execute('DROP TABLE IF EXISTS forms CASCADE');
    },
};
