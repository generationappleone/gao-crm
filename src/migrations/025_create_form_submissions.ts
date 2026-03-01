import type { Migration, DatabaseDriver } from '@gao/orm';

export const CreateFormSubmissionsTable: Migration = {
    name: '025_create_form_submissions',

    async up(driver: DatabaseDriver) {
        await driver.execute(`
            CREATE TABLE form_submissions (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
                contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
                data JSONB NOT NULL DEFAULT '{}',
                ip_address VARCHAR(45),
                user_agent TEXT,
                referrer VARCHAR(500),
                utm_source VARCHAR(100),
                utm_medium VARCHAR(100),
                utm_campaign VARCHAR(100),
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        `);
        await driver.execute('CREATE INDEX idx_fs_form ON form_submissions (form_id)');
        await driver.execute('CREATE INDEX idx_fs_contact ON form_submissions (contact_id)');
        await driver.execute('CREATE INDEX idx_fs_created ON form_submissions (created_at)');
        await driver.execute('CREATE INDEX idx_fs_utm ON form_submissions (utm_source, utm_medium, utm_campaign)');
    },

    async down(driver: DatabaseDriver) {
        await driver.execute('DROP TABLE IF EXISTS form_submissions CASCADE');
    },
};
