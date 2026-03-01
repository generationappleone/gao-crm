import type { Migration, DatabaseDriver } from '@gao/orm';

export const CreatePluginVersionsTable: Migration = {
    name: '055_create_plugin_versions',

    async up(driver: DatabaseDriver) {
        await driver.execute(`
            CREATE TABLE plugin_versions (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                plugin_id UUID NOT NULL REFERENCES plugins(id) ON DELETE CASCADE,
                version VARCHAR(20) NOT NULL,
                changelog TEXT,
                min_crm_version VARCHAR(20),
                file_path VARCHAR(500),
                file_hash VARCHAR(64),
                released_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

                CONSTRAINT uq_pv_plugin_ver UNIQUE (plugin_id, version)
            )
        `);
        await driver.execute('CREATE INDEX idx_pv_plugin ON plugin_versions (plugin_id)');
    },

    async down(driver: DatabaseDriver) {
        await driver.execute('DROP TABLE IF EXISTS plugin_versions CASCADE');
    },
};
