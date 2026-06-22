import { useEffect } from 'react';
import { useSocketStore } from '../store/useSocketStore.js';
import { useHomeStore } from '../store/useHomeStore.js';

/**
 * Thin wrapper around the Zustand socket store.
 * Initialises listeners once and returns workspace-filtered tasks.
 */
export default function useSocket() {
  const activeWorkspace = useHomeStore((s) => s.activeWorkspace);

  const store = useSocketStore();

  // Initialize socket listeners once on first mount
  useEffect(() => {
    store.initialize();
    return () => {
      store.cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter tasks to those belonging to the active workspace
  const filteredTasks = store.tasks.filter(
    (t) => (t.workspaceId || null) === (activeWorkspace?.id ?? null)
  );

  return {
    workspaces: store.workspaces,
    tasks: filteredTasks,
    loading: store.loading,
    error: store.error,
    createWorkspace: store.createWorkspace,
    deleteWorkspace: store.deleteWorkspace,
    createTask: store.createTask,
    updateTask: store.updateTask,
    moveTask: store.moveTask,
    deleteTask: store.deleteTask,
    reorderTask: store.reorderTask,
  };
}