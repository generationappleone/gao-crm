import { Model, Table, Column } from '@gao/orm';

export type AiContextType = 'contact' | 'deal' | 'company' | 'general';

@Table('ai_conversations')
export class AiConversation extends Model {
    @Column() declare id: string;
    @Column() user_id!: string;
    @Column() title?: string;
    @Column() context_type?: AiContextType;
    @Column() context_id?: string;
    @Column() model!: string;
    @Column() total_messages!: number;
    @Column() total_tokens_used!: number;
    @Column() last_message_at?: string;
    @Column() declare created_at: string;
    @Column() declare updated_at: string;
    @Column() declare deleted_at: string | undefined;
}
