import type { Migration, DatabaseDriver } from '@gao/orm';

export const CreateCustomFieldDefinitionsTable: Migration = {
    name: '011_create_custom_field_definitions',

    async up(driver: DatabaseDriver) {
        await driver.execute(`
            CREATE TABLE custom_field_definitions (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                entity_type VARCHAR(30) NOT NULL,
                field_name VARCHAR(100) NOT NULL,
                field_slug VARCHAR(120) NOT NULL,
                field_type VARCHAR(20) NOT NULL,
                field_options JSONB,
                is_required BOOLEAN NOT NULL DEFAULT false,
                is_filterable BOOLEAN NOT NULL DEFAULT false,
                display_order INTEGER NOT NULL DEFAULT 0,
                default_value TEXT,
                placeholder VARCHAR(255),
                validation_rules JSONB,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                deleted_at TIMESTAMPTZ,

                CONSTRAINT ck_cfd_entity_type CHECK (entity_type IN ('contact', 'company', 'deal')),
                CONSTRAINT ck_cfd_field_type CHECK (field_type IN ('text', 'number', 'dropdown', 'date', 'checkbox', 'textarea', 'email', 'phone', 'url')),
                CONSTRAINT uq_cfd_entity_slug UNIQUE (entity_type, field_slug)
            )
        `);
        await driver.execute('CREATE INDEX idx_cfd_entity_type ON custom_field_definitions (entity_type) WHERE deleted_at IS NULL');
        await driver.execute('CREATE INDEX idx_cfd_display_order ON custom_field_definitions (entity_type, display_order) WHERE deleted_at IS NULL');
    },

    async down(driver: DatabaseDriver) {
        await driver.execute('DROP TABLE IF EXISTS custom_field_definitions CASCADE');
    },
};
