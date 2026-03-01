import { Model, Table, Column } from '@gao/orm';

export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled';

@Table('payments')
export class Payment extends Model {
    @Column() declare id: string;
    @Column() invoice_id!: string;
    @Column() payment_method_id?: string;
    @Column() amount!: number;
    @Column() currency!: string;
    @Column() status!: PaymentStatus;
    @Column() reference_number?: string;
    @Column() gateway_transaction_id?: string;
    @Column() gateway_response?: string; // JSONB
    @Column() notes?: string;
    @Column() paid_at?: string;
    @Column() declare created_at: string;
    @Column() declare updated_at: string;
}
