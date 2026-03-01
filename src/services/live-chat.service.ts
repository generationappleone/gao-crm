import { LiveChatSession } from '../models/live-chat-session.model.js';
import { LiveChatMessage, type ChatMessageSender, type ChatMessageType } from '../models/live-chat-message.model.js';

interface StartChatInput {
    visitor_id: string;
    visitor_name?: string;
    visitor_email?: string;
    visitor_ip?: string;
    visitor_user_agent?: string;
    page_url?: string;
    channel?: string;
}

interface SendChatMessageInput {
    session_id: string;
    sender_type: ChatMessageSender;
    sender_id?: string;
    content: string;
    message_type?: ChatMessageType;
    attachments?: unknown[];
}

export class LiveChatService {
    async startSession(data: StartChatInput): Promise<LiveChatSession> {
        return LiveChatSession.create({
            visitor_id: data.visitor_id,
            visitor_name: data.visitor_name,
            visitor_email: data.visitor_email,
            visitor_ip: data.visitor_ip,
            visitor_user_agent: data.visitor_user_agent,
            page_url: data.page_url,
            channel: data.channel ?? 'web_chat',
            status: 'waiting',
            total_messages: 0,
            started_at: new Date().toISOString(),
        });
    }

    async assignAgent(sessionId: string, agentId: string): Promise<LiveChatSession | null> {
        const session = await LiveChatSession.where('id', sessionId).first();
        if (!session) return null;
        session.assigned_to = agentId;
        session.status = 'active';
        if (!session.first_response_at) {
            session.first_response_at = new Date().toISOString();
        }
        await session.save();
        return session;
    }

    async sendMessage(data: SendChatMessageInput): Promise<LiveChatMessage> {
        const message = await LiveChatMessage.create({
            session_id: data.session_id,
            sender_type: data.sender_type,
            sender_id: data.sender_id,
            content: data.content,
            message_type: data.message_type ?? 'text',
            attachments: data.attachments ? JSON.stringify(data.attachments) : undefined,
            is_read: false,
        });

        const session = await LiveChatSession.where('id', data.session_id).first();
        if (session) {
            session.total_messages = (session.total_messages || 0) + 1;
            await session.save();
        }

        return message;
    }

    async getMessages(sessionId: string): Promise<LiveChatMessage[]> {
        return LiveChatMessage.where('session_id', sessionId).orderBy('created_at', 'ASC').get();
    }

    async endSession(sessionId: string, rating?: number, feedback?: string): Promise<LiveChatSession | null> {
        const session = await LiveChatSession.where('id', sessionId).first();
        if (!session) return null;
        session.status = 'ended';
        session.ended_at = new Date().toISOString();
        if (rating !== undefined) session.rating = rating;
        if (feedback !== undefined) session.feedback = feedback;
        await session.save();
        return session;
    }

    async getActiveSessions(agentId?: string): Promise<LiveChatSession[]> {
        let query = LiveChatSession.where('status', 'active');
        if (agentId) query = query.where('assigned_to', agentId);
        return query.orderBy('started_at', 'DESC').get();
    }

    async getWaitingSessions(): Promise<LiveChatSession[]> {
        return LiveChatSession.where('status', 'waiting').orderBy('started_at', 'ASC').get();
    }
}
