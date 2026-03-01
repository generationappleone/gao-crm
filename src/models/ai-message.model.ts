import { Model, Table, Column } from '@gao/orm';

export type AiMessageRole = 'user' | 'assistant' | 'system' | 'tool';

@Table('ai_messages')
export class AiMessage extends Model {
    @Column() declare id: string;
    @Column() conversation_id!: string;
    @Column() role!: AiMessageRole;
    @Column() content!: string;
    @Column() tokens_used!: number;
    @Column() tool_calls?: string; // JSONB
    @Column() metadata?: string; // JSONB
    @Column() declare created_at: string;
}
