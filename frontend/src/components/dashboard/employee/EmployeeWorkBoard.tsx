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
    RefreshCw, FolderKanban,
    Search, StickyNote, X, Save
} from 'lucide-react';
import { taskService } from '../../../services/taskService';
import type { Task } from '../../../services/taskService';
import TaskCard from '../hr/TaskCard';
import TaskDetailsModal from './TaskDetailsModal';
import { useRealTimeSync } from '../../../hooks/useRealTimeSync';

// --- Types ---
const COLUMNS = [
    { id: 'assigned', title: 'Assigned', color: 'indigo' },
    { id: 'in_progress', title: 'In Progress', color: 'blue' },
    { id: 'review', title: 'Review', color: 'fuchsia' },
    { id: 'completed', title: 'Completed', color: 'emerald' },
] as const;

const EmployeeWorkBoard = ({ currentUser }: { currentUser: any }) => {
    // Data State
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // UI State
    const [searchTerm, setSearchTerm] = useState('');
    const [filterPriority, setFilterPriority] = useState<string>('All');
    const [activeTask, setActiveTask] = useState<Task | null>(null);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    // Notepad State
    const [showNotepad, setShowNotepad] = useState(false);
    const [notepadContent, setNotepadContent] = useState(localStorage.getItem('employee_work_notes') || '');

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
            const res = await taskService.getMyTasks();
            if (res.success) {
                setTasks(res.tasks);
            } else {
                setError(res.message || 'Failed to fetch tasks.');
            }
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
    useRealTimeSync(['tasks'], fetchData);

    // --- Filtering Logic ---
    const filteredTasks = useMemo(() => {
        let result = tasks;

        // Search
        if (searchTerm) {
            result = result.filter(t =>
                (t.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (t.project || '').toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Priority Filter
        if (filterPriority !== 'All') {
            result = result.filter(t => t.priority.toLowerCase() === filterPriority.toLowerCase());
        }

        return result;
    }, [tasks, searchTerm, filterPriority]);

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

    const handleSaveNotes = () => {
        localStorage.setItem('employee_work_notes', notepadContent);
    };

    // --- Sub-components ---
    const Column = ({ col, items }: { col: typeof COLUMNS[number], items: Task[] }) => (
        <div className={`flex flex-col h-full bg-gray-50/50 rounded-2xl border border-gray-100 p-4 min-w-[300px]`}>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full bg-${col.color}-500 shadow-sm shadow-${col.color}-200`} />
                    <h3 className="font-bold text-gray-800 text-sm tracking-tight">{col.title}</h3>
                    <span className="text-[10px] font-bold bg-white px-2 py-0.5 rounded-full border border-gray-100 text-gray-500 shadow-sm">
                        {items.length}
                    </span>
                </div>
            </div>

            <SortableContext id={col.id} items={items.map(i => i._id)} strategy={verticalListSortingStrategy}>
                <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                    {items.length === 0 ? (
                        <div className="h-24 flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-xl text-gray-300 text-[10px] font-medium uppercase tracking-widest gap-2">
                            No Tasks
                        </div>
                    ) : (
                        items.map(task => (
                            <div key={task._id} onClick={() => { setSelectedTask(task); setShowDetailsModal(true); }}>
                                <TaskCard
                                    task={task}
                                    onEdit={() => { setSelectedTask(task); setShowDetailsModal(true); }}
                                    onDelete={() => { }} // Restricted
                                />
                            </div>
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
                        <FolderKanban className="text-indigo-600 w-8 h-8" /> MY WORK BOARD
                    </h1>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Manage your professional progress</p>
                </div>

                <div className="flex flex-wrap items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-gray-100 w-full xl:w-auto">
                    {error && (
                        <div className="absolute top-24 left-1/2 -translate-x-1/2 bg-rose-50 border border-rose-200 text-rose-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 animate-fadeIn z-50">
                            <X size={14} className="cursor-pointer" onClick={() => setError(null)} /> {error}
                        </div>
                    )}

                    {/* Search */}
                    <div className="relative flex-1 sm:min-w-[250px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                        <input
                            type="text"
                            placeholder="Find task or project..."
                            className="w-full pl-9 pr-4 py-2 bg-gray-50 border-none rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500/20 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
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

                    <div className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-[10px] font-black uppercase tracking-widest border border-indigo-100 italic">
                        Logged in as: {currentUser?.name}
                    </div>
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
                                <StickyNote size={18} /> Quick Notes
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
                                placeholder="Jot down tasks, dependencies..."
                                value={notepadContent}
                                onChange={(e) => setNotepadContent(e.target.value)}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            {selectedTask && (
                <TaskDetailsModal
                    isOpen={showDetailsModal}
                    onClose={() => { setShowDetailsModal(false); setSelectedTask(null); }}
                    task={selectedTask}
                    onTaskUpdate={(updatedTask: Task) => {
                        setTasks(prev => prev.map(t => t._id === updatedTask._id ? updatedTask : t));
                    }}
                />
            )}

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

export default EmployeeWorkBoard;
