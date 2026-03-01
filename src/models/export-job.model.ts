import { Model, Table, Column } from '@gao/orm';

export type ExportFormat = 'csv' | 'xlsx' | 'pdf' | 'json';
export type ExportStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'expired';

@Table('export_jobs')
export class ExportJob extends Model {
    @Column() declare id: string;
    @Column() user_id!: string;
    @Column() export_type!: ExportFormat;
    @Column() entity_type!: string;
    @Column() filters!: string; // JSONB
    @Column() columns!: string; // JSONB
    @Column() status!: ExportStatus;
    @Column() file_path?: string;
    @Column() file_size?: number;
    @Column() total_rows?: number;
    @Column() error_message?: string;
    @Column() started_at?: string;
    @Column() completed_at?: string;
    @Column() expires_at?: string;
    @Column() declare created_at: string;
}
