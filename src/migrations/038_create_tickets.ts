import type { Migration, DatabaseDriver } from '@gao/orm';

export const CreateTicketsTable: Migration = {
    name: '038_create_tickets',

    async up(driver: DatabaseDriver) {
        await driver.execute(`
            CREATE TABLE tickets (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                ticket_number VARCHAR(20) NOT NULL,
                contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
                company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
                category_id UUID REFERENCES ticket_categories(id) ON DELETE SET NULL,
                assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
                created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                subject VARCHAR(500) NOT NULL,
                description TEXT,
                status VARCHAR(20) NOT NULL DEFAULT 'open',
                priority VARCHAR(10) NOT NULL DEFAULT 'medium',
                channel VARCHAR(20) NOT NULL DEFAULT 'web',
                tags TEXT,
                first_response_at TIMESTAMPTZ,
                resolved_at TIMESTAMPTZ,
                closed_at TIMESTAMPTZ,
                sla_deadline TIMESTAMPTZ,
                total_messages INTEGER NOT NULL DEFAULT 0,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                deleted_at TIMESTAMPTZ,

                CONSTRAINT uq_tickets_number UNIQUE (ticket_number),
                CONSTRAINT ck_t_status CHECK (status IN ('open', 'in_progress', 'waiting', 'resolved', 'closed', 'reopened')),
                CONSTRAINT ck_t_priority CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
                CONSTRAINT ck_t_channel CHECK (channel IN ('web', 'email', 'chat', 'phone', 'whatsapp', 'api'))
            )
        `);
        await driver.execute('CREATE INDEX idx_t_contact ON tickets (contact_id) WHERE deleted_at IS NULL');
        await driver.execute('CREATE INDEX idx_t_assigned ON tickets (assigned_to) WHERE deleted_at IS NULL');
        await driver.execute('CREATE INDEX idx_t_status ON tickets (status) WHERE deleted_at IS NULL');
        await driver.execute('CREATE INDEX idx_t_priority ON tickets (priority) WHERE deleted_at IS NULL');
        await driver.execute('CREATE INDEX idx_t_category ON tickets (category_id) WHERE deleted_at IS NULL');
        await driver.execute('CREATE INDEX idx_t_created ON tickets (created_at DESC) WHERE deleted_at IS NULL');
        await driver.execute('CREATE INDEX idx_t_sla ON tickets (sla_deadline) WHERE deleted_at IS NULL AND status NOT IN (\'resolved\', \'closed\')');
    },

    async down(driver: DatabaseDriver) {
        await driver.execute('DROP TABLE IF EXISTS tickets CASCADE');
    },
};
