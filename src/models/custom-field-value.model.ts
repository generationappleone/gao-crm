import { Model, Table, Column } from '@gao/orm';

@Table('custom_field_values')
export class CustomFieldValue extends Model {
    @Column() declare id: string;
    @Column() field_definition_id!: string;
    @Column() entity_type!: 'contact' | 'company' | 'deal';
    @Column() entity_id!: string;
    @Column() value_text?: string;
    @Column() value_number?: number;
    @Column() value_date?: string;
    @Column() value_boolean?: boolean;
    @Column() declare created_at: string;
    @Column() declare updated_at: string;
}
