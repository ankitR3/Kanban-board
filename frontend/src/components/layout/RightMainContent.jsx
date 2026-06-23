import { Columns3, List, ChevronDown, FolderPlus } from 'lucide-react';
import { useState } from 'react';
import { DndContext, closestCorners, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import useSocket from '../../hooks/useSocket.js';
import TaskCard from '../ui/TaskCard.jsx';
import TaskModal from '../ui/TaskModal.jsx';
import KanbanColumn from '../ui/KanbanColumn.jsx';
import ListView from '../ui/ListView.jsx';
import { Column, SidebarEnum } from '../../constants/enums.js';
import ProgressChart from '../ui/ProgressChart.jsx';
import { useHomeStore } from '../../store/useHomeStore.js';

export default function RightMainContent() {
    const { activeTab, activeWorkspace } = useHomeStore();
    const [activeView, setActiveView] = useState('board');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [activeTask, setActiveTask] = useState(null);
    const { tasks, loading, createTask, updateTask, moveTask, deleteTask, reorderTask } = useSocket();

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 5 },
        })
    );

    const columns = [
        {
            key: Column.TODO,
            label: 'To Do',
            dotColor: 'bg-gray-500',
            textColor: 'text-gray-300',
            bgColor: 'bg-[#222222]',
        },
        {
            key: Column.IN_PROGRESS,
            label: 'In Progress',
            dotColor: 'bg-amber-500',
            textColor: 'text-amber-300',
            bgColor: 'bg-amber-500/10',
        },
        {
            key: Column.DONE,
            label: 'Done',
            dotColor: 'bg-green-500',
            textColor: 'text-green-300',
            bgColor: 'bg-green-500/10',
        },
    ];

    const openCreateModal = () => {
        setEditingTask(null);
        setModalOpen(true);
    };

    const openEditModal = (task) => {
        setEditingTask(task);
        setModalOpen(true);
    };

    const handleSave = (data) => {
        if (editingTask) {
            updateTask(editingTask.id, data);
        } else {
            createTask(data);
        }
        setModalOpen(false);
        setEditingTask(null);
    };

    const handleMarkDone = (task) => {
        moveTask(task.id, Column.DONE);
    };

    const getColumnTasks = (columnKey) =>
        tasks
            .filter((t) => t.column === columnKey)
            .sort((a, b) => {
                const diff = (a.orderIndex ?? 0) - (b.orderIndex ?? 0);
                if (diff !== 0) return diff;
                return (a.createdAt ?? '').localeCompare(b.createdAt ?? '');
            });

    const handleDragStart = (event) => {
        const task = tasks.find((t) => t.id === event.active.id);
        setActiveTask(task || null);
    };

    /**
     * onDragOver fires continuously while dragging.
     * We optimistically update the local tasks state so the card
     * appears in the target column in real-time before the drop.
     */
    const handleDragOver = (event) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const draggedTask = tasks.find((t) => t.id === active.id);
        if (!draggedTask) return;

        // Determine which column `over` belongs to
        let overColumn;
        if (typeof over.id === 'string' && over.id.startsWith('column:')) {
            overColumn = over.id.replace('column:', '');
        } else {
            const overTask = tasks.find((t) => t.id === over.id);
            overColumn = overTask?.column;
        }

        if (!overColumn || overColumn === draggedTask.column) return;

        // Move card to new column optimistically in local state
        setActiveTask((prev) => (prev ? { ...prev, column: overColumn } : prev));
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        setActiveTask(null);

        if (!over) return;

        const draggedTask = tasks.find((t) => t.id === active.id);
        if (!draggedTask) return;

        // Determine destination column
        let targetColumn = draggedTask.column;
        const overTask = tasks.find((t) => t.id === over.id);

        if (overTask) {
            targetColumn = overTask.column;
        } else if (typeof over.id === 'string' && over.id.startsWith('column:')) {
            targetColumn = over.id.replace('column:', '');
        }

        const isColumnChange = draggedTask.column !== targetColumn;

        if (isColumnChange) {
            // Cross-column move: just update the column, let the server place it at the end
            moveTask(active.id, targetColumn);
            return;
        }

        // Same-column reorder
        if (active.id === over.id) return;

        const allColumnTasks = getColumnTasks(targetColumn);
        const oldIndex = allColumnTasks.findIndex((t) => t.id === active.id);
        const newIndex = allColumnTasks.findIndex((t) => t.id === over.id);

        if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;

        reorderTask(active.id, newIndex, targetColumn);
    };

    if (activeTab === SidebarEnum.PROGRESS) {
        return (
            <main className="flex-1 bg-[#0E0E0E] rounded-r-md border-r border-t border-b border-[#1F1F1F] flex flex-col overflow-hidden h-full min-w-0">
                {/* ── toolbar ── */}
                <div className="flex items-center justify-between px-6 py-3 border-b border-[#1F1F1F] shrink-0">
                    <div className="flex items-center gap-4">
                        <span className="text-white font-medium text-sm">Progress</span>
                    </div>
                </div>

                {/* ── content ── */}
                <div className="flex-1 p-6 overflow-y-auto kanban-scroll flex flex-col items-center justify-start">
                    <div className="w-full max-w-5xl">
                        <ProgressChart tasks={tasks} embedded={false} />
                    </div>
                </div>
            </main>
        );
    }

    // ── Loading (socket connecting) ───────────────────────────────────────
    if (loading) {
        return (
        <main className="flex-1 h-full bg-[#0E0E0E] rounded-r-md border-r border-t border-b border-[#1F1F1F] flex items-center justify-center">
            <div className="flex items-center gap-2 text-gray-400 text-sm">
            <div className="w-4 h-4 border-2 border-gray-600 border-t-indigo-500 rounded-full animate-spin" />
            Loading...
            </div>
        </main>
        );
    }

    // ── No workspace selected (shown only after socket has loaded) ────────
    if (!activeWorkspace) {
        return (
            <main className="flex-1 h-full bg-[#0E0E0E] rounded-r-md border-r border-t border-b border-[#1F1F1F] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-center px-6">
                    <div className="w-16 h-16 rounded-2xl bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center">
                        <FolderPlus size={28} className="text-amber-400" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <h3 className="text-white font-semibold text-base">No workspace selected</h3>
                        <p className="text-gray-500 text-sm max-w-xs">
                            Create a workspace from the top-left menu to start organizing your kanban board.
                        </p>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main
            className="flex-1 bg-[#0E0E0E] rounded-r-md border-r border-t border-b border-[#1F1F1F] flex flex-col overflow-hidden h-full min-w-0"
        >
            {/* ── toolbar ── */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-[#1F1F1F] shrink-0">
                <div className="flex items-center gap-4">
                <span className="text-white font-medium text-sm">Issues</span>
                <div className="flex items-center gap-1">
                    <button
                    onClick={() => setActiveView('board')}
                    className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md transition-all
                        ${activeView === 'board' ? 'bg-[#262626] text-white' : 'text-gray-400 hover:text-white hover:cursor-pointer'}`}
                    >
                    <Columns3 size={13} /> Board
                    </button>
                    <button
                    onClick={() => setActiveView('list')}
                    className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md transition-all
                        ${activeView === 'list' ? 'bg-[#262626] text-white' : 'text-gray-400 hover:text-white hover:cursor-pointer'}`}
                    >
                    <List size={13} /> List
                    </button>
                </div>
                </div>
                <button
                    onClick={openCreateModal}
                        className="flex items-center gap-2 text-xs font-semibold text-gray-900 bg-gray-200 hover:bg-gray-100 px-3 py-2 rounded-lg transition-all hover:cursor-pointer"
                        style={{
                            boxShadow: 'inset 0 2px 0 0 rgba(255,255,255,1), inset 0 -3px 0 0 rgba(0,0,0,0.3), 0 1px 3px rgba(0,0,0,0.4)'
                        }}
                    >
                    ADD TASK
                    <ChevronDown size={14} className="text-gray-500" />
                </button>
            </div>

            {/* ── list view ── */}
            {activeView === 'list' && (
                <ListView
                    columns={columns}
                    getColumnTasks={getColumnTasks}
                    onEdit={openEditModal}
                    onMove={moveTask}
                    onAddTask={openCreateModal}
                />
            )}

            {/* ── board view ── */}
            {activeView === 'board' && (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCorners}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDragEnd={handleDragEnd}
                >
                    <div className="flex gap-4 p-4 overflow-x-auto overflow-y-hidden flex-1 min-h-0">
                        {columns.map((col) => (
                            <KanbanColumn
                                key={col.key}
                                column={col}
                                tasks={getColumnTasks(col.key)}
                                onEdit={openEditModal}
                                onDelete={deleteTask}
                                onMarkDone={handleMarkDone}
                                onUpdate={updateTask}
                                onAddTask={openCreateModal}
                            />
                        ))}
                    </div>

                    <DragOverlay>
                        {activeTask ? (
                            <TaskCard
                                task={activeTask}
                                onEdit={() => {}}
                                onDelete={() => {}}
                                onMarkDone={() => {}}
                                onUpdate={() => {}}
                            />
                        ) : null}
                    </DragOverlay>
                </DndContext>
            )}

            <TaskModal
                isOpen={modalOpen}
                onClose={() => { setModalOpen(false); setEditingTask(null); }}
                onSave={handleSave}
                initialTask={editingTask}
            />
        </main>
    )
}