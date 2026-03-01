import type { Migration, DatabaseDriver } from '@gao/orm';

export const CreateCampaignRecipientsTable: Migration = {
    name: '027_create_campaign_recipients',

    async up(driver: DatabaseDriver) {
        await driver.execute(`
            CREATE TABLE campaign_recipients (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
                contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
                email VARCHAR(255) NOT NULL,
                status VARCHAR(20) NOT NULL DEFAULT 'pending',
                sent_at TIMESTAMPTZ,
                opened_at TIMESTAMPTZ,
                clicked_at TIMESTAMPTZ,
                bounced_at TIMESTAMPTZ,
                unsubscribed_at TIMESTAMPTZ,
                open_count INTEGER NOT NULL DEFAULT 0,
                click_count INTEGER NOT NULL DEFAULT 0,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

                CONSTRAINT ck_cr_status CHECK (status IN ('pending', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'unsubscribed', 'failed'))
            )
        `);
        await driver.execute('CREATE INDEX idx_cr_campaign ON campaign_recipients (campaign_id)');
        await driver.execute('CREATE INDEX idx_cr_contact ON campaign_recipients (contact_id)');
        await driver.execute('CREATE INDEX idx_cr_status ON campaign_recipients (campaign_id, status)');
        await driver.execute('CREATE UNIQUE INDEX uq_cr_campaign_contact ON campaign_recipients (campaign_id, contact_id)');
    },

    async down(driver: DatabaseDriver) {
        await driver.execute('DROP TABLE IF EXISTS campaign_recipients CASCADE');
    },
};
