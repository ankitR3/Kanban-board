import prisma from '../../lib/prisma.js';
import { v4 as uuid } from 'uuid';

const ALLOWED_FILE_TYPES = [
    'image/png',
    'image/jpeg',
    'image/gif',
    'image/webp',
    'application/pdf',
];

export default async function updateTaskController(id, changes) {
    try {
        if (!id) throw new Error('task-id is required');
        if (!changes || Object.keys(changes).length === 0) {
            throw new Error('No changes provided');
        }

        const existing = await prisma.task.findUnique({
            where: {
                id
            }
        });
        
        if (!existing) throw new Error(`task not found: ${id}`);

        if (changes.attachments !== undefined) {
            if (changes.attachments === null) {
                delete changes.attachments;
            } else if (Array.isArray(changes.attachments)) {
                changes.attachments = changes.attachments.map((file) => {
                    if (!file.name) throw new Error('Attachment name is required');
                    if (!file.url)  throw new Error('Attachment url is required');
                    if (!file.type) throw new Error('Attachment type is required');
                    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
                        throw new Error(`Invalid file type: ${file.type}`);
                    }
                    return {
                        id:   file.id || uuid(),
                        name: file.name,
                        url:  file.url,
                        type: file.type,
                    };
                });
            }
        }

        const task = await prisma.task.update({
            where: {
                id
            },
            data:  changes,
        });

        return task;
    } catch (err) {
        throw new Error(`Failed to update task: ${err.message}`);
    }
}