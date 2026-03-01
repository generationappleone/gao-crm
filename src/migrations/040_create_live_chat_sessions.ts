import type { Migration, DatabaseDriver } from '@gao/orm';

export const CreateLiveChatSessionsTable: Migration = {
    name: '040_create_live_chat_sessions',

    async up(driver: DatabaseDriver) {
        await driver.execute(`
            CREATE TABLE live_chat_sessions (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                visitor_id VARCHAR(64) NOT NULL,
                contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
                assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
                status VARCHAR(20) NOT NULL DEFAULT 'waiting',
                channel VARCHAR(20) NOT NULL DEFAULT 'web_chat',
                visitor_name VARCHAR(150),
                visitor_email VARCHAR(255),
                visitor_ip VARCHAR(45),
                visitor_user_agent TEXT,
                page_url VARCHAR(500),
                total_messages INTEGER NOT NULL DEFAULT 0,
                rating INTEGER,
                feedback TEXT,
                started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                first_response_at TIMESTAMPTZ,
                ended_at TIMESTAMPTZ,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

                CONSTRAINT ck_lcs_status CHECK (status IN ('waiting', 'active', 'transferred', 'ended', 'missed')),
                CONSTRAINT ck_lcs_channel CHECK (channel IN ('web_chat', 'whatsapp', 'facebook', 'instagram')),
                CONSTRAINT ck_lcs_rating CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5))
            )
        `);
        await driver.execute('CREATE INDEX idx_lcs_visitor ON live_chat_sessions (visitor_id)');
        await driver.execute('CREATE INDEX idx_lcs_contact ON live_chat_sessions (contact_id)');
        await driver.execute('CREATE INDEX idx_lcs_assigned ON live_chat_sessions (assigned_to)');
        await driver.execute('CREATE INDEX idx_lcs_status ON live_chat_sessions (status)');
        await driver.execute('CREATE INDEX idx_lcs_started ON live_chat_sessions (started_at DESC)');
    },

    async down(driver: DatabaseDriver) {
        await driver.execute('DROP TABLE IF EXISTS live_chat_sessions CASCADE');
    },
};
