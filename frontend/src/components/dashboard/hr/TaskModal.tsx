import { useState, useEffect } from 'react';
import { X, CheckCircle, Calendar, Tag, User, Layers } from 'lucide-react';
import SearchDropdown from '../../common/SearchDropdown';
import type { Task } from '../../../services/taskService';

interface TaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (taskData: any) => void;
    task?: Task | null;
    employees: any[];
}

const TaskModal = ({ isOpen, onClose, onSubmit, task, employees }: TaskModalProps) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        project: 'General',
        priority: 'medium',
        dueDate: new Date().toISOString().split('T')[0],
        assignedToEmployeeId: ''
    });

    useEffect(() => {
        if (task) {
            setFormData({
                title: task.title,
                description: task.description || '',
                project: task.project,
                priority: task.priority,
                dueDate: new Date(task.dueDate).toISOString().split('T')[0],
                assignedToEmployeeId: task.assignedTo?._id || ''
            });
        } else {
            setFormData({
                title: '',
                description: '',
                project: 'General',
                priority: 'medium',
                dueDate: new Date().toISOString().split('T')[0],
                assignedToEmployeeId: ''
            });
        }
    }, [task, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg p-0 shadow-2xl overflow-hidden animate-fadeIn">
                <div className="bg-indigo-600 px-6 py-4 flex justify-between items-center text-white">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <CheckCircle size={20} />
                        {task ? 'Edit Task' : 'Create New Task'}
                    </h3>
                    <button onClick={onClose} className="text-white/80 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div>
                        <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                            Task Title
                        </label>
                        <input
                            required
                            type="text"
                            placeholder="e.g. Complete Q3 Revenue Report"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm font-medium"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                            Description
                        </label>
                        <textarea
                            rows={3}
                            placeholder="Briefly describe the task objectives..."
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all resize-none"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                                <Layers size={14} className="text-gray-400" /> Project
                            </label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                value={formData.project}
                                onChange={e => setFormData({ ...formData, project: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                                <User size={14} className="text-gray-400" /> Assign To
                            </label>
                            <SearchDropdown
                                items={employees}
                                onSelect={(e) => setFormData({ ...formData, assignedToEmployeeId: e._id })}
                                placeholder="Search employees..."
                                searchKey="name"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                                <Tag size={14} className="text-gray-400" /> Priority
                            </label>
                            <select
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                value={formData.priority}
                                onChange={e => setFormData({ ...formData, priority: e.target.value })}
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>
                        <div>
                            <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                                <Calendar size={14} className="text-gray-400" /> Due Date
                            </label>
                            <input
                                required
                                type="date"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                value={formData.dueDate}
                                onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 active:scale-[0.98]"
                        >
                            {task ? 'Update Task' : 'Assign Task'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TaskModal;
