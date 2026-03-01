import { Form, type FormStatus } from '../models/form.model.js';
import { FormField, type FormFieldType } from '../models/form-field.model.js';
import { FormSubmission } from '../models/form-submission.model.js';

interface CreateFormInput {
    name: string;
    slug: string;
    description?: string;
    owner_id: string;
    redirect_url?: string;
    success_message?: string;
    notification_emails?: string;
    submit_button_text?: string;
    style_config?: Record<string, unknown>;
}

interface FormFieldInput {
    field_type: FormFieldType;
    label: string;
    name: string;
    placeholder?: string;
    help_text?: string;
    is_required?: boolean;
    validation_rules?: Record<string, unknown>;
    options?: string[];
    default_value?: string;
    width?: 'full' | 'half' | 'third';
    map_to_entity?: string;
    map_to_field?: string;
}

interface SubmitFormInput {
    data: Record<string, unknown>;
    ip_address?: string;
    user_agent?: string;
    referrer?: string;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
}

export class FormBuilderService {
    // ─────────────────────────────────────────────────
    //  Form CRUD
    // ─────────────────────────────────────────────────

    async listForms(ownerId?: string): Promise<Form[]> {
        let query = Form.where('deleted_at', 'IS', null);
        if (ownerId) query = query.where('owner_id', ownerId);
        return query.orderBy('created_at', 'DESC').get();
    }

    async findById(id: string): Promise<Form | null> {
        return Form.where('id', id).whereNull('deleted_at').first() ?? null;
    }

    async findBySlug(slug: string): Promise<Form | null> {
        return Form.where('slug', slug).whereNull('deleted_at').first() ?? null;
    }

    async create(data: CreateFormInput): Promise<Form> {
        return Form.create({
            name: data.name,
            slug: data.slug,
            description: data.description,
            owner_id: data.owner_id,
            status: 'draft',
            redirect_url: data.redirect_url,
            success_message: data.success_message ?? 'Thank you for your submission!',
            notification_emails: data.notification_emails,
            submit_button_text: data.submit_button_text ?? 'Submit',
            style_config: data.style_config ? JSON.stringify(data.style_config) : undefined,
            total_submissions: 0,
        });
    }

    async update(id: string, data: Partial<CreateFormInput & { status: FormStatus }>): Promise<Form | null> {
        const form = await Form.where('id', id).whereNull('deleted_at').first();
        if (!form) return null;

        if (data.name !== undefined) form.name = data.name;
        if (data.description !== undefined) form.description = data.description;
        if (data.redirect_url !== undefined) form.redirect_url = data.redirect_url;
        if (data.success_message !== undefined) form.success_message = data.success_message;
        if (data.notification_emails !== undefined) form.notification_emails = data.notification_emails;
        if (data.submit_button_text !== undefined) form.submit_button_text = data.submit_button_text;
        if (data.style_config !== undefined) form.style_config = JSON.stringify(data.style_config);
        if (data.status !== undefined) form.status = data.status;

        await form.save();
        return form;
    }

    async delete(id: string): Promise<boolean> {
        const form = await Form.where('id', id).whereNull('deleted_at').first();
        if (!form) return false;
        await form.destroy();
        return true;
    }

    // ─────────────────────────────────────────────────
    //  Form Fields
    // ─────────────────────────────────────────────────

    async getFields(formId: string): Promise<FormField[]> {
        return FormField.where('form_id', formId).orderBy('display_order', 'ASC').get();
    }

    async setFields(formId: string, fields: FormFieldInput[]): Promise<FormField[]> {
        // Delete existing fields and recreate (simpler than diff)
        const existing = await FormField.where('form_id', formId).get();
        for (const field of existing) {
            await field.destroy();
        }

        const created: FormField[] = [];
        for (let i = 0; i < fields.length; i++) {
            const f = fields[i]!;
            const field = await FormField.create({
                form_id: formId,
                field_type: f.field_type,
                label: f.label,
                name: f.name,
                placeholder: f.placeholder,
                help_text: f.help_text,
                is_required: f.is_required ?? false,
                validation_rules: f.validation_rules ? JSON.stringify(f.validation_rules) : undefined,
                options: f.options ? JSON.stringify(f.options) : undefined,
                default_value: f.default_value,
                width: f.width ?? 'full',
                display_order: i,
                map_to_entity: f.map_to_entity,
                map_to_field: f.map_to_field,
            });
            created.push(field);
        }
        return created;
    }

    // ─────────────────────────────────────────────────
    //  Submissions
    // ─────────────────────────────────────────────────

    async listSubmissions(formId: string): Promise<FormSubmission[]> {
        return FormSubmission.where('form_id', formId).orderBy('created_at', 'DESC').get();
    }

    async submit(formId: string, input: SubmitFormInput): Promise<FormSubmission> {
        const form = await Form.where('id', formId).whereNull('deleted_at').first();
        if (!form || form.status !== 'active') {
            throw new Error('Form is not active');
        }

        const submission = await FormSubmission.create({
            form_id: formId,
            data: JSON.stringify(input.data),
            ip_address: input.ip_address,
            user_agent: input.user_agent,
            referrer: input.referrer,
            utm_source: input.utm_source,
            utm_medium: input.utm_medium,
            utm_campaign: input.utm_campaign,
        });

        // Increment submission count
        form.total_submissions = (form.total_submissions || 0) + 1;
        await form.save();

        return submission;
    }

    /**
     * Generate embeddable HTML form snippet.
     */
    generateEmbedSnippet(formSlug: string, baseUrl: string): string {
        return `<iframe src="${baseUrl}/forms/${formSlug}" style="width:100%;min-height:500px;border:none;" loading="lazy"></iframe>`;
    }
}
