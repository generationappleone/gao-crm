import { Note } from '../models/note.model.js';
export class NoteService {
    async listByNotable(notableType, notableId) {
        return Note.where('notable_type', notableType)
            .where('notable_id', notableId)
            .whereNull('deleted_at')
            .orderBy('created_at', 'DESC')
            .get();
    }
    async create(data) {
        return Note.create(data);
    }
    async findById(id) {
        return Note.where('id', id).whereNull('deleted_at').first();
    }
    async update(id, data) {
        const note = await this.findById(id);
        if (!note)
            return null;
        note.content = data.content;
        await note.save();
        return note;
    }
    async delete(id) {
        const note = await this.findById(id);
        if (!note)
            return false;
        await note.destroy();
        return true;
    }
}
//# sourceMappingURL=note.service.js.map