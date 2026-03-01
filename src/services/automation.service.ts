import { Automation, type AutomationTrigger, type AutomationStatus } from '../models/automation.model.js';
import { AutomationStep } from '../models/automation-step.model.js';
import { AutomationLog } from '../models/automation-log.model.js';

interface CreateAutomationInput {
    name: string;
    description?: string;
    owner_id: string;
    trigger_type: AutomationTrigger;
    trigger_config?: Record<string, unknown>;
}

interface StepInput {
    step_type: 'action' | 'condition' | 'delay' | 'branch';
    action_type: string;
    action_config: Record<string, unknown>;
    delay_minutes?: number;
    condition_config?: Record<string, unknown>;
}

export class AutomationService {
    // ─────────────────────────────────────────────────
    //  Automation CRUD
    // ─────────────────────────────────────────────────

    async list(ownerId?: string, status?: AutomationStatus): Promise<Automation[]> {
        let query = Automation.where('deleted_at', 'IS', null);
        if (ownerId) query = query.where('owner_id', ownerId);
        if (status) query = query.where('status', status);
        return query.orderBy('created_at', 'DESC').get();
    }

    async findById(id: string): Promise<{ automation: Automation; steps: AutomationStep[] } | null> {
        const automation = await Automation.where('id', id).whereNull('deleted_at').first();
        if (!automation) return null;

        const steps = await AutomationStep
            .where('automation_id', id)
            .orderBy('display_order', 'ASC')
            .get();

        return { automation, steps };
    }

    async create(data: CreateAutomationInput): Promise<Automation> {
        return Automation.create({
            name: data.name,
            description: data.description,
            owner_id: data.owner_id,
            trigger_type: data.trigger_type,
            trigger_config: JSON.stringify(data.trigger_config ?? {}),
            status: 'draft',
            is_active: false,
            total_runs: 0,
            total_successes: 0,
            total_failures: 0,
        });
    }

    async update(id: string, data: Partial<CreateAutomationInput>): Promise<Automation | null> {
        const automation = await Automation.where('id', id).whereNull('deleted_at').first();
        if (!automation) return null;

        if (data.name !== undefined) automation.name = data.name;
        if (data.description !== undefined) automation.description = data.description;
        if (data.trigger_type !== undefined) automation.trigger_type = data.trigger_type;
        if (data.trigger_config !== undefined) automation.trigger_config = JSON.stringify(data.trigger_config);

        await automation.save();
        return automation;
    }

    async activate(id: string): Promise<Automation | null> {
        const automation = await Automation.where('id', id).whereNull('deleted_at').first();
        if (!automation) return null;
        automation.status = 'active';
        automation.is_active = true;
        await automation.save();
        return automation;
    }

    async deactivate(id: string): Promise<Automation | null> {
        const automation = await Automation.where('id', id).whereNull('deleted_at').first();
        if (!automation) return null;
        automation.status = 'paused';
        automation.is_active = false;
        await automation.save();
        return automation;
    }

    async delete(id: string): Promise<boolean> {
        const automation = await Automation.where('id', id).whereNull('deleted_at').first();
        if (!automation) return false;
        await automation.destroy();
        return true;
    }

    // ─────────────────────────────────────────────────
    //  Steps Management
    // ─────────────────────────────────────────────────

    async setSteps(automationId: string, steps: StepInput[]): Promise<AutomationStep[]> {
        // Delete existing steps
        const existing = await AutomationStep.where('automation_id', automationId).get();
        for (const step of existing) {
            await step.destroy();
        }

        const created: AutomationStep[] = [];
        for (let i = 0; i < steps.length; i++) {
            const s = steps[i]!;
            const step = await AutomationStep.create({
                automation_id: automationId,
                step_type: s.step_type,
                action_type: s.action_type,
                action_config: JSON.stringify(s.action_config),
                delay_minutes: s.delay_minutes ?? 0,
                condition_config: s.condition_config ? JSON.stringify(s.condition_config) : undefined,
                display_order: i,
            });
            created.push(step);
        }
        return created;
    }

    // ─────────────────────────────────────────────────
    //  Execution Engine
    // ─────────────────────────────────────────────────

    /**
     * Execute an automation for an entity.
     * In production, this would be queued via @gao/queue.
     */
    async execute(automationId: string, entityType: string, entityId: string): Promise<void> {
        const result = await this.findById(automationId);
        if (!result || !result.automation.is_active) return;

        const { automation, steps } = result;

        // Log automation start
        await AutomationLog.create({
            automation_id: automationId,
            entity_type: entityType,
            entity_id: entityId,
            status: 'started',
            input_data: JSON.stringify({ entity_type: entityType, entity_id: entityId }),
        });

        let success = true;
        for (const step of steps) {
            const stepStart = Date.now();
            try {
                // In production: execute each action type
                await this.executeStep(step, entityType, entityId);

                await AutomationLog.create({
                    automation_id: automationId,
                    step_id: step.id,
                    entity_type: entityType,
                    entity_id: entityId,
                    status: 'success',
                    duration_ms: Date.now() - stepStart,
                });
            } catch (error) {
                success = false;
                await AutomationLog.create({
                    automation_id: automationId,
                    step_id: step.id,
                    entity_type: entityType,
                    entity_id: entityId,
                    status: 'failed',
                    error_message: error instanceof Error ? error.message : String(error),
                    duration_ms: Date.now() - stepStart,
                });
                break; // Stop on failure
            }
        }

        // Update counters
        automation.total_runs = (automation.total_runs || 0) + 1;
        if (success) {
            automation.total_successes = (automation.total_successes || 0) + 1;
        } else {
            automation.total_failures = (automation.total_failures || 0) + 1;
        }
        automation.last_run_at = new Date().toISOString();
        await automation.save();
    }

    /**
     * Execute a single step. Placeholder for production implementation.
     */
    private async executeStep(step: AutomationStep, _entityType: string, _entityId: string): Promise<void> {
        // In production, each action_type maps to a real operation:
        // send_email → EmailHubService.compose + send
        // create_task → ActivityService.create
        // update_field → dynamic field update
        // add_tag → TagService.addTag
        // move_deal_stage → DealService.move
        // webhook → HTTP POST to configured URL
        // wait → delay via queue
        // if_else → evaluate condition, branch to next step

        if (step.step_type === 'delay' && step.delay_minutes > 0) {
            // In production: re-queue with delay
            return;
        }

        // Placeholder: log the action type
        return;
    }

    // ─────────────────────────────────────────────────
    //  Logs
    // ─────────────────────────────────────────────────

    async getLogs(automationId: string, limit = 50): Promise<AutomationLog[]> {
        return AutomationLog
            .where('automation_id', automationId)
            .orderBy('created_at', 'DESC')
            .limit(limit)
            .get();
    }

    /**
     * Find automations triggered by an event.
     */
    async findByTrigger(triggerType: AutomationTrigger): Promise<Automation[]> {
        return Automation
            .where('trigger_type', triggerType)
            .where('is_active', true)
            .where('deleted_at', 'IS', null)
            .get();
    }
}
