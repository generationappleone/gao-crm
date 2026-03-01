import type { Migration, DatabaseDriver } from '@gao/orm';
export const CreateMessagesTable: Migration = {
    name: '067_create_messages',
    async up(d: DatabaseDriver) { await d.execute(`CREATE TABLE messages ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), channel_id UUID NOT NULL REFERENCES channels(id) ON DELETE CASCADE, sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, content TEXT NOT NULL, message_type VARCHAR(20) NOT NULL DEFAULT 'text', parent_id UUID REFERENCES messages(id) ON DELETE SET NULL, is_edited BOOLEAN NOT NULL DEFAULT false, is_pinned BOOLEAN NOT NULL DEFAULT false, attachments JSONB, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), deleted_at TIMESTAMPTZ, CONSTRAINT ck_msg_type CHECK (message_type IN ('text', 'image', 'file', 'system', 'reply')) )`); await d.execute('CREATE INDEX idx_msg_channel ON messages (channel_id, created_at DESC) WHERE deleted_at IS NULL'); },
    async down(d: DatabaseDriver) { await d.execute('DROP TABLE IF EXISTS messages CASCADE'); },
};
