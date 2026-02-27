import { Note } from '../models/note.model.js';
export declare class NoteService {
    listByNotable(notableType: string, notableId: string): Promise<Note[]>;
    create(data: Record<string, unknown>): Promise<Note>;
    findById(id: string): Promise<Note | null>;
    update(id: string, data: Record<string, unknown>): Promise<Note | null>;
    delete(id: string): Promise<boolean>;
}
//# sourceMappingURL=note.service.d.ts.map