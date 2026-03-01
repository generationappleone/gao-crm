import type { Migration, DatabaseDriver } from '@gao/orm';

export const CreatePaymentsTable: Migration = {
    name: '053_create_payments',

    async up(driver: DatabaseDriver) {
        await driver.execute(`
            CREATE TABLE payments (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
                payment_method_id UUID REFERENCES payment_methods(id) ON DELETE SET NULL,
                amount NUMERIC(15,2) NOT NULL,
                currency VARCHAR(3) NOT NULL DEFAULT 'IDR',
                status VARCHAR(20) NOT NULL DEFAULT 'pending',
                reference_number VARCHAR(100),
                gateway_transaction_id VARCHAR(200),
                gateway_response JSONB,
                notes TEXT,
                paid_at TIMESTAMPTZ,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

                CONSTRAINT ck_pay_status CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'))
            )
        `);
        await driver.execute('CREATE INDEX idx_pay_invoice ON payments (invoice_id)');
        await driver.execute('CREATE INDEX idx_pay_status ON payments (status)');
    },

    async down(driver: DatabaseDriver) {
        await driver.execute('DROP TABLE IF EXISTS payments CASCADE');
    },
};
