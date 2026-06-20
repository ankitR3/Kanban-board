/**
 * Integration tests — WebSocket event handling via mocked socket.io-client
 * Verifies that the useSocket hook correctly responds to incoming socket events
 * and that the board UI syncs state across simulated multi-client updates.
 * Run with: npm test
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';

/* ── vi.hoisted: declared before the vi.mock factory is hoisted ─────────
   listeners stores ARRAYS of callbacks so multiple hook instances can
   each register for the same event (simulating a real EventEmitter).    */
const { listeners, mockSocket } = vi.hoisted(() => {
    const listeners = {};
    const mockSocket = {
        on: vi.fn((event, cb) => {
            if (!listeners[event]) listeners[event] = [];
            listeners[event].push(cb);
        }),
        off: vi.fn((event, cb) => {
            if (!listeners[event]) return;
            // socket.off in useSocket doesn't pass cb, so clear all if no cb given
            if (cb) {
                listeners[event] = listeners[event].filter((fn) => fn !== cb);
            } else {
                listeners[event] = [];
            }
        }),
        emit: vi.fn(),
    };
    return { listeners, mockSocket };
});

vi.mock('../../socket/socket.js', () => ({ default: mockSocket }));

import useSocket from '../../hooks/useSocket.js';
import { Column, Priority, Category } from '../../constants/enums.js';

/* helper — fires all registered callbacks for an event (like a real broadcast) */
const emit = (event, payload) =>
    act(() => { (listeners[event] || []).forEach((cb) => cb(payload)); });

const makeTask = (overrides = {}) => ({
    id:          'task-abc',
    title:       'Test task',
    column:      Column.TODO,
    priority:    Priority.MEDIUM,
    category:    Category.GENERAL,
    orderIndex:  0,
    attachments: [],
    ...overrides,
});

/* ══════════════════════════════════════════════════════════════
   useSocket — event handling
══════════════════════════════════════════════════════════════ */
describe('useSocket — WebSocket integration', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        Object.keys(listeners).forEach((k) => delete listeners[k]);
    });

    it('registers socket listeners on mount', () => {
        renderHook(() => useSocket());
        expect(mockSocket.on).toHaveBeenCalledWith('sync:tasks', expect.any(Function));
        expect(mockSocket.on).toHaveBeenCalledWith('task:create', expect.any(Function));
        expect(mockSocket.on).toHaveBeenCalledWith('task:update', expect.any(Function));
        expect(mockSocket.on).toHaveBeenCalledWith('task:move',   expect.any(Function));
        expect(mockSocket.on).toHaveBeenCalledWith('task:delete', expect.any(Function));
    });

    it('deregisters all listeners on unmount', () => {
        const { unmount } = renderHook(() => useSocket());
        unmount();
        expect(mockSocket.off).toHaveBeenCalledWith('sync:tasks');
        expect(mockSocket.off).toHaveBeenCalledWith('task:create');
        expect(mockSocket.off).toHaveBeenCalledWith('task:update');
        expect(mockSocket.off).toHaveBeenCalledWith('task:move');
        expect(mockSocket.off).toHaveBeenCalledWith('task:delete');
    });

    it('starts with loading=true and empty tasks', () => {
        const { result } = renderHook(() => useSocket());
        expect(result.current.loading).toBe(true);
        expect(result.current.tasks).toHaveLength(0);
    });

    it('sets tasks and loading=false on sync:tasks', async () => {
        const { result } = renderHook(() => useSocket());
        const tasks = [makeTask(), makeTask({ id: 'task-2', title: 'Second' })];
        await emit('sync:tasks', tasks);
        expect(result.current.tasks).toHaveLength(2);
        expect(result.current.loading).toBe(false);
    });

    it('appends new task on task:create event', async () => {
        const { result } = renderHook(() => useSocket());
        await emit('sync:tasks', [makeTask()]);
        await emit('task:create', makeTask({ id: 'task-new', title: 'Brand new' }));
        expect(result.current.tasks).toHaveLength(2);
        expect(result.current.tasks.find((t) => t.id === 'task-new')?.title).toBe('Brand new');
    });

    it('updates existing task on task:update event', async () => {
        const { result } = renderHook(() => useSocket());
        await emit('sync:tasks', [makeTask()]);
        const updated = makeTask({ title: 'Updated title' });
        await emit('task:update', { id: 'task-abc', task: updated });
        expect(result.current.tasks[0].title).toBe('Updated title');
    });

    it('moves task to new column on task:move event', async () => {
        const { result } = renderHook(() => useSocket());
        await emit('sync:tasks', [makeTask()]);
        const moved = makeTask({ column: Column.IN_PROGRESS });
        await emit('task:move', { id: 'task-abc', task: moved });
        expect(result.current.tasks[0].column).toBe(Column.IN_PROGRESS);
    });

    it('removes task on task:delete event', async () => {
        const { result } = renderHook(() => useSocket());
        await emit('sync:tasks', [makeTask(), makeTask({ id: 'task-2', title: 'Other' })]);
        await emit('task:delete', { id: 'task-abc' });
        expect(result.current.tasks).toHaveLength(1);
        expect(result.current.tasks[0].id).toBe('task-2');
    });

    it('does not remove a task when a different id is deleted', async () => {
        const { result } = renderHook(() => useSocket());
        await emit('sync:tasks', [makeTask()]);
        await emit('task:delete', { id: 'non-existent-id' });
        expect(result.current.tasks).toHaveLength(1);
    });

    it('emits task:create event when createTask is called', () => {
        const { result } = renderHook(() => useSocket());
        act(() => result.current.createTask({ title: 'Hello' }));
        expect(mockSocket.emit).toHaveBeenCalledWith('task:create', { title: 'Hello' });
    });

    it('emits task:update event when updateTask is called', () => {
        const { result } = renderHook(() => useSocket());
        act(() => result.current.updateTask('task-abc', { priority: Priority.HIGH }));
        expect(mockSocket.emit).toHaveBeenCalledWith('task:update', {
            id: 'task-abc', changes: { priority: Priority.HIGH },
        });
    });

    it('emits task:move event when moveTask is called', () => {
        const { result } = renderHook(() => useSocket());
        act(() => result.current.moveTask('task-abc', Column.DONE));
        expect(mockSocket.emit).toHaveBeenCalledWith('task:move', {
            id: 'task-abc', column: Column.DONE,
        });
    });

    it('emits task:delete event when deleteTask is called', () => {
        const { result } = renderHook(() => useSocket());
        act(() => result.current.deleteTask('task-abc'));
        expect(mockSocket.emit).toHaveBeenCalledWith('task:delete', { id: 'task-abc' });
    });

    it('emits task:reorder event when reorderTask is called', () => {
        const { result } = renderHook(() => useSocket());
        act(() => result.current.reorderTask('task-abc', 2, Column.TODO));
        expect(mockSocket.emit).toHaveBeenCalledWith('task:reorder', {
            id: 'task-abc', newIndex: 2, column: Column.TODO,
        });
    });

    it('stores error message on error event', async () => {
        const { result } = renderHook(() => useSocket());
        await emit('error', { message: 'Something went wrong' });
        expect(result.current.error).toBe('Something went wrong');
    });

    it('real-time sync: both clients receive the same tasks after a broadcast', async () => {
        /* Two hooks = two "clients" sharing the same socket mock.
           Each registers its own callback; emit() calls ALL of them,
           simulating a server broadcast received by every connected client. */
        const { result: client1 } = renderHook(() => useSocket());
        const { result: client2 } = renderHook(() => useSocket());

        const sharedTasks = [makeTask(), makeTask({ id: 'task-2', title: 'Second' })];
        await emit('sync:tasks', sharedTasks);

        expect(client1.current.tasks).toHaveLength(2);
        expect(client2.current.tasks).toHaveLength(2);
        expect(client1.current.tasks[0].id).toBe(client2.current.tasks[0].id);
    });
});
