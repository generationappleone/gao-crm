import type { Migration, DatabaseDriver } from '@gao/orm';

export const AddDeletedAtToStagesAndTags: Migration = {
    name: '010_add_deleted_at_to_stages_and_tags',

    async up(driver: DatabaseDriver) {
        await driver.execute('ALTER TABLE deal_stages ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ');
        await driver.execute('ALTER TABLE tags ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ');
    },

    async down(driver: DatabaseDriver) {
        await driver.execute('ALTER TABLE deal_stages DROP COLUMN IF EXISTS deleted_at');
        await driver.execute('ALTER TABLE tags DROP COLUMN IF EXISTS deleted_at');
    },
};
