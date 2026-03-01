import { EmailTemplate } from '../models/email-template.model.js';
import { EmailMessage, type EmailMessageStatus } from '../models/email-message.model.js';
import { EmailLinkClick } from '../models/email-link-click.model.js';
import { Contact } from '../models/contact.model.js';

interface ComposeEmailInput {
    contact_id?: string;
    deal_id?: string;
    owner_id: string;
    template_id?: string;
    from_email: string;
    to_email: string;
    cc?: string;
    bcc?: string;
    subject: string;
    body_html: string;
    scheduled_at?: string;
}

interface CreateTemplateInput {
    name: string;
    subject: string;
    body_html: string;
    body_text?: string;
    category?: string;
    owner_id: string;
    is_shared?: boolean;
    variables?: string[];
}

export class EmailHubService {
    // ─────────────────────────────────────────────────
    //  Template Management
    // ─────────────────────────────────────────────────

    async listTemplates(ownerId: string): Promise<EmailTemplate[]> {
        // Show own templates + shared templates
        return EmailTemplate
            .where('deleted_at', 'IS', null)
            .where('owner_id', ownerId)
            .orderBy('name', 'ASC')
            .get();
    }

    async createTemplate(data: CreateTemplateInput): Promise<EmailTemplate> {
        return EmailTemplate.create({
            name: data.name,
            subject: data.subject,
            body_html: data.body_html,
            body_text: data.body_text,
            category: data.category,
            owner_id: data.owner_id,
            is_shared: data.is_shared ?? false,
            variables: data.variables ? JSON.stringify(data.variables) : undefined,
        });
    }

    async updateTemplate(id: string, data: Partial<CreateTemplateInput>): Promise<EmailTemplate | null> {
        const template = await EmailTemplate.where('id', id).whereNull('deleted_at').first();
        if (!template) return null;

        if (data.name !== undefined) template.name = data.name;
        if (data.subject !== undefined) template.subject = data.subject;
        if (data.body_html !== undefined) template.body_html = data.body_html;
        if (data.body_text !== undefined) template.body_text = data.body_text;
        if (data.category !== undefined) template.category = data.category as EmailTemplate['category'];
        if (data.is_shared !== undefined) template.is_shared = data.is_shared;
        if (data.variables !== undefined) template.variables = JSON.stringify(data.variables);

        await template.save();
        return template;
    }

    async deleteTemplate(id: string): Promise<boolean> {
        const template = await EmailTemplate.where('id', id).whereNull('deleted_at').first();
        if (!template) return false;
        await template.destroy();
        return true;
    }

    // ─────────────────────────────────────────────────
    //  Email Compose & Send
    // ─────────────────────────────────────────────────

    async listMessages(ownerId: string, status?: EmailMessageStatus): Promise<EmailMessage[]> {
        let query = EmailMessage
            .where('owner_id', ownerId)
            .where('deleted_at', 'IS', null);

        if (status) {
            query = query.where('status', status);
        }

        return query.orderBy('created_at', 'DESC').get();
    }

    async composeEmail(data: ComposeEmailInput): Promise<EmailMessage> {
        // Resolve merge variables if template is used
        let bodyHtml = data.body_html;

        if (data.contact_id) {
            const contact = await Contact.where('id', data.contact_id).first();
            if (contact) {
                bodyHtml = this.resolveMergeVariables(bodyHtml, {
                    first_name: contact.first_name,
                    last_name: contact.last_name,
                    email: contact.email ?? '',
                    phone: contact.phone ?? '',
                    position: contact.position ?? '',
                });
            }
        }

        // Add tracking pixel
        const message = await EmailMessage.create({
            contact_id: data.contact_id,
            deal_id: data.deal_id,
            owner_id: data.owner_id,
            template_id: data.template_id,
            from_email: data.from_email,
            to_email: data.to_email,
            cc: data.cc,
            bcc: data.bcc,
            subject: data.subject,
            body_html: bodyHtml,
            status: data.scheduled_at ? 'queued' : 'draft',
            scheduled_at: data.scheduled_at,
            open_count: 0,
            click_count: 0,
        });

        return message;
    }

    async sendEmail(messageId: string): Promise<EmailMessage | null> {
        const message = await EmailMessage.where('id', messageId).whereNull('deleted_at').first();
        if (!message) return null;
        if (message.status !== 'draft' && message.status !== 'queued') return null;

        // In production, integrate with @gao/email SMTP transport here.
        // For now, mark as sent.
        message.status = 'sent';
        message.sent_at = new Date().toISOString();
        await message.save();

        return message;
    }

    async getMessage(id: string): Promise<EmailMessage | null> {
        return EmailMessage.where('id', id).whereNull('deleted_at').first() ?? null;
    }

    async deleteMessage(id: string): Promise<boolean> {
        const message = await EmailMessage.where('id', id).whereNull('deleted_at').first();
        if (!message) return false;
        await message.destroy();
        return true;
    }

    // ─────────────────────────────────────────────────
    //  Tracking
    // ─────────────────────────────────────────────────

    /**
     * Record an email open event (triggered by tracking pixel).
     */
    async trackOpen(trackingId: string): Promise<void> {
        const message = await EmailMessage.where('tracking_id', trackingId).first();
        if (!message) return;

        message.open_count = (message.open_count || 0) + 1;
        if (!message.opened_at) {
            message.opened_at = new Date().toISOString();
        }
        await message.save();
    }

    /**
     * Record a link click event.
     */
    async trackClick(trackingId: string, url: string, ip?: string, userAgent?: string): Promise<string> {
        const message = await EmailMessage.where('tracking_id', trackingId).first();
        if (!message) return url;

        message.click_count = (message.click_count || 0) + 1;
        if (!message.clicked_at) {
            message.clicked_at = new Date().toISOString();
        }
        await message.save();

        await EmailLinkClick.create({
            email_message_id: message.id,
            original_url: url,
            ip_address: ip,
            user_agent: userAgent,
        });

        return url;
    }

    // ─────────────────────────────────────────────────
    //  Helpers
    // ─────────────────────────────────────────────────

    /**
     * Replace {{variable}} placeholders in email body.
     */
    private resolveMergeVariables(html: string, variables: Record<string, string>): string {
        let result = html;
        for (const [key, value] of Object.entries(variables)) {
            const pattern = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'gi');
            result = result.replace(pattern, value);
        }
        return result;
    }
}
