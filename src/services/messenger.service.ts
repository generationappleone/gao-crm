import { Channel } from '../models/channel.model.js';
import { ChannelMember } from '../models/channel-member.model.js';
import { Message } from '../models/message.model.js';

export class MessengerService {
    async listChannels(userId: string): Promise<Channel[]> {
        const memberships = await ChannelMember.where('user_id', userId).get();
        const channelIds = memberships.map((m) => m.channel_id);
        if (channelIds.length === 0) return [];
        const channels: Channel[] = [];
        for (const cid of channelIds) {
            const ch = await Channel.where('id', cid).where('is_archived', false).first();
            if (ch) channels.push(ch);
        }
        return channels;
    }

    async createChannel(data: { name: string; slug: string; description?: string; type?: string; created_by: string }): Promise<Channel> {
        const channel = await Channel.create({ name: data.name, slug: data.slug, description: data.description, type: data.type ?? 'public', created_by: data.created_by, is_archived: false });
        await ChannelMember.create({ channel_id: channel.id, user_id: data.created_by, role: 'owner', joined_at: new Date().toISOString() });
        return channel;
    }

    async joinChannel(channelId: string, userId: string): Promise<ChannelMember> {
        return ChannelMember.create({ channel_id: channelId, user_id: userId, role: 'member', joined_at: new Date().toISOString() });
    }

    async sendMessage(data: { channel_id: string; sender_id: string; content: string; message_type?: string; parent_id?: string }): Promise<Message> {
        return Message.create({ channel_id: data.channel_id, sender_id: data.sender_id, content: data.content, message_type: data.message_type ?? 'text', parent_id: data.parent_id, is_edited: false, is_pinned: false });
    }

    async getMessages(channelId: string, limit = 50): Promise<Message[]> {
        return Message.where('channel_id', channelId).whereNull('deleted_at').orderBy('created_at', 'DESC').limit(limit).get();
    }
}
