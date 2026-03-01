import type { Migration, DatabaseDriver } from '@gao/orm';

export const CreateClientPortalUsersTable: Migration = {
    name: '056_create_client_portal_users',

    async up(driver: DatabaseDriver) {
        await driver.execute(`
            CREATE TABLE client_portal_users (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
                company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                name VARCHAR(200) NOT NULL,
                is_active BOOLEAN NOT NULL DEFAULT true,
                last_login_at TIMESTAMPTZ,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        `);
        await driver.execute('CREATE INDEX idx_cpu_contact ON client_portal_users (contact_id)');
    },

    async down(driver: DatabaseDriver) {
        await driver.execute('DROP TABLE IF EXISTS client_portal_users CASCADE');
    },
};
