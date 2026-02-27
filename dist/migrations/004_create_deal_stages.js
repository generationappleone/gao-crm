export const CreateDealStagesTable = {
    name: '004_create_deal_stages',
    async up(driver) {
        await driver.execute(`
            CREATE TABLE deal_stages (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(50) NOT NULL,
                slug VARCHAR(60) NOT NULL,
                display_order INTEGER NOT NULL DEFAULT 0,
                color VARCHAR(7) NOT NULL DEFAULT '#6366f1',
                is_won BOOLEAN NOT NULL DEFAULT false,
                is_lost BOOLEAN NOT NULL DEFAULT false,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

                CONSTRAINT uq_deal_stages_slug UNIQUE (slug)
            );

            CREATE INDEX idx_deal_stages_order ON deal_stages (display_order);
        `);
    },
    async down(driver) {
        await driver.execute('DROP TABLE IF EXISTS deal_stages CASCADE');
    },
};
//# sourceMappingURL=004_create_deal_stages.js.map