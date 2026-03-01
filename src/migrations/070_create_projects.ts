import type { Migration, DatabaseDriver } from '@gao/orm';
export const CreateProjectsTable: Migration = {
    name: '070_create_projects',
    async up(d: DatabaseDriver) { await d.execute(`CREATE TABLE projects ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name VARCHAR(200) NOT NULL, description TEXT, deal_id UUID REFERENCES deals(id) ON DELETE SET NULL, owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, status VARCHAR(20) NOT NULL DEFAULT 'active', priority VARCHAR(10) NOT NULL DEFAULT 'medium', start_date DATE, due_date DATE, completed_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), deleted_at TIMESTAMPTZ, CONSTRAINT ck_prj_status CHECK (status IN ('active', 'on_hold', 'completed', 'cancelled')), CONSTRAINT ck_prj_priority CHECK (priority IN ('low', 'medium', 'high', 'urgent')) )`); await d.execute('CREATE INDEX idx_prj_owner ON projects (owner_id) WHERE deleted_at IS NULL'); await d.execute('CREATE INDEX idx_prj_deal ON projects (deal_id) WHERE deleted_at IS NULL AND deal_id IS NOT NULL'); },
    async down(d: DatabaseDriver) { await d.execute('DROP TABLE IF EXISTS projects CASCADE'); },
};
