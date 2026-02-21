import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Clock, ChevronDown, ChevronUp, MoreVertical, X } from 'lucide-react';
import type { Task } from '../../../services/taskService';

interface TaskCardProps {
    task: Task;
    onEdit: (task: Task) => void;
    onDelete: (id: string) => void;
}

const TaskCard = ({ task, onEdit, onDelete }: TaskCardProps) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({
        id: task._id,
        data: {
            type: 'Task',
            task,
        },
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
    };

    const getPriorityColor = (p: string) => {
        switch (p?.toLowerCase()) {
            case 'high': return 'bg-rose-100 text-rose-700 border-rose-200';
            case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'low': return 'bg-blue-100 text-blue-700 border-blue-200';
            default: return 'bg-gray-100 text-gray-600 border-gray-200';
        }
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return 'No Date';
        return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all group relative cursor-grab active:cursor-grabbing mb-3"
        >
            <div className="flex justify-between items-start mb-2">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                </span>
                <div className="flex items-center gap-1">
                    <button
                        onClick={(e) => { e.stopPropagation(); onEdit(task); }}
                        className="p-1 hover:bg-gray-100 rounded text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Edit Task"
                    >
                        <MoreVertical size={14} />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(task._id); }}
                        className="p-1 hover:bg-rose-50 rounded text-gray-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete Task"
                    >
                        <X size={14} />
                    </button>
                </div>
            </div>

            <h4 className="font-semibold text-gray-900 text-sm mb-1 leading-snug">{task.title}</h4>

            <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded">
                    {task.project}
                </span>
            </div>

            <div className="flex items-center justify-between mt-auto">
                <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-medium">
                    <Clock size={12} className="text-gray-400" />
                    {formatDate(task.dueDate)}
                </div>

                {task.assignedTo && task.assignedTo.name && (
                    <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-gray-400 font-medium">{task.assignedTo.name}</span>
                        <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-[10px] font-bold border border-indigo-100 overflow-hidden">
                            {task.assignedTo.name.charAt(0)}
                        </div>
                    </div>
                )}
            </div>

            {task.description && (
                <div className="mt-3 pt-3 border-t border-gray-50">
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
                        className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors uppercase tracking-tight"
                    >
                        {isExpanded ? <><ChevronUp size={12} /> Hide Details</> : <><ChevronDown size={12} /> View Details</>}
                    </button>

                    {isExpanded && (
                        <p className="mt-2 text-xs text-gray-600 leading-relaxed animate-fadeIn">
                            {task.description}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

export default TaskCard;
