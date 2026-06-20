import prisma from '../../lib/prisma.js';
import { Column } from '../../../generated/client/index.js';

const VALID_COLUMNS = [
    Column.TODO,
    Column.IN_PROGRESS,
    Column.DONE
]
export default async function moveTaskController(id, column) {
    try {
        if (!id) throw new Error('Task ID is required');
        if (!column) throw new Error('Column is required');

        if (!VALID_COLUMNS.includes(column)) {
          throw new Error(`Invalid column. Must be one of: ${VALID_COLUMNS.join(', ')}`);
        }

        const existing = await prisma.task.findUnique({
            where: {
                id
            }
        });

        if (!existing) throw new Error(`task not found: ${id}`);
        if (existing.column === column) {
            return existing;
        }

        const count = await prisma.task.count({ where: { column } });

        const task = await prisma.task.update({
            where: {
                id
            },
            data:  {
                column, orderIndex: count
            },
        });

        return task;
    } catch (err) {
        throw new Error(`Failed to move task: ${err.message}`);
    }
}