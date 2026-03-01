import { Model, Table, Column } from '@gao/orm';

export type CustomFieldEntityType = 'contact' | 'company' | 'deal';
export type CustomFieldType = 'text' | 'number' | 'dropdown' | 'date' | 'checkbox' | 'textarea' | 'email' | 'phone' | 'url';

@Table('custom_field_definitions')
export class CustomFieldDefinition extends Model {
    @Column() declare id: string;
    @Column() entity_type!: CustomFieldEntityType;
    @Column() field_name!: string;
    @Column() field_slug!: string;
    @Column() field_type!: CustomFieldType;
    @Column() field_options?: string; // JSONB stored as string
    @Column() is_required!: boolean;
    @Column() is_filterable!: boolean;
    @Column() display_order!: number;
    @Column() default_value?: string;
    @Column() placeholder?: string;
    @Column() validation_rules?: string; // JSONB stored as string
    @Column() declare created_at: string;
    @Column() declare updated_at: string;
    @Column() declare deleted_at: string | undefined;
}
