import { useState, useEffect, useMemo } from 'react';
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import type {
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
    Plus, RefreshCw, FolderKanban,
    StickyNote, X, Save
} from 'lucide-react';
import { API_BASE_URL } from '../../../config';
import SearchDropdown from '../../common/SearchDropdown';
import { taskService } from '../../../services/taskService';
import type { Task } from '../../../services/taskService';
import TaskCard from './TaskCard';
import TaskModal from './TaskModal';
import { useRealTimeSync } from '../../../hooks/useRealTimeSync';

// --- Types ---
type BoardTab = 'projects' | 'employee_tasks' | 'personal_tasks';
const COLUMNS = [
    { id: 'assigned', title: 'Assigned', color: 'rose', bg: 'bg-rose-50', border: 'border-rose-100' },
    { id: 'in_progress', title: 'In Progress', color: 'amber', bg: 'bg-amber-50', border: 'border-amber-100' },
    { id: 'review', title: 'Review', color: 'fuchsia', bg: 'bg-fuchsia-50', border: 'border-fuchsia-100' },
    { id: 'completed', title: 'Completed', color: 'emerald', bg: 'bg-emerald-50', border: 'border-emerald-100' },
] as const;

const OperationsBoard = ({ currentUser }: { currentUser?: any }) => {
    // Data State
    const [tasks, setTasks] = useState<Task[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // UI State
    const [activeTab, setActiveTab] = useState<BoardTab>('employee_tasks');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterPriority, setFilterPriority] = useState<string>('All');
    const [activeTask, setActiveTask] = useState<Task | null>(null);
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);

    // Notepad State
    const [showNotepad, setShowNotepad] = useState(false);
    const [notepadContent, setNotepadContent] = useState(localStorage.getItem('hr_ops_notes') || '');

    // DND Sensors
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    // --- Data Fetching ---
    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [taskRes, empRes] = await Promise.all([
                taskService.getAllTasks(),
                fetch(`${API_BASE_URL}/hr/employees`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                }).then(res => res.json())
            ]);

            if (taskRes.success) setTasks(taskRes.tasks);
            if (empRes.success) setEmployees(empRes.employees);
        } catch (err) {
            setError('Failed to sync board data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Real-time Database Synchronization
    useRealTimeSync(['tasks', 'employees'], fetchData);

    // --- Filtering Logic ---
    const filteredTasks = useMemo(() => {
        let result = tasks;

        // Tab Filtering
        if (activeTab === 'personal_tasks' && currentUser) {
            result = result.filter(t => t.assignedTo?._id === currentUser._id || t.createdBy === currentUser._id);
        }

        // Search
        if (searchTerm) {
            result = result.filter(t =>
                t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                t.assignedTo?.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Priority Filter
        if (filterPriority !== 'All') {
            result = result.filter(t => t.priority.toLowerCase() === filterPriority.toLowerCase());
        }

        return result;
    }, [tasks, activeTab, searchTerm, filterPriority, currentUser]);

    // --- DND Handlers ---
    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const task = tasks.find(t => t._id === active.id);
        if (task) setActiveTask(task);
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        const isActiveATask = active.data.current?.type === 'Task';
        const isOverAColumn = COLUMNS.some(col => col.id === overId);

        if (isActiveATask && isOverAColumn) {
            setTasks((prev) => {
                const activeIndex = prev.findIndex((t) => t._id === activeId);
                const updatedTasks = [...prev];
                updatedTasks[activeIndex] = { ...updatedTasks[activeIndex], status: overId as any };
                return updatedTasks;
            });
        }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveTask(null);

        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        const task = tasks.find(t => t._id === activeId);
        if (!task) return;

        const newStatus = COLUMNS.some(col => col.id === overId) ? overId : task.status;

        if (newStatus !== task.status) {
            try {
                await taskService.updateTaskStatus(activeId as string, newStatus as string);
                setTasks(prev => prev.map(t => t._id === activeId ? { ...t, status: newStatus as any } : t));
            } catch (err) {
                setError('Failed to update status.');
                fetchData();
            }
        }
    };

    // --- Actions ---
    const handleCreateOrUpdateTask = async (taskData: any) => {
        try {
            if (editingTask) {
                const res = await taskService.updateTask(editingTask._id, taskData);
                if (res.success) fetchData();
            } else {
                const res = await taskService.createTask(taskData);
                if (res.success) fetchData();
            }
            setShowTaskModal(false);
            setEditingTask(null);
        } catch (err) {
            alert('Operation failed.');
        }
    };

    const handleDeleteTask = async (id: string) => {
        if (!window.confirm('Delete this task?')) return;
        try {
            await taskService.deleteTask(id);
            fetchData();
        } catch (err) { alert('Delete failed.'); }
    };

    const handleSaveNotes = () => {
        localStorage.setItem('hr_ops_notes', notepadContent);
        // show toast?
    };

    // --- Sub-components ---
    const Column = ({ col, items }: { col: typeof COLUMNS[number], items: Task[] }) => (
        <div className={`flex flex-col h-full ${col.bg} rounded-2xl border ${col.border} p-4 min-w-[300px]`}>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full bg-${col.color}-500 shadow-sm shadow-${col.color}-200`} />
                    <h3 className="font-extrabold text-gray-800 text-sm tracking-tight uppercase">{col.title}</h3>
                    <span className={`text-[10px] font-black bg-white px-2 py-0.5 rounded-full border ${col.border} text-${col.color}-600 shadow-sm`}>
                        {items.length}
                    </span>
                </div>
            </div>

            <SortableContext id={col.id} items={items.map(i => i._id)} strategy={verticalListSortingStrategy}>
                <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                    {items.length === 0 ? (
                        <div className="h-24 flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-xl text-gray-300 text-[10px] font-medium uppercase tracking-widest gap-2">
                            Empty State
                        </div>
                    ) : (
                        items.map(task => (
                            <TaskCard
                                key={task._id}
                                task={task}
                                onEdit={(t) => { setEditingTask(t); setShowTaskModal(true); }}
                                onDelete={handleDeleteTask}
                            />
                        ))
                    )}
                </div>
            </SortableContext>
        </div>
    );

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col gap-6 relative p-1 mt-[-20px]">
            {/* Header Area */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2 italic">
                        <FolderKanban className="text-indigo-600 w-8 h-8" /> OPERATIONS BOARD
                    </h1>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Real-time Task Orchestration</p>
                </div>

                <div className="flex flex-wrap items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-gray-100 w-full xl:w-auto">
                    {error && (
                        <div className="absolute top-24 left-1/2 -translate-x-1/2 bg-rose-50 border border-rose-200 text-rose-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 animate-fadeIn z-50">
                            <X size={14} className="cursor-pointer" onClick={() => setError(null)} /> {error}
                        </div>
                    )}
                    {/* Tabs */}
                    <div className="flex bg-gray-50 p-1 rounded-xl">
                        {(['employee_tasks', 'personal_tasks'] as const).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-tighter transition-all ${activeTab === tab ? 'bg-white text-indigo-600 shadow-sm translate-y-[-1px]' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                {tab.replace('_', ' ')}
                            </button>
                        ))}
                    </div>

                    <div className="h-6 w-[1px] bg-gray-100 mx-1 hidden sm:block" />

                    {/* Search */}
                    <div className="flex-1 sm:min-w-[250px]">
                        <SearchDropdown
                            items={tasks}
                            onSelect={(t) => {
                                setSearchTerm(t.title);
                                setEditingTask(t);
                                setShowTaskModal(true);
                            }}
                            placeholder="Find task or teammate..."
                            searchKey="title"
                            labelKey="title"
                            iconType="project"
                        />
                    </div>

                    {/* Filter */}
                    <select
                        className="bg-gray-50 border-none rounded-xl text-xs font-bold text-gray-600 py-2 px-3 focus:ring-2 focus:ring-indigo-500/20"
                        value={filterPriority}
                        onChange={(e) => setFilterPriority(e.target.value)}
                    >
                        <option>All Priorities</option>
                        <option>High</option>
                        <option>Medium</option>
                        <option>Low</option>
                    </select>

                    <button
                        onClick={fetchData}
                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                    >
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>

                    <button
                        onClick={() => { setEditingTask(null); setShowTaskModal(true); }}
                        className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/30 font-black text-xs uppercase tracking-widest active:scale-95"
                    >
                        <Plus size={16} strokeWidth={3} /> Assign New
                    </button>
                </div>
            </div>

            {/* Board Container */}
            <div className="flex-1 overflow-x-auto pb-4 custom-scrollbar">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCorners}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDragEnd={handleDragEnd}
                >
                    <div className="flex gap-6 h-full min-w-max pb-2">
                        {COLUMNS.map(col => (
                            <Column
                                key={col.id}
                                col={col}
                                items={filteredTasks.filter(t => t.status === col.id)}
                            />
                        ))}
                    </div>

                    <DragOverlay dropAnimation={{
                        sideEffects: defaultDropAnimationSideEffects({
                            styles: {
                                active: {
                                    opacity: '0.5',
                                },
                            },
                        }),
                    }}>
                        {activeTask ? (
                            <TaskCard
                                task={activeTask}
                                onEdit={() => { }}
                                onDelete={() => { }}
                            />
                        ) : null}
                    </DragOverlay>
                </DndContext>
            </div>

            {/* Notepad Widget */}
            <div className="fixed bottom-10 right-10 z-[100]">
                {!showNotepad ? (
                    <button
                        onClick={() => setShowNotepad(true)}
                        className="w-16 h-16 bg-amber-400 text-amber-900 rounded-2xl shadow-2xl hover:bg-amber-300 transition-all transform hover:scale-110 hover:rotate-3 flex items-center justify-center border-4 border-white group"
                    >
                        <StickyNote size={28} className="group-hover:animate-bounce" />
                    </button>
                ) : (
                    <div className="w-80 bg-amber-50 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] border-2 border-amber-200 overflow-hidden transform transition-all animate-slideUp origin-bottom-right">
                        <div className="bg-amber-200 px-6 py-4 flex justify-between items-center">
                            <div className="flex items-center gap-2 font-black text-amber-900 text-sm uppercase tracking-tighter italic">
                                <StickyNote size={18} /> Quick Ops Notes
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => { handleSaveNotes(); setShowNotepad(false); }} className="p-2 hover:bg-white/40 rounded-xl transition-colors">
                                    <Save size={16} className="text-amber-900" />
                                </button>
                                <button onClick={() => setShowNotepad(false)} className="p-2 hover:bg-white/40 rounded-xl transition-colors text-amber-900">
                                    <X size={16} />
                                </button>
                            </div>
                        </div>
                        <div className="p-4">
                            <textarea
                                className="w-full h-64 bg-amber-50 rounded-2xl p-4 text-sm text-amber-900/80 resize-none outline-none font-medium leading-relaxed placeholder:text-amber-700/30"
                                placeholder="Brainstorm ideas, keep track of dependencies..."
                                value={notepadContent}
                                onChange={(e) => setNotepadContent(e.target.value)}
                            />
                        </div>
                        <div className="px-6 py-3 bg-amber-200/30 text-[10px] text-amber-700 font-black uppercase tracking-widest text-right italic">
                            Local Memory Persistent
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            <TaskModal
                isOpen={showTaskModal}
                onClose={() => { setShowTaskModal(false); setEditingTask(null); }}
                onSubmit={handleCreateOrUpdateTask}
                task={editingTask}
                employees={employees}
            />

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { 
                    background: #e2e8f0; 
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
                
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }

                @keyframes slideUp {
                    from { opacity: 0; transform: scale(0.9) translateY(40px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
                .animate-slideUp {
                    animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                }
            `}</style>
        </div>
    );
};

export default OperationsBoard;
