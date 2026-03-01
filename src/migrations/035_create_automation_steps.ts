import type { Migration, DatabaseDriver } from '@gao/orm';

export const CreateAutomationStepsTable: Migration = {
    name: '035_create_automation_steps',

    async up(driver: DatabaseDriver) {
        await driver.execute(`
            CREATE TABLE automation_steps (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                automation_id UUID NOT NULL REFERENCES automations(id) ON DELETE CASCADE,
                step_type VARCHAR(20) NOT NULL,
                action_type VARCHAR(30) NOT NULL,
                action_config JSONB NOT NULL DEFAULT '{}',
                delay_minutes INTEGER NOT NULL DEFAULT 0,
                condition_config JSONB,
                on_success_step_id UUID REFERENCES automation_steps(id) ON DELETE SET NULL,
                on_failure_step_id UUID REFERENCES automation_steps(id) ON DELETE SET NULL,
                display_order INTEGER NOT NULL DEFAULT 0,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

                CONSTRAINT ck_as_step_type CHECK (step_type IN ('action', 'condition', 'delay', 'branch')),
                CONSTRAINT ck_as_action CHECK (action_type IN (
                    'send_email', 'create_task', 'update_field', 'add_tag', 'remove_tag',
                    'assign_owner', 'move_deal_stage', 'create_note', 'send_notification',
                    'webhook', 'wait', 'if_else', 'score_adjust', 'create_activity'
                ))
            )
        `);
        await driver.execute('CREATE INDEX idx_as_automation ON automation_steps (automation_id, display_order)');
    },

    async down(driver: DatabaseDriver) {
        await driver.execute('DROP TABLE IF EXISTS automation_steps CASCADE');
    },
};
