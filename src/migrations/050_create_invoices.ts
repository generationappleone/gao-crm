import type { Migration, DatabaseDriver } from '@gao/orm';

export const CreateInvoicesTable: Migration = {
    name: '050_create_invoices',

    async up(driver: DatabaseDriver) {
        await driver.execute(`
            CREATE TABLE invoices (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                invoice_number VARCHAR(50) NOT NULL UNIQUE,
                quotation_id UUID REFERENCES quotations(id) ON DELETE SET NULL,
                deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
                contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
                company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
                issued_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                status VARCHAR(20) NOT NULL DEFAULT 'draft',
                currency VARCHAR(3) NOT NULL DEFAULT 'IDR',
                subtotal NUMERIC(15,2) NOT NULL DEFAULT 0,
                tax_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
                tax_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
                discount_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
                total NUMERIC(15,2) NOT NULL DEFAULT 0,
                amount_paid NUMERIC(15,2) NOT NULL DEFAULT 0,
                amount_due NUMERIC(15,2) NOT NULL DEFAULT 0,
                is_recurring BOOLEAN NOT NULL DEFAULT false,
                recurring_day INTEGER,
                is_prorated BOOLEAN NOT NULL DEFAULT false,
                original_total NUMERIC(15,2),
                notes TEXT,
                terms TEXT,
                issued_at TIMESTAMPTZ,
                due_at TIMESTAMPTZ,
                paid_at TIMESTAMPTZ,
                cancelled_at TIMESTAMPTZ,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                deleted_at TIMESTAMPTZ,

                CONSTRAINT ck_inv_status CHECK (status IN ('draft', 'pending', 'sent', 'viewed', 'partial', 'paid', 'overdue', 'cancelled', 'refunded'))
            )
        `);
        await driver.execute('CREATE INDEX idx_inv_contact ON invoices (contact_id) WHERE deleted_at IS NULL');
        await driver.execute('CREATE INDEX idx_inv_company ON invoices (company_id) WHERE deleted_at IS NULL');
        await driver.execute('CREATE INDEX idx_inv_status ON invoices (status) WHERE deleted_at IS NULL');
        await driver.execute('CREATE INDEX idx_inv_due ON invoices (due_at) WHERE deleted_at IS NULL AND status NOT IN (\'paid\', \'cancelled\')');
    },

    async down(driver: DatabaseDriver) {
        await driver.execute('DROP TABLE IF EXISTS invoices CASCADE');
    },
};
