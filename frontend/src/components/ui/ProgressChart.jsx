import React from 'react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    Cell, PieChart, Pie, AreaChart, Area, CartesianGrid,
} from 'recharts';
import {
    CheckCircle2, ListTodo, TrendingUp, Tags, AlertTriangle,
    Clock, ClipboardList, Zap
} from 'lucide-react';
import { Column, Priority, Category } from '../../constants/enums.js';

/* ── colour palette matching the board columns ── */
const COLUMN_META = {
    [Column.TODO]:        { label: 'To Do',       color: '#a1a1aa' },
    [Column.IN_PROGRESS]: { label: 'In Progress',  color: '#f59e0b' },
    [Column.DONE]:        { label: 'Done',          color: '#10b981' },
};

/* ── Custom Glassmorphism Tooltip for Recharts ── */
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        // Fallback color extraction
        const color = payload[0].payload.color || payload[0].color || '#3b82f6';
        return (
            <div className="bg-[#121214]/95 backdrop-blur-md border border-[#2c2c32]/80 px-3 py-2 rounded-lg shadow-2xl flex flex-col gap-1 animate-in fade-in zoom-in-95 duration-100">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{label}</p>
                <p className="text-xs font-extrabold text-white flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full ring-2 ring-white/5 shadow-inner" style={{ backgroundColor: color }} />
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
        { name: 'Remaining', value: otherCount || (total === 0 ? 1 : 0), color: '#222222' }
    ];

    /* Priority distribution */
    const priorityData = [
        { name: 'Low', count: tasks.filter((t) => t.priority === Priority.LOW).length },
        { name: 'Medium', count: tasks.filter((t) => t.priority === Priority.MEDIUM).length },
        { name: 'High', count: tasks.filter((t) => t.priority === Priority.HIGH).length },
    ];

    /* Category distribution with gradients */
    const categoryList = [
        { label: 'General', count: tasks.filter((t) => t.category === Category.GENERAL).length, color: 'from-purple-500 to-indigo-500', dot: 'bg-purple-500' },
        { label: 'Bug', count: tasks.filter((t) => t.category === Category.BUG).length, color: 'from-red-500 to-rose-500', dot: 'bg-red-500' },
        { label: 'Feature', count: tasks.filter((t) => t.category === Category.FEATURE).length, color: 'from-blue-500 to-cyan-500', dot: 'bg-blue-500' },
        { label: 'Enhancement', count: tasks.filter((t) => t.category === Category.ENHANCEMENT).length, color: 'from-emerald-500 to-teal-500', dot: 'bg-emerald-500' },
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
                className="bg-[#141414] border border-[#1f1f1f] rounded-xl p-4 flex flex-col gap-4 shadow-xl"
            >
                <div className="flex items-center justify-between">
                    <h3 className="text-white font-semibold text-xs">Task Progress</h3>
                    <span className="text-[11px] text-gray-500">
                        {doneCount}/{total} complete
                    </span>
                </div>
                <div>
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] text-gray-400">Completion</span>
                        <span className="text-[11px] font-semibold text-green-400">{donePct}%</span>
                    </div>
                    <div className="w-full bg-[#2a2a2a] rounded-full h-1.5 overflow-hidden">
                        <div
                            data-testid="completion-bar"
                            className="h-1.5 bg-green-500 rounded-full transition-all duration-500"
                            style={{ width: `${donePct}%` }}
                        />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div data-testid="progress-chart" className="w-full flex flex-col gap-6 select-none animate-in fade-in duration-300">
            {/* Top statistics overview bar */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Tasks */}
                <div className="bg-gradient-to-b from-[#151518] to-[#0f0f11] border border-[#222225] hover:border-[#33333b] hover:shadow-lg transition-all duration-300 rounded-xl p-4 flex items-center justify-between group">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Total Tasks</span>
                        <span className="text-2xl font-extrabold text-white mt-1 group-hover:text-indigo-400 transition-colors">{total}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500/20 group-hover:scale-105 transition-all">
                        <ClipboardList size={18} />
                    </div>
                </div>

                {/* Completed */}
                <div className="bg-gradient-to-b from-[#151518] to-[#0f0f11] border border-[#222225] hover:border-[#22c55e]/30 hover:shadow-lg transition-all duration-300 rounded-xl p-4 flex items-center justify-between group">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Completed</span>
                        <span className="text-2xl font-extrabold text-emerald-500 mt-1 group-hover:text-emerald-400 transition-colors">{doneCount}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20 group-hover:scale-105 transition-all">
                        <CheckCircle2 size={18} />
                    </div>
                </div>

                {/* In Progress */}
                <div className="bg-gradient-to-b from-[#151518] to-[#0f0f11] border border-[#222225] hover:border-[#f59e0b]/30 hover:shadow-lg transition-all duration-300 rounded-xl p-4 flex items-center justify-between group">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">In Progress</span>
                        <span className="text-2xl font-extrabold text-amber-500 mt-1 group-hover:text-amber-400 transition-colors">
                            {tasks.filter((t) => t.column === Column.IN_PROGRESS).length}
                        </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400 group-hover:bg-amber-500/20 group-hover:scale-105 transition-all">
                        <Zap size={18} className="animate-pulse" />
                    </div>
                </div>

                {/* Todo Tasks */}
                <div className="bg-gradient-to-b from-[#151518] to-[#0f0f11] border border-[#222225] hover:border-[#888]/30 hover:shadow-lg transition-all duration-300 rounded-xl p-4 flex items-center justify-between group">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Todo Tasks</span>
                        <span className="text-2xl font-extrabold text-zinc-400 mt-1 group-hover:text-zinc-300 transition-colors">
                            {tasks.filter((t) => t.column === Column.TODO).length}
                        </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-zinc-500/10 text-zinc-400 group-hover:bg-zinc-500/20 group-hover:scale-105 transition-all">
                        <ListTodo size={18} />
                    </div>
                </div>
            </div>

            {/* Bento Grid Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                
                {/* CARD 1: Task Completion (Pie Circular Gauge) */}
                <div className="bg-gradient-to-b from-[#151518] to-[#0f0f11] border border-[#222225] hover:border-[#33333b] transition-all rounded-xl p-5 flex flex-col relative shadow-md">
                    <div className="flex items-center gap-2 mb-4 justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                                <CheckCircle2 size={16} />
                            </div>
                            <h4 className="text-white text-xs font-semibold uppercase tracking-wider">Completion Rate</h4>
                        </div>
                        <span className="text-[10px] text-gray-400 font-bold bg-[#1d1d21] border border-[#2d2d35] px-2 py-0.5 rounded">
                            {donePct}% Efficiency
                        </span>
                    </div>

                    <div className="relative w-full h-44 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <defs>
                                    <linearGradient id="completedPieGrad" x1="0" y1="0" x2="1" y2="1">
                                        <stop offset="0%" stopColor="#10b981"/>
                                        <stop offset="100%" stopColor="#059669"/>
                                    </linearGradient>
                                    <linearGradient id="remainingPieGrad" x1="0" y1="0" x2="1" y2="1">
                                        <stop offset="0%" stopColor="#222225"/>
                                        <stop offset="100%" stopColor="#1b1b1e"/>
                                    </linearGradient>
                                </defs>
                                <Pie
                                    data={completionData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={58}
                                    outerRadius={70}
                                    startAngle={90}
                                    endAngle={-270}
                                    paddingAngle={total > 0 && doneCount > 0 && otherCount > 0 ? 3 : 0}
                                    dataKey="value"
                                >
                                    <Cell key="completed" fill="url(#completedPieGrad)" stroke="none" />
                                    <Cell key="remaining" fill="url(#remainingPieGrad)" stroke="none" />
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-3xl font-extrabold text-white tracking-tight">{donePct}%</span>
                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">
                                {doneCount}/{total} complete
                            </span>
                        </div>
                    </div>

                    {/* Hidden/accessible bar for Vitest unit test validation */}
                    <div className="mt-4">
                        <div className="w-full bg-[#1b1b1e] rounded-full h-1 overflow-hidden">
                            <div
                                data-testid="completion-bar"
                                className="h-1 bg-emerald-500 rounded-full transition-all duration-500"
                                style={{ width: `${donePct}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* CARD 2: Work Distribution (Sleek Bar Chart) */}
                <div className="bg-gradient-to-b from-[#151518] to-[#0f0f11] border border-[#222225] hover:border-[#33333b] transition-all rounded-xl p-5 flex flex-col shadow-md">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                            <ListTodo size={16} />
                        </div>
                        <h4 className="text-white text-xs font-semibold uppercase tracking-wider">Work Distribution</h4>
                    </div>

                    <div className="w-full h-44 mt-2">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barData} barCategoryGap="30%">
                                <defs>
                                    <linearGradient id="todoBarGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#a1a1aa" stopOpacity={0.95}/>
                                        <stop offset="100%" stopColor="#71717a" stopOpacity={0.2}/>
                                    </linearGradient>
                                    <linearGradient id="progressBarGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.95}/>
                                        <stop offset="100%" stopColor="#d97706" stopOpacity={0.2}/>
                                    </linearGradient>
                                    <linearGradient id="doneBarGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.95}/>
                                        <stop offset="100%" stopColor="#059669" stopOpacity={0.2}/>
                                    </linearGradient>
                                </defs>
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
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                                <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={45}>
                                    {barData.map((entry, idx) => {
                                        let fillGrad;
                                        if (entry.name === 'To Do') fillGrad = 'url(#todoBarGrad)';
                                        else if (entry.name === 'In Progress') fillGrad = 'url(#progressBarGrad)';
                                        else fillGrad = 'url(#doneBarGrad)';
                                        return <Cell key={`cell-${idx}`} fill={fillGrad} />;
                                    })}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>

            {/* Bento Grid Row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                
                {/* CARD 3: Priority Burden (Smooth Gradient Area Chart) */}
                <div className="bg-gradient-to-b from-[#151518] to-[#0f0f11] border border-[#222225] hover:border-[#33333b] transition-all rounded-xl p-5 flex flex-col shadow-md">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
                            <TrendingUp size={16} />
                        </div>
                        <h4 className="text-white text-xs font-semibold uppercase tracking-wider">Priority Load</h4>
                    </div>

                    <div className="w-full h-44 mt-2">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={priorityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="priorityAreaGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.35}/>
                                        <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.01}/>
                                    </linearGradient>
                                    <linearGradient id="priorityLineGrad" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="0%" stopColor="#60a5fa"/>
                                        <stop offset="100%" stopColor="#3b82f6"/>
                                    </linearGradient>
                                </defs>
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
                                <Area
                                    type="monotone"
                                    dataKey="count"
                                    stroke="url(#priorityLineGrad)"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#priorityAreaGrad)"
                                    activeDot={{ r: 5, stroke: '#151518', strokeWidth: 2, fill: '#60a5fa' }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* CARD 4: Categories Breakdown (Horizontal progress list) */}
                <div className="bg-gradient-to-b from-[#151518] to-[#0f0f11] border border-[#222225] hover:border-[#33333b] transition-all rounded-xl p-5 flex flex-col justify-between shadow-md">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
                                <Tags size={16} />
                            </div>
                            <h4 className="text-white text-xs font-semibold uppercase tracking-wider">Categories Breakdown</h4>
                        </div>

                        <div className="flex flex-col gap-3.5 mt-2">
                            {categoryList.map((cat) => {
                                const pct = total > 0 ? Math.round((cat.count / total) * 100) : 0;
                                return (
                                    <div key={cat.label} className="flex flex-col gap-1.5">
                                        <div className="flex items-center justify-between text-xs">
                                            <div className="flex items-center gap-2">
                                                <span className={`w-2 h-2 rounded-full ${cat.dot} ring-4 ${cat.dot}/10`} />
                                                <span className="font-semibold text-gray-300">{cat.label}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 font-bold text-gray-400">
                                                <span>{cat.count} {cat.count === 1 ? 'task' : 'tasks'}</span>
                                                <span className="text-[10px] text-gray-600 font-medium">({pct}%)</span>
                                            </div>
                                        </div>
                                        <div className="w-full bg-[#1b1b1e] rounded-full h-1.5 overflow-hidden">
                                            <div
                                                className={`h-full bg-gradient-to-r ${cat.color} rounded-full transition-all duration-500`}
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

            {/* Bento Grid Row 3 (Urgent Items and Recently Completed) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                
                {/* CARD 5: Urgent Action Items */}
                <div className="bg-gradient-to-b from-[#151518] to-[#0f0f11] border border-[#222225] hover:border-[#33333b] transition-all rounded-xl p-5 flex flex-col justify-between shadow-md">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400">
                                    <AlertTriangle size={16} />
                                </div>
                                <h4 className="text-white text-xs font-semibold uppercase tracking-wider">Urgent Action Items</h4>
                            </div>
                            {urgentTasks.length > 0 && (
                                <span className="text-[9px] px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 font-bold uppercase tracking-wider">
                                    {urgentTasks.length} High Priority
                                </span>
                            )}
                        </div>

                        {urgentTasks.length === 0 ? (
                            <div className="h-44 flex flex-col items-center justify-center text-center p-4">
                                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-2">
                                    <CheckCircle2 size={20} />
                                </div>
                                <p className="text-xs text-gray-300 font-semibold">All Clear!</p>
                                <p className="text-[10px] text-gray-500 mt-0.5">No urgent items pending attention.</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2.5 h-44 overflow-y-auto kanban-scroll pr-1">
                                {urgentTasks.map((task) => (
                                    <div key={task.id} className="p-2.5 rounded-lg bg-[#19191c] border border-[#242428] hover:border-[#333338] transition-all flex flex-col gap-1.5">
                                        <div className="flex items-start justify-between gap-2">
                                            <span className="text-xs font-semibold text-white line-clamp-1">{task.title || 'Untitled Task'}</span>
                                            <span className={`text-[8px] px-1.5 py-0.2 rounded font-extrabold uppercase tracking-wider shrink-0
                                                ${task.column === Column.TODO ? 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/25' : 'bg-amber-500/10 text-amber-400 border border-amber-500/25'}`}
                                            >
                                                {task.column === Column.TODO ? 'Todo' : 'Active'}
                                            </span>
                                        </div>
                                        {task.description && (
                                            <p className="text-[10px] text-gray-400 line-clamp-1">{task.description}</p>
                                        )}
                                        <div className="flex items-center justify-between text-[9px] text-gray-500 mt-0.5">
                                            <span className="font-semibold px-1.5 py-0.2 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 uppercase tracking-wide">
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
                <div className="bg-gradient-to-b from-[#151518] to-[#0f0f11] border border-[#222225] hover:border-[#33333b] transition-all rounded-xl p-5 flex flex-col justify-between shadow-md">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                                    <CheckCircle2 size={16} />
                                </div>
                                <h4 className="text-white text-xs font-semibold uppercase tracking-wider">Recently Completed</h4>
                            </div>
                            {recentlyCompleted.length > 0 && (
                                <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold uppercase tracking-wider">
                                    Archive
                                </span>
                            )}
                        </div>

                        {recentlyCompleted.length === 0 ? (
                            <div className="h-44 flex flex-col items-center justify-center text-center p-4">
                                <div className="w-10 h-10 rounded-full bg-[#1c1c1f] flex items-center justify-center text-gray-500 mb-2">
                                    <Clock size={20} />
                                </div>
                                <p className="text-xs text-gray-400 font-semibold">No completed tasks yet</p>
                                <p className="text-[10px] text-gray-500 mt-0.5">Move a task to "Done" to see it here.</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2.5 h-44 overflow-y-auto kanban-scroll pr-1">
                                {recentlyCompleted.map((task) => (
                                    <div key={task.id} className="p-2.5 rounded-lg bg-[#19191c]/60 border border-[#222225] hover:border-[#2b2b30] transition-all flex flex-col gap-1">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-xs font-semibold text-gray-200 line-clamp-1 leading-snug">{task.title || 'Untitled Task'}</span>
                                            <div className="flex items-center text-[9px] text-emerald-400 font-bold gap-1">
                                                <CheckCircle2 size={10} className="shrink-0" />
                                                <span>Done</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between text-[9px] text-gray-500 mt-1">
                                            <span className="font-semibold uppercase px-1.5 py-0.2 rounded bg-[#202025] text-gray-400">
                                                {(task.category || 'GENERAL').toLowerCase()}
                                            </span>
                                            <span className="flex items-center gap-1 font-medium">
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
