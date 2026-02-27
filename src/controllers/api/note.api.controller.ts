import { Controller, Get, Post, Put, Delete } from '@gao/http';
import type { GaoRequest, GaoResponse } from '@gao/http';
import { NoteService } from '../../services/note.service.js';

const noteService = new NoteService();

@Controller('/api/notes')
export class NoteApiController {
    @Get('/')
    async list(req: GaoRequest, res: GaoResponse) {
        const { notable_type, notable_id } = req.query;
        if (!notable_type || !notable_id) {
            return res.error(422, 'VALIDATION', 'notable_type and notable_id are required');
        }
        const notes = await noteService.listByNotable(notable_type, notable_id);
        return res.json(notes);
    }

    @Post('/')
    async create(req: GaoRequest, res: GaoResponse) {
        const body = req.body as Record<string, unknown>;
        if (!body.notable_type || !body.notable_id || !body.content || !body.author_id) {
            return res.error(422, 'VALIDATION', 'notable_type, notable_id, author_id, and content are required');
        }
        const note = await noteService.create(body as { notable_type: string; notable_id: string; author_id: string; content: string });
        return res.status(201).json(note.toJSON());
    }

    @Put('/:id')
    async update(req: GaoRequest, res: GaoResponse) {
        const { content } = req.body as { content?: string };
        if (!content) return res.error(422, 'VALIDATION', 'content is required');
        const note = await noteService.update(req.params.id, { content });
        if (!note) return res.error(404, 'NOT_FOUND', 'Note not found');
        return res.json(note.toJSON());
    }

    @Delete('/:id')
    async destroy(req: GaoRequest, res: GaoResponse) {
        const deleted = await noteService.delete(req.params.id);
        if (!deleted) return res.error(404, 'NOT_FOUND', 'Note not found');
        return res.empty();
    }
}
