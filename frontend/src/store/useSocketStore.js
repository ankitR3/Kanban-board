import { create } from 'zustand';
import socket from '../socket/socket.js';
import { useHomeStore } from './useHomeStore.js';

// Simple helper to move item in array
function arrayMove(array, from, to) {
  const newArray = array.slice();
  newArray.splice(to < 0 ? newArray.length + to : to, 0, newArray.splice(from, 1)[0]);
  return newArray;
}

// ── Pending operation tracking ──────────────────────────────────────────
// Prevents stale server responses from overwriting newer optimistic state
// when the user performs rapid successive drag operations.
//
// Example without tracking (the flicker bug):
//   1. Move task to IN_PROGRESS → optimistic ✓
//   2. Move task to DONE → optimistic ✓
//   3. Server responds to #1 (column=IN_PROGRESS) → OVERWRITES #2 → flicker!
//   4. Server responds to #2 (column=DONE) → correct again
//
// With tracking, response #3 is skipped because we know a newer op is pending.

const _pendingMoves   = new Map();   // taskId → count of in-flight moves
const _pendingDeletes = new Set();   // taskIds with in-flight deletes
let   _pendingCreates  = 0;          // count of in-flight creates
let   _pendingReorders = 0;          // count of in-flight reorders

function hasPendingOps() {
  return _pendingMoves.size > 0 || _pendingDeletes.size > 0 ||
         _pendingCreates > 0 || _pendingReorders > 0;
}

function clearAllPending() {
  _pendingMoves.clear();
  _pendingDeletes.clear();
  _pendingCreates = 0;
  _pendingReorders = 0;
}

export const useSocketStore = create((set, get) => ({
  tasks: [],
  workspaces: [],
  loading: true,
  error: null,
  _initialized: false,
  _mountCount: 0,

  _setTasks: (tasks) => set({ tasks }),

  // ── Initialize socket listeners (called once) ────────────────────────
  initialize: () => {
    set((state) => ({ _mountCount: state._mountCount + 1 }));
    if (get()._initialized) return;
    set({ _initialized: true });

    // ── Workspace events ──────────────────────────────────────────────
    socket.on('sync:workspaces', (incoming) => {
      set({ workspaces: incoming });
      const { activeWorkspace, setActiveWorkspace } = useHomeStore.getState();
      if (activeWorkspace) {
        const stillExists = incoming.find((ws) => ws.id === activeWorkspace.id);
        if (stillExists) {
          setActiveWorkspace(stillExists);
        } else {
          setActiveWorkspace(incoming[0] ?? null);
        }
      } else if (incoming.length > 0) {
        setActiveWorkspace(incoming[0]);
      }
    });

    socket.on('workspace:create', (workspace) => {
      set((state) => ({ workspaces: [...state.workspaces, workspace] }));
      useHomeStore.getState().setActiveWorkspace(workspace);
    });

    socket.on('workspace:delete', ({ id }) => {
      set((state) => {
        const updated = state.workspaces.filter((ws) => ws.id !== id);
        const { activeWorkspace, setActiveWorkspace } = useHomeStore.getState();
        if (activeWorkspace?.id === id) {
          setActiveWorkspace(updated[0] ?? null);
        }
        return { workspaces: updated };
      });
    });

    // ── Task events ───────────────────────────────────────────────────

    socket.on('sync:tasks', (serverTasks) => {
      // sync:tasks arrives on initial connect AND as response to task:reorder.
      if (_pendingReorders > 0) {
        _pendingReorders--;
      }

      if (hasPendingOps()) {
        // Merge: keep optimistic state for tasks with pending ops,
        // use server state for everything else.
        set((state) => {
          const serverMap = new Map(serverTasks.map((t) => [t.id, t]));
          const merged = [];
          const seen = new Set();

          for (const task of state.tasks) {
            seen.add(task.id);

            // Keep optimistic creates (not yet confirmed by server)
            if (task._optimistic) {
              merged.push(task);
              continue;
            }

            // Keep optimistic state for tasks with pending moves
            if (_pendingMoves.has(task.id)) {
              merged.push(task);
              continue;
            }

            // Skip tasks with pending deletes
            if (_pendingDeletes.has(task.id)) {
              continue;
            }

            // Use server version (updated orderIndex, etc.)
            merged.push(serverMap.get(task.id) || task);
          }

          // Add server tasks we don't have yet (from other clients)
          for (const st of serverTasks) {
            if (!seen.has(st.id) && !_pendingDeletes.has(st.id)) {
              merged.push(st);
            }
          }

          return { tasks: merged, loading: false };
        });
      } else {
        // No pending ops — safe to apply server state directly
        set({ tasks: serverTasks, loading: false });
      }
    });

    socket.on('task:create', (task) => {
      _pendingCreates = Math.max(0, _pendingCreates - 1);
      set((state) => {
        // Replace optimistic placeholder with the real server task
        const idx = state.tasks.findIndex((t) => t._optimistic);
        if (idx !== -1) {
          const updated = [...state.tasks];
          updated[idx] = task;
          return { tasks: updated };
        }
        return { tasks: [...state.tasks, task] };
      });
    });

    socket.on('task:update', ({ id, task }) => {
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? task : t)),
      }));
    });

    socket.on('task:move', ({ id, task }) => {
      const pending = _pendingMoves.get(id) || 0;

      if (pending > 1) {
        // Multiple moves in-flight — skip this stale response
        _pendingMoves.set(id, pending - 1);
        return;
      }

      if (pending === 1) {
        // Last pending move resolved — apply server truth
        _pendingMoves.delete(id);
      }

      // Apply (either last pending resolved, or from another client)
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? task : t)),
      }));
    });

    socket.on('task:delete', ({ id }) => {
      _pendingDeletes.delete(id);
      // Remove in case it wasn't optimistically removed
      set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== id),
      }));
    });

    socket.on('error', ({ message }) => {
      console.log('Socket error received:', message);
      set({ error: message });
      clearAllPending();
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected.');
      clearAllPending();
    });
  },

  cleanup: () => {
    set((state) => {
      const newCount = Math.max(0, state._mountCount - 1);
      if (newCount > 0) {
        return { _mountCount: newCount };
      }

      socket.off('sync:workspaces');
      socket.off('workspace:create');
      socket.off('workspace:delete');
      socket.off('sync:tasks');
      socket.off('task:create');
      socket.off('task:update');
      socket.off('task:move');
      socket.off('task:delete');
      socket.off('error');
      socket.off('disconnect');

      return { _initialized: false, _mountCount: 0 };
    });
  },

  // ── Workspace actions ─────────────────────────────────────────────────
  createWorkspace: (name) => {
    socket.emit('workspace:create', { name });
  },

  deleteWorkspace: (id) => {
    socket.emit('workspace:delete', { id });
  },

  // ── Task actions ──────────────────────────────────────────────────────
  createTask: (data) => {
    const wsId = useHomeStore.getState().activeWorkspace?.id ?? null;
    const currentTasks = get().tasks;
    _pendingCreates++;
    const tempTask = {
      id: `_optimistic_${Date.now()}`,
      _optimistic: true,
      title: data.title?.trim() ?? '',
      description: data.description || '',
      column: data.column || 'TODO',
      priority: data.priority || 'MEDIUM',
      category: data.category || 'GENERAL',
      workspaceId: wsId,
      orderIndex: currentTasks.filter((t) => t.column === (data.column || 'TODO')).length,
      attachments: data.attachments || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set({ tasks: [...currentTasks, tempTask] });
    
    const payload = { ...data };
    if (wsId) {
      payload.workspaceId = wsId;
    }
    socket.emit('task:create', payload);
  },

  updateTask: (id, changes) => {
    socket.emit('task:update', { id, changes });
  },

  moveTask: (id, column) => {
    const currentTasks = get().tasks;
    const targetTask = currentTasks.find((t) => t.id === id);
    if (targetTask) {
      _pendingMoves.set(id, (_pendingMoves.get(id) || 0) + 1);
      set({ tasks: currentTasks.map((t) => (t.id === id ? { ...t, column } : t)) });
    }
    socket.emit('task:move', { id, column });
  },

  deleteTask: (id) => {
    _pendingDeletes.add(id);
    set({ tasks: get().tasks.filter((t) => t.id !== id) });
    socket.emit('task:delete', { id });
  },

  reorderTask: (id, newIndex, column) => {
    const currentTasks = get().tasks;
    const wsId = useHomeStore.getState().activeWorkspace?.id ?? null;
    _pendingReorders++;

    const columnTasks = currentTasks
      .filter((t) => t.column === column && t.workspaceId === wsId)
      .sort((a, b) => {
        const diff = (a.orderIndex ?? 0) - (b.orderIndex ?? 0);
        if (diff !== 0) return diff;
        return (a.createdAt ?? '').localeCompare(b.createdAt ?? '');
      });

    const oldIndex = columnTasks.findIndex((t) => t.id === id);
    if (oldIndex !== -1 && oldIndex !== newIndex) {
      const reorderedColumn = arrayMove(columnTasks, oldIndex, newIndex)
        .map((t, i) => ({ ...t, orderIndex: i }));
      const updatedTasks = [
        ...currentTasks.filter(
          (t) => t.column !== column || t.workspaceId !== wsId
        ),
        ...reorderedColumn,
      ];
      set({ tasks: updatedTasks });
    }
    socket.emit('task:reorder', { id, newIndex, column });
  },
}));
