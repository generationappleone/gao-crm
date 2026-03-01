import { Pipeline } from '../models/pipeline.model.js';
import { DealStage } from '../models/deal-stage.model.js';
import { Deal } from '../models/deal.model.js';

interface CreatePipelineInput {
    name: string;
    description?: string;
    is_default?: boolean;
    display_order?: number;
}

interface BoardData {
    pipeline: Pipeline;
    stages: Array<{
        stage: DealStage;
        deals: Deal[];
    }>;
}

export class PipelineService {
    /**
     * List all pipelines.
     */
    async list(): Promise<Pipeline[]> {
        return Pipeline
            .where('deleted_at', 'IS', null)
            .orderBy('display_order', 'ASC')
            .get();
    }

    /**
     * Get a single pipeline by ID.
     */
    async findById(id: string): Promise<Pipeline | null> {
        return Pipeline.where('id', id).whereNull('deleted_at').first() ?? null;
    }

    /**
     * Create a new pipeline.
     */
    async create(data: CreatePipelineInput): Promise<Pipeline> {
        const slug = data.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

        // If marking as default, unset other defaults
        if (data.is_default) {
            await this.unsetAllDefaults();
        }

        return Pipeline.create({
            name: data.name,
            slug,
            description: data.description,
            is_default: data.is_default ?? false,
            display_order: data.display_order ?? 0,
        });
    }

    /**
     * Update a pipeline.
     */
    async update(id: string, data: Partial<CreatePipelineInput>): Promise<Pipeline | null> {
        const pipeline = await Pipeline.where('id', id).whereNull('deleted_at').first();
        if (!pipeline) return null;

        if (data.name !== undefined) {
            pipeline.name = data.name;
            pipeline.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        }
        if (data.description !== undefined) pipeline.description = data.description;
        if (data.display_order !== undefined) pipeline.display_order = data.display_order;
        if (data.is_default) {
            await this.unsetAllDefaults();
            pipeline.is_default = true;
        }

        await pipeline.save();
        return pipeline;
    }

    /**
     * Soft-delete a pipeline.
     */
    async delete(id: string): Promise<boolean> {
        const pipeline = await Pipeline.where('id', id).whereNull('deleted_at').first();
        if (!pipeline) return false;
        if (pipeline.is_default) return false; // Cannot delete default pipeline
        await pipeline.destroy();
        return true;
    }

    /**
     * Get Kanban board data: pipeline with stages and deals per stage.
     */
    async getBoard(pipelineId: string): Promise<BoardData | null> {
        const pipeline = await Pipeline.where('id', pipelineId).whereNull('deleted_at').first();
        if (!pipeline) return null;

        const stages = await DealStage
            .where('pipeline_id', pipelineId)
            .whereNull('deleted_at')
            .orderBy('display_order', 'ASC')
            .get();

        const stagesWithDeals: BoardData['stages'] = [];

        for (const stage of stages) {
            const deals = await Deal
                .where('stage_id', stage.id)
                .where('pipeline_id', pipelineId)
                .whereNull('deleted_at')
                .orderBy('position', 'ASC')
                .get();
            stagesWithDeals.push({ stage, deals });
        }

        return { pipeline, stages: stagesWithDeals };
    }

    /**
     * Move a deal to a new stage and/or position.
     */
    async moveDeal(dealId: string, stageId: string, position: number): Promise<Deal | null> {
        const deal = await Deal.where('id', dealId).whereNull('deleted_at').first();
        if (!deal) return null;

        deal.stage_id = stageId;
        deal.position = position;
        await deal.save();
        return deal;
    }

    /**
     * Unset is_default on all pipelines.
     */
    private async unsetAllDefaults(): Promise<void> {
        const defaults = await Pipeline.where('is_default', true).get();
        for (const p of defaults) {
            p.is_default = false;
            await p.save();
        }
    }
}
