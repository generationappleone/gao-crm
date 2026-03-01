import { CsatSurvey, type SurveyType } from '../models/csat-survey.model.js';
import { CsatResponse } from '../models/csat-response.model.js';

interface CreateSurveyInput {
    name: string;
    type?: SurveyType;
    trigger_event?: string;
    question?: string;
}

interface SubmitResponseInput {
    survey_id: string;
    contact_id?: string;
    ticket_id?: string;
    chat_session_id?: string;
    score: number;
    comment?: string;
}

export class CsatService {
    // ─── Surveys ───────────────────────────────────
    async listSurveys(): Promise<CsatSurvey[]> {
        return CsatSurvey.where('deleted_at', 'IS', null).orderBy('created_at', 'DESC').get();
    }

    async findById(id: string): Promise<CsatSurvey | null> {
        return CsatSurvey.where('id', id).whereNull('deleted_at').first() ?? null;
    }

    async createSurvey(data: CreateSurveyInput): Promise<CsatSurvey> {
        return CsatSurvey.create({
            name: data.name,
            type: data.type ?? 'csat',
            trigger_event: data.trigger_event ?? 'ticket_closed',
            question: data.question ?? 'How satisfied are you with our support?',
            is_active: true,
            total_responses: 0,
            average_score: 0,
        });
    }

    async updateSurvey(id: string, data: Partial<CreateSurveyInput & { is_active: boolean }>): Promise<CsatSurvey | null> {
        const survey = await CsatSurvey.where('id', id).whereNull('deleted_at').first();
        if (!survey) return null;

        if (data.name !== undefined) survey.name = data.name;
        if (data.question !== undefined) survey.question = data.question;
        if (data.trigger_event !== undefined) survey.trigger_event = data.trigger_event;
        if (data.is_active !== undefined) survey.is_active = data.is_active;

        await survey.save();
        return survey;
    }

    async deleteSurvey(id: string): Promise<boolean> {
        const survey = await CsatSurvey.where('id', id).whereNull('deleted_at').first();
        if (!survey) return false;
        await survey.destroy();
        return true;
    }

    // ─── Responses ─────────────────────────────────
    async submitResponse(data: SubmitResponseInput): Promise<CsatResponse> {
        const response = await CsatResponse.create({
            survey_id: data.survey_id,
            contact_id: data.contact_id,
            ticket_id: data.ticket_id,
            chat_session_id: data.chat_session_id,
            score: data.score,
            comment: data.comment,
        });

        // Update survey stats using running average (no full table scan)
        const survey = await CsatSurvey.where('id', data.survey_id).first();
        if (survey) {
            const oldCount = survey.total_responses;
            const oldAvg = survey.average_score;
            const newCount = oldCount + 1;
            const newAvg = Math.round(((oldAvg * oldCount + data.score) / newCount) * 100) / 100;
            survey.total_responses = newCount;
            survey.average_score = newAvg;
            await survey.save();
        }

        return response;
    }

    async getResponses(surveyId: string): Promise<CsatResponse[]> {
        return CsatResponse.where('survey_id', surveyId).orderBy('created_at', 'DESC').get();
    }

    // ─── Analytics ─────────────────────────────────
    async getAnalytics(surveyId: string): Promise<Record<string, number>> {
        const survey = await CsatSurvey.where('id', surveyId).first();
        if (!survey) return {};

        const responses = await CsatResponse.where('survey_id', surveyId).get();
        const scores = responses.map((r) => r.score);

        // CSAT: % of 4-5 scores (out of 5)
        // NPS: % promoters (9-10) - % detractors (0-6)
        let csat = 0;
        let nps = 0;

        if (survey.type === 'csat' && scores.length > 0) {
            const satisfied = scores.filter((s) => s >= 4).length;
            csat = Math.round((satisfied / scores.length) * 100);
        }

        if (survey.type === 'nps' && scores.length > 0) {
            const promoters = scores.filter((s) => s >= 9).length;
            const detractors = scores.filter((s) => s <= 6).length;
            nps = Math.round(((promoters - detractors) / scores.length) * 100);
        }

        return {
            total_responses: scores.length,
            average_score: survey.average_score,
            csat_percentage: csat,
            nps_score: nps,
        };
    }
}
