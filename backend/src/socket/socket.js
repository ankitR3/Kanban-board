import createTaskController from '../controllers/task/createTask.controller.js';
import updateTaskController from '../controllers/task/updateTask.controller.js';
import moveTaskController from '../controllers/task/moveTask.controller.js';
import getAllTaskController from '../controllers/task/getAllTask.controller.js';
import deleteTaskController from '../controllers/task/deleteTask.controller.js';
import reorderTaskController from '../controllers/task/reorderTask.controller.js';
import getAllWorkspacesController from '../controllers/workspace/getAllWorkspaces.controller.js';
import createWorkspaceController from '../controllers/workspace/createWorkspace.controller.js';
import deleteWorkspaceController from '../controllers/workspace/deleteWorkspace.controller.js';

const safeHandler = (socket, fn) => async (...args) => {
    try {
        await fn(...args);
    } catch (err) {
        console.error('socket error: ', err.message);
        socket.emit('error', {
            message: err.message
        });
    }
};

export function registerSocketEvents(io) {
    io.on('connection', async (socket) => {
        console.log(`connected: ${socket.id}`);

        // Sync workspaces on connect
        try {
            const workspaces = await getAllWorkspacesController();
            socket.emit('sync:workspaces', workspaces);
        } catch (err) {
            socket.emit('error', { message: 'Failed to load workspaces' });
        }

        // Sync tasks on connect
        try {
            const tasks = await getAllTaskController();
            socket.emit('sync:tasks', tasks);
        } catch (err) {
            socket.emit('error', {
                message: 'Failed to load tasks'
            });
        }

        // ── Workspace events ──────────────────────────────────────────────

        socket.on('workspace:create', safeHandler(socket, async ({ name }) => {
            const workspace = await createWorkspaceController(name);
            io.emit('workspace:create', workspace);
        }));

        socket.on('workspace:delete', safeHandler(socket, async ({ id }) => {
            await deleteWorkspaceController(id);
            io.emit('workspace:delete', { id });
        }));

        // ── Task events ───────────────────────────────────────────────────

        socket.on('task:create', safeHandler(socket, async (data) => {
            const task = await createTaskController(data);
            io.emit('task:create', task);
        }));

        socket.on('task:update', safeHandler(socket, async ({ id, changes }) => {
            const task = await updateTaskController(id, changes);
            io.emit('task:update', {
                id,
                task
            });
        }));

        socket.on('task:reorder', safeHandler(socket, async ({ id, newIndex, column }) => {
            await reorderTaskController(id, newIndex, column);
            // Broadcast the full task list so every client gets consistent ordering
            const allTasks = await getAllTaskController();
            io.emit('sync:tasks', allTasks);
        }));

        socket.on('task:move', safeHandler(socket, async ({ id, column }) => {
            const task = await moveTaskController(id, column);
            io.emit('task:move', {
                id,
                column,
                task
            });
        }));

        socket.on('task:delete', safeHandler(socket, async ({ id }) => {
            await deleteTaskController(id);
            io.emit('task:delete', {
                id
            });
        }));

        socket.on('disconnect', () => {
            console.log(`disconnected: ${socket.id}`);
        });
    });
}