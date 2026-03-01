import type { Migration, DatabaseDriver } from '@gao/orm';

export const CreateReportsTable: Migration = {
    name: '045_create_reports',

    async up(driver: DatabaseDriver) {
        await driver.execute(`
            CREATE TABLE reports (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(255) NOT NULL,
                description TEXT,
                owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                report_type VARCHAR(30) NOT NULL,
                entity_type VARCHAR(30) NOT NULL,
                columns JSONB NOT NULL DEFAULT '[]',
                filters JSONB NOT NULL DEFAULT '[]',
                group_by VARCHAR(100),
                sort_by VARCHAR(100),
                sort_direction VARCHAR(4) NOT NULL DEFAULT 'DESC',
                chart_type VARCHAR(20),
                is_public BOOLEAN NOT NULL DEFAULT false,
                is_favorite BOOLEAN NOT NULL DEFAULT false,
                last_run_at TIMESTAMPTZ,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                deleted_at TIMESTAMPTZ,

                CONSTRAINT ck_rpt_type CHECK (report_type IN ('table', 'summary', 'chart', 'pivot', 'funnel')),
                CONSTRAINT ck_rpt_entity CHECK (entity_type IN ('contact', 'company', 'deal', 'ticket', 'activity', 'campaign', 'form_submission', 'revenue')),
                CONSTRAINT ck_rpt_chart CHECK (chart_type IS NULL OR chart_type IN ('bar', 'line', 'pie', 'donut', 'area', 'funnel', 'scatter')),
                CONSTRAINT ck_rpt_sort CHECK (sort_direction IN ('ASC', 'DESC'))
            )
        `);
        await driver.execute('CREATE INDEX idx_rpt_owner ON reports (owner_id) WHERE deleted_at IS NULL');
        await driver.execute('CREATE INDEX idx_rpt_entity ON reports (entity_type) WHERE deleted_at IS NULL');
        await driver.execute('CREATE INDEX idx_rpt_public ON reports (is_public) WHERE deleted_at IS NULL AND is_public = true');
    },

    async down(driver: DatabaseDriver) {
        await driver.execute('DROP TABLE IF EXISTS reports CASCADE');
    },
};
