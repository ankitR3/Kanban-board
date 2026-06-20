import prisma from '../../lib/prisma.js';
import { Column, Priority, Category } from '../../../generated/client/index.js';

export default async function createTaskController(data) {
    try {
        if (!data.title || data.title.trim() === '') {
            throw new Error("title is required");
        }

        const count = await prisma.task.count({
            where: {
                column: Column.TODO
            }
        });

        const task = await prisma.task.create({
            data: {
                title: data.title.trim(),
                description: data.description || "",
                column: Column.TODO,
                priority: data.priority || Priority.MEDIUM,
                category: data.category || Category.GENERAL,
                orderIndex: count,
                attachments: [],
            },
        });

        return task;
    } catch (err) {
        throw new Error(`Failed to create task: ${err.message}`);
    }
}