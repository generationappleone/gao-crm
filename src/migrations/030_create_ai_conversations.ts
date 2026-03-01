import type { Migration, DatabaseDriver } from '@gao/orm';

export const CreateAiConversationsTable: Migration = {
    name: '030_create_ai_conversations',

    async up(driver: DatabaseDriver) {
        await driver.execute(`
            CREATE TABLE ai_conversations (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                title VARCHAR(255),
                context_type VARCHAR(30),
                context_id UUID,
                model VARCHAR(50) NOT NULL DEFAULT 'gemini-2.0-flash',
                total_messages INTEGER NOT NULL DEFAULT 0,
                total_tokens_used INTEGER NOT NULL DEFAULT 0,
                last_message_at TIMESTAMPTZ,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                deleted_at TIMESTAMPTZ,

                CONSTRAINT ck_aic_ctx CHECK (context_type IS NULL OR context_type IN ('contact', 'deal', 'company', 'general'))
            )
        `);
        await driver.execute('CREATE INDEX idx_aic_user ON ai_conversations (user_id) WHERE deleted_at IS NULL');
        await driver.execute('CREATE INDEX idx_aic_context ON ai_conversations (context_type, context_id) WHERE deleted_at IS NULL');
        await driver.execute('CREATE INDEX idx_aic_last ON ai_conversations (last_message_at DESC) WHERE deleted_at IS NULL');
    },

    async down(driver: DatabaseDriver) {
        await driver.execute('DROP TABLE IF EXISTS ai_conversations CASCADE');
    },
};
