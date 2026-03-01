import type { Migration, DatabaseDriver } from '@gao/orm';

export const CreateWebTrackingEventsTable: Migration = {
    name: '029_create_web_tracking_events',

    async up(driver: DatabaseDriver) {
        await driver.execute(`
            CREATE TABLE web_tracking_events (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                session_id UUID NOT NULL REFERENCES web_tracking_sessions(id) ON DELETE CASCADE,
                event_type VARCHAR(30) NOT NULL,
                page_url VARCHAR(1000),
                page_title VARCHAR(500),
                element_id VARCHAR(100),
                element_text VARCHAR(255),
                custom_data JSONB,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

                CONSTRAINT ck_wte_type CHECK (event_type IN (
                    'pageview', 'click', 'scroll', 'form_start', 'form_submit',
                    'video_play', 'download', 'outbound_click', 'custom'
                ))
            )
        `);
        await driver.execute('CREATE INDEX idx_wte_session ON web_tracking_events (session_id)');
        await driver.execute('CREATE INDEX idx_wte_type ON web_tracking_events (event_type)');
        await driver.execute('CREATE INDEX idx_wte_created ON web_tracking_events (created_at)');
        await driver.execute('CREATE INDEX idx_wte_page ON web_tracking_events (page_url) WHERE event_type = \'pageview\'');
    },

    async down(driver: DatabaseDriver) {
        await driver.execute('DROP TABLE IF EXISTS web_tracking_events CASCADE');
    },
};
