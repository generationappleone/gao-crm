import type { Migration, DatabaseDriver } from '@gao/orm';

export const CreateInvoiceItemsTable: Migration = {
    name: '051_create_invoice_items',

    async up(driver: DatabaseDriver) {
        await driver.execute(`
            CREATE TABLE invoice_items (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
                product_id UUID REFERENCES products(id) ON DELETE SET NULL,
                description VARCHAR(500) NOT NULL,
                quantity NUMERIC(10,2) NOT NULL DEFAULT 1,
                unit_price NUMERIC(15,2) NOT NULL DEFAULT 0,
                discount_percent NUMERIC(5,2) NOT NULL DEFAULT 0,
                tax_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
                amount NUMERIC(15,2) NOT NULL DEFAULT 0,
                sort_order INTEGER NOT NULL DEFAULT 0,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                deleted_at TIMESTAMPTZ DEFAULT NULL
            )
        `);
        await driver.execute('CREATE INDEX idx_ii_invoice ON invoice_items (invoice_id)');
    },

    async down(driver: DatabaseDriver) {
        await driver.execute('DROP TABLE IF EXISTS invoice_items CASCADE');
    },
};
