import type { Migration, DatabaseDriver } from '@gao/orm';

export const CreateTerritoriesTable: Migration = {
    name: '062_create_territories',
    async up(driver: DatabaseDriver) {
        await driver.execute(`
            CREATE TABLE territories (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(200) NOT NULL,
                parent_id UUID REFERENCES territories(id) ON DELETE SET NULL,
                manager_id UUID REFERENCES users(id) ON DELETE SET NULL,
                description TEXT,
                region VARCHAR(100),
                country VARCHAR(2),
                is_active BOOLEAN NOT NULL DEFAULT true,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        `);
        await driver.execute('CREATE INDEX idx_terr_parent ON territories (parent_id)');
        await driver.execute('CREATE INDEX idx_terr_manager ON territories (manager_id)');
    },
    async down(driver: DatabaseDriver) { await driver.execute('DROP TABLE IF EXISTS territories CASCADE'); },
};
