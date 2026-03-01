import type { Migration, DatabaseDriver } from '@gao/orm';
export const CreateFilesTable: Migration = {
    name: '068_create_files',
    async up(d: DatabaseDriver) { await d.execute(`CREATE TABLE files ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, name VARCHAR(255) NOT NULL, original_name VARCHAR(255) NOT NULL, file_path VARCHAR(500) NOT NULL, mime_type VARCHAR(100), file_size BIGINT NOT NULL DEFAULT 0, storage VARCHAR(20) NOT NULL DEFAULT 'local', is_public BOOLEAN NOT NULL DEFAULT false, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), deleted_at TIMESTAMPTZ, CONSTRAINT ck_f_storage CHECK (storage IN ('local', 's3', 'gcs')) )`); await d.execute('CREATE INDEX idx_f_uploader ON files (uploaded_by) WHERE deleted_at IS NULL'); },
    async down(d: DatabaseDriver) { await d.execute('DROP TABLE IF EXISTS files CASCADE'); },
};
