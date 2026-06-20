import { Plus } from 'lucide-react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import SortableTaskCard from '../ui/SortableTaskCard.jsx';

export default function KanbanColumn({ column, tasks, onEdit, onDelete, onMarkDone, onUpdate, onAddTask }) {
    const droppableId = `column:${column.key}`;
    const { setNodeRef, isOver } = useDroppable({ id: droppableId });

    return (
        <div className="w-70 shrink-0 bg-[#141414] rounded-lg p-3 flex flex-col max-h-full">
            {/* Header — stays fixed, never scrolls */}
            <div className={`flex items-center gap-2 mb-3 w-fit pl-2 pr-2.5 py-1 rounded-md shrink-0 ${column.bgColor}`}>
                <span className={`w-2 h-2 rounded-full shrink-0 ${column.dotColor}`} />
                <span className={`text-sm font-medium whitespace-nowrap ${column.textColor}`}>{column.label}</span>
                <span className="text-gray-600 text-xs">{tasks.length}</span>
            </div>

            {/* Card list — scrolls internally when it overflows */}
            {/* ref is placed here so the whole scrollable area is the drop zone */}
            <div
                ref={setNodeRef}
                className={`kanban-scroll overflow-y-auto flex-1 min-h-0 pr-1 rounded-md transition-colors ${
                    isOver ? 'outline outline-2 outline-indigo-500/50 bg-indigo-500/5' : ''
                }`}
            >
                <SortableContext
                    id={droppableId}
                    items={tasks.map((t) => t.id)}
                    strategy={verticalListSortingStrategy}
                >
                    {/* min-h ensures empty columns remain droppable */}
                    <div className="min-h-[60px] pb-1">
                        {tasks.map((task) => (
                            <SortableTaskCard
                                key={task.id}
                                task={task}
                                onEdit={onEdit}
                                onDelete={onDelete}
                                onMarkDone={onMarkDone}
                                onUpdate={onUpdate}
                            />
                        ))}
                    </div>
                </SortableContext>
            </div>

            {/* Add Task — stays fixed at bottom, never scrolls */}
            <button
                onClick={onAddTask}
                className="flex items-center gap-1.5 text-gray-400 hover:bg-[#282828] text-md px-1 py-1.5 transition-all w-full hover:cursor-pointer rounded-md shrink-0"
            >
                <Plus size={17} /> Add Task
            </button>
        </div>
    );
}