import { Model, Table, Column } from '@gao/orm';

export type WidgetType = 'number' | 'chart' | 'table' | 'list' | 'progress' | 'funnel' | 'activity_feed' | 'leaderboard';

@Table('dashboard_widgets')
export class DashboardWidget extends Model {
    @Column() declare id: string;
    @Column() user_id!: string;
    @Column() title!: string;
    @Column() widget_type!: WidgetType;
    @Column() data_source!: string;
    @Column() config!: string; // JSONB
    @Column() width!: string;
    @Column() position!: number;
    @Column() is_visible!: boolean;
    @Column() refresh_interval!: number;
    @Column() declare created_at: string;
    @Column() declare updated_at: string;
}
