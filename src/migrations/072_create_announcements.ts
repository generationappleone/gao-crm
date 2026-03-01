import type { Migration, DatabaseDriver } from '@gao/orm';
export const CreateAnnouncementsTable: Migration = {
    name: '072_create_announcements',
    async up(d: DatabaseDriver) { await d.execute(`CREATE TABLE announcements ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, title VARCHAR(300) NOT NULL, content TEXT NOT NULL, is_pinned BOOLEAN NOT NULL DEFAULT false, published_at TIMESTAMPTZ, expires_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), deleted_at TIMESTAMPTZ )`); await d.execute('CREATE INDEX idx_ann_published ON announcements (published_at DESC) WHERE deleted_at IS NULL'); },
    async down(d: DatabaseDriver) { await d.execute('DROP TABLE IF EXISTS announcements CASCADE'); },
};
