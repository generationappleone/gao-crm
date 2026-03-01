import type { Migration, DatabaseDriver } from '@gao/orm';

export const CreateEmailMessagesTable: Migration = {
    name: '016_create_email_messages',

    async up(driver: DatabaseDriver) {
        await driver.execute(`
            CREATE TABLE email_messages (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
                deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
                owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                template_id UUID REFERENCES email_templates(id) ON DELETE SET NULL,
                from_email VARCHAR(255) NOT NULL,
                to_email VARCHAR(255) NOT NULL,
                cc TEXT,
                bcc TEXT,
                subject VARCHAR(500) NOT NULL,
                body_html TEXT NOT NULL,
                status VARCHAR(20) NOT NULL DEFAULT 'draft',
                tracking_id UUID UNIQUE DEFAULT gen_random_uuid(),
                opened_at TIMESTAMPTZ,
                open_count INTEGER NOT NULL DEFAULT 0,
                clicked_at TIMESTAMPTZ,
                click_count INTEGER NOT NULL DEFAULT 0,
                sent_at TIMESTAMPTZ,
                scheduled_at TIMESTAMPTZ,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                deleted_at TIMESTAMPTZ,

                CONSTRAINT ck_email_messages_status CHECK (
                    status IN ('draft', 'queued', 'sent', 'delivered', 'bounced', 'failed')
                )
            )
        `);
        await driver.execute('CREATE INDEX idx_email_messages_contact ON email_messages (contact_id) WHERE deleted_at IS NULL');
        await driver.execute('CREATE INDEX idx_email_messages_deal ON email_messages (deal_id) WHERE deleted_at IS NULL');
        await driver.execute('CREATE INDEX idx_email_messages_owner ON email_messages (owner_id) WHERE deleted_at IS NULL');
        await driver.execute('CREATE INDEX idx_email_messages_status ON email_messages (status) WHERE deleted_at IS NULL');
        await driver.execute('CREATE INDEX idx_email_messages_to ON email_messages (to_email) WHERE deleted_at IS NULL');
        await driver.execute('CREATE INDEX idx_email_messages_sent ON email_messages (sent_at DESC) WHERE deleted_at IS NULL');
        await driver.execute('CREATE INDEX idx_email_messages_scheduled ON email_messages (scheduled_at) WHERE status = \'queued\' AND deleted_at IS NULL');
    },

    async down(driver: DatabaseDriver) {
        await driver.execute('DROP TABLE IF EXISTS email_messages CASCADE');
    },
};
