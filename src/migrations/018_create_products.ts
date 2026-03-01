import type { Migration, DatabaseDriver } from '@gao/orm';

export const CreateProductsTable: Migration = {
    name: '018_create_products',

    async up(driver: DatabaseDriver) {
        await driver.execute(`
            CREATE TABLE products (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(255) NOT NULL,
                sku VARCHAR(50),
                description TEXT,
                unit_price DECIMAL(19,4) NOT NULL DEFAULT 0,
                currency CHAR(3) NOT NULL DEFAULT 'IDR',
                unit VARCHAR(30) NOT NULL DEFAULT 'unit',
                tax_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
                is_active BOOLEAN NOT NULL DEFAULT true,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                deleted_at TIMESTAMPTZ,

                CONSTRAINT uq_products_sku UNIQUE (sku),
                CONSTRAINT ck_products_unit_price CHECK (unit_price >= 0),
                CONSTRAINT ck_products_tax_rate CHECK (tax_rate >= 0 AND tax_rate <= 100),
                CONSTRAINT ck_products_unit CHECK (unit IN ('unit', 'hour', 'day', 'month', 'year', 'license', 'project', 'kg', 'pcs'))
            )
        `);
        await driver.execute('CREATE INDEX idx_products_name ON products (name) WHERE deleted_at IS NULL');
        await driver.execute('CREATE INDEX idx_products_sku ON products (sku) WHERE deleted_at IS NULL');
        await driver.execute('CREATE INDEX idx_products_active ON products (is_active) WHERE deleted_at IS NULL');
    },

    async down(driver: DatabaseDriver) {
        await driver.execute('DROP TABLE IF EXISTS products CASCADE');
    },
};
