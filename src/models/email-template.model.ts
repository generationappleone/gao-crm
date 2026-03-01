import { Model, Table, Column } from '@gao/orm';

@Table('email_templates')
export class EmailTemplate extends Model {
    @Column() declare id: string;
    @Column() name!: string;
    @Column() subject!: string;
    @Column() body_html!: string;
    @Column() body_text?: string;
    @Column() category?: 'follow_up' | 'introduction' | 'proposal' | 'thank_you' | 'meeting' | 'general';
    @Column() owner_id!: string;
    @Column() is_shared!: boolean;
    @Column() variables?: string; // JSONB stored as string
    @Column() declare created_at: string;
    @Column() declare updated_at: string;
    @Column() declare deleted_at: string | undefined;
}
