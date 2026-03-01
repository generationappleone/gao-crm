import type { Migration, DatabaseDriver } from '@gao/orm';

export const CreateApprovalRequestsTable: Migration = {
    name: '064_create_approval_requests',
    async up(driver: DatabaseDriver) {
        await driver.execute(`
            CREATE TABLE approval_requests (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                chain_id UUID NOT NULL REFERENCES approval_chains(id) ON DELETE CASCADE,
                entity_type VARCHAR(30) NOT NULL,
                entity_id UUID NOT NULL,
                requested_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                current_step INTEGER NOT NULL DEFAULT 0,
                status VARCHAR(20) NOT NULL DEFAULT 'pending',
                approver_id UUID REFERENCES users(id) ON DELETE SET NULL,
                approved_at TIMESTAMPTZ,
                rejected_at TIMESTAMPTZ,
                rejection_reason TEXT,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                CONSTRAINT ck_ar_status CHECK (status IN ('pending', 'in_review', 'approved', 'rejected', 'cancelled'))
            )
        `);
        await driver.execute('CREATE INDEX idx_ar_entity ON approval_requests (entity_type, entity_id)');
        await driver.execute('CREATE INDEX idx_ar_approver ON approval_requests (approver_id) WHERE status = \'in_review\'');
    },
    async down(driver: DatabaseDriver) { await driver.execute('DROP TABLE IF EXISTS approval_requests CASCADE'); },
};
