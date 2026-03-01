import type { Migration, DatabaseDriver } from '@gao/orm';

export const CreateAiMessagesTable: Migration = {
    name: '031_create_ai_messages',

    async up(driver: DatabaseDriver) {
        await driver.execute(`
            CREATE TABLE ai_messages (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
                role VARCHAR(20) NOT NULL,
                content TEXT NOT NULL,
                tokens_used INTEGER NOT NULL DEFAULT 0,
                tool_calls JSONB,
                metadata JSONB,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

                CONSTRAINT ck_aim_role CHECK (role IN ('user', 'assistant', 'system', 'tool'))
            )
        `);
        await driver.execute('CREATE INDEX idx_aim_conversation ON ai_messages (conversation_id, created_at ASC)');
    },

    async down(driver: DatabaseDriver) {
        await driver.execute('DROP TABLE IF EXISTS ai_messages CASCADE');
    },
};
