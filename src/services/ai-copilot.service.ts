import { AiConversation, type AiContextType } from '../models/ai-conversation.model.js';
import { AiMessage, type AiMessageRole } from '../models/ai-message.model.js';

interface StartConversationInput {
    user_id: string;
    title?: string;
    context_type?: AiContextType;
    context_id?: string;
    model?: string;
}

interface SendMessageInput {
    conversation_id: string;
    content: string;
}

interface AiResponse {
    message: AiMessage;
    conversation: AiConversation;
}

export class AiCopilotService {
    /**
     * List conversations for a user.
     */
    async listConversations(userId: string): Promise<AiConversation[]> {
        return AiConversation
            .where('user_id', userId)
            .where('deleted_at', 'IS', null)
            .orderBy('last_message_at', 'DESC')
            .limit(50)
            .get();
    }

    /**
     * Get a conversation with its messages.
     */
    async getConversation(id: string): Promise<{ conversation: AiConversation; messages: AiMessage[] } | null> {
        const conversation = await AiConversation.where('id', id).whereNull('deleted_at').first();
        if (!conversation) return null;

        const messages = await AiMessage
            .where('conversation_id', id)
            .orderBy('created_at', 'ASC')
            .get();

        return { conversation, messages };
    }

    /**
     * Start a new AI conversation.
     */
    async startConversation(data: StartConversationInput): Promise<AiConversation> {
        return AiConversation.create({
            user_id: data.user_id,
            title: data.title ?? 'New Conversation',
            context_type: data.context_type,
            context_id: data.context_id,
            model: data.model ?? 'gemini-2.0-flash',
            total_messages: 0,
            total_tokens_used: 0,
        });
    }

    /**
     * Send a message and generate AI response.
     * In production, this connects to Gemini/OpenAI API.
     */
    async sendMessage(data: SendMessageInput): Promise<AiResponse> {
        const conversation = await AiConversation.where('id', data.conversation_id).first();
        if (!conversation) throw new Error('Conversation not found');

        // Save user message
        const userMessage = await AiMessage.create({
            conversation_id: data.conversation_id,
            role: 'user' as AiMessageRole,
            content: data.content,
            tokens_used: this.estimateTokens(data.content),
        });

        // Generate AI response
        // In production: call Gemini API with conversation history + CRM context
        const aiResponseContent = await this.generateResponse(conversation, data.content);
        const aiTokens = this.estimateTokens(aiResponseContent);

        const assistantMessage = await AiMessage.create({
            conversation_id: data.conversation_id,
            role: 'assistant' as AiMessageRole,
            content: aiResponseContent,
            tokens_used: aiTokens,
        });

        // Update conversation counters
        conversation.total_messages = (conversation.total_messages || 0) + 2;
        conversation.total_tokens_used = (conversation.total_tokens_used || 0) + userMessage.tokens_used + aiTokens;
        conversation.last_message_at = new Date().toISOString();

        // Auto-generate title from first message
        if (conversation.total_messages <= 2 && (!conversation.title || conversation.title === 'New Conversation')) {
            conversation.title = data.content.substring(0, 80) + (data.content.length > 80 ? '...' : '');
        }

        await conversation.save();

        return { message: assistantMessage, conversation };
    }

    /**
     * Delete a conversation.
     */
    async deleteConversation(id: string): Promise<boolean> {
        const conversation = await AiConversation.where('id', id).whereNull('deleted_at').first();
        if (!conversation) return false;
        await conversation.destroy();
        return true;
    }

    // ─── Internal Helpers ──────────────────────────────

    /**
     * Generate AI response. Placeholder for actual API integration.
     * In production: Gemini/OpenAI with CRM context injection.
     */
    private async generateResponse(conversation: AiConversation, userMessage: string): Promise<string> {
        // This is a placeholder. In production, this would:
        // 1. Gather CRM context (contact info, deal data, recent activities)
        // 2. Build system prompt with CRM-specific instructions
        // 3. Call Gemini API with conversation history
        // 4. Handle function calling for CRM operations

        const contextHint = conversation.context_type
            ? ` (Context: ${conversation.context_type})`
            : '';

        return `I'm your GAO CRM AI Copilot${contextHint}. ` +
            `I received your message: "${userMessage.substring(0, 100)}". ` +
            `In production, I'll be connected to the Gemini API to provide intelligent CRM assistance, ` +
            `including deal insights, email drafting, contact analysis, and next-action recommendations.`;
    }

    /**
     * Rough token estimation (4 chars ≈ 1 token).
     */
    private estimateTokens(text: string): number {
        return Math.ceil(text.length / 4);
    }
}
