import type { Migration, DatabaseDriver } from '@gao/orm';

export const CreatePluginsTable: Migration = {
    name: '054_create_plugins',

    async up(driver: DatabaseDriver) {
        await driver.execute(`
            CREATE TABLE plugins (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                slug VARCHAR(100) NOT NULL UNIQUE,
                name VARCHAR(200) NOT NULL,
                description TEXT,
                author VARCHAR(200),
                homepage VARCHAR(500),
                icon_url VARCHAR(500),
                category VARCHAR(30) NOT NULL DEFAULT 'general',
                current_version VARCHAR(20),
                is_installed BOOLEAN NOT NULL DEFAULT false,
                is_active BOOLEAN NOT NULL DEFAULT false,
                config JSONB NOT NULL DEFAULT '{}',
                installed_at TIMESTAMPTZ,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

                CONSTRAINT ck_pl_cat CHECK (category IN ('general', 'integration', 'automation', 'reporting', 'communication', 'payment', 'security', 'ui'))
            )
        `);
        await driver.execute('CREATE INDEX idx_pl_active ON plugins (is_active) WHERE is_installed = true');
    },

    async down(driver: DatabaseDriver) {
        await driver.execute('DROP TABLE IF EXISTS plugins CASCADE');
    },
};
