import prisma from '../../lib/prisma.js';

export default async function getAllWorkspacesController() {
    try {
        const workspaces = await prisma.workspace.findMany({
            orderBy: { createdAt: 'asc' }
        });
        return workspaces;
    } catch (err) {
        throw new Error(`Failed to fetch workspaces: ${err.message}`);
    }
}
