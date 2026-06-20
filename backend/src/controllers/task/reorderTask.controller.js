import prisma from '../../lib/prisma.js';

export default async function reorderTaskController(id, newIndex, column) {
    try {
        if (!id) throw new Error('Task ID is required');
        if (newIndex === undefined || newIndex === null) {
            throw new Error('New index is required');
        }

        const existing = await prisma.task.findUnique({
            where: {
                id
            }
        });

        if (!existing) throw new Error(`Task not found: ${id}`);

        const tasksInColumn = await prisma.task.findMany({
            where: {
                column
            },
            orderBy: {
                orderIndex: 'asc'
            },
        });

        const filtered = tasksInColumn.filter((t) => t.id !== id);

        filtered.splice(newIndex, 0, { ...existing, column });

        const updates = filtered.map((t, index) =>
            prisma.task.update({
                where: {
                    id: t.id
                },
                data: {
                    orderIndex: index,
                    column
                },
            })
        );

        await Promise.all(updates);

        const updatedTask = await prisma.task.findUnique({
            where: {
                id
            }
        });
        return updatedTask;
    } catch (err){
        throw new Error(`Failed to reorder task: ${err.message}`);
    }
}