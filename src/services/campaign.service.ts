import { Campaign, type CampaignStatus } from '../models/campaign.model.js';
import { CampaignRecipient } from '../models/campaign-recipient.model.js';
import { Contact } from '../models/contact.model.js';

interface CreateCampaignInput {
    name: string;
    owner_id: string;
    type?: 'email' | 'sms' | 'whatsapp';
    template_id?: string;
    subject?: string;
    body_html?: string;
    from_email?: string;
    from_name?: string;
    source?: string;
    medium?: string;
    scheduled_at?: string;
}

export class CampaignService {
    async list(ownerId?: string, status?: CampaignStatus): Promise<Campaign[]> {
        let query = Campaign.where('deleted_at', 'IS', null);
        if (ownerId) query = query.where('owner_id', ownerId);
        if (status) query = query.where('status', status);
        return query.orderBy('created_at', 'DESC').get();
    }

    async findById(id: string): Promise<Campaign | null> {
        return Campaign.where('id', id).whereNull('deleted_at').first() ?? null;
    }

    async create(data: CreateCampaignInput): Promise<Campaign> {
        return Campaign.create({
            name: data.name,
            owner_id: data.owner_id,
            type: data.type ?? 'email',
            status: 'draft',
            template_id: data.template_id,
            subject: data.subject,
            body_html: data.body_html,
            from_email: data.from_email,
            from_name: data.from_name,
            source: data.source,
            medium: data.medium ?? 'email',
            scheduled_at: data.scheduled_at,
            total_recipients: 0,
            total_sent: 0,
            total_opens: 0,
            total_clicks: 0,
            total_bounces: 0,
            total_unsubscribes: 0,
        });
    }

    async update(id: string, data: Partial<CreateCampaignInput>): Promise<Campaign | null> {
        const campaign = await Campaign.where('id', id).whereNull('deleted_at').first();
        if (!campaign || campaign.status !== 'draft') return null;

        if (data.name !== undefined) campaign.name = data.name;
        if (data.subject !== undefined) campaign.subject = data.subject;
        if (data.body_html !== undefined) campaign.body_html = data.body_html;
        if (data.from_email !== undefined) campaign.from_email = data.from_email;
        if (data.from_name !== undefined) campaign.from_name = data.from_name;
        if (data.template_id !== undefined) campaign.template_id = data.template_id;
        if (data.source !== undefined) campaign.source = data.source;
        if (data.scheduled_at !== undefined) campaign.scheduled_at = data.scheduled_at;

        await campaign.save();
        return campaign;
    }

    /**
     * Add contacts as recipients to a campaign.
     */
    async addRecipients(campaignId: string, contactIds: string[]): Promise<number> {
        let added = 0;
        for (const contactId of contactIds) {
            const contact = await Contact.where('id', contactId).first();
            if (!contact?.email) continue;

            // Skip if already a recipient
            const exists = await CampaignRecipient
                .where('campaign_id', campaignId)
                .where('contact_id', contactId)
                .first();
            if (exists) continue;

            await CampaignRecipient.create({
                campaign_id: campaignId,
                contact_id: contactId,
                email: contact.email,
                status: 'pending',
                open_count: 0,
                click_count: 0,
            });
            added++;
        }

        // Update total count
        const campaign = await Campaign.where('id', campaignId).first();
        if (campaign) {
            const allRecipients = await CampaignRecipient.where('campaign_id', campaignId).get();
            campaign.total_recipients = allRecipients.length;
            await campaign.save();
        }

        return added;
    }

    async getRecipients(campaignId: string): Promise<CampaignRecipient[]> {
        return CampaignRecipient.where('campaign_id', campaignId).get();
    }

    /**
     * Start sending a campaign.
     * In production, this would queue individual emails via @gao/queue.
     */
    async send(id: string): Promise<Campaign | null> {
        const campaign = await Campaign.where('id', id).whereNull('deleted_at').first();
        if (!campaign) return null;
        if (campaign.status !== 'draft' && campaign.status !== 'scheduled') return null;

        campaign.status = 'sending';
        campaign.sent_at = new Date().toISOString();
        await campaign.save();

        // In production: queue each recipient email via @gao/queue
        // For now, mark as sent
        campaign.status = 'sent';
        campaign.completed_at = new Date().toISOString();
        await campaign.save();

        return campaign;
    }

    async updateStatus(id: string, status: CampaignStatus): Promise<Campaign | null> {
        const campaign = await Campaign.where('id', id).whereNull('deleted_at').first();
        if (!campaign) return null;
        campaign.status = status;
        await campaign.save();
        return campaign;
    }

    async delete(id: string): Promise<boolean> {
        const campaign = await Campaign.where('id', id).whereNull('deleted_at').first();
        if (!campaign) return false;
        await campaign.destroy();
        return true;
    }

    /**
     * Get campaign analytics summary.
     */
    async getAnalytics(id: string): Promise<Record<string, number> | null> {
        const campaign = await Campaign.where('id', id).whereNull('deleted_at').first();
        if (!campaign) return null;

        const openRate = campaign.total_sent > 0
            ? Math.round((campaign.total_opens / campaign.total_sent) * 100)
            : 0;
        const clickRate = campaign.total_sent > 0
            ? Math.round((campaign.total_clicks / campaign.total_sent) * 100)
            : 0;
        const bounceRate = campaign.total_sent > 0
            ? Math.round((campaign.total_bounces / campaign.total_sent) * 100)
            : 0;

        return {
            total_recipients: campaign.total_recipients,
            total_sent: campaign.total_sent,
            total_opens: campaign.total_opens,
            total_clicks: campaign.total_clicks,
            total_bounces: campaign.total_bounces,
            total_unsubscribes: campaign.total_unsubscribes,
            open_rate: openRate,
            click_rate: clickRate,
            bounce_rate: bounceRate,
        };
    }
}
