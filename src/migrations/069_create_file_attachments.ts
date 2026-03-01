import type { Migration, DatabaseDriver } from '@gao/orm';
export const CreateFileAttachmentsTable: Migration = {
    name: '069_create_file_attachments',
    async up(d: DatabaseDriver) { await d.execute(`CREATE TABLE file_attachments ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE, entity_type VARCHAR(30) NOT NULL, entity_id UUID NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW() )`); await d.execute('CREATE INDEX idx_fa_entity ON file_attachments (entity_type, entity_id)'); },
    async down(d: DatabaseDriver) { await d.execute('DROP TABLE IF EXISTS file_attachments CASCADE'); },
};
