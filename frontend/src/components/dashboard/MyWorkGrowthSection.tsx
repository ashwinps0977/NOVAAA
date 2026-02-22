import { useState, useEffect } from 'react';
import { Briefcase, BookOpen, Zap, CheckCircle, Clock, AlertCircle, RefreshCw, ChevronRight, Star } from 'lucide-react';
import { API_BASE_URL } from '../../config';

// ─── Types ──────────────────────────────────────────────────────────────────

interface Project {
    _id: string;
    title: string;
    description?: string;
    role: string;
    status: string;
    deadline: string;
}

interface TrainingAssignment {
    _id: string;
    module: { title: string; category: string; duration?: string; description?: string };
    status: string;
    progress: number;
    deadline?: string;
    priority?: string;
}

interface Skill {
    _id: string;
    name: string;
    category: string;
    currentLevel: number;
    requiredLevel: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const API = API_BASE_URL.replace('/api', '');

const getHeaders = (json = false) => {
    const h: Record<string, string> = { Authorization: `Bearer ${localStorage.getItem('token')}` };
    if (json) h['Content-Type'] = 'application/json';
    return h;
};

const fmtDate = (d?: string) =>
    d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

const StatusPill = ({ status }: { status: string }) => {
    const map: Record<string, string> = {
        Completed: 'bg-emerald-100 text-emerald-700',
        'In Progress': 'bg-blue-100 text-blue-700',
        Pending: 'bg-amber-100 text-amber-700',
        'Not Started': 'bg-gray-100 text-gray-600',
        Overdue: 'bg-rose-100 text-rose-700',
        'On Hold': 'bg-orange-100 text-orange-700',
    };
    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${map[status] ?? 'bg-gray-100 text-gray-500'}`}>
            {status}
        </span>
    );
};

// ─── Main Component ──────────────────────────────────────────────────────────

const MyWorkGrowthSection = () => {
    const [tab, setTab] = useState<'projects' | 'training' | 'skills'>('projects');
    const [projects, setProjects] = useState<Project[]>([]);
    const [trainings, setTrainings] = useState<TrainingAssignment[]>([]);
    const [skills, setSkills] = useState<Skill[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const fetchAll = async () => {
        setLoading(true);
        setError(null);
        try {
            const h = getHeaders();
            const [projRes, trainRes, skillRes] = await Promise.all([
                fetch(`${API}/api/projects/my-projects`, { headers: h }),
                fetch(`${API}/api/trainings/my-assignments`, { headers: h }),
                fetch(`${API}/api/skills/my-skills`, { headers: h }),
            ]);
            const [projData, trainData, skillData] = await Promise.all([
                projRes.json(), trainRes.json(), skillRes.json(),
            ]);

            console.log('[MyWorkGrowth] projects:', projData);
            console.log('[MyWorkGrowth] trainings:', trainData);
            console.log('[MyWorkGrowth] skills:', skillData);

            if (projData.success !== false) setProjects(projData.projects || projData.data || []);
            if (trainData.success !== false) setTrainings(trainData.assignments || trainData.trainings || []);
            if (skillData.success !== false) setSkills(skillData.skills || skillData.data || []);
        } catch (e) {
            console.error('[MyWorkGrowth] fetch error', e);
            setError('Failed to load your data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAll(); }, []);

    // Update training progress
    const handleProgressUpdate = async (id: string, progress: number) => {
        setUpdatingId(id);
        try {
            const res = await fetch(`${API}/api/trainings/${id}/progress`, {
                method: 'PUT',
                headers: getHeaders(true),
                body: JSON.stringify({ progress }),
            });
            const data = await res.json();
            if (data.success) {
                setTrainings(prev => prev.map(t => t._id === id ? { ...t, progress } : t));
            }
        } catch {
            // silently fail — data was not changed
        } finally {
            setUpdatingId(null);
        }
    };

    // ─── Derived stats ────────────────────────────────────────────────────────
    const activeProjects = projects.filter(p => p.status !== 'Completed').length;
    const completedTraining = trainings.filter(t => t.status === 'Completed').length;
    const avgProgress = trainings.length > 0
        ? Math.round(trainings.reduce((s, t) => s + t.progress, 0) / trainings.length)
        : 0;
    const skillsToImprove = skills.filter(s => s.currentLevel < s.requiredLevel).length;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-72 gap-3">
                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-gray-400 font-medium">Loading your work & growth data…</span>
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
            <div>
                <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-0.5">My Dashboard</p>
                <h1 className="text-2xl font-black text-gray-900">My Work & Growth</h1>
                <p className="text-sm text-gray-500 mt-0.5">Your personal projects, training progress, and skills overview</p>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Active Projects', value: activeProjects, Icon: Briefcase, color: 'bg-indigo-50 text-indigo-600', border: 'border-indigo-100' },
                    { label: 'Training Progress', value: `${avgProgress}%`, Icon: BookOpen, color: 'bg-emerald-50 text-emerald-600', border: 'border-emerald-100' },
                    { label: 'Completed Courses', value: completedTraining, Icon: CheckCircle, color: 'bg-blue-50 text-blue-600', border: 'border-blue-100' },
                    { label: 'Skills to Improve', value: skillsToImprove, Icon: Zap, color: 'bg-amber-50 text-amber-600', border: 'border-amber-100' },
                ].map(s => (
                    <div key={s.label} className={`bg-white rounded-2xl border ${s.border} p-5 flex items-center gap-4`}>
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${s.color}`}>
                            <s.Icon size={20} />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-gray-900">{s.value}</p>
                            <p className="text-xs text-gray-500 font-medium">{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tab switcher */}
            <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
                {(['projects', 'training', 'skills'] as const).map(t => (
                    <button key={t} onClick={() => setTab(t)}
                        className={`px-5 py-2 rounded-lg text-sm font-bold transition-all capitalize ${tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                        {t === 'projects' ? '🗂 Projects' : t === 'training' ? '📚 Training' : '⚡ Skills'}
                    </button>
                ))}
            </div>

            {/* Projects tab */}
            {tab === 'projects' && (
                <div className="space-y-3">
                    {projects.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-gray-100 gap-3 text-gray-400">
                            <Briefcase size={36} strokeWidth={1.5} />
                            <p className="font-semibold text-sm">No projects assigned yet</p>
                            <p className="text-xs text-gray-400">Your HR will assign projects here when ready.</p>
                        </div>
                    ) : (
                        projects.map(p => (
                            <div key={p._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-indigo-200 transition-colors">
                                <div className="flex items-start gap-4">
                                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center font-black text-lg shrink-0">
                                        {p.title.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-black text-gray-900 text-base">{p.title}</p>
                                        <p className="text-sm text-indigo-600 font-semibold">{p.role}</p>
                                        {p.description && (
                                            <p className="text-xs text-gray-500 mt-1 max-w-md">{p.description}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 shrink-0">
                                    <div className="text-right">
                                        <p className="text-xs text-gray-400 font-medium">Deadline</p>
                                        <p className="text-sm font-bold text-gray-700">{fmtDate(p.deadline)}</p>
                                    </div>
                                    <StatusPill status={p.status} />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Training tab */}
            {tab === 'training' && (
                <div className="space-y-3">
                    {trainings.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-gray-100 gap-3 text-gray-400">
                            <BookOpen size={36} strokeWidth={1.5} />
                            <p className="font-semibold text-sm">No trainings assigned yet</p>
                            <p className="text-xs text-gray-400">Your HR will assign training courses here.</p>
                        </div>
                    ) : (
                        trainings.map(t => (
                            <div key={t._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:border-emerald-200 transition-colors">
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                    <div className="flex items-start gap-4 flex-1">
                                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-black text-lg shrink-0">
                                            {t.module?.title?.charAt(0) || '?'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-black text-gray-900 text-base">{t.module?.title || '—'}</p>
                                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                                <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs font-semibold rounded-lg">{t.module?.category || '—'}</span>
                                                {t.priority && (
                                                    <span className="px-2 py-0.5 bg-gray-50 text-gray-600 text-xs font-semibold rounded-lg">{t.priority} priority</span>
                                                )}
                                                {t.module?.duration && (
                                                    <span className="flex items-center gap-1 text-xs text-gray-400">
                                                        <Clock size={11} /> {t.module.duration}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                        {t.deadline && (
                                            <div className="text-right">
                                                <p className="text-xs text-gray-400">Due</p>
                                                <p className="text-xs font-bold text-gray-700">{fmtDate(t.deadline)}</p>
                                            </div>
                                        )}
                                        <StatusPill status={t.status} />
                                    </div>
                                </div>

                                {/* Progress bar + update slider */}
                                <div className="mt-4">
                                    <div className="flex justify-between items-center mb-1.5">
                                        <span className="text-xs font-bold text-gray-500">Progress</span>
                                        <span className="text-xs font-black text-gray-700">{t.progress}%</span>
                                    </div>
                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
                                        <div
                                            className={`h-full rounded-full transition-all ${t.status === 'Overdue' ? 'bg-rose-500' : t.progress === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                                            style={{ width: `${t.progress}%` }}
                                        />
                                    </div>
                                    {t.status !== 'Completed' && (
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="range" min={0} max={100} step={5}
                                                value={t.progress}
                                                onChange={e => setTrainings(prev => prev.map(x => x._id === t._id ? { ...x, progress: +e.target.value } : x))}
                                                className="flex-1 accent-blue-500"
                                            />
                                            <button
                                                onClick={() => handleProgressUpdate(t._id, t.progress)}
                                                disabled={updatingId === t._id}
                                                className="text-xs font-black text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1 shrink-0">
                                                {updatingId === t._id ? <RefreshCw size={11} className="animate-spin" /> : <ChevronRight size={11} />}
                                                Save
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Skills tab */}
            {tab === 'skills' && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <h3 className="font-black text-gray-900 mb-4 flex items-center gap-2">
                        <Zap size={18} className="text-amber-500" /> My Skills
                        <span className="ml-auto text-xs font-semibold text-gray-400">{skills.length} tracked</span>
                    </h3>
                    {skills.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-3 text-gray-400">
                            <Zap size={36} strokeWidth={1.5} />
                            <p className="font-semibold text-sm">No skills tracked yet</p>
                            <p className="text-xs text-gray-400">Your HR will populate your skill profile here.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {skills.map(s => {
                                const pct = Math.round((s.currentLevel / 5) * 100);
                                const reqPct = Math.round((s.requiredLevel / 5) * 100);
                                const gap = s.requiredLevel - s.currentLevel;
                                return (
                                    <div key={s._id}>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-gray-900 text-sm">{s.name}</span>
                                                <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-lg font-medium">{s.category}</span>
                                            </div>
                                            <div className="flex gap-0.5 text-amber-500">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        size={12}
                                                        fill={i < s.currentLevel ? "currentColor" : "none"}
                                                        className={i < s.currentLevel ? "" : "text-gray-300"}
                                                    />
                                                ))}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs">
                                                <span className="font-semibold text-gray-600">{s.currentLevel}/5</span>
                                                {gap > 0 ? (
                                                    <span className="px-2 py-0.5 bg-rose-100 text-rose-600 rounded-full font-bold">-{gap} gap</span>
                                                ) : (
                                                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-600 rounded-full font-bold">✓ Met</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                                            {/* Required level marker */}
                                            <div className="absolute top-0 bottom-0 w-0.5 bg-gray-400 z-10" style={{ left: `${reqPct}%` }} />
                                            {/* Current level bar */}
                                            <div className={`h-full rounded-full transition-all ${gap > 0 ? 'bg-amber-400' : 'bg-emerald-500'}`}
                                                style={{ width: `${pct}%` }} />
                                        </div>
                                        <div className="flex justify-between mt-1">
                                            <span className="text-[10px] text-gray-400">Current: {s.currentLevel}</span>
                                            <span className="text-[10px] text-gray-400">Required: {s.requiredLevel}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default MyWorkGrowthSection;
