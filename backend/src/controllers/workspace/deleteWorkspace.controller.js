import prisma from '../../lib/prisma.js';

export default async function deleteWorkspaceController(id) {
    try {
        if (!id) throw new Error('Workspace id is required');

        const existing = await prisma.workspace.findUnique({
            where: { id }
        });

        if (!existing) throw new Error(`Workspace not found: ${id}`);

        // Nullify workspaceId on tasks that belonged to this workspace
        await prisma.task.updateMany({
            where: { workspaceId: id },
            data: { workspaceId: null }
        });

        await prisma.workspace.delete({
            where: { id }
        });

        return { success: true, id };
    } catch (err) {
        throw new Error(`Failed to delete workspace: ${err.message}`);
    }
}
