import type { Migration, DatabaseDriver } from '@gao/orm';

export const CreateCurrenciesTable: Migration = {
    name: '059_create_currencies',
    async up(driver: DatabaseDriver) {
        await driver.execute(`
            CREATE TABLE currencies (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                code VARCHAR(3) NOT NULL UNIQUE,
                name VARCHAR(100) NOT NULL,
                symbol VARCHAR(10) NOT NULL,
                decimal_places INTEGER NOT NULL DEFAULT 2,
                is_default BOOLEAN NOT NULL DEFAULT false,
                is_active BOOLEAN NOT NULL DEFAULT true,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        `);
    },
    async down(driver: DatabaseDriver) { await driver.execute('DROP TABLE IF EXISTS currencies CASCADE'); },
};
