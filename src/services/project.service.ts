import { Project } from '../models/project.model.js';
import { ProjectTask } from '../models/project-task.model.js';

export class ProjectService {
    async list(ownerId?: string): Promise<Project[]> {
        let query = Project.where('deleted_at', 'IS', null);
        if (ownerId) query = query.where('owner_id', ownerId);
        return query.orderBy('created_at', 'DESC').get();
    }

    async findById(id: string): Promise<Project | null> {
        return Project.where('id', id).whereNull('deleted_at').first() ?? null;
    }

    async create(data: { name: string; description?: string; deal_id?: string; owner_id: string; priority?: string; start_date?: string; due_date?: string }): Promise<Project> {
        return Project.create({ name: data.name, description: data.description, deal_id: data.deal_id, owner_id: data.owner_id, status: 'active', priority: data.priority ?? 'medium', start_date: data.start_date, due_date: data.due_date });
    }

    async updateStatus(id: string, status: string): Promise<Project | null> {
        const project = await Project.where('id', id).whereNull('deleted_at').first();
        if (!project) return null;
        project.status = status;
        if (status === 'completed') project.completed_at = new Date().toISOString();
        await project.save();
        return project;
    }

    // ─── Tasks ──────────────────────────────────────
    async getTasks(projectId: string): Promise<ProjectTask[]> {
        return ProjectTask.where('project_id', projectId).orderBy('sort_order', 'ASC').get();
    }

    async createTask(data: { project_id: string; title: string; description?: string; assignee_id?: string; priority?: string; due_date?: string }): Promise<ProjectTask> {
        return ProjectTask.create({ project_id: data.project_id, title: data.title, description: data.description, assignee_id: data.assignee_id, status: 'todo', priority: data.priority ?? 'medium', sort_order: 0 });
    }

    async updateTaskStatus(taskId: string, status: string): Promise<ProjectTask | null> {
        const task = await ProjectTask.where('id', taskId).first();
        if (!task) return null;
        task.status = status;
        if (status === 'done') task.completed_at = new Date().toISOString();
        await task.save();
        return task;
    }
}
