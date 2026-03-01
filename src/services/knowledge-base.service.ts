import { KnowledgeBaseArticle, type ArticleStatus } from '../models/knowledge-base-article.model.js';

interface CreateArticleInput {
    title: string;
    slug: string;
    content: string;
    excerpt?: string;
    category?: string;
    author_id: string;
    is_featured?: boolean;
}

export class KnowledgeBaseService {
    async listPublished(category?: string): Promise<KnowledgeBaseArticle[]> {
        let query = KnowledgeBaseArticle.where('status', 'published').where('deleted_at', 'IS', null);
        if (category) query = query.where('category', category);
        return query.orderBy('display_order', 'ASC').get();
    }

    async listAll(status?: ArticleStatus): Promise<KnowledgeBaseArticle[]> {
        let query = KnowledgeBaseArticle.where('deleted_at', 'IS', null);
        if (status) query = query.where('status', status);
        return query.orderBy('updated_at', 'DESC').get();
    }

    async findById(id: string): Promise<KnowledgeBaseArticle | null> {
        return KnowledgeBaseArticle.where('id', id).whereNull('deleted_at').first() ?? null;
    }

    async findBySlug(slug: string): Promise<KnowledgeBaseArticle | null> {
        return KnowledgeBaseArticle.where('slug', slug).whereNull('deleted_at').first() ?? null;
    }

    async create(data: CreateArticleInput): Promise<KnowledgeBaseArticle> {
        return KnowledgeBaseArticle.create({
            title: data.title,
            slug: data.slug,
            content: data.content,
            excerpt: data.excerpt,
            category: data.category,
            author_id: data.author_id,
            status: 'draft',
            is_featured: data.is_featured ?? false,
            view_count: 0,
            helpful_count: 0,
            not_helpful_count: 0,
            display_order: 0,
        });
    }

    async update(id: string, data: Partial<CreateArticleInput & { status: ArticleStatus }>): Promise<KnowledgeBaseArticle | null> {
        const article = await KnowledgeBaseArticle.where('id', id).whereNull('deleted_at').first();
        if (!article) return null;

        if (data.title !== undefined) article.title = data.title;
        if (data.content !== undefined) article.content = data.content;
        if (data.excerpt !== undefined) article.excerpt = data.excerpt;
        if (data.category !== undefined) article.category = data.category;
        if (data.is_featured !== undefined) article.is_featured = data.is_featured;
        if (data.status !== undefined) {
            article.status = data.status;
            if (data.status === 'published' && !article.published_at) {
                article.published_at = new Date().toISOString();
            }
        }

        await article.save();
        return article;
    }

    async recordView(id: string): Promise<void> {
        const article = await KnowledgeBaseArticle.where('id', id).first();
        if (article) {
            article.view_count = (article.view_count || 0) + 1;
            await article.save();
        }
    }

    async vote(id: string, helpful: boolean): Promise<void> {
        const article = await KnowledgeBaseArticle.where('id', id).first();
        if (article) {
            if (helpful) {
                article.helpful_count = (article.helpful_count || 0) + 1;
            } else {
                article.not_helpful_count = (article.not_helpful_count || 0) + 1;
            }
            await article.save();
        }
    }

    async delete(id: string): Promise<boolean> {
        const article = await KnowledgeBaseArticle.where('id', id).whereNull('deleted_at').first();
        if (!article) return false;
        await article.destroy();
        return true;
    }

    async getCategories(): Promise<string[]> {
        const articles = await KnowledgeBaseArticle.where('status', 'published').where('deleted_at', 'IS', null).get();
        const categories = new Set<string>();
        for (const a of articles) {
            if (a.category) categories.add(a.category);
        }
        return Array.from(categories).sort();
    }
}
