import type { Migration, DatabaseDriver } from '@gao/orm';

export const CreateWebTrackingSessionsTable: Migration = {
    name: '028_create_web_tracking_sessions',

    async up(driver: DatabaseDriver) {
        await driver.execute(`
            CREATE TABLE web_tracking_sessions (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                visitor_id VARCHAR(64) NOT NULL,
                contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
                ip_address VARCHAR(45),
                user_agent TEXT,
                referrer VARCHAR(500),
                utm_source VARCHAR(100),
                utm_medium VARCHAR(100),
                utm_campaign VARCHAR(100),
                utm_content VARCHAR(100),
                utm_term VARCHAR(100),
                country VARCHAR(2),
                city VARCHAR(100),
                device_type VARCHAR(20),
                browser VARCHAR(50),
                os VARCHAR(50),
                total_pageviews INTEGER NOT NULL DEFAULT 0,
                total_events INTEGER NOT NULL DEFAULT 0,
                duration_seconds INTEGER NOT NULL DEFAULT 0,
                started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        `);
        await driver.execute('CREATE INDEX idx_wts_visitor ON web_tracking_sessions (visitor_id)');
        await driver.execute('CREATE INDEX idx_wts_contact ON web_tracking_sessions (contact_id)');
        await driver.execute('CREATE INDEX idx_wts_started ON web_tracking_sessions (started_at)');
        await driver.execute('CREATE INDEX idx_wts_utm ON web_tracking_sessions (utm_source, utm_medium, utm_campaign)');
    },

    async down(driver: DatabaseDriver) {
        await driver.execute('DROP TABLE IF EXISTS web_tracking_sessions CASCADE');
    },
};
