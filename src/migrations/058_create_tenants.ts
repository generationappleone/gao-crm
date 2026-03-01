import type { Migration, DatabaseDriver } from '@gao/orm';

export const CreateTenantsTable: Migration = {
    name: '058_create_tenants',
    async up(driver: DatabaseDriver) {
        await driver.execute(`
            CREATE TABLE tenants (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(200) NOT NULL,
                slug VARCHAR(100) NOT NULL UNIQUE,
                domain VARCHAR(255),
                logo_url VARCHAR(500),
                settings JSONB NOT NULL DEFAULT '{}',
                plan VARCHAR(30) NOT NULL DEFAULT 'free',
                max_users INTEGER NOT NULL DEFAULT 5,
                is_active BOOLEAN NOT NULL DEFAULT true,
                trial_ends_at TIMESTAMPTZ,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                CONSTRAINT ck_t_plan CHECK (plan IN ('free', 'starter', 'professional', 'enterprise'))
            )
        `);
    },
    async down(driver: DatabaseDriver) { await driver.execute('DROP TABLE IF EXISTS tenants CASCADE'); },
};
