import { Model, Table, Column } from '@gao/orm';

export type FormFieldType = 'text' | 'email' | 'phone' | 'number' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'date' | 'file' | 'hidden' | 'heading' | 'paragraph' | 'divider';

@Table('form_fields')
export class FormField extends Model {
    @Column() declare id: string;
    @Column() form_id!: string;
    @Column() field_type!: FormFieldType;
    @Column() label!: string;
    @Column() name!: string;
    @Column() placeholder?: string;
    @Column() help_text?: string;
    @Column() is_required!: boolean;
    @Column() validation_rules?: string; // JSONB
    @Column() options?: string; // JSONB
    @Column() default_value?: string;
    @Column() width!: 'full' | 'half' | 'third';
    @Column() display_order!: number;
    @Column() map_to_entity?: string;
    @Column() map_to_field?: string;
    @Column() declare created_at: string;
    @Column() declare updated_at: string;
}
