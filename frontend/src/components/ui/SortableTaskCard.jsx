import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import TaskCard from './TaskCard.jsx';

export default function SortableTaskCard({ task, onEdit, onDelete, onMarkDone, onUpdate }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: task.id,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        cursor: isDragging ? 'grabbing' : 'grab',
    };

    return (
        // The whole card is the drag surface. activationConstraint: { distance: 5 }
        // on the PointerSensor means you must move 5px before drag activates,
        // so normal clicks on dropdowns / buttons still fire as expected.
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <TaskCard
                task={task}
                onEdit={onEdit}
                onDelete={onDelete}
                onMarkDone={onMarkDone}
                onUpdate={onUpdate}
            />
        </div>
    );
}