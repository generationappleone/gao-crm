import type { Migration, DatabaseDriver } from '@gao/orm';

export const CreateTagsTable: Migration = {
    name: '008_create_tags',

    async up(driver: DatabaseDriver) {
        await driver.execute(`
            CREATE TABLE tags (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(50) NOT NULL,
                slug VARCHAR(60) NOT NULL,
                color VARCHAR(7) NOT NULL DEFAULT '#6366f1',
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

                CONSTRAINT uq_tags_slug UNIQUE (slug)
            );
        `);
    },

    async down(driver: DatabaseDriver) {
        await driver.execute('DROP TABLE IF EXISTS tags CASCADE');
    },
};
