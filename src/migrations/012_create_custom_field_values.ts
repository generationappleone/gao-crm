import type { Migration, DatabaseDriver } from '@gao/orm';

export const CreateCustomFieldValuesTable: Migration = {
    name: '012_create_custom_field_values',

    async up(driver: DatabaseDriver) {
        await driver.execute(`
            CREATE TABLE custom_field_values (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                field_definition_id UUID NOT NULL REFERENCES custom_field_definitions(id) ON DELETE CASCADE,
                entity_type VARCHAR(30) NOT NULL,
                entity_id UUID NOT NULL,
                value_text TEXT,
                value_number DECIMAL(19,4),
                value_date DATE,
                value_boolean BOOLEAN,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

                CONSTRAINT ck_cfv_entity_type CHECK (entity_type IN ('contact', 'company', 'deal'))
            )
        `);
        await driver.execute('CREATE UNIQUE INDEX uq_cfv_entity_field ON custom_field_values (field_definition_id, entity_type, entity_id)');
        await driver.execute('CREATE INDEX idx_cfv_entity ON custom_field_values (entity_type, entity_id)');
        await driver.execute('CREATE INDEX idx_cfv_definition ON custom_field_values (field_definition_id)');
    },

    async down(driver: DatabaseDriver) {
        await driver.execute('DROP TABLE IF EXISTS custom_field_values CASCADE');
    },
};
