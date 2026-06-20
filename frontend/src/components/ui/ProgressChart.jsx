import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    Cell, PieChart, Pie, Legend,
} from 'recharts';
import { Column } from '../../constants/enums.js';

/* ── colour palette matching the board columns ── */
const COLUMN_META = {
    [Column.TODO]:        { label: 'To Do',       color: '#6b7280' },
    [Column.IN_PROGRESS]: { label: 'In Progress',  color: '#f59e0b' },
    [Column.DONE]:        { label: 'Done',          color: '#22c55e' },
};

/* ── shared tooltip style ── */
const tooltipStyle = {
    contentStyle: { background: '#1e1e1e', border: '1px solid #333', borderRadius: 8, color: '#e5e7eb' },
    itemStyle:    { color: '#e5e7eb' },
    cursor:       { fill: 'rgba(255,255,255,0.04)' },
};

export default function ProgressChart({ tasks }) {
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

    const pieData = [
        { name: 'Done',         value: doneCount,  color: '#22c55e' },
        { name: 'Not Complete', value: otherCount, color: '#374151' },
    ];

    return (
        <div
            data-testid="progress-chart"
            className="bg-[#141414] border border-[#1f1f1f] rounded-xl p-5 flex flex-col gap-6"
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-white font-semibold text-sm">Task Progress</h3>
                <span className="text-xs text-gray-500">
                    {doneCount}/{total} complete
                </span>
            </div>

            {/* Completion progress bar */}
            <div>
                <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-gray-400">Completion</span>
                    <span className="text-xs font-semibold text-green-400">{donePct}%</span>
                </div>
                <div className="w-full bg-[#2a2a2a] rounded-full h-2 overflow-hidden">
                    <div
                        data-testid="completion-bar"
                        className="h-2 bg-green-500 rounded-full transition-all duration-500"
                        style={{ width: `${donePct}%` }}
                    />
                </div>
            </div>

            {/* Bar chart — tasks per column */}
            <div>
                <p className="text-xs text-gray-500 mb-3">Tasks per column</p>
                <ResponsiveContainer width="100%" height={120}>
                    <BarChart data={barData} barCategoryGap="30%">
                        <XAxis
                            dataKey="name"
                            tick={{ fill: '#9ca3af', fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            allowDecimals={false}
                            tick={{ fill: '#6b7280', fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                            width={20}
                        />
                        <Tooltip {...tooltipStyle} />
                        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                            {barData.map((entry) => (
                                <Cell key={entry.name} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Pie chart — done vs not done */}
            <div>
                <p className="text-xs text-gray-500 mb-1">Done vs Not Complete</p>
                <ResponsiveContainer width="100%" height={140}>
                    <PieChart>
                        <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={35}
                            outerRadius={55}
                            paddingAngle={3}
                            dataKey="value"
                        >
                            {pieData.map((entry) => (
                                <Cell key={entry.name} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip {...tooltipStyle} />
                        <Legend
                            iconType="circle"
                            iconSize={8}
                            wrapperStyle={{ fontSize: 11, color: '#9ca3af' }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
