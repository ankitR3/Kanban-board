import { useEffect, useState, useRef } from 'react';
import socket from '../socket/socket.js';
import { useHomeStore } from '../store/useHomeStore.js';

// Simple helper to move item in array
function arrayMove(array, from, to) {
  const newArray = array.slice();
  newArray.splice(to < 0 ? newArray.length + to : to, 0, newArray.splice(from, 1)[0]);
  return newArray;
}

export default function useSocket() {
  const [tasks, setTasks]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const activeWorkspace = useHomeStore((state) => state.activeWorkspace);
  const workspaceTaskMap = useHomeStore((state) => state.workspaceTaskMap);
  const assignTaskToWorkspace = useHomeStore((state) => state.assignTaskToWorkspace);

  const tasksRef = useRef(tasks);
  const backupTasksRef = useRef(null);
  const revertTimeoutRef = useRef(null);
  const activeWorkspaceRef = useRef(activeWorkspace);

  // Keep tasksRef up to date
  useEffect(() => {
    tasksRef.current = tasks;
  }, [tasks]);

  // Keep activeWorkspaceRef up to date
  useEffect(() => {
    activeWorkspaceRef.current = activeWorkspace;
  }, [activeWorkspace]);

  const revertToStable = () => {
    if (backupTasksRef.current) {
      console.warn('Reverting tasks to last stable state.');
      setTasks(backupTasksRef.current);
      backupTasksRef.current = null;
    }
    if (revertTimeoutRef.current) {
      clearTimeout(revertTimeoutRef.current);
      revertTimeoutRef.current = null;
    }
  };

  const confirmStable = () => {
    backupTasksRef.current = null;
    if (revertTimeoutRef.current) {
      clearTimeout(revertTimeoutRef.current);
      revertTimeoutRef.current = null;
    }
  };

  const applyOptimisticUpdate = (newTasks) => {
    // Save backup if we don't have one active already
    if (!backupTasksRef.current) {
      backupTasksRef.current = tasksRef.current;
    }

    if (revertTimeoutRef.current) {
      clearTimeout(revertTimeoutRef.current);
    }

    setTasks(newTasks);

    // Revert if server doesn't respond or confirm in 4 seconds
    revertTimeoutRef.current = setTimeout(() => {
      console.warn('Socket request timed out. Reverting.');
      revertToStable();
    }, 4000);
  };

  useEffect(() => {
    socket.on('sync:tasks', (newTasks) => {
      setTasks(newTasks);
      setLoading(false);
      confirmStable();
    });

    socket.on('task:create', (task) => {
        console.log('Received task:create from server:', task);
        // Automatically associate the new task with the active workspace of the creator
        assignTaskToWorkspace(task.id, activeWorkspaceRef.current);
        setTasks((prev) => [...prev, task]);
    });

    socket.on('task:update', ({ id, task }) => {
      setTasks((prev) => prev.map((t) => (t.id === id ? task : t)));
    });

    socket.on('task:move', ({ id, task }) => {
      setTasks((prev) => prev.map((t) => (t.id === id ? task : t)));
      confirmStable();
    });

    socket.on('task:delete', ({ id }) => {
      setTasks((prev) => prev.filter((t) => t.id !== id));
    });

    socket.on('error', ({ message }) => {
        console.log('Socket error received:', message);
        setError(message);
        revertToStable();
    });

    socket.on('disconnect', () => {
        console.log('Socket disconnected. Reverting to stable state.');
        revertToStable();
    });

    return () => {
      socket.off('sync:tasks');
      socket.off('task:create');
      socket.off('task:update');
      socket.off('task:move');
      socket.off('task:delete');
      socket.off('error');
      socket.off('disconnect');
      if (revertTimeoutRef.current) {
        clearTimeout(revertTimeoutRef.current);
      }
    };
  }, [assignTaskToWorkspace]); // Setup socket listeners once on mount!

  const createTask = (data) => {
    console.log('createTask called with:', data);
    socket.emit('task:create', data);
  };

  const updateTask = (id, changes) => {
    socket.emit('task:update', { id, changes });
  };

  const moveTask = (id, column) => {
    const currentTasks = tasksRef.current;
    const targetTask = currentTasks.find((t) => t.id === id);
    if (targetTask) {
      const updatedTasks = currentTasks.map((t) =>
        t.id === id ? { ...t, column } : t
      );
      applyOptimisticUpdate(updatedTasks);
    }
    socket.emit('task:move', { id, column });
  };

  const deleteTask = (id) => {
    socket.emit('task:delete', { id });
  };

  const reorderTask = (id, newIndex, column) => {
    const currentTasks = tasksRef.current;
    const columnTasks = currentTasks
      .filter((t) => {
        const taskWorkspace = workspaceTaskMap[t.id] || "Ankit Raj's Workspace";
        return t.column === column && taskWorkspace === activeWorkspaceRef.current;
      })
      .sort((a, b) => {
        const diff = (a.orderIndex ?? 0) - (b.orderIndex ?? 0);
        if (diff !== 0) return diff;
        return (a.createdAt ?? '').localeCompare(b.createdAt ?? '');
      });

    const oldIndex = columnTasks.findIndex((t) => t.id === id);
    if (oldIndex !== -1 && oldIndex !== newIndex) {
      const reorderedColumn = arrayMove(columnTasks, oldIndex, newIndex);
      const updatedTasks = [
        ...currentTasks.filter((t) => {
          const taskWorkspace = workspaceTaskMap[t.id] || "Ankit Raj's Workspace";
          return t.column !== column || taskWorkspace !== activeWorkspaceRef.current;
        }),
        ...reorderedColumn,
      ];
      applyOptimisticUpdate(updatedTasks);
    }
    socket.emit('task:reorder', { id, newIndex, column });
  };

  // Filter tasks belonging to the active workspace
  const filteredTasks = tasks.filter((task) => {
    const taskWorkspace = workspaceTaskMap[task.id] || "Ankit Raj's Workspace";
    return taskWorkspace === activeWorkspace;
  });

  return {
    tasks: filteredTasks,
    setTasks,
    loading,
    error,
    createTask,
    updateTask,
    moveTask,
    deleteTask,
    reorderTask,
  };
}