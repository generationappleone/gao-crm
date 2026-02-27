import { Company } from '../models/company.model.js';
import type { PaginationParams, PaginationMeta } from '../helpers/pagination.js';
export interface CompanyListResult {
    companies: Company[];
    meta: PaginationMeta;
}
export declare class CompanyService {
    list(params: PaginationParams, search?: string): Promise<CompanyListResult>;
    findById(id: string): Promise<Company | null>;
    create(data: Record<string, unknown>): Promise<Company>;
    update(id: string, data: Record<string, unknown>): Promise<Company | null>;
    delete(id: string): Promise<boolean>;
}
//# sourceMappingURL=company.service.d.ts.map