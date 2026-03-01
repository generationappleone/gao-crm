import type { Migration, DatabaseDriver } from '@gao/orm';

export const CreateCampaignsTable: Migration = {
    name: '026_create_campaigns',

    async up(driver: DatabaseDriver) {
        await driver.execute(`
            CREATE TABLE campaigns (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(255) NOT NULL,
                owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                type VARCHAR(20) NOT NULL DEFAULT 'email',
                status VARCHAR(20) NOT NULL DEFAULT 'draft',
                template_id UUID REFERENCES email_templates(id) ON DELETE SET NULL,
                subject VARCHAR(500),
                body_html TEXT,
                from_email VARCHAR(255),
                from_name VARCHAR(150),
                source VARCHAR(100),
                medium VARCHAR(100) DEFAULT 'email',
                scheduled_at TIMESTAMPTZ,
                sent_at TIMESTAMPTZ,
                completed_at TIMESTAMPTZ,
                total_recipients INTEGER NOT NULL DEFAULT 0,
                total_sent INTEGER NOT NULL DEFAULT 0,
                total_opens INTEGER NOT NULL DEFAULT 0,
                total_clicks INTEGER NOT NULL DEFAULT 0,
                total_bounces INTEGER NOT NULL DEFAULT 0,
                total_unsubscribes INTEGER NOT NULL DEFAULT 0,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                deleted_at TIMESTAMPTZ,

                CONSTRAINT ck_camp_type CHECK (type IN ('email', 'sms', 'whatsapp')),
                CONSTRAINT ck_camp_status CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'paused', 'cancelled'))
            )
        `);
        await driver.execute('CREATE INDEX idx_camp_owner ON campaigns (owner_id) WHERE deleted_at IS NULL');
        await driver.execute('CREATE INDEX idx_camp_status ON campaigns (status) WHERE deleted_at IS NULL');
        await driver.execute('CREATE INDEX idx_camp_type ON campaigns (type) WHERE deleted_at IS NULL');
        await driver.execute('CREATE INDEX idx_camp_scheduled ON campaigns (scheduled_at) WHERE deleted_at IS NULL AND status = \'scheduled\'');
    },

    async down(driver: DatabaseDriver) {
        await driver.execute('DROP TABLE IF EXISTS campaigns CASCADE');
    },
};
