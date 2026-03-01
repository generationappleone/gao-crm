import type { Migration, DatabaseDriver } from '@gao/orm';

export const CreateSharedDocumentsTable: Migration = {
    name: '057_create_shared_documents',

    async up(driver: DatabaseDriver) {
        await driver.execute(`
            CREATE TABLE shared_documents (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
                company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
                deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
                name VARCHAR(255) NOT NULL,
                file_path VARCHAR(500) NOT NULL,
                file_type VARCHAR(50),
                file_size INTEGER,
                is_portal_visible BOOLEAN NOT NULL DEFAULT false,
                portal_expires_at TIMESTAMPTZ,
                download_count INTEGER NOT NULL DEFAULT 0,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                deleted_at TIMESTAMPTZ
            )
        `);
        await driver.execute('CREATE INDEX idx_sd_contact ON shared_documents (contact_id) WHERE deleted_at IS NULL');
        await driver.execute('CREATE INDEX idx_sd_deal ON shared_documents (deal_id) WHERE deleted_at IS NULL');
        await driver.execute('CREATE INDEX idx_sd_portal ON shared_documents (is_portal_visible) WHERE deleted_at IS NULL AND is_portal_visible = true');
    },

    async down(driver: DatabaseDriver) {
        await driver.execute('DROP TABLE IF EXISTS shared_documents CASCADE');
    },
};
