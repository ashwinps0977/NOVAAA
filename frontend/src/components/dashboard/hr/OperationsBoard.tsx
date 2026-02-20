import { useState, useEffect, useRef } from 'react';
import {
    Plus, CheckCircle, Clock,
    RefreshCw, AlertCircle, ChevronDown, Check, FolderKanban,
    StickyNote, X, Save
} from 'lucide-react';

// ─── Types & Interfaces ──────────────────────────────────────────────────────────

interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
}

interface Project {
    _id: string;
    title: string;
    description: string;
    status: 'Assigned' | 'In Progress' | 'Review' | 'Completed';
    priority: 'Low' | 'Medium' | 'High';
    deadline: string;
    assignedTo?: { _id: string; name: string; position?: string };
    completionPercentage?: number;
    role?: string;
}

interface Task {
    _id: string;
    title: string;
    description?: string;
    status: 'In Progress' | 'Review' | 'Completed';
    priority: 'Low' | 'Medium' | 'High';
    due: string; // or deadline
    assignedTo?: { _id: string; name: string };
    createdBy?: { _id: string; name: string };
    project?: string;
}

type BoardTab = 'projects' | 'employee_tasks' | 'personal_tasks';

const COLUMNS = ['Assigned', 'In Progress', 'Review', 'Completed'] as const;

// ─── Helpers ─────────────────────────────────────────────────────────────────────

const API_BASE = 'http://localhost:5000/api';

const getHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token')}`,
});

const formatDate = (dateStr: string) => {
    if (!dateStr) return 'No Date';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const getPriorityColor = (p: string) => {
    switch (p?.toLowerCase()) {
        case 'high': return 'bg-rose-100 text-rose-700 border-rose-200';
        case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200';
        case 'low': return 'bg-blue-100 text-blue-700 border-blue-200';
        default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
};

const getColumnColor = (s: string) => {
    // Opacity handled via bg-opacity or rgba in style
    switch (s) {
        case 'Assigned': return { bg: 'rgba(224, 231, 255, 0.65)', border: 'border-indigo-200', text: 'text-indigo-800', dot: 'bg-indigo-500' }; // Indigo
        case 'In Progress': return { bg: 'rgba(219, 234, 254, 0.65)', border: 'border-blue-200', text: 'text-blue-800', dot: 'bg-blue-500' }; // Blue
        case 'Review': return { bg: 'rgba(250, 232, 255, 0.65)', border: 'border-fuchsia-200', text: 'text-fuchsia-800', dot: 'bg-fuchsia-500' }; // Fuchsia
        case 'Completed': return { bg: 'rgba(209, 250, 229, 0.65)', border: 'border-emerald-200', text: 'text-emerald-800', dot: 'bg-emerald-500' }; // Emerald
        default: return { bg: 'rgba(243, 244, 246, 0.65)', border: 'border-gray-200', text: 'text-gray-800', dot: 'bg-gray-400' };
    }
};

// ─── Component ───────────────────────────────────────────────────────────────────

interface OperationsBoardProps {
    currentUser?: User;
}

const OperationsBoard = ({ currentUser }: OperationsBoardProps) => {
    const [activeTab, setActiveTab] = useState<BoardTab>('projects');

    // Data
    const [projects, setProjects] = useState<Project[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Modals
    const [showProjectModal, setShowProjectModal] = useState(false);
    const [showTaskModal, setShowTaskModal] = useState(false);

    // Notepad
    const [showNotepad, setShowNotepad] = useState(false);
    const [notepadContent, setNotepadContent] = useState('');
    const notepadRef = useRef<HTMLTextAreaElement>(null);

    // Forms
    const [newProject, setNewProject] = useState({
        title: '', description: '', role: '', assignedToEmployeeId: '', deadline: '', priority: 'Medium'
    });
    const [newTask, setNewTask] = useState({
        title: '', project: 'General', priority: 'Medium', due: '', assignedToEmployeeId: ''
    });

    // ─── Fetch Data ────────────────────────────────────────────────────────────────

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const headers = getHeaders();
            const [projRes, taskRes, empRes] = await Promise.all([
                fetch(`${API_BASE}/projects`, { headers }),
                fetch(`${API_BASE}/tasks`, { headers }),
                fetch(`${API_BASE}/hr/employees`, { headers })
            ]);

            const projData = await projRes.json();
            const taskData = await taskRes.json();
            const empData = await empRes.json();

            if (projData.success !== false) setProjects(projData.projects || projData.data || []);

            let allTasks = [];
            if (taskData.success !== false) {
                allTasks = taskData.tasks || taskData.data || [];
            }
            setTasks(allTasks);

            if (empData.success !== false) setEmployees(empData.employees || []);

        } catch (err) {
            console.error('Board data fetch error:', err);
            setError('Some data failed to load. Please refresh.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // Load notepad content
        const savedNote = localStorage.getItem('hr_operations_notepad');
        if (savedNote) setNotepadContent(savedNote);
    }, []);

    // ─── Actions ───────────────────────────────────────────────────────────────────

    const handleUpdateStatus = async (id: string, newStatus: string, type: 'project' | 'task') => {
        if (type === 'project') {
            setProjects(prev => prev.map(p => p._id === id ? { ...p, status: newStatus as any } : p));
            try {
                await fetch(`${API_BASE}/projects/${id}/status`, {
                    method: 'PUT', headers: getHeaders(),
                    body: JSON.stringify({ status: newStatus })
                });
            } catch (e) {
                console.error('Update status failed', e);
                fetchData();
            }
        } else {
            setTasks(prev => prev.map(t => t._id === id ? { ...t, status: newStatus as any } : t));
            try {
                await fetch(`${API_BASE}/tasks/${id}`, {
                    method: 'PUT', headers: getHeaders(),
                    body: JSON.stringify({ status: newStatus })
                });
            } catch (e) {
                console.error('Update status failed', e);
                fetchData();
            }
        }
    };

    const handleCreateProject = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_BASE}/projects`, {
                method: 'POST', headers: getHeaders(),
                body: JSON.stringify(newProject)
            });
            if (res.ok) {
                setShowProjectModal(false);
                setNewProject({ title: '', description: '', role: '', assignedToEmployeeId: '', deadline: '', priority: 'Medium' });
                fetchData();
            } else {
                alert('Failed to create project');
            }
        } catch (e) { console.error(e); }
    };

    const handleCreateTask = async (e: React.FormEvent, isPersonal: boolean) => {
        e.preventDefault();
        try {
            const payload = { ...newTask };
            if (isPersonal) {
                delete (payload as any).assignedToEmployeeId;
            }

            const res = await fetch(`${API_BASE}/tasks`, {
                method: 'POST', headers: getHeaders(),
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                setShowTaskModal(false);
                setNewTask({ title: '', project: 'General', priority: 'Medium', due: '', assignedToEmployeeId: '' });
                fetchData();
            } else {
                alert('Failed to create task');
            }
        } catch (e) { console.error(e); }
    };

    const handleSaveNotepad = () => {
        localStorage.setItem('hr_operations_notepad', notepadContent);
        // Visual feedback could be added here
    };

    // ─── Filtering ─────────────────────────────────────────────────────────────────

    const getBoardData = () => {
        switch (activeTab) {
            case 'projects':
                return projects;
            case 'employee_tasks':
                return tasks.filter(t => t.assignedTo && typeof t.assignedTo === 'object');
            case 'personal_tasks':
                return tasks.filter(t => !t.assignedTo || (currentUser && t.createdBy?._id === currentUser._id && !t.assignedTo));
            default: return [];
        }
    };

    const boardItems = getBoardData();

    // ─── Render ────────────────────────────────────────────────────────────────────

    return (
        <div className="space-y-4 h-[calc(100vh-140px)] flex flex-col relative">
            {/* Header & Controls - Reduced padding for better fit */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 px-1">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <FolderKanban className="text-indigo-600 w-6 h-6" /> Operations Board
                    </h1>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                        <button
                            onClick={() => setActiveTab('projects')}
                            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${activeTab === 'projects' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >Projects</button>
                        <button
                            onClick={() => setActiveTab('employee_tasks')}
                            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${activeTab === 'employee_tasks' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >Empl. Tasks</button>
                        <button
                            onClick={() => setActiveTab('personal_tasks')}
                            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${activeTab === 'personal_tasks' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >My Tasks</button>
                    </div>

                    <button
                        onClick={fetchData}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Refresh Board"
                    >
                        <RefreshCw size={16} />
                    </button>

                    {activeTab === 'projects' && (
                        <button onClick={() => setShowProjectModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm font-medium text-xs">
                            <Plus size={14} /> New Project
                        </button>
                    )}
                    {activeTab === 'personal_tasks' && (
                        <button onClick={() => setShowTaskModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm font-medium text-xs">
                            <Plus size={14} /> Personal Task
                        </button>
                    )}
                    {activeTab === 'employee_tasks' && (
                        <button onClick={() => setShowTaskModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm font-medium text-xs">
                            <Plus size={14} /> Assign Task
                        </button>
                    )}
                </div>
            </div>

            {/* Error State */}
            {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-2 rounded-lg flex items-center gap-2 text-sm">
                    <AlertCircle size={16} /> {error}
                </div>
            )}

            {/* Kanban Board - Grid Layout to fit screen */}
            {loading ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <div className="flex-1 grid grid-cols-4 gap-4 h-full overflow-hidden pb-2 pr-1">
                    {COLUMNS.map(col => {
                        const itemsInCol = boardItems.filter((item: any) =>
                            (item.status || 'Assigned') === col
                        );
                        const colors = getColumnColor(col);

                        return (
                            <div key={col}
                                className={`flex flex-col h-full rounded-xl border ${colors.border}`}
                                style={{ backgroundColor: colors.bg }}
                            >
                                {/* Column Header */}
                                <div className="p-3 border-b border-gray-100/20 flex items-center justify-between backdrop-blur-sm rounded-t-xl bg-white/20">
                                    <h3 className={`font-bold text-sm flex items-center gap-2 ${colors.text}`}>
                                        <div className={`w-2.5 h-2.5 rounded-full ${colors.dot}`} />
                                        {col}
                                    </h3>
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold bg-white/40 ${colors.text}`}>
                                        {itemsInCol.length}
                                    </span>
                                </div>

                                {/* Cards Container - Scrollable Vertical */}
                                <div className="flex-1 overflow-y-auto p-2 space-y-2 scrollbar-hide">
                                    {itemsInCol.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center text-gray-400/60 text-xs italic gap-2">
                                            <div className="p-3 bg-white/30 rounded-full">
                                                <FolderKanban size={24} className="opacity-50" />
                                            </div>
                                            <span>No items</span>
                                        </div>
                                    ) : (
                                        itemsInCol.map((item: any) => (
                                            <div key={item._id} className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all group relative cursor-pointer">
                                                {/* Card Content */}
                                                <div className="mb-1.5 flex justify-between items-start">
                                                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${getPriorityColor(item.priority)}`}>
                                                        {item.priority || 'Normal'}
                                                    </span>
                                                </div>

                                                <h4 className="font-semibold text-gray-800 text-sm mb-1 leading-snug">{item.title}</h4>

                                                {activeTab === 'projects' && item.description && (
                                                    <p className="text-[10px] text-gray-500 mb-2 line-clamp-2">{item.description}</p>
                                                )}

                                                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
                                                    <div className="flex items-center gap-1 text-[10px] text-gray-400 font-medium">
                                                        <Clock size={10} />
                                                        {formatDate(item.deadline || item.due)}
                                                    </div>

                                                    {/* Assignee Avatar */}
                                                    {(item.assignedTo || item.assignedToEmployeeId) && (
                                                        <div className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-[9px] font-bold border border-indigo-100">
                                                            {typeof item.assignedTo === 'object' ? item.assignedTo.name.charAt(0) : 'U'}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Status Changer */}
                                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <div className="relative group/menu">
                                                        <button className="p-1 hover:bg-gray-100 rounded text-gray-400">
                                                            <ChevronDown size={14} />
                                                        </button>
                                                        <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 shadow-xl rounded-lg py-1 w-32 z-10 hidden group-hover/menu:block">
                                                            {COLUMNS.map(s => (
                                                                <button
                                                                    key={s}
                                                                    onClick={() => handleUpdateStatus(item._id, s, activeTab === 'projects' ? 'project' : 'task')}
                                                                    className={`w-full text-left px-3 py-1.5 text-[10px] hover:bg-gray-50 flex items-center justify-between ${item.status === s ? 'text-indigo-600 font-bold bg-indigo-50' : 'text-gray-600'}`}
                                                                >
                                                                    {s}
                                                                    {item.status === s && <Check size={10} />}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Create Project Modal */}
            {showProjectModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl transform transition-all animate-fadeIn">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-gray-900">Create New Project</h3>
                            <button onClick={() => setShowProjectModal(false)} className="text-gray-400 hover:text-gray-600"><CheckCircle className="rotate-45" /></button>
                        </div>
                        <form onSubmit={handleCreateProject} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Project Title</label>
                                <input required type="text" className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm"
                                    value={newProject.title} onChange={e => setNewProject({ ...newProject, title: e.target.value })} placeholder="e.g. Q3 Marketing Campaign" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Description</label>
                                <textarea required className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm" rows={3}
                                    value={newProject.description} onChange={e => setNewProject({ ...newProject, description: e.target.value })} placeholder="Brief details..." />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Assign Lead</label>
                                    <select required className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                        value={newProject.assignedToEmployeeId} onChange={e => setNewProject({ ...newProject, assignedToEmployeeId: e.target.value })}>
                                        <option value="">Select Employee</option>
                                        {employees.map(e => <option key={e._id || e.id} value={e._id || e.id}>{e.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Deadline</label>
                                    <input required type="date" className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                        value={newProject.deadline} onChange={e => setNewProject({ ...newProject, deadline: e.target.value })} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Role</label>
                                <input required type="text" className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                    value={newProject.role} onChange={e => setNewProject({ ...newProject, role: e.target.value })} placeholder="e.g. Project Lead" />
                            </div>

                            <button type="submit" className="w-full py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20 mt-2 text-sm">
                                Create Project
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Create Task Modal */}
            {showTaskModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl transform transition-all animate-fadeIn">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-gray-900">
                                {activeTab === 'personal_tasks' ? 'Create Personal Task' : 'Assign Employee Task'}
                            </h3>
                            <button onClick={() => setShowTaskModal(false)} className="text-gray-400 hover:text-gray-600"><CheckCircle className="rotate-45" /></button>
                        </div>
                        <form onSubmit={(e) => handleCreateTask(e, activeTab === 'personal_tasks')} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Task Title</label>
                                <input required type="text" className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm"
                                    value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })} placeholder="e.g. Review Q3 Reports" />
                            </div>

                            {activeTab !== 'personal_tasks' && (
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Assign To</label>
                                    <select required className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                        value={newTask.assignedToEmployeeId} onChange={e => setNewTask({ ...newTask, assignedToEmployeeId: e.target.value })}>
                                        <option value="">Select Employee</option>
                                        {employees.map(e => <option key={e._id || e.id} value={e._id || e.id}>{e.name}</option>)}
                                    </select>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Priority</label>
                                    <select required className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                        value={newTask.priority} onChange={e => setNewTask({ ...newTask, priority: e.target.value })}>
                                        <option>Low</option>
                                        <option>Medium</option>
                                        <option>High</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Due Date</label>
                                    <input required type="date" className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                        value={newTask.due} onChange={e => setNewTask({ ...newTask, due: e.target.value })} />
                                </div>
                            </div>

                            <button type="submit" className="w-full py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20 mt-2 text-sm">
                                {activeTab === 'personal_tasks' ? 'Add Personal Task' : 'Assign Task'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* NOTEPAD WIDGET */}
            <div className="absolute bottom-6 right-6 z-50">
                {/* Floating Button */}
                {!showNotepad && (
                    <button
                        onClick={() => setShowNotepad(true)}
                        className="w-14 h-14 bg-yellow-400 text-yellow-900 rounded-full shadow-xl hover:bg-yellow-300 transition-all transform hover:scale-110 flex items-center justify-center border-4 border-yellow-200"
                        title="Open Notepad"
                    >
                        <StickyNote size={24} fill="currentColor" className="opacity-80" />
                    </button>
                )}

                {/* Notepad Overlay */}
                {showNotepad && (
                    <div className="w-80 bg-yellow-50 rounded-2xl shadow-2xl border-2 border-yellow-200 overflow-hidden transform transition-all animate-slideUp origin-bottom-right">
                        <div className="bg-yellow-200 px-4 py-2 flex justify-between items-center border-b border-yellow-300/50">
                            <div className="flex items-center gap-2 font-bold text-yellow-900 text-sm">
                                <StickyNote size={16} /> Quick Notes
                            </div>
                            <div className="flex items-center gap-1">
                                <button onClick={handleSaveNotepad} className="p-1 hover:bg-yellow-300 rounded text-yellow-800" title="Save">
                                    <Save size={14} />
                                </button>
                                <button onClick={() => setShowNotepad(false)} className="p-1 hover:bg-yellow-300 rounded text-yellow-800" title="Close">
                                    <X size={14} />
                                </button>
                            </div>
                        </div>
                        <div className="p-0">
                            <textarea
                                ref={notepadRef}
                                className="w-full h-64 bg-yellow-50 p-4 text-sm text-gray-800 resize-none outline-none font-mono leading-relaxed"
                                placeholder="Write down your thoughts..."
                                value={notepadContent}
                                onChange={(e) => setNotepadContent(e.target.value)}
                                onBlur={handleSaveNotepad}
                                spellCheck={false}
                            />
                        </div>
                        <div className="bg-yellow-100/50 px-3 py-1 text-[10px] text-yellow-700 text-right italic">
                            Auto-saves on blur
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes slideUp {
                    from { opacity: 0; transform: scale(0.9) translateY(20px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
                .animate-slideUp {
                    animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>

        </div>
    );
};

export default OperationsBoard;
