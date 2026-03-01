import type { Migration, DatabaseDriver } from '@gao/orm';

export const CreateDashboardWidgetsTable: Migration = {
    name: '046_create_dashboard_widgets',

    async up(driver: DatabaseDriver) {
        await driver.execute(`
            CREATE TABLE dashboard_widgets (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                title VARCHAR(255) NOT NULL,
                widget_type VARCHAR(30) NOT NULL,
                data_source VARCHAR(30) NOT NULL,
                config JSONB NOT NULL DEFAULT '{}',
                width VARCHAR(10) NOT NULL DEFAULT 'half',
                position INTEGER NOT NULL DEFAULT 0,
                is_visible BOOLEAN NOT NULL DEFAULT true,
                refresh_interval INTEGER NOT NULL DEFAULT 300,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

                CONSTRAINT ck_dw_type CHECK (widget_type IN ('number', 'chart', 'table', 'list', 'progress', 'funnel', 'activity_feed', 'leaderboard')),
                CONSTRAINT ck_dw_source CHECK (data_source IN ('deals', 'contacts', 'revenue', 'tickets', 'campaigns', 'activities', 'forms', 'custom')),
                CONSTRAINT ck_dw_width CHECK (width IN ('quarter', 'third', 'half', 'two_thirds', 'full'))
            )
        `);
        await driver.execute('CREATE INDEX idx_dw_user ON dashboard_widgets (user_id, position)');
    },

    async down(driver: DatabaseDriver) {
        await driver.execute('DROP TABLE IF EXISTS dashboard_widgets CASCADE');
    },
};
