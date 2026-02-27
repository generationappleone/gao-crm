import { Note } from '../models/note.model.js';

export class NoteService {
    async listByNotable(notableType: string, notableId: string): Promise<Note[]> {
        return Note.where('notable_type', notableType)
            .where('notable_id', notableId)
            .whereNull('deleted_at')
            .orderBy('created_at', 'DESC')
            .get();
    }

    async create(data: Record<string, unknown>): Promise<Note> {
        return Note.create(data);
    }

    async findById(id: string): Promise<Note | null> {
        return Note.where('id', id).whereNull('deleted_at').first();
    }

    async update(id: string, data: Record<string, unknown>): Promise<Note | null> {
        const note = await this.findById(id);
        if (!note) return null;

        note.content = data.content as string;
        await note.save();
        return note;
    }

    async delete(id: string): Promise<boolean> {
        const note = await this.findById(id);
        if (!note) return false;
        await note.destroy();
        return true;
    }
}
