import { Report, type ReportType, type ChartType } from '../models/report.model.js';

interface CreateReportInput {
    name: string;
    description?: string;
    owner_id: string;
    report_type: ReportType;
    entity_type: string;
    columns?: string[];
    filters?: Array<{ field: string; operator: string; value: string }>;
    group_by?: string;
    sort_by?: string;
    sort_direction?: 'ASC' | 'DESC';
    chart_type?: ChartType;
}

export class ReportBuilderService {
    async list(ownerId?: string): Promise<Report[]> {
        let query = Report.where('deleted_at', 'IS', null);
        if (ownerId) query = query.where('owner_id', ownerId);
        return query.orderBy('updated_at', 'DESC').get();
    }

    async findById(id: string): Promise<Report | null> {
        return Report.where('id', id).whereNull('deleted_at').first() ?? null;
    }

    async create(data: CreateReportInput): Promise<Report> {
        return Report.create({
            name: data.name,
            description: data.description,
            owner_id: data.owner_id,
            report_type: data.report_type,
            entity_type: data.entity_type,
            columns: JSON.stringify(data.columns ?? []),
            filters: JSON.stringify(data.filters ?? []),
            group_by: data.group_by,
            sort_by: data.sort_by,
            sort_direction: data.sort_direction ?? 'DESC',
            chart_type: data.chart_type,
            is_public: false,
            is_favorite: false,
        });
    }

    async update(id: string, data: Partial<CreateReportInput & { is_public: boolean; is_favorite: boolean }>): Promise<Report | null> {
        const report = await Report.where('id', id).whereNull('deleted_at').first();
        if (!report) return null;

        if (data.name !== undefined) report.name = data.name;
        if (data.description !== undefined) report.description = data.description;
        if (data.report_type !== undefined) report.report_type = data.report_type;
        if (data.columns !== undefined) report.columns = JSON.stringify(data.columns);
        if (data.filters !== undefined) report.filters = JSON.stringify(data.filters);
        if (data.group_by !== undefined) report.group_by = data.group_by;
        if (data.sort_by !== undefined) report.sort_by = data.sort_by;
        if (data.sort_direction !== undefined) report.sort_direction = data.sort_direction;
        if (data.chart_type !== undefined) report.chart_type = data.chart_type;
        if (data.is_public !== undefined) report.is_public = data.is_public;
        if (data.is_favorite !== undefined) report.is_favorite = data.is_favorite;

        await report.save();
        return report;
    }

    async delete(id: string): Promise<boolean> {
        const report = await Report.where('id', id).whereNull('deleted_at').first();
        if (!report) return false;
        await report.destroy();
        return true;
    }

    /**
     * Execute a report and return results.
     * In production: dynamically builds SQL from columns/filters/group_by.
     */
    async execute(id: string): Promise<{ report: Report; data: unknown[] }> {
        const report = await Report.where('id', id).whereNull('deleted_at').first();
        if (!report) throw new Error('Report not found');

        report.last_run_at = new Date().toISOString();
        await report.save();

        // Placeholder — in production this would dynamically query the entity_type table
        return { report, data: [] };
    }

    async getPublicReports(): Promise<Report[]> {
        return Report.where('is_public', true).where('deleted_at', 'IS', null).orderBy('name', 'ASC').get();
    }
}
