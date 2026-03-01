import type { Migration, DatabaseDriver } from '@gao/orm';
export const CreateChannelsTable: Migration = {
    name: '065_create_channels',
    async up(d: DatabaseDriver) { await d.execute(`CREATE TABLE channels ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name VARCHAR(200) NOT NULL, slug VARCHAR(200) NOT NULL UNIQUE, description TEXT, type VARCHAR(20) NOT NULL DEFAULT 'public', created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, is_archived BOOLEAN NOT NULL DEFAULT false, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), CONSTRAINT ck_ch_type CHECK (type IN ('public', 'private', 'direct')) )`); await d.execute('CREATE INDEX idx_ch_archived ON channels (is_archived)'); },
    async down(d: DatabaseDriver) { await d.execute('DROP TABLE IF EXISTS channels CASCADE'); },
};
