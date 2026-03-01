import type { Migration, DatabaseDriver } from '@gao/orm';

export const CreateQuotationItemsTable: Migration = {
    name: '020_create_quotation_items',

    async up(driver: DatabaseDriver) {
        await driver.execute(`
            CREATE TABLE quotation_items (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                quotation_id UUID NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
                product_id UUID REFERENCES products(id) ON DELETE SET NULL,
                description VARCHAR(500) NOT NULL,
                quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
                unit_price DECIMAL(19,4) NOT NULL DEFAULT 0,
                discount_percent DECIMAL(5,2) NOT NULL DEFAULT 0,
                tax_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
                total DECIMAL(19,4) NOT NULL DEFAULT 0,
                display_order INTEGER NOT NULL DEFAULT 0,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                deleted_at TIMESTAMPTZ DEFAULT NULL,

                CONSTRAINT ck_qi_quantity CHECK (quantity > 0),
                CONSTRAINT ck_qi_unit_price CHECK (unit_price >= 0),
                CONSTRAINT ck_qi_discount CHECK (discount_percent >= 0 AND discount_percent <= 100),
                CONSTRAINT ck_qi_tax CHECK (tax_rate >= 0 AND tax_rate <= 100),
                CONSTRAINT ck_qi_total CHECK (total >= 0)
            )
        `);
        await driver.execute('CREATE INDEX idx_qi_quotation ON quotation_items (quotation_id)');
        await driver.execute('CREATE INDEX idx_qi_product ON quotation_items (product_id)');
    },

    async down(driver: DatabaseDriver) {
        await driver.execute('DROP TABLE IF EXISTS quotation_items CASCADE');
    },
};
