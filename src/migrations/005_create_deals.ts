import type { Migration, DatabaseDriver } from '@gao/orm';

export const CreateDealsTable: Migration = {
    name: '005_create_deals',

    async up(driver: DatabaseDriver) {
        await driver.execute(`
            CREATE TABLE deals (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE RESTRICT,
                company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
                owner_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
                stage_id UUID NOT NULL REFERENCES deal_stages(id) ON DELETE RESTRICT,
                title VARCHAR(255) NOT NULL,
                value DECIMAL(15, 2) NOT NULL DEFAULT 0,
                currency CHAR(3) NOT NULL DEFAULT 'IDR',
                probability INTEGER NOT NULL DEFAULT 0,
                expected_close_at DATE,
                won_at TIMESTAMPTZ,
                lost_at TIMESTAMPTZ,
                lost_reason TEXT,
                notes TEXT,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                deleted_at TIMESTAMPTZ,

                CONSTRAINT ck_deals_value CHECK (value >= 0),
                CONSTRAINT ck_deals_probability CHECK (probability >= 0 AND probability <= 100)
            )
        `);
        await driver.execute('CREATE INDEX idx_deals_contact ON deals (contact_id) WHERE deleted_at IS NULL');
        await driver.execute('CREATE INDEX idx_deals_company ON deals (company_id) WHERE deleted_at IS NULL');
        await driver.execute('CREATE INDEX idx_deals_owner ON deals (owner_id) WHERE deleted_at IS NULL');
        await driver.execute('CREATE INDEX idx_deals_stage ON deals (stage_id) WHERE deleted_at IS NULL');
        await driver.execute('CREATE INDEX idx_deals_title ON deals (title) WHERE deleted_at IS NULL');
        await driver.execute('CREATE INDEX idx_deals_expected_close ON deals (expected_close_at) WHERE deleted_at IS NULL');
        await driver.execute('CREATE INDEX idx_deals_created ON deals (created_at DESC) WHERE deleted_at IS NULL');
    },

    async down(driver: DatabaseDriver) {
        await driver.execute('DROP TABLE IF EXISTS deals CASCADE');
    },
};
