import type { Migration, DatabaseDriver } from '@gao/orm';

export const CreateExchangeRatesTable: Migration = {
    name: '060_create_exchange_rates',
    async up(driver: DatabaseDriver) {
        await driver.execute(`
            CREATE TABLE exchange_rates (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                from_currency VARCHAR(3) NOT NULL,
                to_currency VARCHAR(3) NOT NULL,
                rate NUMERIC(18,8) NOT NULL,
                effective_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                CONSTRAINT uq_er_pair UNIQUE (from_currency, to_currency, effective_at)
            )
        `);
        await driver.execute('CREATE INDEX idx_er_pair ON exchange_rates (from_currency, to_currency, effective_at DESC)');
    },
    async down(driver: DatabaseDriver) { await driver.execute('DROP TABLE IF EXISTS exchange_rates CASCADE'); },
};
