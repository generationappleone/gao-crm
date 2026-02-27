import { Company } from '../models/company.model.js';
export class CompanyService {
    async list(params, search) {
        let query = Company.where('id', '!=', '').whereNull('deleted_at');
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
    async findById(id) {
        return Company.where('id', id).whereNull('deleted_at').first();
    }
    async create(data) {
        return Company.create(data);
    }
    async update(id, data) {
        const company = await this.findById(id);
        if (!company)
            return null;
        company.fill(data);
        await company.save();
        return company;
    }
    async delete(id) {
        const company = await this.findById(id);
        if (!company)
            return false;
        await company.destroy();
        return true;
    }
}
//# sourceMappingURL=company.service.js.map