import React from 'react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    Cell, PieChart, Pie, LineChart, Line, CartesianGrid,
} from 'recharts';
import {
    CheckCircle2, ListTodo, TrendingUp, Tags, AlertTriangle,
    Clock, ClipboardList
} from 'lucide-react';
import { Column, Priority, Category } from '../../constants/enums.js';

/* ── colour palette matching the board columns ── */
const COLUMN_META = {
    [Column.TODO]:        { label: 'To Do',       color: '#a1a1aa' },
    [Column.IN_PROGRESS]: { label: 'In Progress',  color: '#f59e0b' },
    [Column.DONE]:        { label: 'Done',          color: '#10b981' },
};

/* ── Custom Flat Tooltip for Recharts ── */
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const color = payload[0].payload.color || payload[0].color || '#3b82f6';
        return (
            <div className="bg-[#1A1A1A] border border-[#2D2D2D] px-3 py-2 rounded shadow-lg flex flex-col gap-1 text-xs">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
                <p className="font-medium text-white flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                    {payload[0].value} {payload[0].value === 1 ? 'task' : 'tasks'}
                </p>
            </div>
        );
    }
    return null;
};

export default function ProgressChart({ tasks, embedded }) {
    const total = tasks.length;

    /* Per-column counts */
    const barData = Object.entries(COLUMN_META).map(([col, meta]) => ({
        name:  meta.label,
        count: tasks.filter((t) => t.column === col).length,
        color: meta.color,
    }));

    /* Done vs Not-done for pie */
    const doneCount  = tasks.filter((t) => t.column === Column.DONE).length;
    const otherCount = total - doneCount;
    const donePct    = total > 0 ? Math.round((doneCount / total) * 100) : 0;

    const completionData = [
        { name: 'Completed', value: doneCount, color: '#10b981' },
        { name: 'Remaining', value: otherCount || (total === 0 ? 1 : 0), color: '#2E2E2E' }
    ];

    /* Priority distribution */
    const priorityData = [
        { name: 'Low', count: tasks.filter((t) => t.priority === Priority.LOW).length },
        { name: 'Medium', count: tasks.filter((t) => t.priority === Priority.MEDIUM).length },
        { name: 'High', count: tasks.filter((t) => t.priority === Priority.HIGH).length },
    ];

    /* Category distribution with flat colors */
    const categoryList = [
        { label: 'General', count: tasks.filter((t) => t.category === Category.GENERAL).length, color: 'bg-zinc-600', dot: 'bg-zinc-400' },
        { label: 'Bug', count: tasks.filter((t) => t.category === Category.BUG).length, color: 'bg-red-500', dot: 'bg-red-500' },
        { label: 'Feature', count: tasks.filter((t) => t.category === Category.FEATURE).length, color: 'bg-blue-500', dot: 'bg-blue-500' },
        { label: 'Enhancement', count: tasks.filter((t) => t.category === Category.ENHANCEMENT).length, color: 'bg-emerald-500', dot: 'bg-emerald-500' },
    ];

    /* Urgent items list: High priority & NOT done */
    const urgentTasks = tasks
        .filter((t) => t.priority === Priority.HIGH && t.column !== Column.DONE)
        .slice(0, 4);

    /* Recently completed items list: Done column, sorted by updated time */
    const recentlyCompleted = tasks
        .filter((t) => t.column === Column.DONE)
        .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
        .slice(0, 4);

    if (embedded) {
        return (
            <div
                data-testid="progress-chart"
                className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-4 flex flex-col gap-4 shadow-xl"
            >
                <div className="flex items-center justify-between">
                    <h3 className="text-white font-medium text-xs">Task Progress</h3>
                    <span className="text-[11px] text-gray-400">
                        {doneCount}/{total} complete
                    </span>
                </div>
                <div>
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] text-gray-500">Completion</span>
                        <span className="text-[11px] font-semibold text-[#10b981]">{donePct}%</span>
                    </div>
                    <div className="w-full bg-[#2a2a2a] rounded-full h-1.5 overflow-hidden">
                        <div
                            data-testid="completion-bar"
                            className="h-1.5 bg-[#10b981] rounded-full transition-all duration-500"
                            style={{ width: `${donePct}%` }}
                        />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div data-testid="progress-chart" className="w-full flex flex-col gap-6 select-none">
            {/* Top statistics overview bar */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Tasks */}
                <div className="bg-[#1A1A1A] border border-[#2A2A2A] hover:border-[#3A3A3A] transition-colors rounded-lg p-4 flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Total Tasks</span>
                        <span className="text-2xl font-bold text-white mt-1">{total}</span>
                    </div>
                    <div className="p-2 text-gray-400">
                        <ClipboardList size={16} />
                    </div>
                </div>

                {/* Completed */}
                <div className="bg-[#1A1A1A] border border-[#2A2A2A] hover:border-[#3A3A3A] transition-colors rounded-lg p-4 flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Completed</span>
                        <span className="text-2xl font-bold text-[#10b981] mt-1">{doneCount}</span>
                    </div>
                    <div className="p-2 text-emerald-500">
                        <CheckCircle2 size={16} />
                    </div>
                </div>

                {/* In Progress */}
                <div className="bg-[#1A1A1A] border border-[#2A2A2A] hover:border-[#3A3A3A] transition-colors rounded-lg p-4 flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">In Progress</span>
                        <span className="text-2xl font-bold text-[#f59e0b] mt-1">
                            {tasks.filter((t) => t.column === Column.IN_PROGRESS).length}
                        </span>
                    </div>
                    <div className="p-2 text-amber-500">
                        <TrendingUp size={16} />
                    </div>
                </div>

                {/* Todo Tasks */}
                <div className="bg-[#1A1A1A] border border-[#2A2A2A] hover:border-[#3A3A3A] transition-colors rounded-lg p-4 flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Todo Tasks</span>
                        <span className="text-2xl font-bold text-gray-300 mt-1">
                            {tasks.filter((t) => t.column === Column.TODO).length}
                        </span>
                    </div>
                    <div className="p-2 text-gray-400">
                        <ListTodo size={16} />
                    </div>
                </div>
            </div>

            {/* Row 1: Completion and Work Distribution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                
                {/* CARD 1: Task Completion (Pie Circular Gauge) */}
                <div className="bg-[#1A1A1A] border border-[#2A2A2A] hover:border-[#3A3A3A] transition-colors rounded-lg p-5 flex flex-col relative shadow-md">
                    <div className="flex items-center gap-2 mb-4 justify-between">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 size={15} className="text-emerald-500" />
                            <h4 className="text-white text-xs font-semibold uppercase tracking-wider">Completion Rate</h4>
                        </div>
                        <span className="text-[10px] text-gray-400 font-medium bg-[#222222] border border-[#2D2D2D] px-2 py-0.5 rounded">
                            {donePct}% complete
                        </span>
                    </div>

                    <div className="relative w-full h-44 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={completionData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={55}
                                    outerRadius={68}
                                    startAngle={90}
                                    endAngle={-270}
                                    dataKey="value"
                                >
                                    <Cell key="completed" fill="#10b981" stroke="none" />
                                    <Cell key="remaining" fill="#2E2E2E" stroke="none" />
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl font-bold text-white tracking-tight">{donePct}%</span>
                            <span className="text-[10px] text-gray-500 font-medium mt-0.5">
                                {doneCount}/{total} complete
                            </span>
                        </div>
                    </div>

                    {/* Hidden/accessible bar for Vitest unit test validation */}
                    <div className="mt-4">
                        <div className="w-full bg-[#2A2A2A] rounded-full h-1 overflow-hidden">
                            <div
                                data-testid="completion-bar"
                                className="h-1 bg-[#10b981] rounded-full transition-all duration-500"
                                style={{ width: `${donePct}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* CARD 2: Work Distribution (Sleek Bar Chart) */}
                <div className="bg-[#1A1A1A] border border-[#2A2A2A] hover:border-[#3A3A3A] transition-colors rounded-lg p-5 flex flex-col shadow-md">
                    <div className="flex items-center gap-2 mb-4">
                        <ListTodo size={15} className="text-gray-400" />
                        <h4 className="text-white text-xs font-semibold uppercase tracking-wider">Work Distribution</h4>
                    </div>

                    <div className="w-full h-44 mt-2">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barData} barCategoryGap="30%">
                                <CartesianGrid strokeDasharray="3 3" stroke="#222225" vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    tick={{ fill: '#888', fontSize: 10, fontWeight: 500 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    allowDecimals={false}
                                    tick={{ fill: '#666', fontSize: 10, fontWeight: 500 }}
                                    axisLine={false}
                                    tickLine={false}
                                    width={15}
                                />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.01)' }} />
                                <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={40}>
                                    {barData.map((entry, idx) => (
                                        <Cell key={`cell-${idx}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>

            {/* Row 2: Priority Load and Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                
                {/* CARD 3: Priority Burden (Simple clean Line Chart) */}
                <div className="bg-[#1A1A1A] border border-[#2A2A2A] hover:border-[#3A3A3A] transition-colors rounded-lg p-5 flex flex-col shadow-md">
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingUp size={15} className="text-[#3b82f6]" />
                        <h4 className="text-white text-xs font-semibold uppercase tracking-wider">Priority Load</h4>
                    </div>

                    <div className="w-full h-44 mt-2">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={priorityData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#222225" vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    tick={{ fill: '#888', fontSize: 10, fontWeight: 500 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    allowDecimals={false}
                                    tick={{ fill: '#666', fontSize: 10, fontWeight: 500 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Line
                                    type="monotone"
                                    dataKey="count"
                                    stroke="#3b82f6"
                                    strokeWidth={2}
                                    dot={{ r: 4, stroke: '#3b82f6', strokeWidth: 1.5, fill: '#1A1A1A' }}
                                    activeDot={{ r: 5, stroke: '#3b82f6', strokeWidth: 2, fill: '#ffffff' }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* CARD 4: Categories Breakdown (Horizontal progress list) */}
                <div className="bg-[#1A1A1A] border border-[#2A2A2A] hover:border-[#3A3A3A] transition-colors rounded-lg p-5 flex flex-col justify-between shadow-md">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <Tags size={15} className="text-gray-400" />
                            <h4 className="text-white text-xs font-semibold uppercase tracking-wider">Categories Breakdown</h4>
                        </div>

                        <div className="flex flex-col gap-3.5 mt-2">
                            {categoryList.map((cat) => {
                                const pct = total > 0 ? Math.round((cat.count / total) * 100) : 0;
                                return (
                                    <div key={cat.label} className="flex flex-col gap-1.5">
                                        <div className="flex items-center justify-between text-xs">
                                            <div className="flex items-center gap-2">
                                                <span className={`w-2 h-2 rounded-full ${cat.dot}`} />
                                                <span className="font-medium text-gray-300">{cat.label}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 font-medium text-gray-400">
                                                <span>{cat.count} {cat.count === 1 ? 'task' : 'tasks'}</span>
                                                <span className="text-[10px] text-gray-600">({pct}%)</span>
                                            </div>
                                        </div>
                                        <div className="w-full bg-[#2A2A2A] rounded-full h-1.5 overflow-hidden">
                                            <div
                                                className={`h-full ${cat.color} rounded-full transition-all duration-500`}
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

            </div>

            {/* Row 3 (Urgent Items and Recently Completed) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                
                {/* CARD 5: Urgent Action Items */}
                <div className="bg-[#1A1A1A] border border-[#2A2A2A] hover:border-[#3A3A3A] transition-colors rounded-lg p-5 flex flex-col justify-between shadow-md">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <AlertTriangle size={15} className="text-red-400" />
                                <h4 className="text-white text-xs font-semibold uppercase tracking-wider">Urgent Action Items</h4>
                            </div>
                            {urgentTasks.length > 0 && (
                                <span className="text-[9px] px-2 py-0.5 rounded bg-red-950/40 border border-red-900/60 text-red-400 font-semibold uppercase tracking-wider">
                                    {urgentTasks.length} High
                                </span>
                            )}
                        </div>

                        {urgentTasks.length === 0 ? (
                            <div className="h-44 flex flex-col items-center justify-center text-center p-4">
                                <div className="w-8 h-8 rounded-full bg-emerald-950/30 border border-emerald-900/50 flex items-center justify-center text-emerald-400 mb-2">
                                    <CheckCircle2 size={16} />
                                </div>
                                <p className="text-xs text-gray-300 font-medium">All Clear!</p>
                                <p className="text-[10px] text-gray-500 mt-0.5">No urgent items pending attention.</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2.5 h-44 overflow-y-auto kanban-scroll pr-1">
                                {urgentTasks.map((task) => (
                                    <div key={task.id} className="p-2.5 rounded bg-[#161616] border border-[#252528] hover:border-[#2D2D30] transition-colors flex flex-col gap-1.5">
                                        <div className="flex items-start justify-between gap-2">
                                            <span className="text-xs font-medium text-white line-clamp-1">{task.title || 'Untitled Task'}</span>
                                            <span className="text-[8px] px-1.5 py-0.2 rounded font-semibold uppercase tracking-wider shrink-0 bg-[#222222] border border-[#333333] text-gray-400"
                                            >
                                                {task.column === Column.TODO ? 'Todo' : 'Active'}
                                            </span>
                                        </div>
                                        {task.description && (
                                            <p className="text-[10px] text-gray-500 line-clamp-1">{task.description}</p>
                                        )}
                                        <div className="flex items-center justify-between text-[9px] text-gray-500 mt-0.5">
                                            <span className="font-semibold px-1.5 py-0.2 rounded bg-purple-950/40 text-purple-400 border border-purple-900/40 uppercase tracking-wide">
                                                {(task.category || 'GENERAL').toLowerCase()}
                                            </span>
                                            <span className="flex items-center gap-1 font-medium">
                                                <Clock size={10} />
                                                {task.createdAt ? new Date(task.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Recent'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* CARD 6: Recently Completed Tasks */}
                <div className="bg-[#1A1A1A] border border-[#2A2A2A] hover:border-[#3A3A3A] transition-colors rounded-lg p-5 flex flex-col justify-between shadow-md">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 size={15} className="text-emerald-500" />
                                <h4 className="text-white text-xs font-semibold uppercase tracking-wider">Recently Completed</h4>
                            </div>
                        </div>

                        {recentlyCompleted.length === 0 ? (
                            <div className="h-44 flex flex-col items-center justify-center text-center p-4">
                                <div className="w-8 h-8 rounded-full bg-[#222222] border border-[#333333] flex items-center justify-center text-gray-500 mb-2">
                                    <Clock size={16} />
                                </div>
                                <p className="text-xs text-gray-400 font-medium">No completed tasks yet</p>
                                <p className="text-[10px] text-gray-500 mt-0.5">Move a task to "Done" to see it here.</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2.5 h-44 overflow-y-auto kanban-scroll pr-1">
                                {recentlyCompleted.map((task) => (
                                    <div key={task.id} className="p-2.5 rounded bg-[#161616] border border-[#252528] hover:border-[#2D2D30] transition-colors flex flex-col gap-1">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-xs font-medium text-gray-300 line-clamp-1 leading-snug">{task.title || 'Untitled Task'}</span>
                                            <div className="flex items-center text-[9px] text-emerald-500 font-semibold gap-1">
                                                <CheckCircle2 size={10} className="shrink-0" />
                                                <span>Done</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between text-[9px] text-gray-500 mt-1">
                                            <span className="font-semibold uppercase px-1.5 py-0.2 rounded bg-[#202025] text-gray-400">
                                                {(task.category || 'GENERAL').toLowerCase()}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                Completed {task.updatedAt || task.createdAt ? new Date(task.updatedAt || task.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Recent'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
