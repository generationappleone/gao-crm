import type { Migration, DatabaseDriver } from '@gao/orm';

export const CreateEmailLinkClicksTable: Migration = {
    name: '017_create_email_link_clicks',

    async up(driver: DatabaseDriver) {
        await driver.execute(`
            CREATE TABLE email_link_clicks (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                email_message_id UUID NOT NULL REFERENCES email_messages(id) ON DELETE CASCADE,
                original_url TEXT NOT NULL,
                clicked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                ip_address VARCHAR(45),
                user_agent TEXT
            )
        `);
        await driver.execute('CREATE INDEX idx_email_link_clicks_message ON email_link_clicks (email_message_id)');
    },

    async down(driver: DatabaseDriver) {
        await driver.execute('DROP TABLE IF EXISTS email_link_clicks CASCADE');
    },
};
