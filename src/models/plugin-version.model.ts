import { Model, Table, Column } from '@gao/orm';

@Table('plugin_versions')
export class PluginVersion extends Model {
    @Column() declare id: string;
    @Column() plugin_id!: string;
    @Column() version!: string;
    @Column() changelog?: string;
    @Column() min_crm_version?: string;
    @Column() file_path?: string;
    @Column() file_hash?: string;
    @Column() released_at!: string;
    @Column() declare created_at: string;
}
