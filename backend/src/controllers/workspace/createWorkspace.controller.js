import prisma from '../../lib/prisma.js';

export default async function createWorkspaceController(name) {
    try {
        if (!name || name.trim() === '') {
            throw new Error('Workspace name is required');
        }

        const trimmed = name.trim();

        const existing = await prisma.workspace.findUnique({
            where: { name: trimmed }
        });

        if (existing) {
            throw new Error(`Workspace "${trimmed}" already exists`);
        }

        const workspace = await prisma.workspace.create({
            data: { name: trimmed }
        });

        return workspace;
    } catch (err) {
        throw new Error(`Failed to create workspace: ${err.message}`);
    }
}
