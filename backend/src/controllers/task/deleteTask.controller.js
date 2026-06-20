import prisma from '../../lib/prisma.js';

export default async function deleteTaskController(id) {
    try {
        if (!id) throw new Error('task-id is required');

        const existing = await prisma.task.findUnique({
            where: {
                id
            }
        });

        if (!existing) throw new Error(`task not found: ${id}`);

        await prisma.task.delete({
            where: {
                id
            }
        });

        return {
            success: true,
            id
        };
    } catch (err) {
        throw new Error(`Failed to delete task: ${err.message}`);
    }
}