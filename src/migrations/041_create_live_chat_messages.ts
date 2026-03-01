import type { Migration, DatabaseDriver } from '@gao/orm';

export const CreateLiveChatMessagesTable: Migration = {
    name: '041_create_live_chat_messages',

    async up(driver: DatabaseDriver) {
        await driver.execute(`
            CREATE TABLE live_chat_messages (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                session_id UUID NOT NULL REFERENCES live_chat_sessions(id) ON DELETE CASCADE,
                sender_type VARCHAR(10) NOT NULL,
                sender_id UUID,
                content TEXT NOT NULL,
                message_type VARCHAR(20) NOT NULL DEFAULT 'text',
                attachments JSONB,
                is_read BOOLEAN NOT NULL DEFAULT false,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

                CONSTRAINT ck_lcm_sender CHECK (sender_type IN ('visitor', 'agent', 'bot')),
                CONSTRAINT ck_lcm_type CHECK (message_type IN ('text', 'image', 'file', 'system', 'typing'))
            )
        `);
        await driver.execute('CREATE INDEX idx_lcm_session ON live_chat_messages (session_id, created_at ASC)');
    },

    async down(driver: DatabaseDriver) {
        await driver.execute('DROP TABLE IF EXISTS live_chat_messages CASCADE');
    },
};
