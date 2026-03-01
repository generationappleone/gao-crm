import { ScoringRule, type ScoringCategory } from '../models/scoring-rule.model.js';
import { LeadScore, type LeadGrade } from '../models/lead-score.model.js';

interface CreateRuleInput {
    name: string;
    description?: string;
    entity_type?: 'contact' | 'company' | 'deal';
    category: ScoringCategory;
    condition_field: string;
    condition_operator: string;
    condition_value: string;
    score_delta: number;
}

export class LeadScoringService {
    // ─────────────────────────────────────────────────
    //  Scoring Rules CRUD
    // ─────────────────────────────────────────────────

    async listRules(entityType?: string): Promise<ScoringRule[]> {
        let query = ScoringRule.where('deleted_at', 'IS', null);
        if (entityType) query = query.where('entity_type', entityType);
        return query.orderBy('display_order', 'ASC').get();
    }

    async createRule(data: CreateRuleInput): Promise<ScoringRule> {
        return ScoringRule.create({
            name: data.name,
            description: data.description,
            entity_type: data.entity_type ?? 'contact',
            category: data.category,
            condition_field: data.condition_field,
            condition_operator: data.condition_operator,
            condition_value: data.condition_value,
            score_delta: data.score_delta,
            is_active: true,
            display_order: 0,
        });
    }

    async updateRule(id: string, data: Partial<CreateRuleInput & { is_active: boolean }>): Promise<ScoringRule | null> {
        const rule = await ScoringRule.where('id', id).whereNull('deleted_at').first();
        if (!rule) return null;

        if (data.name !== undefined) rule.name = data.name;
        if (data.description !== undefined) rule.description = data.description;
        if (data.category !== undefined) rule.category = data.category;
        if (data.condition_field !== undefined) rule.condition_field = data.condition_field;
        if (data.condition_operator !== undefined) rule.condition_operator = data.condition_operator as any;
        if (data.condition_value !== undefined) rule.condition_value = data.condition_value;
        if (data.score_delta !== undefined) rule.score_delta = data.score_delta;
        if (data.is_active !== undefined) rule.is_active = data.is_active;

        await rule.save();
        return rule;
    }

    async deleteRule(id: string): Promise<boolean> {
        const rule = await ScoringRule.where('id', id).whereNull('deleted_at').first();
        if (!rule) return false;
        await rule.destroy();
        return true;
    }

    // ─────────────────────────────────────────────────
    //  Score Calculation
    // ─────────────────────────────────────────────────

    /**
     * Calculate score for an entity based on active rules.
     */
    async calculateScore(entityType: 'contact' | 'company' | 'deal', entityId: string, entityData: Record<string, unknown>): Promise<LeadScore> {
        const rules = await ScoringRule
            .where('entity_type', entityType)
            .where('is_active', true)
            .where('deleted_at', 'IS', null)
            .get();

        let demographicScore = 0;
        let behavioralScore = 0;
        let engagementScore = 0;
        const breakdown: Array<{ rule_id: string; rule_name: string; category: string; delta: number; matched: boolean }> = [];

        for (const rule of rules) {
            const matched = this.evaluateCondition(entityData, rule.condition_field, rule.condition_operator, rule.condition_value);

            breakdown.push({
                rule_id: rule.id,
                rule_name: rule.name,
                category: rule.category,
                delta: matched ? rule.score_delta : 0,
                matched,
            });

            if (matched) {
                switch (rule.category) {
                    case 'demographic':
                    case 'firmographic':
                        demographicScore += rule.score_delta;
                        break;
                    case 'behavioral':
                        behavioralScore += rule.score_delta;
                        break;
                    case 'engagement':
                        engagementScore += rule.score_delta;
                        break;
                    default:
                        behavioralScore += rule.score_delta;
                }
            }
        }

        const totalScore = demographicScore + behavioralScore + engagementScore;
        const grade = this.calculateGrade(totalScore);

        // Upsert score
        let score = await LeadScore.where('entity_type', entityType).where('entity_id', entityId).first();

        if (score) {
            score.total_score = totalScore;
            score.demographic_score = demographicScore;
            score.behavioral_score = behavioralScore;
            score.engagement_score = engagementScore;
            score.grade = grade;
            score.last_calculated_at = new Date().toISOString();
            score.score_breakdown = JSON.stringify(breakdown);
            await score.save();
        } else {
            score = await LeadScore.create({
                entity_type: entityType,
                entity_id: entityId,
                total_score: totalScore,
                demographic_score: demographicScore,
                behavioral_score: behavioralScore,
                engagement_score: engagementScore,
                grade,
                last_calculated_at: new Date().toISOString(),
                score_breakdown: JSON.stringify(breakdown),
            });
        }

        return score;
    }

    /**
     * Get score for an entity.
     */
    async getScore(entityType: string, entityId: string): Promise<LeadScore | null> {
        return LeadScore.where('entity_type', entityType).where('entity_id', entityId).first() ?? null;
    }

    /**
     * Get top-scoring entities.
     */
    async getTopScores(entityType: string, limit = 20): Promise<LeadScore[]> {
        return LeadScore
            .where('entity_type', entityType)
            .orderBy('total_score', 'DESC')
            .limit(limit)
            .get();
    }

    // ─── Internal Helpers ──────────────────────────────

    private evaluateCondition(data: Record<string, unknown>, field: string, operator: string, value: string): boolean {
        const fieldValue = data[field];

        switch (operator) {
            case 'equals':
                return String(fieldValue) === value;
            case 'not_equals':
                return String(fieldValue) !== value;
            case 'contains':
                return String(fieldValue ?? '').toLowerCase().includes(value.toLowerCase());
            case 'gt':
                return Number(fieldValue) > Number(value);
            case 'lt':
                return Number(fieldValue) < Number(value);
            case 'gte':
                return Number(fieldValue) >= Number(value);
            case 'lte':
                return Number(fieldValue) <= Number(value);
            case 'is_set':
                return fieldValue !== null && fieldValue !== undefined && fieldValue !== '';
            case 'is_not_set':
                return fieldValue === null || fieldValue === undefined || fieldValue === '';
            case 'in':
                return value.split(',').map((v) => v.trim()).includes(String(fieldValue));
            default:
                return false;
        }
    }

    private calculateGrade(score: number): LeadGrade {
        if (score >= 90) return 'A+';
        if (score >= 80) return 'A';
        if (score >= 70) return 'B+';
        if (score >= 60) return 'B';
        if (score >= 50) return 'C+';
        if (score >= 40) return 'C';
        if (score >= 20) return 'D';
        return 'F';
    }
}
