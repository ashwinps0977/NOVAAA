import { useState, useEffect } from 'react';
import { Briefcase, BookOpen, Users, Plus, X, AlertCircle, CheckCircle, RefreshCw, ChevronRight } from 'lucide-react';
import { API_BASE_URL } from '../../../config';
import SearchDropdown from '../../common/SearchDropdown';


// ─── Types ──────────────────────────────────────────────────────────────────

interface Employee {
    _id: string;
    name: string;
    position: string;
    department: string;
    email: string;
}

interface Project {
    _id: string;
    title: string;
    description: string;
    role: string;
    status: string;
    deadline: string;
    assignedTo?: { name: string; position?: string };
}

interface TrainingModule {
    _id: string;
    title: string;
    category: string;
    duration: string;
}

interface TrainingAssignment {
    _id: string;
    module: { title: string; category: string };
    employee: { name: string; position?: string };
    status: string;
    progress: number;
    deadline: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const API = API_BASE_URL.replace('/api', '');

const getHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token')}`,
});

const fmtDate = (d: string) =>
    d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

const StatusPill = ({ status }: { status: string }) => {
    const map: Record<string, string> = {
        Completed: 'bg-emerald-100 text-emerald-700',
        'In Progress': 'bg-blue-100 text-blue-700',
        Pending: 'bg-amber-100 text-amber-700',
        'Not Started': 'bg-gray-100 text-gray-600',
        Overdue: 'bg-rose-100 text-rose-700',
        'On Hold': 'bg-orange-100 text-orange-700',
        Delayed: 'bg-rose-100 text-rose-700',
    };
    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${map[status] ?? 'bg-gray-100 text-gray-500'}`}>
            {status}
        </span>
    );
};

// ─── Main Component ──────────────────────────────────────────────────────────

const WorkforceDevelopmentHub = () => {
    const [tab, setTab] = useState<'projects' | 'training'>('projects');

    // Data
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [modules, setModules] = useState<TrainingModule[]>([]);
    const [assignments, setAssignments] = useState<TrainingAssignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Modals
    const [showProjectModal, setShowProjectModal] = useState(false);
    const [showTrainingModal, setShowTrainingModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    // Project form
    const [pForm, setPForm] = useState({ title: '', description: '', role: '', employeeId: '', deadline: '' });
    // Training form
    const [tForm, setTForm] = useState({ moduleId: '', employeeId: '', deadline: '', priority: 'Medium' });

    // ─── Fetch all data ───────────────────────────────────────────────────────
    const fetchAll = async () => {
        setLoading(true);
        setError(null);
        try {
            const h = getHeaders();
            const [empRes, projRes, modRes, assignRes] = await Promise.all([
                fetch(`${API}/api/hr/employees`, { headers: h }),
                fetch(`${API}/api/projects`, { headers: h }),
                fetch(`${API}/api/trainings/modules`, { headers: h }),
                fetch(`${API}/api/trainings/stats`, { headers: h }),
            ]);

            const [empData, projData, modData, assignData] = await Promise.all([
                empRes.json(), projRes.json(), modRes.json(), assignRes.json(),
            ]);

            console.log('[HR Hub] employees:', empData);
            console.log('[HR Hub] projects:', projData);
            console.log('[HR Hub] modules:', modData);
            console.log('[HR Hub] training stats:', assignData);

            if (empData.success !== false) setEmployees(empData.employees || empData.data || []);
            if (projData.success !== false) setProjects(projData.projects || projData.data || []);
            if (modData.success !== false) setModules(modData.modules || modData.data || []);
            if (assignData.success !== false) setAssignments(assignData.assignments || []);
        } catch (err) {
            console.error('[HR Hub] fetch error', err);
            setError('Failed to load data. Is the backend running?');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAll(); }, []);

    // ─── Assign project ───────────────────────────────────────────────────────
    const handleAssignProject = async () => {
        if (!pForm.title || !pForm.employeeId || !pForm.deadline) return;
        setSubmitting(true);
        try {
            const res = await fetch(`${API}/api/projects`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({
                    title: pForm.title,
                    description: pForm.description,
                    role: pForm.role,
                    assignedToEmployeeId: pForm.employeeId,
                    deadline: pForm.deadline,
                }),
            });
            const data = await res.json();
            if (data.success) {
                setSuccessMsg('Project assigned successfully!');
                setShowProjectModal(false);
                setPForm({ title: '', description: '', role: '', employeeId: '', deadline: '' });
                fetchAll();
                setTimeout(() => setSuccessMsg(''), 3000);
            } else {
                alert(data.message + (data.error ? ': ' + data.error : '') || 'Failed to assign project.');
            }
        } catch {
            alert('Network error.');
        } finally {
            setSubmitting(false);
        }
    };

    // ─── Assign training ──────────────────────────────────────────────────────
    const handleAssignTraining = async () => {
        if (!tForm.moduleId || !tForm.employeeId) return;
        setSubmitting(true);
        try {
            const res = await fetch(`${API}/api/trainings/assign`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({
                    moduleId: tForm.moduleId,
                    employeeIds: [tForm.employeeId],
                    deadline: tForm.deadline || undefined,
                    priority: tForm.priority,
                }),
            });
            const data = await res.json();
            if (data.success) {
                setSuccessMsg('Training assigned successfully!');
                setShowTrainingModal(false);
                setTForm({ moduleId: '', employeeId: '', deadline: '', priority: 'Medium' });
                fetchAll();
                setTimeout(() => setSuccessMsg(''), 3000);
            } else {
                alert(data.message || 'Failed to assign training.');
            }
        } catch {
            alert('Network error.');
        } finally {
            setSubmitting(false);
        }
    };

    // ─── Stats ────────────────────────────────────────────────────────────────
    const activeProjects = projects.filter(p => p.status !== 'Completed').length;
    const completedProjects = projects.filter(p => p.status === 'Completed').length;
    const completedAssignments = assignments.filter(a => a.status === 'Completed').length;

    // ─── Loading / Error ──────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="flex items-center justify-center h-72 gap-3">
                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-gray-400 font-medium">Loading workforce data…</span>
            </div>
        );
    }
    if (error) {
        return (
            <div className="flex items-center gap-3 p-5 bg-rose-50 border border-rose-200 rounded-2xl">
                <AlertCircle size={20} className="text-rose-500 shrink-0" />
                <p className="text-rose-700 text-sm font-medium">{error}</p>
                <button onClick={fetchAll} className="ml-auto flex items-center gap-1.5 text-rose-600 text-xs font-bold hover:underline">
                    <RefreshCw size={13} /> Retry
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-0.5">HR Control</p>
                    <h1 className="text-2xl font-black text-gray-900">Workforce Hub</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Manage employee projects & training assignments</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setShowProjectModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20">
                        <Plus size={15} /> Assign Project
                    </button>
                    <button onClick={() => setShowTrainingModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20">
                        <Plus size={15} /> Assign Training
                    </button>
                </div>
            </div>

            {/* Success toast */}
            {successMsg && (
                <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700 font-semibold">
                    <CheckCircle size={16} className="text-emerald-500" /> {successMsg}
                </div>
            )}

            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Employees', value: employees.length, Icon: Users, color: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
                    { label: 'Active Projects', value: activeProjects, Icon: Briefcase, color: 'bg-blue-50 text-blue-600 border-blue-100' },
                    { label: 'Completed Projects', value: completedProjects, Icon: CheckCircle, color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
                    { label: 'Training Completed', value: completedAssignments, Icon: BookOpen, color: 'bg-amber-50 text-amber-600 border-amber-100' },
                ].map(c => (
                    <div key={c.label} className={`bg-white rounded-2xl border p-5 flex items-center gap-4 ${c.color.split(' ').pop()}`}>
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${c.color.split(' ').slice(0, 2).join(' ')}`}>
                            <c.Icon size={20} />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-gray-900">{c.value}</p>
                            <p className="text-xs text-gray-500 font-medium">{c.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tab switcher */}
            <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
                {(['projects', 'training'] as const).map(t => (
                    <button key={t} onClick={() => setTab(t)}
                        className={`px-5 py-2 rounded-lg text-sm font-bold transition-all capitalize ${tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                        {t === 'projects' ? '🗂 Projects' : '📚 Training'}
                    </button>
                ))}
            </div>

            {/* Projects tab */}
            {tab === 'projects' && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
                        <h3 className="font-black text-gray-900">All Projects ({projects.length})</h3>
                        <button onClick={fetchAll} className="text-xs text-gray-400 flex items-center gap-1 hover:text-gray-600">
                            <RefreshCw size={12} /> Refresh
                        </button>
                    </div>
                    {projects.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
                            <Briefcase size={36} strokeWidth={1.5} />
                            <p className="font-semibold text-sm">No projects yet</p>
                            <button onClick={() => setShowProjectModal(true)} className="text-indigo-500 text-xs font-bold flex items-center gap-1 hover:underline">
                                <Plus size={12} /> Assign first project <ChevronRight size={12} />
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-left border-b border-gray-50 bg-gray-50/50">
                                        {['Project', 'Assigned To', 'Role', 'Deadline', 'Status'].map(h => (
                                            <th key={h} className="px-5 py-3 text-xs font-black text-gray-400 uppercase tracking-wider">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {projects.map(p => (
                                        <tr key={p._id} className="hover:bg-gray-50/60 transition-colors">
                                            <td className="px-5 py-4">
                                                <p className="font-bold text-gray-900 text-sm">{p.title}</p>
                                                {p.description && (
                                                    <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[180px]">{p.description}</p>
                                                )}
                                            </td>
                                            <td className="px-5 py-4 text-sm text-gray-700 font-medium">{p.assignedTo?.name || '—'}</td>
                                            <td className="px-5 py-4 text-sm text-gray-500">{p.role || '—'}</td>
                                            <td className="px-5 py-4 text-sm text-gray-500 whitespace-nowrap">{fmtDate(p.deadline)}</td>
                                            <td className="px-5 py-4"><StatusPill status={p.status} /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Training tab */}
            {tab === 'training' && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
                        <h3 className="font-black text-gray-900">Training Assignments ({assignments.length})</h3>
                        <button onClick={fetchAll} className="text-xs text-gray-400 flex items-center gap-1 hover:text-gray-600">
                            <RefreshCw size={12} /> Refresh
                        </button>
                    </div>
                    {assignments.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
                            <BookOpen size={36} strokeWidth={1.5} />
                            <p className="font-semibold text-sm">No training assignments yet</p>
                            <button onClick={() => setShowTrainingModal(true)} className="text-emerald-500 text-xs font-bold flex items-center gap-1 hover:underline">
                                <Plus size={12} /> Assign first training <ChevronRight size={12} />
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-left border-b border-gray-50 bg-gray-50/50">
                                        {['Employee', 'Course', 'Category', 'Progress', 'Deadline', 'Status'].map(h => (
                                            <th key={h} className="px-5 py-3 text-xs font-black text-gray-400 uppercase tracking-wider">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {assignments.map(a => (
                                        <tr key={a._id} className="hover:bg-gray-50/60 transition-colors">
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                                                        {a.employee?.name?.charAt(0) || '?'}
                                                    </div>
                                                    <span className="font-bold text-gray-900 text-sm">{a.employee?.name || '—'}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-sm font-medium text-gray-800">{a.module?.title || '—'}</td>
                                            <td className="px-5 py-4">
                                                <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs font-semibold rounded-lg">{a.module?.category || '—'}</span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2 min-w-[100px]">
                                                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                        <div className={`h-full rounded-full transition-all ${a.status === 'Overdue' ? 'bg-rose-500' : a.progress === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                                                            style={{ width: `${a.progress}%` }} />
                                                    </div>
                                                    <span className="text-xs font-bold text-gray-600">{a.progress}%</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-sm text-gray-500 whitespace-nowrap">{fmtDate(a.deadline)}</td>
                                            <td className="px-5 py-4"><StatusPill status={a.status} /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Employee Directory */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-black text-gray-900 mb-4 flex items-center gap-2">
                    <Users size={18} className="text-indigo-500" /> Employee Directory
                    <span className="ml-auto text-xs font-semibold text-gray-400">{employees.length} employees</span>
                </h3>
                {employees.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-6">No employees in system.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {employees.map(e => (
                            <div key={e._id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-600 text-white font-bold text-sm flex items-center justify-center shrink-0">
                                    {e.name?.charAt(0) || '?'}
                                </div>
                                <div className="min-w-0">
                                    <p className="font-bold text-gray-900 text-sm truncate">{e.name}</p>
                                    <p className="text-xs text-gray-500 truncate">{e.position} · {e.department}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Assign Project Modal ── */}
            {showProjectModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
                        <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white flex items-center justify-between">
                            <div>
                                <p className="font-black text-lg">Assign Project</p>
                                <p className="text-indigo-200 text-xs">Assign a project to an employee</p>
                            </div>
                            <button onClick={() => setShowProjectModal(false)} className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
                                <X size={17} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Select Employee</label>
                                <SearchDropdown
                                    items={employees}
                                    onSelect={(e) => setPForm({ ...pForm, employeeId: e._id })}
                                    placeholder="Search employees..."
                                    searchKey="name"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Project Title</label>
                                <input value={pForm.title} onChange={e => setPForm({ ...pForm, title: e.target.value })}
                                    placeholder="e.g. NOVA Platform v2"
                                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Role / Responsibility</label>
                                <input value={pForm.role} onChange={e => setPForm({ ...pForm, role: e.target.value })}
                                    placeholder="e.g. Lead Developer"
                                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Description (optional)</label>
                                <textarea value={pForm.description} onChange={e => setPForm({ ...pForm, description: e.target.value })}
                                    rows={2} placeholder="Brief project description…"
                                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Deadline</label>
                                <input type="date" value={pForm.deadline} onChange={e => setPForm({ ...pForm, deadline: e.target.value })}
                                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                            </div>
                            <div className="flex gap-3 pt-1">
                                <button onClick={() => setShowProjectModal(false)}
                                    className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50">
                                    Cancel
                                </button>
                                <button onClick={handleAssignProject} disabled={submitting || !pForm.title || !pForm.employeeId || !pForm.deadline}
                                    className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white font-black text-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/25 transition-colors">
                                    {submitting ? 'Assigning…' : 'Assign Project'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Assign Training Modal ── */}
            {showTrainingModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
                        <div className="px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex items-center justify-between">
                            <div>
                                <p className="font-black text-lg">Assign Training</p>
                                <p className="text-emerald-200 text-xs">Enroll an employee in a course</p>
                            </div>
                            <button onClick={() => setShowTrainingModal(false)} className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
                                <X size={17} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Select Employee</label>
                                <SearchDropdown
                                    items={employees}
                                    onSelect={(e) => setTForm({ ...tForm, employeeId: e._id })}
                                    placeholder="Search employees..."
                                    searchKey="name"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Select Course</label>
                                <select value={tForm.moduleId} onChange={e => setTForm({ ...tForm, moduleId: e.target.value })}
                                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500">
                                    <option value="">— Choose Course —</option>
                                    {modules.length === 0
                                        ? <option disabled>No modules found in system</option>
                                        : modules.map(m => (
                                            <option key={m._id} value={m._id}>{m.title} ({m.category})</option>
                                        ))
                                    }
                                </select>
                                {modules.length === 0 && (
                                    <p className="text-xs text-amber-600 mt-1 font-medium">⚠ No training modules in the system. Create modules via API first.</p>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Deadline (optional)</label>
                                    <input type="date" value={tForm.deadline} onChange={e => setTForm({ ...tForm, deadline: e.target.value })}
                                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Priority</label>
                                    <select value={tForm.priority} onChange={e => setTForm({ ...tForm, priority: e.target.value })}
                                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500">
                                        <option value="Low">🟢 Low</option>
                                        <option value="Medium">🟡 Medium</option>
                                        <option value="High">🔴 High</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-3 pt-1">
                                <button onClick={() => setShowTrainingModal(false)}
                                    className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50">
                                    Cancel
                                </button>
                                <button onClick={handleAssignTraining} disabled={submitting || !tForm.moduleId || !tForm.employeeId}
                                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-black text-sm hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-600/25 transition-colors">
                                    {submitting ? 'Assigning…' : 'Assign Training'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WorkforceDevelopmentHub;
