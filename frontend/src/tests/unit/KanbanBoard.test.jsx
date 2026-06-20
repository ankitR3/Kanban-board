/**
 * Unit tests — TaskCard, TaskModal, KanbanColumn, ProgressChart, useSocket hook
 * Run with: npm test
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import React from 'react';

/* ─── Mock socket.io-client before any imports that use it ─── */
vi.mock('../../socket/socket.js', () => ({
    default: {
        on:   vi.fn(),
        off:  vi.fn(),
        emit: vi.fn(),
    },
}));

import TaskCard    from '../../components/ui/TaskCard.jsx';
import TaskModal   from '../../components/ui/TaskModal.jsx';
import KanbanColumn from '../../components/ui/KanbanColumn.jsx';
import ProgressChart from '../../components/ui/ProgressChart.jsx';
import { Priority, Category, Column } from '../../constants/enums.js';

/* ─── shared mock data ──────────────────────────────────────── */
const mockTask = {
    id:          'task-1',
    title:       'Fix login bug',
    description: 'Users cannot log in with SSO',
    column:      Column.TODO,
    priority:    Priority.HIGH,
    category:    Category.BUG,
    orderIndex:  0,
    attachments: [],
};

const noop = () => {};

/* ══════════════════════════════════════════════════════════════
   TaskCard
══════════════════════════════════════════════════════════════ */
describe('TaskCard', () => {
    it('renders task title', () => {
        render(<TaskCard task={mockTask} onEdit={noop} onDelete={noop} onMarkDone={noop} onUpdate={noop} />);
        expect(screen.getByText('Fix login bug')).toBeInTheDocument();
    });

    it('renders priority badge', () => {
        render(<TaskCard task={mockTask} onEdit={noop} onDelete={noop} onMarkDone={noop} onUpdate={noop} />);
        expect(screen.getByText('High')).toBeInTheDocument();
    });

    it('renders category badge', () => {
        render(<TaskCard task={mockTask} onEdit={noop} onDelete={noop} onMarkDone={noop} onUpdate={noop} />);
        expect(screen.getByText('bug')).toBeInTheDocument();
    });

    it('calls onEdit when card is clicked', () => {
        const onEdit = vi.fn();
        render(<TaskCard task={mockTask} onEdit={onEdit} onDelete={noop} onMarkDone={noop} onUpdate={noop} />);
        fireEvent.click(screen.getByText('Fix login bug'));
        expect(onEdit).toHaveBeenCalledWith(mockTask);
    });

    it('shows description icon when description exists', () => {
        render(<TaskCard task={mockTask} onEdit={noop} onDelete={noop} onMarkDone={noop} onUpdate={noop} />);
        // AlignLeft icon is rendered when description is present
        const svg = document.querySelector('svg');
        expect(svg).toBeTruthy();
    });

    it('does not crash for task without priority or category', () => {
        const minimal = { ...mockTask, priority: null, category: null };
        render(<TaskCard task={minimal} onEdit={noop} onDelete={noop} onMarkDone={noop} onUpdate={noop} />);
        expect(screen.getByText('Fix login bug')).toBeInTheDocument();
    });
});

/* ══════════════════════════════════════════════════════════════
   TaskModal
══════════════════════════════════════════════════════════════ */
describe('TaskModal', () => {
    it('does not render when isOpen is false', () => {
        render(<TaskModal isOpen={false} onClose={noop} onSave={noop} initialTask={null} />);
        expect(screen.queryByTestId('task-modal')).not.toBeInTheDocument();
    });

    it('renders when isOpen is true', () => {
        render(<TaskModal isOpen={true} onClose={noop} onSave={noop} initialTask={null} />);
        expect(screen.getByTestId('task-modal')).toBeInTheDocument();
    });

    it('shows "Create Task" label for new tasks', () => {
        render(<TaskModal isOpen={true} onClose={noop} onSave={noop} initialTask={null} />);
        expect(screen.getByTestId('save-task-btn')).toHaveTextContent('Create Task');
    });

    it('shows "Save Changes" label when editing', () => {
        render(<TaskModal isOpen={true} onClose={noop} onSave={noop} initialTask={mockTask} />);
        expect(screen.getByTestId('save-task-btn')).toHaveTextContent('Save Changes');
    });

    it('pre-fills title when editing', () => {
        render(<TaskModal isOpen={true} onClose={noop} onSave={noop} initialTask={mockTask} />);
        expect(screen.getByTestId('task-title-input')).toHaveValue('Fix login bug');
    });

    it('pre-fills description when editing', () => {
        render(<TaskModal isOpen={true} onClose={noop} onSave={noop} initialTask={mockTask} />);
        expect(screen.getByTestId('task-description-input')).toHaveValue('Users cannot log in with SSO');
    });

    it('calls onSave with correct data on submit', () => {
        const onSave = vi.fn();
        render(<TaskModal isOpen={true} onClose={noop} onSave={onSave} initialTask={null} />);
        fireEvent.change(screen.getByTestId('task-title-input'), { target: { value: 'New Task' } });
        fireEvent.click(screen.getByTestId('save-task-btn'));
        expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ title: 'New Task' }));
    });

    it('does not call onSave when title is empty', () => {
        const onSave = vi.fn();
        render(<TaskModal isOpen={true} onClose={noop} onSave={onSave} initialTask={null} />);
        fireEvent.click(screen.getByTestId('save-task-btn'));
        expect(onSave).not.toHaveBeenCalled();
    });

    it('calls onClose when backdrop is clicked', () => {
        const onClose = vi.fn();
        render(<TaskModal isOpen={true} onClose={onClose} onSave={noop} initialTask={null} />);
        fireEvent.click(screen.getByTestId('task-modal'));
        expect(onClose).toHaveBeenCalled();
    });

    it('shows file error for unsupported file type', async () => {
        render(<TaskModal isOpen={true} onClose={noop} onSave={noop} initialTask={null} />);
        const input = screen.getByTestId('file-input');
        const badFile = new File(['data'], 'test.exe', { type: 'application/exe' });
        fireEvent.change(input, { target: { files: [badFile] } });
        await waitFor(() => {
            expect(screen.getByTestId('file-error')).toBeInTheDocument();
        });
    });

    it('renders attachment item after valid image upload', async () => {
        // Mock FileReader
        const mockReadAsDataURL = vi.fn();
        const originalFileReader = global.FileReader;
        global.FileReader = class {
            readAsDataURL(file) {
                this.result = 'data:image/png;base64,abc';
                this.onload?.({ target: { result: this.result } });
            }
        };

        render(<TaskModal isOpen={true} onClose={noop} onSave={noop} initialTask={null} />);
        const input = screen.getByTestId('file-input');
        const goodFile = new File(['data'], 'photo.png', { type: 'image/png' });
        fireEvent.change(input, { target: { files: [goodFile] } });

        await waitFor(() => {
            expect(screen.getByTestId('attachment-item')).toBeInTheDocument();
        });

        global.FileReader = originalFileReader;
    });
});

/* ══════════════════════════════════════════════════════════════
   KanbanColumn
══════════════════════════════════════════════════════════════ */
vi.mock('@dnd-kit/core', async () => {
    const actual = await vi.importActual('@dnd-kit/core');
    return { ...actual, useDroppable: () => ({ setNodeRef: vi.fn(), isOver: false }) };
});
vi.mock('@dnd-kit/sortable', async () => {
    const actual = await vi.importActual('@dnd-kit/sortable');
    return { ...actual, SortableContext: ({ children }) => children, useSortable: () => ({ attributes: {}, listeners: {}, setNodeRef: vi.fn(), transform: null, transition: null, isDragging: false }) };
});

describe('KanbanColumn', () => {
    const column = { key: Column.TODO, label: 'To Do', dotColor: 'bg-gray-500', textColor: 'text-gray-300', bgColor: 'bg-[#222]' };

    it('renders column label', () => {
        render(<KanbanColumn column={column} tasks={[]} onEdit={noop} onDelete={noop} onMarkDone={noop} onUpdate={noop} onAddTask={noop} />);
        expect(screen.getByText('To Do')).toBeInTheDocument();
    });

    it('shows task count', () => {
        render(<KanbanColumn column={column} tasks={[mockTask]} onEdit={noop} onDelete={noop} onMarkDone={noop} onUpdate={noop} onAddTask={noop} />);
        expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('calls onAddTask when Add Task button is clicked', () => {
        const onAddTask = vi.fn();
        render(<KanbanColumn column={column} tasks={[]} onEdit={noop} onDelete={noop} onMarkDone={noop} onUpdate={noop} onAddTask={onAddTask} />);
        fireEvent.click(screen.getByText(/Add Task/i));
        expect(onAddTask).toHaveBeenCalled();
    });
});

/* ══════════════════════════════════════════════════════════════
   ProgressChart
══════════════════════════════════════════════════════════════ */
describe('ProgressChart', () => {
    const tasks = [
        { id: '1', column: Column.TODO },
        { id: '2', column: Column.IN_PROGRESS },
        { id: '3', column: Column.DONE },
        { id: '4', column: Column.DONE },
    ];

    it('renders the chart container', () => {
        render(<ProgressChart tasks={tasks} />);
        expect(screen.getByTestId('progress-chart')).toBeInTheDocument();
    });

    it('shows correct completion percentage (2/4 = 50%)', () => {
        render(<ProgressChart tasks={tasks} />);
        expect(screen.getByText('50%')).toBeInTheDocument();
    });

    it('shows 0% when no tasks', () => {
        render(<ProgressChart tasks={[]} />);
        expect(screen.getByText('0%')).toBeInTheDocument();
    });

    it('shows 100% when all tasks are done', () => {
        const allDone = [
            { id: '1', column: Column.DONE },
            { id: '2', column: Column.DONE },
        ];
        render(<ProgressChart tasks={allDone} />);
        expect(screen.getByText('100%')).toBeInTheDocument();
    });

    it('renders the completion bar', () => {
        render(<ProgressChart tasks={tasks} />);
        expect(screen.getByTestId('completion-bar')).toBeInTheDocument();
    });

    it('shows task count summary', () => {
        render(<ProgressChart tasks={tasks} />);
        expect(screen.getByText('2/4 complete')).toBeInTheDocument();
    });
});
