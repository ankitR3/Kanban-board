import prisma from '../../lib/prisma.js';

export default async function getAllTaskController() {
    try {
        const tasks = await prisma.task.findMany({
            orderBy: {
                orderIndex: 'asc'
            },
        });

        if (!tasks || tasks.length === 0) {
            return [];
        }

        return tasks;
    } catch (err) {
        throw new Error(`Failed to fetch tasks: ${err.message}`);
    }
}