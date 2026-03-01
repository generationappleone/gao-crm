import { Controller, Get, Post, Put, Delete } from '@gao/http';
import type { GaoRequest, GaoResponse } from '@gao/http';
import { CustomFieldService } from '../../services/custom-field.service.js';
import type { CustomFieldEntityType, CustomFieldType } from '../../models/custom-field-definition.model.js';

const service = new CustomFieldService();

const VALID_ENTITY_TYPES = ['contact', 'company', 'deal'];
const VALID_FIELD_TYPES = ['text', 'number', 'dropdown', 'date', 'checkbox', 'textarea', 'email', 'phone', 'url'];

@Controller('/api/custom-fields')
export class CustomFieldApiController {
    /**
     * GET /api/custom-fields/definitions?entity_type=contact
     */
    @Get('/definitions')
    async listDefinitions(req: GaoRequest, res: GaoResponse) {
        const entityType = req.query.entity_type as string;
        if (!entityType || !VALID_ENTITY_TYPES.includes(entityType)) {
            return res.error(400, 'VALIDATION', 'entity_type is required and must be: contact, company, or deal');
        }
        const definitions = await service.listDefinitions(entityType as CustomFieldEntityType);
        return res.json({ data: definitions.map((d) => d.toJSON()) });
    }

    /**
     * POST /api/custom-fields/definitions
     */
    @Post('/definitions')
    async createDefinition(req: GaoRequest, res: GaoResponse) {
        const body = req.body as Record<string, unknown>;

        if (!body.entity_type || !VALID_ENTITY_TYPES.includes(body.entity_type as string)) {
            return res.error(422, 'VALIDATION', 'entity_type is required (contact, company, deal)');
        }
        if (!body.field_name || typeof body.field_name !== 'string') {
            return res.error(422, 'VALIDATION', 'field_name is required');
        }
        if (!body.field_type || !VALID_FIELD_TYPES.includes(body.field_type as string)) {
            return res.error(422, 'VALIDATION', `field_type must be one of: ${VALID_FIELD_TYPES.join(', ')}`);
        }

        const definition = await service.createDefinition({
            entity_type: body.entity_type as CustomFieldEntityType,
            field_name: body.field_name as string,
            field_type: body.field_type as CustomFieldType,
            field_options: body.field_options as string[] | undefined,
            is_required: body.is_required as boolean | undefined,
            is_filterable: body.is_filterable as boolean | undefined,
            display_order: body.display_order as number | undefined,
            default_value: body.default_value as string | undefined,
            placeholder: body.placeholder as string | undefined,
            validation_rules: body.validation_rules as Record<string, unknown> | undefined,
        });

        return res.status(201).json({ data: definition.toJSON() });
    }

    /**
     * PUT /api/custom-fields/definitions/:id
     */
    @Put('/definitions/:id')
    async updateDefinition(req: GaoRequest, res: GaoResponse) {
        const body = req.body as Record<string, unknown>;
        const definition = await service.updateDefinition(req.params.id, {
            field_name: body.field_name as string | undefined,
            field_type: body.field_type as CustomFieldType | undefined,
            field_options: body.field_options as string[] | undefined,
            is_required: body.is_required as boolean | undefined,
            is_filterable: body.is_filterable as boolean | undefined,
            display_order: body.display_order as number | undefined,
            default_value: body.default_value as string | undefined,
            placeholder: body.placeholder as string | undefined,
            validation_rules: body.validation_rules as Record<string, unknown> | undefined,
        });

        if (!definition) return res.error(404, 'NOT_FOUND', 'Field definition not found');
        return res.json({ data: definition.toJSON() });
    }

    /**
     * DELETE /api/custom-fields/definitions/:id
     */
    @Delete('/definitions/:id')
    async deleteDefinition(req: GaoRequest, res: GaoResponse) {
        const deleted = await service.deleteDefinition(req.params.id);
        if (!deleted) return res.error(404, 'NOT_FOUND', 'Field definition not found');
        return res.empty();
    }

    /**
     * GET /api/custom-fields/values?entity_type=contact&entity_id=:id
     */
    @Get('/values')
    async getValues(req: GaoRequest, res: GaoResponse) {
        const entityType = req.query.entity_type as string;
        const entityId = req.query.entity_id as string;

        if (!entityType || !VALID_ENTITY_TYPES.includes(entityType)) {
            return res.error(400, 'VALIDATION', 'entity_type is required');
        }
        if (!entityId) {
            return res.error(400, 'VALIDATION', 'entity_id is required');
        }

        const values = await service.getValues(entityType as CustomFieldEntityType, entityId);
        return res.json({ data: values.map((v) => v.toJSON()) });
    }

    /**
     * PUT /api/custom-fields/values — Batch upsert values for an entity
     * Body: { entity_type, entity_id, values: [{ field_definition_id, value }] }
     */
    @Put('/values')
    async setValues(req: GaoRequest, res: GaoResponse) {
        const body = req.body as {
            entity_type?: string;
            entity_id?: string;
            values?: Array<{ field_definition_id: string; value: string | number | boolean | null }>;
        };

        if (!body.entity_type || !VALID_ENTITY_TYPES.includes(body.entity_type)) {
            return res.error(422, 'VALIDATION', 'entity_type is required');
        }
        if (!body.entity_id) {
            return res.error(422, 'VALIDATION', 'entity_id is required');
        }
        if (!Array.isArray(body.values) || body.values.length === 0) {
            return res.error(422, 'VALIDATION', 'values array is required and must not be empty');
        }

        const results = await service.setValues(
            body.entity_type as CustomFieldEntityType,
            body.entity_id,
            body.values
        );

        return res.json({ data: results.map((v) => v.toJSON()) });
    }
}
