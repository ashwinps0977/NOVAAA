import { useState, useEffect } from 'react';
import {
    Clock,
    TrendingUp,
    Award,
    Target,
    Zap,
    ChevronRight,
    PlayCircle,
    BarChart3,
    Lightbulb,
    ShieldCheck,
    Briefcase,
    Star,
    Plus,
    AlertCircle
} from 'lucide-react';
import { API_BASE_URL } from '../../config';

interface Training {
    _id: string;
    title: string;
    description: string;
    category: 'Onboarding' | 'Technical' | 'Soft Skills' | 'Compliance' | 'Upskilling';
    provider: string;
    duration: string;
    status: 'Not Started' | 'In Progress' | 'Completed';
    progress: number;
}

interface Skill {
    _id: string;
    name: string;
    category: string;
    currentLevel: number;
    requiredLevel: number;
    gap: number;
    status: string;
}

const TrainingSection = () => {
    const [activeTab, setActiveTab] = useState<'explorer' | 'my-learning' | 'skill-gap'>('explorer');
    const [trainings, setTrainings] = useState<Training[]>([]);
    const [skills, setSkills] = useState<Skill[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const [tRes, sRes] = await Promise.all([
                fetch(`${API_BASE_URL}/trainings/my-trainings`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${API_BASE_URL}/skills/my-skills`, { headers: { 'Authorization': `Bearer ${token}` } })
            ]);

            if (tRes.ok) {
                const tData = await tRes.json();
                setTrainings(tData.trainings || []);
            }
            if (sRes.ok) {
                const sData = await sRes.json();
                setSkills(sData.skills || []);
            }
        } catch (error) {
            console.error('Error fetching training data:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderProgressBar = (progress: number) => (
        <div className="w-full bg-gray-100 rounded-full h-2 mt-4 overflow-hidden">
            <div
                className={`h-full transition-all duration-1000 ease-out rounded-full ${progress === 100 ? 'bg-emerald-500' : 'bg-indigo-600'
                    }`}
                style={{ width: `${progress}%` }}
            />
        </div>
    );

    return (
        <div className="p-4 md:p-8 bg-gray-50/30 min-h-screen animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                <div>
                    <h2 className="text-4xl font-black text-gray-900 tracking-tighter flex items-center">
                        Growth <span className="text-indigo-600 ml-2">& Development</span>
                    </h2>
                    <p className="text-gray-500 font-medium mt-1">Enhance your skills and fast-track your career path</p>
                </div>

                <div className="flex bg-white/80 backdrop-blur-md p-1.5 rounded-2xl shadow-sm border border-gray-100">
                    {(['explorer', 'my-learning', 'skill-gap'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${activeTab === tab
                                ? 'bg-indigo-600 text-white shadow-indigo-100 shadow-lg scale-100'
                                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50 scale-95'
                                }`}
                        >
                            {tab.replace('-', ' ')}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center h-64 space-y-4">
                    <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                    <p className="text-gray-400 font-bold animate-pulse uppercase tracking-widest text-xs">Syncing your growth data...</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {activeTab === 'explorer' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-700">
                            {[
                                { title: 'A. Onboarding Training', desc: 'New joiner essentials, policies, and tools setup.', icon: <Briefcase className="text-white" />, color: 'from-blue-500 to-indigo-600' },
                                { title: 'B. Technical Training', desc: 'Role-specific deep dives (React, Node, Cloud, QA).', icon: <Zap className="text-white" />, color: 'from-amber-400 to-orange-500' },
                                { title: 'C. Soft Skills', desc: 'Communication, Presentation, and Leadership basics.', icon: <Star className="text-white" />, color: 'from-emerald-400 to-teal-600' },
                                { title: 'D. Compliance Training', desc: 'POSH, Cybersecurity, and mandatory corporate legal requirements.', icon: <ShieldCheck className="text-white" />, color: 'from-rose-500 to-red-600' },
                                { title: 'E. Upskilling & Reskilling', desc: 'Prepare for your next promotion or role transition.', icon: <TrendingUp className="text-white" />, color: 'from-violet-500 to-purple-600' }
                            ].map((cat, idx) => (
                                <div key={idx} className="bg-white rounded-[32px] p-6 shadow-xl shadow-gray-100 border border-gray-100 group hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center mb-6 shadow-lg rotate-3 group-hover:rotate-0 transition-transform duration-500`}>
                                        {cat.icon}
                                    </div>
                                    <h4 className="text-xl font-black text-gray-900 tracking-tight mb-2">{cat.title}</h4>
                                    <p className="text-gray-500 text-sm font-medium leading-relaxed mb-6">{cat.desc}</p>
                                    <button className="flex items-center text-xs font-black uppercase tracking-widest text-indigo-600 group/btn">
                                        Explore Courses <ChevronRight size={14} className="ml-1 group-hover/btn:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'my-learning' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-bottom-4 duration-700">
                            <div className="bg-white rounded-[40px] p-8 shadow-2xl shadow-gray-100 border border-gray-100">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-2xl font-black text-gray-900 tracking-tighter">My Progress</h3>
                                    <div className="flex items-center space-x-2 bg-indigo-50 px-3 py-1 rounded-full">
                                        <Clock size={14} className="text-indigo-600" />
                                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Active Learning</span>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    {trainings.length > 0 ? trainings.map((t) => (
                                        <div key={t._id} className="p-6 rounded-3xl bg-gray-50/50 border border-gray-100 group transition-all duration-300 hover:bg-white hover:shadow-lg">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-start space-x-4">
                                                    <div className="p-3 bg-white rounded-2xl shadow-sm">
                                                        <PlayCircle size={20} className="text-indigo-600" />
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-1 block">{t.category}</span>
                                                        <h5 className="font-black text-gray-900 group-hover:text-indigo-600 transition-colors">{t.title}</h5>
                                                        <p className="text-[11px] text-gray-400 font-bold mt-1 uppercase tracking-tight">{t.duration} • {t.provider}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${t.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                                                        }`}>
                                                        {t.status}
                                                    </span>
                                                    <p className="text-lg font-black text-gray-900 mt-2">{t.progress}%</p>
                                                </div>
                                            </div>
                                            {renderProgressBar(t.progress)}
                                        </div>
                                    )) : (
                                        <div className="text-center py-12 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                                            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No active trainings found</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="bg-indigo-600 rounded-[40px] p-8 text-white shadow-2xl shadow-indigo-100 relative overflow-hidden">
                                    <div className="relative z-10">
                                        <Award size={48} className="mb-6 opacity-20" />
                                        <h3 className="text-3xl font-black tracking-tighter mb-2">Certifications</h3>
                                        <p className="text-indigo-100 font-medium text-sm mb-6">You've completed 12% of your assigned training for this quarter. Keep going!</p>
                                        <div className="flex gap-4">
                                            <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl">
                                                <p className="text-2xl font-black">02</p>
                                                <p className="text-[10px] uppercase font-bold text-indigo-200">Earned</p>
                                            </div>
                                            <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl">
                                                <p className="text-2xl font-black">05</p>
                                                <p className="text-[10px] uppercase font-bold text-indigo-200">Pending</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl" />
                                </div>

                                <div className="bg-white rounded-[40px] p-8 shadow-xl shadow-gray-100 border border-gray-100">
                                    <h4 className="text-lg font-black text-gray-900 tracking-tighter mb-6 flex items-center">
                                        <Lightbulb size={20} className="mr-2 text-amber-500" /> AI Recommended
                                    </h4>
                                    <div className="space-y-4">
                                        {[
                                            { title: 'System Architecture Design', tag: 'Career Path' },
                                            { title: 'Effective Conflict Handling', tag: 'Leadership' }
                                        ].map((rec, i) => (
                                            <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-dotted border-gray-200">
                                                <div>
                                                    <p className="font-bold text-gray-900 text-sm">{rec.title}</p>
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">{rec.tag}</span>
                                                </div>
                                                <Plus size={18} className="text-gray-400 hover:text-indigo-600 cursor-pointer" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'skill-gap' && (
                        <div className="animate-in slide-in-from-bottom-4 duration-700">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 bg-white rounded-[40px] p-10 shadow-2xl shadow-gray-100 border border-gray-100">
                                    <div className="flex items-center justify-between mb-10">
                                        <div>
                                            <h3 className="text-3xl font-black text-gray-900 tracking-tighter">Skill Gap Analysis</h3>
                                            <p className="text-gray-500 font-medium mt-1">Comparing Current Skills vs. Role Requirements (Goal: Senior Dev)</p>
                                        </div>
                                        <BarChart3 size={32} className="text-indigo-600 opacity-20" />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {skills.length > 0 ? skills.map((skill) => (
                                            <div key={skill._id} className="space-y-3 p-6 rounded-3xl bg-gray-50/50 hover:bg-white hover:shadow-lg transition-all border border-gray-100">
                                                <div className="flex justify-between items-center">
                                                    <h5 className="font-black text-gray-900">{skill.name}</h5>
                                                    <span className={`text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-widest ${skill.gap === 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                                                        }`}>
                                                        {skill.status}
                                                    </span>
                                                </div>
                                                <div className="flex items-center space-x-4">
                                                    <div className="flex-1 space-y-1">
                                                        <div className="flex justify-between text-[10px] font-black uppercase text-gray-400">
                                                            <span>Current: L{skill.currentLevel}</span>
                                                            <span className="text-indigo-600 text-[11px]">Req: L{skill.requiredLevel}</span>
                                                        </div>
                                                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden flex">
                                                            <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${(skill.currentLevel / 5) * 100}%` }} />
                                                            {skill.gap > 0 && (
                                                                <div className="h-full bg-indigo-100 rounded-r-full animate-pulse" style={{ width: `${(skill.gap / 5) * 100}%` }} />
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                {skill.gap > 0 && (
                                                    <div className="flex items-center text-[10px] text-red-500 font-bold uppercase tracking-tight">
                                                        <AlertCircle size={10} className="mr-1" /> Training Recommended for Level {skill.requiredLevel}
                                                    </div>
                                                )}
                                            </div>
                                        )) : (
                                            <div className="col-span-full text-center py-12 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                                                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No skill data available</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <div className="bg-slate-900 rounded-[40px] p-8 text-white shadow-2xl relative overflow-hidden group">
                                        <h4 className="text-xl font-black tracking-tight mb-4 flex items-center">
                                            <Target size={20} className="mr-2 text-indigo-400" /> Career Roadmap
                                        </h4>
                                        <div className="space-y-6 relative">
                                            <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-indigo-500/30" />
                                            {[
                                                { label: 'Current Role', role: 'Junior React Dev', completed: true },
                                                { label: 'Next Milestone', role: 'Full Stack Engineer', completed: false },
                                                { label: 'Ultimate Goal', role: 'Senior Architect', completed: false }
                                            ].map((step, i) => (
                                                <div key={i} className="flex items-center space-x-4 pl-1 relative z-10">
                                                    <div className={`w-5 h-5 rounded-full border-4 border-slate-900 ${step.completed ? 'bg-indigo-500' : 'bg-slate-700'}`} />
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">{step.label}</p>
                                                        <p className="font-bold text-sm tracking-tight">{step.role}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-[40px] p-8 shadow-xl shadow-gray-100 border border-gray-100">
                                        <h4 className="text-lg font-black text-gray-900 tracking-tighter mb-4">Skill Scorecard</h4>
                                        <div className="flex items-center justify-center p-6 bg-indigo-50/50 rounded-3xl border border-indigo-100">
                                            <div className="text-center">
                                                <span className="text-5xl font-black text-indigo-600">84</span>
                                                <span className="text-indigo-400 font-black text-xl">/100</span>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mt-2">Overall Proficiency</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default TrainingSection;
