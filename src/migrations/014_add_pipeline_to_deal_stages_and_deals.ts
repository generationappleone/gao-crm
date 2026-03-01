import type { Migration, DatabaseDriver } from '@gao/orm';

export const AddPipelineToDealStagesAndDeals: Migration = {
    name: '014_add_pipeline_to_deal_stages_and_deals',

    async up(driver: DatabaseDriver) {
        // Get default pipeline id
        const rows = await driver.query<{ id: string }>(
            "SELECT id FROM pipelines WHERE is_default = true LIMIT 1"
        );
        const defaultPipelineId = rows[0]?.id;

        if (!defaultPipelineId) {
            throw new Error('Default pipeline not found. Run migration 013 first.');
        }

        // Add pipeline_id to deal_stages
        await driver.execute('ALTER TABLE deal_stages ADD COLUMN IF NOT EXISTS pipeline_id UUID');
        await driver.execute(`UPDATE deal_stages SET pipeline_id = '${defaultPipelineId}' WHERE pipeline_id IS NULL`);
        await driver.execute('ALTER TABLE deal_stages ALTER COLUMN pipeline_id SET NOT NULL');
        await driver.execute('ALTER TABLE deal_stages ADD CONSTRAINT fk_deal_stages_pipeline FOREIGN KEY (pipeline_id) REFERENCES pipelines(id) ON DELETE CASCADE');
        await driver.execute('CREATE INDEX idx_deal_stages_pipeline ON deal_stages (pipeline_id)');

        // Add pipeline_id and position to deals
        await driver.execute('ALTER TABLE deals ADD COLUMN IF NOT EXISTS pipeline_id UUID');
        await driver.execute(`UPDATE deals SET pipeline_id = '${defaultPipelineId}' WHERE pipeline_id IS NULL`);
        await driver.execute('ALTER TABLE deals ALTER COLUMN pipeline_id SET NOT NULL');
        await driver.execute('ALTER TABLE deals ADD CONSTRAINT fk_deals_pipeline FOREIGN KEY (pipeline_id) REFERENCES pipelines(id) ON DELETE RESTRICT');
        await driver.execute('CREATE INDEX idx_deals_pipeline ON deals (pipeline_id) WHERE deleted_at IS NULL');

        await driver.execute('ALTER TABLE deals ADD COLUMN IF NOT EXISTS position INTEGER NOT NULL DEFAULT 0');
    },

    async down(driver: DatabaseDriver) {
        // Remove from deals
        await driver.execute('ALTER TABLE deals DROP COLUMN IF EXISTS position');
        await driver.execute('ALTER TABLE deals DROP CONSTRAINT IF EXISTS fk_deals_pipeline');
        await driver.execute('DROP INDEX IF EXISTS idx_deals_pipeline');
        await driver.execute('ALTER TABLE deals DROP COLUMN IF EXISTS pipeline_id');

        // Remove from deal_stages
        await driver.execute('ALTER TABLE deal_stages DROP CONSTRAINT IF EXISTS fk_deal_stages_pipeline');
        await driver.execute('DROP INDEX IF EXISTS idx_deal_stages_pipeline');
        await driver.execute('ALTER TABLE deal_stages DROP COLUMN IF EXISTS pipeline_id');
    },
};
