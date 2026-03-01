import { Model, Table, Column } from '@gao/orm';

export type PaymentProvider = 'manual' | 'bank_transfer' | 'midtrans' | 'xendit' | 'stripe' | 'paypal';

@Table('payment_methods')
export class PaymentMethod extends Model {
    @Column() declare id: string;
    @Column() name!: string;
    @Column() provider!: PaymentProvider;
    @Column() config!: string; // JSONB
    @Column() is_active!: boolean;
    @Column() display_order!: number;
    @Column() declare created_at: string;
    @Column() declare updated_at: string;
}
