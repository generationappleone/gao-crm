import { Model, Table, Column } from '@gao/orm';

export type ArticleStatus = 'draft' | 'published' | 'archived';

@Table('knowledge_base_articles')
export class KnowledgeBaseArticle extends Model {
    @Column() declare id: string;
    @Column() title!: string;
    @Column() slug!: string;
    @Column() content!: string;
    @Column() excerpt?: string;
    @Column() category?: string;
    @Column() author_id!: string;
    @Column() status!: ArticleStatus;
    @Column() is_featured!: boolean;
    @Column() view_count!: number;
    @Column() helpful_count!: number;
    @Column() not_helpful_count!: number;
    @Column() display_order!: number;
    @Column() published_at?: string;
    @Column() declare created_at: string;
    @Column() declare updated_at: string;
    @Column() declare deleted_at: string | undefined;
}
