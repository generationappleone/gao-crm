import { LandingPage, type LandingPageStatus } from '../models/landing-page.model.js';

interface CreateLandingPageInput {
    title: string;
    slug: string;
    template: string;
    description?: string;
    sections?: string;
    seo_title?: string;
    seo_description?: string;
    custom_css?: string;
    form_id?: string;
    chat_enabled?: boolean;
    created_by?: string;
}

export class LandingPageService {
    async list(): Promise<LandingPage[]> {
        return LandingPage.where('deleted_at', null).orderBy('created_at', 'DESC').get();
    }

    async findById(id: string): Promise<LandingPage | null> {
        return LandingPage.where('id', id).where('deleted_at', null).first();
    }

    async findBySlug(slug: string): Promise<LandingPage | null> {
        return LandingPage.where('slug', slug).where('status', 'published').where('deleted_at', null).first();
    }

    async create(data: CreateLandingPageInput): Promise<LandingPage> {
        return LandingPage.create({
            ...data,
            status: 'draft',
            total_views: 0,
            total_conversions: 0,
        });
    }

    async update(id: string, data: Partial<CreateLandingPageInput> & { status?: LandingPageStatus }): Promise<LandingPage | null> {
        const page = await LandingPage.where('id', id).first();
        if (!page) return null;
        if (data.title !== undefined) page.title = data.title;
        if (data.slug !== undefined) page.slug = data.slug;
        if (data.template !== undefined) page.template = data.template;
        if (data.description !== undefined) page.description = data.description;
        if (data.sections !== undefined) page.sections = data.sections;
        if (data.seo_title !== undefined) page.seo_title = data.seo_title;
        if (data.seo_description !== undefined) page.seo_description = data.seo_description;
        if (data.custom_css !== undefined) page.custom_css = data.custom_css;
        if (data.form_id !== undefined) page.form_id = data.form_id;
        if (data.chat_enabled !== undefined) page.chat_enabled = data.chat_enabled;
        if (data.status === 'published' && !page.published_at) {
            page.published_at = new Date().toISOString();
        }
        if (data.status !== undefined) page.status = data.status;
        await page.save();
        return page;
    }

    async publish(id: string): Promise<LandingPage | null> {
        return this.update(id, { status: 'published' });
    }

    async unpublish(id: string): Promise<LandingPage | null> {
        return this.update(id, { status: 'draft' });
    }

    async delete(id: string): Promise<boolean> {
        const page = await LandingPage.where('id', id).first();
        if (!page) return false;
        page.deleted_at = new Date().toISOString();
        await page.save();
        return true;
    }

    async incrementViews(id: string): Promise<void> {
        const page = await LandingPage.where('id', id).first();
        if (page) {
            page.total_views = (page.total_views ?? 0) + 1;
            await page.save();
        }
    }
}
