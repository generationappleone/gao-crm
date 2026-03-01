import { ApprovalChain } from '../models/approval-chain.model.js';
import { ApprovalRequest, type ApprovalStatus } from '../models/approval-request.model.js';

export class ApprovalService {
    async listChains(entityType?: string): Promise<ApprovalChain[]> {
        let query = ApprovalChain.where('is_active', true);
        if (entityType) query = query.where('entity_type', entityType);
        return query.orderBy('name', 'ASC').get();
    }

    async createChain(data: { name: string; entity_type: string; conditions?: Record<string, unknown>; steps?: Array<{ approver_id: string; role?: string }> }): Promise<ApprovalChain> {
        return ApprovalChain.create({ name: data.name, entity_type: data.entity_type, conditions: JSON.stringify(data.conditions ?? {}), steps: JSON.stringify(data.steps ?? []), is_active: true });
    }

    async requestApproval(data: { chain_id: string; entity_type: string; entity_id: string; requested_by: string }): Promise<ApprovalRequest> {
        return ApprovalRequest.create({ chain_id: data.chain_id, entity_type: data.entity_type, entity_id: data.entity_id, requested_by: data.requested_by, current_step: 0, status: 'pending' });
    }

    async approve(id: string, approverId: string): Promise<ApprovalRequest | null> {
        const req = await ApprovalRequest.where('id', id).first();
        if (!req) return null;
        req.status = 'approved' as ApprovalStatus;
        req.approver_id = approverId;
        req.approved_at = new Date().toISOString();
        await req.save();
        return req;
    }

    async reject(id: string, approverId: string, reason?: string): Promise<ApprovalRequest | null> {
        const req = await ApprovalRequest.where('id', id).first();
        if (!req) return null;
        req.status = 'rejected' as ApprovalStatus;
        req.approver_id = approverId;
        req.rejected_at = new Date().toISOString();
        req.rejection_reason = reason;
        await req.save();
        return req;
    }

    async getPending(approverId: string): Promise<ApprovalRequest[]> {
        return ApprovalRequest.where('approver_id', approverId).where('status', 'in_review').orderBy('created_at', 'ASC').get();
    }
}
