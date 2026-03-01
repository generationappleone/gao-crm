import type { Migration, DatabaseDriver } from '@gao/orm';

export const CreatePipelinesTable: Migration = {
    name: '013_create_pipelines',

    async up(driver: DatabaseDriver) {
        await driver.execute(`
            CREATE TABLE pipelines (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(100) NOT NULL,
                slug VARCHAR(120) NOT NULL,
                description TEXT,
                is_default BOOLEAN NOT NULL DEFAULT false,
                display_order INTEGER NOT NULL DEFAULT 0,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                deleted_at TIMESTAMPTZ,

                CONSTRAINT uq_pipelines_slug UNIQUE (slug)
            )
        `);
        await driver.execute('CREATE INDEX idx_pipelines_order ON pipelines (display_order) WHERE deleted_at IS NULL');

        // Insert default pipeline
        await driver.execute(`
            INSERT INTO pipelines (name, slug, description, is_default, display_order)
            VALUES ('Sales Pipeline', 'sales-pipeline', 'Default sales pipeline', true, 0)
        `);
    },

    async down(driver: DatabaseDriver) {
        await driver.execute('DROP TABLE IF EXISTS pipelines CASCADE');
    },
};
