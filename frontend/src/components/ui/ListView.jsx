import { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, Flag, Tag, Circle } from 'lucide-react';
import { Column, Priority, Category } from '../../constants/enums.js';

/* ─── colour maps ─────────────────────────────────────────── */
const priorityMeta = {
    [Priority.LOW]:    { label: 'Low',    color: '#9ca3af', bg: 'bg-gray-500/15',   text: 'text-gray-300' },
    [Priority.MEDIUM]: { label: 'Medium', color: '#3b82f6', bg: 'bg-blue-500/15',   text: 'text-blue-300' },
    [Priority.HIGH]:   { label: 'High',   color: '#f59e0b', bg: 'bg-amber-500/15',  text: 'text-amber-300' },
};

const categoryMeta = {
    [Category.GENERAL]:     { label: 'General',     bg: 'bg-gray-500/15',   text: 'text-gray-300' },
    [Category.BUG]:         { label: 'Bug',         bg: 'bg-red-500/15',    text: 'text-red-300' },
    [Category.FEATURE]:     { label: 'Feature',     bg: 'bg-purple-500/15', text: 'text-purple-300' },
    [Category.ENHANCEMENT]: { label: 'Enhancement', bg: 'bg-cyan-500/15',   text: 'text-cyan-300' },
};

const statusMeta = {
    [Column.TODO]:        { label: 'To Do',       dot: 'bg-gray-400',   text: 'text-gray-300',   ring: 'border-gray-500' },
    [Column.IN_PROGRESS]: { label: 'In Progress', dot: 'bg-amber-400',  text: 'text-amber-300',  ring: 'border-amber-500' },
    [Column.DONE]:        { label: 'Done',        dot: 'bg-green-400',  text: 'text-green-300',  ring: 'border-green-500' },
};

/* ─── StatusBadge — click to cycle column ────────────────── */
function StatusBadge({ task, onMove }) {
    const [open, setOpen] = useState(false);
    const meta = statusMeta[task.column] ?? statusMeta[Column.TODO];

    return (
        <div className="relative">
            <button
                onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
                className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded border ${meta.ring} bg-transparent ${meta.text} hover:bg-white/5 cursor-pointer transition-colors`}
            >
                <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                {meta.label}
            </button>
            {open && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
                    <div className="absolute top-full left-0 mt-1 bg-[#1e1e1e] border border-[#333] rounded-lg shadow-2xl z-20 min-w-36 py-1 overflow-hidden">
                        {Object.entries(statusMeta).map(([col, m]) => (
                            <div
                                key={col}
                                onClick={(e) => { e.stopPropagation(); onMove(task.id, col); setOpen(false); }}
                                className={`flex items-center gap-2 px-3 py-2 text-xs cursor-pointer hover:bg-[#2a2a2a] transition-colors ${m.text}`}
                            >
                                <span className={`w-2 h-2 rounded-full ${m.dot}`} />
                                {m.label}
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

/* ─── Single row ──────────────────────────────────────────── */
function ListRow({ task, onEdit, onMove }) {
    const pMeta = task.priority ? priorityMeta[task.priority] : null;
    const cMeta = task.category ? categoryMeta[task.category] : null;

    return (
        <div
            onClick={() => onEdit(task)}
            className="group grid items-center border-b border-[#1e1e1e] hover:bg-[#181818] transition-colors cursor-pointer"
            style={{ gridTemplateColumns: '2fr 130px 150px 140px' }}
        >
            {/* Name */}
            <div className="flex items-center gap-3 px-4 py-2.5 min-w-0">
                <Circle size={13} className="shrink-0 text-gray-600 group-hover:text-gray-400 transition-colors" />
                <span className="text-sm text-gray-200 truncate group-hover:text-white transition-colors">
                    {task.title}
                </span>
            </div>

            {/* Priority */}
            <div className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                {pMeta ? (
                    <span className={`inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-md font-medium ${pMeta.bg} ${pMeta.text}`}>
                        <Flag size={10} fill={pMeta.color} color={pMeta.color} />
                        {pMeta.label}
                    </span>
                ) : (
                    <span className="text-gray-600 text-xs">—</span>
                )}
            </div>

            {/* Status */}
            <div className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                <StatusBadge task={task} onMove={onMove} />
            </div>

            {/* Category */}
            <div className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                {cMeta ? (
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md font-medium ${cMeta.bg} ${cMeta.text}`}>
                        <Tag size={10} />
                        {cMeta.label}
                    </span>
                ) : (
                    <span className="text-gray-600 text-xs">—</span>
                )}
            </div>
        </div>
    );
}

/* ─── Group (one status section) ─────────────────────────── */
function ListGroup({ column, tasks, onEdit, onMove, onAddTask }) {
    const [collapsed, setCollapsed] = useState(false);
    const meta = statusMeta[column.key];

    return (
        <div className="mb-6">
            {/* Group header */}
            <div className="flex items-center gap-2 px-4 py-2 select-none">
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="text-gray-500 hover:text-gray-300 transition-colors"
                >
                    {collapsed
                        ? <ChevronRight size={14} />
                        : <ChevronDown size={14} />}
                </button>
                <span className={`w-2.5 h-2.5 rounded-full ${meta.dot}`} />
                <span className={`text-sm font-semibold uppercase tracking-wide ${meta.text}`}>
                    {column.label}
                </span>
                <span className="text-gray-600 text-xs ml-1">{tasks.length}</span>
            </div>

            {!collapsed && (
                <>
                    {/* Table header */}
                    <div
                        className="grid border-b border-[#1e1e1e] bg-[#111]"
                        style={{ gridTemplateColumns: '2fr 130px 150px 140px' }}
                    >
                        <div className="px-4 py-2 text-[11px] text-gray-500 font-medium uppercase tracking-wider">Name</div>
                        <div className="px-3 py-2 text-[11px] text-gray-500 font-medium uppercase tracking-wider">Priority</div>
                        <div className="px-3 py-2 text-[11px] text-gray-500 font-medium uppercase tracking-wider">Status</div>
                        <div className="px-3 py-2 text-[11px] text-gray-500 font-medium uppercase tracking-wider">Category</div>
                    </div>

                    {/* Rows */}
                    {tasks.length === 0 && (
                        <div className="px-10 py-4 text-xs text-gray-600 italic border-b border-[#1e1e1e]">
                            No tasks
                        </div>
                    )}
                    {tasks.map((task) => (
                        <ListRow key={task.id} task={task} onEdit={onEdit} onMove={onMove} />
                    ))}

                    {/* Add task row */}
                    <button
                        onClick={onAddTask}
                        className="flex items-center gap-2 px-4 py-2.5 text-xs text-gray-500 hover:text-gray-300 hover:bg-[#181818] transition-colors w-full border-b border-[#1e1e1e] cursor-pointer"
                    >
                        <Plus size={13} /> Add Task
                    </button>
                </>
            )}
        </div>
    );
}

/* ─── Main export ─────────────────────────────────────────── */
export default function ListView({ columns, getColumnTasks, onEdit, onMove, onAddTask }) {
    return (
        <div className="flex-1 overflow-y-auto px-2 py-4">
            {columns.map((col) => (
                <ListGroup
                    key={col.key}
                    column={col}
                    tasks={getColumnTasks(col.key)}
                    onEdit={onEdit}
                    onMove={onMove}
                    onAddTask={onAddTask}
                />
            ))}
        </div>
    );
}
