import type { Migration, DatabaseDriver } from '@gao/orm';

export const CreateFormFieldsTable: Migration = {
    name: '024_create_form_fields',

    async up(driver: DatabaseDriver) {
        await driver.execute(`
            CREATE TABLE form_fields (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
                field_type VARCHAR(30) NOT NULL,
                label VARCHAR(255) NOT NULL,
                name VARCHAR(100) NOT NULL,
                placeholder VARCHAR(255),
                help_text VARCHAR(500),
                is_required BOOLEAN NOT NULL DEFAULT false,
                validation_rules JSONB,
                options JSONB,
                default_value TEXT,
                width VARCHAR(10) NOT NULL DEFAULT 'full',
                display_order INTEGER NOT NULL DEFAULT 0,
                map_to_entity VARCHAR(30),
                map_to_field VARCHAR(100),
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

                CONSTRAINT ck_ff_type CHECK (field_type IN (
                    'text', 'email', 'phone', 'number', 'textarea',
                    'select', 'radio', 'checkbox', 'date', 'file',
                    'hidden', 'heading', 'paragraph', 'divider'
                )),
                CONSTRAINT ck_ff_width CHECK (width IN ('full', 'half', 'third')),
                CONSTRAINT ck_ff_map_entity CHECK (map_to_entity IS NULL OR map_to_entity IN ('contact', 'company', 'deal'))
            )
        `);
        await driver.execute('CREATE INDEX idx_ff_form ON form_fields (form_id)');
        await driver.execute('CREATE INDEX idx_ff_order ON form_fields (form_id, display_order)');
    },

    async down(driver: DatabaseDriver) {
        await driver.execute('DROP TABLE IF EXISTS form_fields CASCADE');
    },
};
