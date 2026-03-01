import type { Migration, DatabaseDriver } from '@gao/orm';

export const CreatePaymentMethodsTable: Migration = {
    name: '052_create_payment_methods',

    async up(driver: DatabaseDriver) {
        await driver.execute(`
            CREATE TABLE payment_methods (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(100) NOT NULL,
                provider VARCHAR(30) NOT NULL,
                config JSONB NOT NULL DEFAULT '{}',
                is_active BOOLEAN NOT NULL DEFAULT true,
                display_order INTEGER NOT NULL DEFAULT 0,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

                CONSTRAINT ck_pm_provider CHECK (provider IN ('manual', 'bank_transfer', 'midtrans', 'xendit', 'stripe', 'paypal'))
            )
        `);
    },

    async down(driver: DatabaseDriver) {
        await driver.execute('DROP TABLE IF EXISTS payment_methods CASCADE');
    },
};
