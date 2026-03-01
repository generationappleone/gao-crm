import { ExportJob, type ExportFormat, type ExportStatus } from '../models/export-job.model.js';

interface CreateExportInput {
    user_id: string;
    export_type: ExportFormat;
    entity_type: string;
    filters?: Record<string, unknown>;
    columns?: string[];
}

export class ExportService {
    async list(userId: string): Promise<ExportJob[]> {
        return ExportJob.where('user_id', userId).orderBy('created_at', 'DESC').limit(50).get();
    }

    async findById(id: string): Promise<ExportJob | null> {
        return ExportJob.where('id', id).first() ?? null;
    }

    async create(data: CreateExportInput): Promise<ExportJob> {
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours
        return ExportJob.create({
            user_id: data.user_id,
            export_type: data.export_type,
            entity_type: data.entity_type,
            filters: JSON.stringify(data.filters ?? {}),
            columns: JSON.stringify(data.columns ?? []),
            status: 'pending',
            expires_at: expiresAt,
        });
    }

    /**
     * Process an export job. In production, this is queued via @gao/queue.
     */
    async process(id: string): Promise<ExportJob | null> {
        const job = await ExportJob.where('id', id).first();
        if (!job || job.status !== 'pending') return null;

        job.status = 'processing' as ExportStatus;
        job.started_at = new Date().toISOString();
        await job.save();

        try {
            // In production: query entity_type, apply filters, generate file
            const fileName = `export_${job.entity_type}_${Date.now()}.${job.export_type}`;
            const filePath = `/exports/${fileName}`;

            job.status = 'completed' as ExportStatus;
            job.file_path = filePath;
            job.file_size = 0; // Calculated after file generation
            job.total_rows = 0;
            job.completed_at = new Date().toISOString();
            await job.save();
        } catch (error) {
            job.status = 'failed' as ExportStatus;
            job.error_message = error instanceof Error ? error.message : String(error);
            await job.save();
        }

        return job;
    }

    async updateStatus(id: string, status: ExportStatus): Promise<void> {
        const job = await ExportJob.where('id', id).first();
        if (job) {
            job.status = status;
            await job.save();
        }
    }
}
