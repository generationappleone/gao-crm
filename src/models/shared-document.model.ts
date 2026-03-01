import { Model, Table, Column } from '@gao/orm';

@Table('shared_documents')
export class SharedDocument extends Model {
    @Column() declare id: string;
    @Column() uploaded_by!: string;
    @Column() contact_id?: string;
    @Column() company_id?: string;
    @Column() deal_id?: string;
    @Column() name!: string;
    @Column() file_path!: string;
    @Column() file_type?: string;
    @Column() file_size?: number;
    @Column() is_portal_visible!: boolean;
    @Column() portal_expires_at?: string;
    @Column() download_count!: number;
    @Column() declare created_at: string;
    @Column() declare updated_at: string;
    @Column() declare deleted_at: string | undefined;
}
