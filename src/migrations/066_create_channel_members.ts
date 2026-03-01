import type { Migration, DatabaseDriver } from '@gao/orm';
export const CreateChannelMembersTable: Migration = {
    name: '066_create_channel_members',
    async up(d: DatabaseDriver) { await d.execute(`CREATE TABLE channel_members ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), channel_id UUID NOT NULL REFERENCES channels(id) ON DELETE CASCADE, user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, role VARCHAR(20) NOT NULL DEFAULT 'member', last_read_at TIMESTAMPTZ, joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), CONSTRAINT uq_cm UNIQUE (channel_id, user_id), CONSTRAINT ck_cm_role CHECK (role IN ('owner', 'admin', 'member')) )`); },
    async down(d: DatabaseDriver) { await d.execute('DROP TABLE IF EXISTS channel_members CASCADE'); },
};
