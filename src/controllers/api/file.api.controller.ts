/**
 * GAO CRM — File Upload API Controller
 *
 * Handles file uploads and file management.
 * Uses the framework's built-in multipart parsing.
 *
 * Routes:
 *   POST   /api/files/upload   → Upload a file (multipart/form-data)
 *   GET    /api/files           → List files for an entity
 *   DELETE /api/files/:id       → Delete a file
 */

import { Controller, Get, Post, Delete } from '@gao/http';
import type { GaoRequest, GaoResponse } from '@gao/http';
import { FileModel } from '../../models/file.model.js';
import { FileAttachment } from '../../models/file-attachment.model.js';
import { randomUUID } from 'node:crypto';
import { writeFile, mkdir, unlink, readFile } from 'node:fs/promises';
import { join, extname, basename } from 'node:path';

const UPLOAD_DIR = join(process.cwd(), 'uploads');

@Controller('/api/files')
export class FileApiController {
    /**
     * POST /api/files/upload — Upload a file
     * Expects multipart/form-data with:
     *   - file: the uploaded file
     *   - entity_type: e.g. 'deal', 'contact', 'company'
     *   - entity_id: UUID of the entity
     */
    @Post('/upload')
    async upload(req: GaoRequest, res: GaoResponse) {
        try {
            // The body parser already parsed multipart into FormData
            const formData = req.body as FormData;
            if (!(formData instanceof FormData)) {
                return res.error(400, 'INVALID_REQUEST', 'Request must be multipart/form-data');
            }

            const file = formData.get('file') as File | null;
            const entityType = formData.get('entity_type') as string | null;
            const entityId = formData.get('entity_id') as string | null;

            if (!file || !(file instanceof File)) {
                return res.error(422, 'VALIDATION', 'file is required');
            }
            if (!entityType || !entityId) {
                return res.error(422, 'VALIDATION', 'entity_type and entity_id are required');
            }

            // Validate file size (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                return res.error(422, 'VALIDATION', 'File size must be under 10MB');
            }

            // Generate unique filename
            const ext = extname(file.name) || '.bin';
            const uniqueName = `${randomUUID()}${ext}`;

            // Ensure upload directory exists
            await mkdir(UPLOAD_DIR, { recursive: true });

            // Write file to disk
            const buffer = Buffer.from(await file.arrayBuffer());
            const filePath = join(UPLOAD_DIR, uniqueName);
            await writeFile(filePath, buffer);

            // Get user ID
            const user = req.user as Record<string, unknown> | undefined;
            const uploadedBy = (user?.id as string) ?? '';

            // Save to database
            const fileRecord = await FileModel.create({
                id: randomUUID(),
                uploaded_by: uploadedBy,
                name: uniqueName,
                original_name: file.name,
                file_path: filePath,
                mime_type: file.type || 'application/octet-stream',
                file_size: file.size,
                storage: 'local',
                is_public: false,
            });

            // Create attachment link
            await FileAttachment.create({
                id: randomUUID(),
                file_id: fileRecord.id,
                entity_type: entityType,
                entity_id: entityId,
            });

            return res.status(201).json({
                data: fileRecord.toJSON(),
                message: 'File uploaded successfully',
            });
        } catch (err) {
            console.error('[FileUpload] Error:', err);
            return res.error(500, 'UPLOAD_FAILED', 'Failed to upload file');
        }
    }

    /**
     * GET /api/files — List files for an entity
     * Query: entity_type, entity_id
     */
    @Get('/')
    async list(req: GaoRequest, res: GaoResponse) {
        const { entity_type, entity_id } = req.query;
        if (!entity_type || !entity_id) {
            return res.error(422, 'VALIDATION', 'entity_type and entity_id are required');
        }

        const attachments = await FileAttachment.where('entity_type', entity_type).where('entity_id', entity_id).get();
        const fileIds = attachments.map(a => a.file_id);
        if (fileIds.length === 0) {
            return res.json({ data: [] });
        }

        const files = await Promise.all(
            fileIds.map(fid => FileModel.where('id', fid).whereNull('deleted_at').first())
        );

        return res.json({
            data: files.filter(Boolean).map(f => f!.toJSON()),
        });
    }

    /**
     * DELETE /api/files/:id — Delete a file
     */
    @Delete('/:id')
    async destroy(req: GaoRequest, res: GaoResponse) {
        const file = await FileModel.where('id', req.params.id).whereNull('deleted_at').first();
        if (!file) return res.error(404, 'NOT_FOUND', 'File not found');

        // Remove physical file
        try {
            await unlink(file.file_path);
        } catch {
            // File may already be deleted from disk
        }

        // Soft delete the record
        file.deleted_at = new Date().toISOString();
        await file.save();

        // Remove attachment links
        const attachments = await FileAttachment.where('file_id', file.id).get();
        for (const att of attachments) {
            await att.destroy();
        }

        return res.json({ message: 'File deleted' });
    }

    /**
     * GET /api/files/:id/download — Download a file
     */
    @Get('/:id/download')
    async download(req: GaoRequest, res: GaoResponse) {
        const file = await FileModel.where('id', req.params.id).whereNull('deleted_at').first();
        if (!file) return res.error(404, 'NOT_FOUND', 'File not found');

        try {
            const data = await readFile(file.file_path);
            const sanitizedName = basename(file.original_name).replace(/[^a-zA-Z0-9._-]/g, '_');
            return new Response(data, {
                headers: {
                    'Content-Type': file.mime_type || 'application/octet-stream',
                    'Content-Disposition': `attachment; filename="${sanitizedName}"`,
                    'Content-Length': String(data.length),
                },
            });
        } catch {
            return res.error(404, 'NOT_FOUND', 'File not found on disk');
        }
    }
}
