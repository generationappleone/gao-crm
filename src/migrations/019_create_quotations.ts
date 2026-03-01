import type { Migration, DatabaseDriver } from '@gao/orm';

export const CreateQuotationsTable: Migration = {
    name: '019_create_quotations',

    async up(driver: DatabaseDriver) {
        await driver.execute(`
            CREATE TABLE quotations (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                quote_number VARCHAR(30) NOT NULL,
                deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
                contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE RESTRICT,
                company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
                owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                title VARCHAR(255) NOT NULL,
                status VARCHAR(20) NOT NULL DEFAULT 'draft',
                subtotal DECIMAL(19,4) NOT NULL DEFAULT 0,
                discount_type VARCHAR(10),
                discount_value DECIMAL(19,4) NOT NULL DEFAULT 0,
                tax_amount DECIMAL(19,4) NOT NULL DEFAULT 0,
                total_amount DECIMAL(19,4) NOT NULL DEFAULT 0,
                currency CHAR(3) NOT NULL DEFAULT 'IDR',
                notes TEXT,
                terms TEXT,
                valid_until DATE,
                accepted_at TIMESTAMPTZ,
                rejected_at TIMESTAMPTZ,
                sent_at TIMESTAMPTZ,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                deleted_at TIMESTAMPTZ,

                CONSTRAINT uq_quotations_number UNIQUE (quote_number),
                CONSTRAINT ck_quotations_status CHECK (status IN ('draft', 'sent', 'viewed', 'accepted', 'rejected', 'expired')),
                CONSTRAINT ck_quotations_discount_type CHECK (discount_type IS NULL OR discount_type IN ('percentage', 'fixed')),
                CONSTRAINT ck_quotations_subtotal CHECK (subtotal >= 0),
                CONSTRAINT ck_quotations_total CHECK (total_amount >= 0)
            )
        `);
        await driver.execute('CREATE INDEX idx_quotations_deal ON quotations (deal_id) WHERE deleted_at IS NULL');
        await driver.execute('CREATE INDEX idx_quotations_contact ON quotations (contact_id) WHERE deleted_at IS NULL');
        await driver.execute('CREATE INDEX idx_quotations_owner ON quotations (owner_id) WHERE deleted_at IS NULL');
        await driver.execute('CREATE INDEX idx_quotations_status ON quotations (status) WHERE deleted_at IS NULL');
        await driver.execute('CREATE INDEX idx_quotations_number ON quotations (quote_number) WHERE deleted_at IS NULL');
        await driver.execute('CREATE INDEX idx_quotations_valid ON quotations (valid_until) WHERE deleted_at IS NULL AND status = \'sent\'');
    },

    async down(driver: DatabaseDriver) {
        await driver.execute('DROP TABLE IF EXISTS quotations CASCADE');
    },
};
