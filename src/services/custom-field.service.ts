import { CustomFieldDefinition, type CustomFieldEntityType, type CustomFieldType } from '../models/custom-field-definition.model.js';
import { CustomFieldValue } from '../models/custom-field-value.model.js';

interface CreateFieldDefinitionInput {
    entity_type: CustomFieldEntityType;
    field_name: string;
    field_type: CustomFieldType;
    field_options?: string[];
    is_required?: boolean;
    is_filterable?: boolean;
    display_order?: number;
    default_value?: string;
    placeholder?: string;
    validation_rules?: Record<string, unknown>;
}

interface UpdateFieldDefinitionInput {
    field_name?: string;
    field_type?: CustomFieldType;
    field_options?: string[];
    is_required?: boolean;
    is_filterable?: boolean;
    display_order?: number;
    default_value?: string;
    placeholder?: string;
    validation_rules?: Record<string, unknown>;
}

interface FieldValueInput {
    field_definition_id: string;
    value: string | number | boolean | null;
}

export class CustomFieldService {
    /**
     * List all custom field definitions for an entity type.
     */
    async listDefinitions(entityType: CustomFieldEntityType): Promise<CustomFieldDefinition[]> {
        return CustomFieldDefinition
            .where('entity_type', entityType)
            .whereNull('deleted_at')
            .orderBy('display_order', 'ASC')
            .get();
    }

    /**
     * Create a custom field definition.
     */
    async createDefinition(data: CreateFieldDefinitionInput): Promise<CustomFieldDefinition> {
        const slug = data.field_name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

        return CustomFieldDefinition.create({
            entity_type: data.entity_type,
            field_name: data.field_name,
            field_slug: slug,
            field_type: data.field_type,
            field_options: data.field_options ? JSON.stringify(data.field_options) : undefined,
            is_required: data.is_required ?? false,
            is_filterable: data.is_filterable ?? false,
            display_order: data.display_order ?? 0,
            default_value: data.default_value,
            placeholder: data.placeholder,
            validation_rules: data.validation_rules ? JSON.stringify(data.validation_rules) : undefined,
        });
    }

    /**
     * Update a custom field definition.
     */
    async updateDefinition(id: string, data: UpdateFieldDefinitionInput): Promise<CustomFieldDefinition | null> {
        const definition = await CustomFieldDefinition.where('id', id).whereNull('deleted_at').first();
        if (!definition) return null;

        if (data.field_name !== undefined) {
            definition.field_name = data.field_name;
            definition.field_slug = data.field_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        }
        if (data.field_type !== undefined) definition.field_type = data.field_type;
        if (data.field_options !== undefined) definition.field_options = JSON.stringify(data.field_options);
        if (data.is_required !== undefined) definition.is_required = data.is_required;
        if (data.is_filterable !== undefined) definition.is_filterable = data.is_filterable;
        if (data.display_order !== undefined) definition.display_order = data.display_order;
        if (data.default_value !== undefined) definition.default_value = data.default_value;
        if (data.placeholder !== undefined) definition.placeholder = data.placeholder;
        if (data.validation_rules !== undefined) {
            definition.validation_rules = JSON.stringify(data.validation_rules);
        }

        await definition.save();
        return definition;
    }

    /**
     * Soft-delete a custom field definition.
     */
    async deleteDefinition(id: string): Promise<boolean> {
        const definition = await CustomFieldDefinition.where('id', id).whereNull('deleted_at').first();
        if (!definition) return false;
        await definition.destroy();
        return true;
    }

    /**
     * Get all custom field values for a specific entity.
     */
    async getValues(entityType: CustomFieldEntityType, entityId: string): Promise<CustomFieldValue[]> {
        return CustomFieldValue
            .where('entity_type', entityType)
            .where('entity_id', entityId)
            .get();
    }

    /**
     * Batch set/update custom field values for an entity.
     * Upserts values — creates if new, updates if exists.
     */
    async setValues(
        entityType: CustomFieldEntityType,
        entityId: string,
        values: FieldValueInput[]
    ): Promise<CustomFieldValue[]> {
        const results: CustomFieldValue[] = [];

        for (const input of values) {
            // Find existing value
            let fieldValue = await CustomFieldValue
                .where('field_definition_id', input.field_definition_id)
                .where('entity_type', entityType)
                .where('entity_id', entityId)
                .first();

            // Get field definition to determine storage column
            const definition = await CustomFieldDefinition
                .where('id', input.field_definition_id)
                .whereNull('deleted_at')
                .first();

            if (!definition) continue;

            const storageData = this.resolveStorageColumn(definition.field_type, input.value);

            if (fieldValue) {
                // Update existing
                fieldValue.value_text = storageData.value_text ?? undefined;
                fieldValue.value_number = storageData.value_number ?? undefined;
                fieldValue.value_date = storageData.value_date ?? undefined;
                fieldValue.value_boolean = storageData.value_boolean ?? undefined;
                await fieldValue.save();
            } else {
                // Create new
                fieldValue = await CustomFieldValue.create({
                    field_definition_id: input.field_definition_id,
                    entity_type: entityType,
                    entity_id: entityId,
                    ...storageData,
                });
            }

            results.push(fieldValue);
        }

        return results;
    }

    /**
     * Determine which typed column to use for storing the value based on field type.
     */
    private resolveStorageColumn(
        fieldType: CustomFieldType,
        value: string | number | boolean | null
    ): Pick<CustomFieldValue, 'value_text' | 'value_number' | 'value_date' | 'value_boolean'> {
        if (value === null || value === undefined) {
            return { value_text: undefined, value_number: undefined, value_date: undefined, value_boolean: undefined };
        }

        switch (fieldType) {
            case 'number':
                return { value_number: Number(value), value_text: undefined, value_date: undefined, value_boolean: undefined };
            case 'date':
                return { value_date: String(value), value_text: undefined, value_number: undefined, value_boolean: undefined };
            case 'checkbox':
                return { value_boolean: Boolean(value), value_text: undefined, value_number: undefined, value_date: undefined };
            case 'text':
            case 'textarea':
            case 'email':
            case 'phone':
            case 'url':
            case 'dropdown':
            default:
                return { value_text: String(value), value_number: undefined, value_date: undefined, value_boolean: undefined };
        }
    }
}
