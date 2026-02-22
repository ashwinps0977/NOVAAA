import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Clock, ChevronDown, ChevronUp, MoreVertical, X, FileText, Download, CheckCircle2, Paperclip } from 'lucide-react';
import type { Task } from '../../../services/taskService';
import { API_BASE_URL } from '../../../config';

interface TaskCardProps {
    task: Task;
    onEdit: (task: Task) => void;
    onDelete: (id: string) => void;
    onStatusUpdate?: (id: string, status: string) => void;
}

const TaskCard = ({ task, onEdit, onDelete, onStatusUpdate }: TaskCardProps) => {
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

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'assigned': return 'bg-rose-50 border-rose-200 text-rose-700';
            case 'in_progress': return 'bg-amber-50 border-amber-200 text-amber-700';
            case 'review': return 'bg-fuchsia-50 border-fuchsia-200 text-fuchsia-700';
            case 'completed': return 'bg-emerald-50 border-emerald-200 text-emerald-700';
            default: return 'bg-white border-gray-100 text-gray-700';
        }
    };

    const statusStyle = getStatusStyles(task.status);

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

    const getFileName = (url: string) => {
        const parts = url.split('/');
        const fullName = parts[parts.length - 1];
        return fullName.split('-').slice(2).join('-') || fullName;
    };

    const handleDownload = (e: React.MouseEvent, url: string) => {
        e.stopPropagation();
        const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}/${url.startsWith('/') ? url.slice(1) : url}`;
        window.open(fullUrl, '_blank');
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`p-4 rounded-xl shadow-sm border hover:shadow-md transition-all group relative cursor-grab active:cursor-grabbing mb-3 ${statusStyle}`}
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
                {task.status === 'in_progress' && (
                    <div className="flex-1 ml-4 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-400 rounded-full animate-pulse" style={{ width: '45%' }}></div>
                    </div>
                )}
                {task.attachments && task.attachments.length > 0 && (
                    <div className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full ml-auto">
                        <Paperclip size={10} />
                        {task.attachments.length}
                    </div>
                )}
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
                        <div className="mt-3 space-y-3 animate-fadeIn">
                            <p className="text-xs text-gray-600 leading-relaxed">
                                {task.description}
                            </p>

                            {task.attachments && task.attachments.length > 0 && (
                                <div className="space-y-2">
                                    <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Attachments</h5>
                                    <div className="space-y-1">
                                        {task.attachments.map((url, i) => (
                                            <div key={i} className="flex items-center justify-between p-2 bg-white rounded-lg border border-gray-100 group/file">
                                                <div className="flex items-center gap-2 overflow-hidden">
                                                    <FileText size={12} className="text-indigo-500" />
                                                    <span className="text-[10px] font-bold text-gray-600 truncate max-w-[120px]" title={getFileName(url)}>
                                                        {getFileName(url)}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={(e) => handleDownload(e, url)}
                                                    className="p-1 hover:bg-indigo-50 rounded text-gray-400 hover:text-indigo-600 transition-colors"
                                                >
                                                    <Download size={12} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {task.status === 'review' && onStatusUpdate && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); onStatusUpdate(task._id, 'completed'); }}
                                    className="w-full mt-2 py-2 bg-emerald-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 active:scale-95 flex items-center justify-center gap-2"
                                >
                                    <CheckCircle2 size={12} /> Mark as Completed
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default TaskCard;
