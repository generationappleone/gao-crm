import type { Migration, DatabaseDriver } from '@gao/orm';

export const CreateContactsTable: Migration = {
    name: '003_create_contacts',

    async up(driver: DatabaseDriver) {
        await driver.execute(`
            CREATE TABLE contacts (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
                owner_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
                first_name VARCHAR(100) NOT NULL,
                last_name VARCHAR(100) NOT NULL,
                email VARCHAR(255),
                phone VARCHAR(30),
                position VARCHAR(100),
                status VARCHAR(20) NOT NULL DEFAULT 'lead',
                source VARCHAR(50),
                avatar_url VARCHAR(500),
                address TEXT,
                city VARCHAR(100),
                notes TEXT,
                last_contacted_at TIMESTAMPTZ,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                deleted_at TIMESTAMPTZ,

                CONSTRAINT ck_contacts_status CHECK (status IN ('lead', 'prospect', 'customer', 'churned'))
            )
        `);
        await driver.execute('CREATE UNIQUE INDEX uq_contacts_email ON contacts (email) WHERE deleted_at IS NULL AND email IS NOT NULL');
        await driver.execute('CREATE INDEX idx_contacts_company ON contacts (company_id) WHERE deleted_at IS NULL');
        await driver.execute('CREATE INDEX idx_contacts_owner ON contacts (owner_id) WHERE deleted_at IS NULL');
        await driver.execute('CREATE INDEX idx_contacts_status ON contacts (status) WHERE deleted_at IS NULL');
        await driver.execute('CREATE INDEX idx_contacts_name ON contacts (last_name, first_name) WHERE deleted_at IS NULL');
        await driver.execute('CREATE INDEX idx_contacts_created ON contacts (created_at DESC) WHERE deleted_at IS NULL');
    },

    async down(driver: DatabaseDriver) {
        await driver.execute('DROP TABLE IF EXISTS contacts CASCADE');
    },
};
