import { Model, Table, Column } from '@gao/orm';

export type ReportType = 'table' | 'summary' | 'chart' | 'pivot' | 'funnel';
export type ChartType = 'bar' | 'line' | 'pie' | 'donut' | 'area' | 'funnel' | 'scatter';

@Table('reports')
export class Report extends Model {
    @Column() declare id: string;
    @Column() name!: string;
    @Column() description?: string;
    @Column() owner_id!: string;
    @Column() report_type!: ReportType;
    @Column() entity_type!: string;
    @Column() columns!: string; // JSONB
    @Column() filters!: string; // JSONB
    @Column() group_by?: string;
    @Column() sort_by?: string;
    @Column() sort_direction!: 'ASC' | 'DESC';
    @Column() chart_type?: ChartType;
    @Column() is_public!: boolean;
    @Column() is_favorite!: boolean;
    @Column() last_run_at?: string;
    @Column() declare created_at: string;
    @Column() declare updated_at: string;
    @Column() declare deleted_at: string | undefined;
}
