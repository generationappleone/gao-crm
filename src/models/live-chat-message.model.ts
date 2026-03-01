import { Model, Table, Column } from '@gao/orm';

export type ChatMessageSender = 'visitor' | 'agent' | 'bot';
export type ChatMessageType = 'text' | 'image' | 'file' | 'system' | 'typing';

@Table('live_chat_messages')
export class LiveChatMessage extends Model {
    @Column() declare id: string;
    @Column() session_id!: string;
    @Column() sender_type!: ChatMessageSender;
    @Column() sender_id?: string;
    @Column() content!: string;
    @Column() message_type!: ChatMessageType;
    @Column() attachments?: string; // JSONB
    @Column() is_read!: boolean;
    @Column() declare created_at: string;
}
