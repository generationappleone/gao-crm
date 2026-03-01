import type { Migration, DatabaseDriver } from '@gao/orm';

export const CreateTicketCategoriesTable: Migration = {
    name: '037_create_ticket_categories',

    async up(driver: DatabaseDriver) {
        await driver.execute(`
            CREATE TABLE ticket_categories (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(100) NOT NULL,
                slug VARCHAR(120) NOT NULL,
                description TEXT,
                color VARCHAR(7) NOT NULL DEFAULT '#6366f1',
                display_order INTEGER NOT NULL DEFAULT 0,
                is_active BOOLEAN NOT NULL DEFAULT true,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                deleted_at TIMESTAMPTZ,

                CONSTRAINT uq_tc_slug UNIQUE (slug)
            )
        `);
        await driver.execute('CREATE INDEX idx_tc_active ON ticket_categories (is_active) WHERE deleted_at IS NULL');
    },

    async down(driver: DatabaseDriver) {
        await driver.execute('DROP TABLE IF EXISTS ticket_categories CASCADE');
    },
};
