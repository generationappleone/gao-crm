import { Company } from '../models/company.model.js';
import type { PaginationParams, PaginationMeta } from '../helpers/pagination.js';

export interface CompanyListResult {
    companies: Company[];
    meta: PaginationMeta;
}

export class CompanyService {

    async list(params: PaginationParams, search?: string): Promise<CompanyListResult> {
        let query = Company.where('deleted_at', 'IS', null);

        if (search) {
            query = query.where('name', 'LIKE', `%${search}%`);
        }

        const result = await query.orderBy('created_at', 'DESC').paginate(params.page, params.perPage);

        return {
            companies: result.data,
            meta: {
                page: result.meta.page,
                per_page: result.meta.perPage,
                total: result.meta.total,
                total_pages: result.meta.totalPages,
            },
        };
    }

    async findById(id: string): Promise<Company | null> {
        return Company.where('id', id).whereNull('deleted_at').first();
    }

    async create(data: Record<string, unknown>): Promise<Company> {
        return Company.create(data);
    }

    async update(id: string, data: Record<string, unknown>): Promise<Company | null> {
        const company = await this.findById(id);
        if (!company) return null;

        company.fill(data);
        await company.save();
        return company;
    }

    async delete(id: string): Promise<boolean> {
        const company = await this.findById(id);
        if (!company) return false;
        await company.destroy();
        return true;
    }
}
