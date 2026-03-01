import { Model, Table, Column } from '@gao/orm';

export type LandingPageStatus = 'draft' | 'published' | 'archived';

@Table('landing_pages')
export class LandingPage extends Model {
    @Column() declare id: string;
    @Column() title!: string;
    @Column() slug!: string;
    @Column() description?: string;
    @Column() template!: string;
    @Column() status!: LandingPageStatus;
    @Column() sections?: string; // JSONB — section definitions
    @Column() seo_title?: string;
    @Column() seo_description?: string;
    @Column() custom_css?: string;
    @Column() form_id?: string;
    @Column() chat_enabled?: boolean;
    @Column() total_views?: number;
    @Column() total_conversions?: number;
    @Column() published_at?: string;
    @Column() created_by?: string;
    @Column() declare created_at: string;
    @Column() declare updated_at: string;
    @Column() declare deleted_at: string;
}
