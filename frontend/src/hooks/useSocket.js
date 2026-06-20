import { useEffect, useState } from 'react';
import socket from '../socket/socket.js';

export default function useSocket() {
  const [tasks, setTasks]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    socket.on('sync:tasks', (tasks) => {
      setTasks(tasks);
      setLoading(false);
    });

    socket.on('task:create', (task) => {
        console.log('Received task:create from server:', task);
        setTasks((prev) => [...prev, task]);
    });

    socket.on('task:update', ({ id, task }) => {
      setTasks((prev) => prev.map((t) => (t.id === id ? task : t)));
    });

    socket.on('task:move', ({ id, task }) => {
      // Server returns the full updated task (with new column + orderIndex)
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? task : t))
      );
    });

    socket.on('task:delete', ({ id }) => {
      setTasks((prev) => prev.filter((t) => t.id !== id));
    });

    // task:reorder is no longer emitted — backend broadcasts sync:tasks instead

    socket.on('error', ({ message }) => {
        console.log('Socket error received:', message);
        setError(message);
    });

    return () => {
      socket.off('sync:tasks');
      socket.off('task:create');
      socket.off('task:update');
      socket.off('task:move');
      socket.off('task:delete');
      socket.off('error');
    };
  }, []);

  const createTask = (data) => {
    console.log('createTask called with:', data);
    socket.emit('task:create', data);
  };

  const updateTask = (id, changes) => {
    socket.emit('task:update', { id, changes });
  };

  const moveTask = (id, column) => {
    socket.emit('task:move', { id, column });
  };

  const deleteTask = (id) => {
    socket.emit('task:delete', { id });
  };

  const reorderTask = (id, newIndex, column) => {
    socket.emit('task:reorder', { id, newIndex, column });
  };

  return {
    tasks,
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