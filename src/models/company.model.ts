import { Model, Table, Column } from '@gao/orm';

@Table('companies')
export class Company extends Model {
    @Column() declare id: string;
    @Column() name!: string;
    @Column() industry?: string;
    @Column() website?: string;
    @Column() phone?: string;
    @Column() email?: string;
    @Column() address?: string;
    @Column() city?: string;
    @Column() state?: string;
    @Column() country?: string;
    @Column() employee_count?: number;
    @Column() annual_revenue?: number;
    @Column() notes?: string;
    @Column() declare created_at: string;
    @Column() declare updated_at: string;
    @Column() declare deleted_at: string | undefined;
}
