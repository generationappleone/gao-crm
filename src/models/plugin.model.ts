import { Model, Table, Column } from '@gao/orm';

@Table('plugins')
export class Plugin extends Model {
    @Column() declare id: string;
    @Column() slug!: string;
    @Column() name!: string;
    @Column() description?: string;
    @Column() author?: string;
    @Column() homepage?: string;
    @Column() icon_url?: string;
    @Column() category!: string;
    @Column() current_version?: string;
    @Column() is_installed!: boolean;
    @Column() is_active!: boolean;
    @Column() config!: string; // JSONB
    @Column() installed_at?: string;
    @Column() declare created_at: string;
    @Column() declare updated_at: string;
}
