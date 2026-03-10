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
    AlertCircle,
    ArrowLeft,
    BookOpen,
    Layout,
    RefreshCw
} from 'lucide-react';
import { API_BASE_URL } from '../../config';

interface Training {
    _id: string;
    title: string;
    description: string;
    category: string;
    provider: string;
    duration: string;
    status: 'Not Started' | 'In Progress' | 'Completed';
    progress: number;
    contentUrl?: string; // Added for functionality
}

interface TrainingModule {
    _id: string;
    title: string;
    description: string;
    category: string;
    duration: string;
    format: string;
    contentUrl?: string;
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
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [trainings, setTrainings] = useState<Training[]>([]);
    const [allModules, setAllModules] = useState<TrainingModule[]>([]);
    const [skills, setSkills] = useState<Skill[]>([]);
    const [loading, setLoading] = useState(true);
    const [enrolling, setEnrolling] = useState<string | null>(null);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const getHeaders = (json = false) => {
        const h: Record<string, string> = { Authorization: `Bearer ${localStorage.getItem('token')}` };
        if (json) h['Content-Type'] = 'application/json';
        return h;
    };

    useEffect(() => {
        fetchData();
        fetchModules();
    }, []);

    const fetchModules = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/trainings/modules`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setAllModules(data.modules || []);
            }
        } catch (error) {
            console.error('Error fetching modules:', error);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const [tRes, sRes, aRes] = await Promise.all([
                fetch(`${API_BASE_URL}/trainings/my-trainings`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${API_BASE_URL}/skills/my-skills`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${API_BASE_URL}/trainings/my-assignments`, { headers: { 'Authorization': `Bearer ${token}` } })
            ]);

            let combinedTrainings: Training[] = [];

            if (tRes.ok) {
                const legacyData = await tRes.json();
                combinedTrainings = [...(legacyData.trainings || [])];
            }

            if (aRes.ok) {
                const assignmentData = await aRes.json();
                const mappedAssignments = (assignmentData.assignments || []).map((a: any) => ({
                    _id: a._id,
                    title: a.module?.title || 'Untitled Course',
                    description: a.module?.description || '',
                    category: a.module?.category || 'General',
                    provider: a.module?.trainerName || 'Internal',
                    duration: a.module?.duration || 'Unknown',
                    status: a.status,
                    progress: a.progress,
                    contentUrl: a.module?.contentUrl || '#'
                }));

                // Avoid duplicates by title if necessary, or just merge
                combinedTrainings = [...combinedTrainings, ...mappedAssignments];
            }

            setTrainings(combinedTrainings);

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

    const handleProgressUpdate = async (id: string, progress: number) => {
        setUpdatingId(id);
        try {
            const status = progress === 100 ? 'Completed' : progress > 0 ? 'In Progress' : 'Not Started';
            const res = await fetch(`${API_BASE_URL}/trainings/${id}/progress`, {
                method: 'PUT',
                headers: getHeaders(true),
                body: JSON.stringify({ progress, status }),
            });
            const data = await res.json();
            if (data.success) {
                fetchData(); // Refresh all data to sync state
            }
        } catch (error) {
            console.error('Progress update error:', error);
        } finally {
            setUpdatingId(null);
        }
    };

    const handleDownloadCertificate = async (id: string, moduleTitle: string) => {
        try {
            const res = await fetch(`${API_BASE_URL}/trainings/${id}/certificate`, {
                headers: getHeaders(),
            });
            const data = await res.json();
            if (data.success) {
                const { certificate } = data;
                alert(`🎊 Training Certificate Validated!\n\nID: ${certificate.certificateId}\nCourse: ${certificate.courseTitle}\nAwarded To: ${certificate.candidateName}\nDate: ${new Date(certificate.completionDate).toLocaleDateString()}\n\nDownloading your official ${moduleTitle} certificate of completion...`);

                const link = document.createElement('a');
                link.href = '#';
                link.setAttribute('download', `${moduleTitle.replace(/\s+/g, '_')}_Certificate.pdf`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        } catch (error) {
            console.error('Certificate error:', error);
            alert('Failed to generate certificate. Please try again.');
        }
    };

    const handleEnroll = async (moduleId: string) => {
        setEnrolling(moduleId);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/trainings/enroll/${moduleId}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                alert('Enrolled successfully! Redirecting to My Learning...');
                fetchData(); // Refresh list
                setActiveTab('my-learning');
            } else {
                const data = await res.json();
                alert(data.message || 'Enrollment failed');
            }
        } catch (error) {
            console.error('Enrollment error:', error);
        } finally {
            setEnrolling(null);
        }
    };

    const renderProgressBar = (progress: number) => (
        <div className="w-full bg-gray-100 rounded-full h-2 mt-4 overflow-hidden shadow-inner">
            <div
                className={`h-full transition-all duration-1000 ease-out rounded-full ${progress === 100 ? 'bg-emerald-500' : 'bg-indigo-600'
                    }`}
                style={{ width: `${progress}%` }}
            />
        </div>
    );

    const categories = [
        { title: 'Software Development', desc: 'React, Node.js, Mobile, DevOps, and Architecture.', icon: <Zap className="text-white" />, color: 'from-blue-500 to-indigo-600' },
        { title: 'Quality Assurance', desc: 'Software Testing, Automation, Selenium, and JMeter.', icon: <ShieldCheck className="text-white" />, color: 'from-amber-400 to-orange-500' },
        { title: 'IT Infrastructure', desc: 'Systems, Networking, Cloud, and Database Admin.', icon: <Briefcase className="text-white" />, color: 'from-emerald-400 to-teal-600' },
        { title: 'Data & Analytics', desc: 'Data Science, BI, Engineering, and Analytics.', icon: <TrendingUp className="text-white" />, color: 'from-rose-500 to-red-600' },
        { title: 'Security & Compliance', desc: 'Cybersecurity, Pentesting, and Risk Analysis.', icon: <ShieldCheck className="text-white" />, color: 'from-violet-500 to-purple-600' },
        { title: 'Project & Product Management', desc: 'Agile, Scrum, PMP, and Product Management.', icon: <Target className="text-white" />, color: 'from-indigo-400 to-blue-500' },
        { title: 'UX / Design', desc: 'UI/UX Design, Graphic Design, and Interaction.', icon: <Star className="text-white" />, color: 'from-fuchsia-500 to-pink-600' },
        { title: 'IT Sales / Marketing', desc: 'Sales Engineering, Pre-Sales, and Customer Success.', icon: <Briefcase className="text-white" />, color: 'from-orange-400 to-red-500' },
        { title: 'Emerging Technologies', desc: 'AI, Blockchain, IoT, and RPA.', icon: <Zap className="text-white" />, color: 'from-cyan-400 to-blue-600' },
        { title: 'Executive & Leadership', desc: 'Leading Teams and Strategic Management.', icon: <Award className="text-white" />, color: 'from-slate-700 to-slate-900' },
        { title: 'Supporting Roles', desc: 'Technical Writing and Change Management.', icon: <Lightbulb className="text-white" />, color: 'from-teal-400 to-emerald-600' }
    ];

    return (
        <div className="p-4 md:p-8 bg-gray-50/30 min-h-screen animate-in fade-in duration-700 font-sans">
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
                            onClick={() => {
                                setActiveTab(tab);
                                if (tab !== 'explorer') setSelectedCategory(null);
                            }}
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
                    <p className="text-gray-400 font-bold animate-pulse uppercase tracking-widest text-[10px]">Syncing your growth profile...</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {activeTab === 'explorer' && !selectedCategory && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-700">
                            {categories.map((cat, idx) => (
                                <div key={idx} onClick={() => setSelectedCategory(cat.title)} className="bg-white rounded-[40px] p-8 shadow-xl shadow-gray-100 border border-transparent hover:border-indigo-100 group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer relative overflow-hidden">
                                    <div className={`w-16 h-16 rounded-[24px] bg-gradient-to-br ${cat.color} flex items-center justify-center mb-8 shadow-lg rotate-3 group-hover:rotate-0 transition-transform duration-500 relative z-10`}>
                                        {cat.icon}
                                    </div>
                                    <h4 className="text-2xl font-black text-gray-900 tracking-tight mb-3 relative z-10">{cat.title}</h4>
                                    <p className="text-gray-500 text-sm font-medium leading-relaxed mb-8 relative z-10 opacity-80">{cat.desc}</p>
                                    <div className="flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 group/btn relative z-10">
                                        Explore Catalog <ChevronRight size={14} className="ml-2 group-hover/btn:translate-x-2 transition-transform" />
                                    </div>
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-full -mr-16 -mt-16 group-hover:bg-indigo-50 transition-colors duration-500" />
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'explorer' && selectedCategory && (
                        <div className="animate-in slide-in-from-bottom-4 duration-700">
                            <div className="flex items-center mb-10">
                                <button
                                    onClick={() => setSelectedCategory(null)}
                                    className="mr-6 p-4 bg-white rounded-2xl shadow-sm hover:shadow-md border border-gray-100 transition-all hover:-translate-x-2"
                                >
                                    <ArrowLeft size={20} className="text-indigo-600" />
                                </button>
                                <div>
                                    <h3 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">{selectedCategory}</h3>
                                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Available learning modules for your role</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {allModules.filter(m => m.category === selectedCategory).length > 0 ? (
                                    allModules.filter(m => m.category === selectedCategory).map((mod) => (
                                        <div key={mod._id} className="bg-white rounded-[40px] p-10 shadow-xl shadow-gray-100 border border-gray-100 group transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 relative overflow-hidden">
                                            <div className="relative z-10">
                                                <div className="flex justify-between items-start mb-8">
                                                    <div className="p-4 bg-indigo-50 rounded-[20px] group-hover:bg-indigo-600 transition-colors duration-500">
                                                        <BookOpen size={28} className="text-indigo-600 group-hover:text-white transition-colors duration-500" />
                                                    </div>
                                                    <div className="px-5 py-1.5 bg-emerald-50 rounded-full border border-emerald-100">
                                                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{mod.duration}</span>
                                                    </div>
                                                </div>
                                                <h4 className="text-2xl font-black text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors uppercase tracking-tighter">{mod.title}</h4>
                                                <p className="text-gray-500 font-medium leading-relaxed mb-10 opacity-70">{mod.description}</p>

                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-6">
                                                        <div className="flex items-center space-x-2">
                                                            <PlayCircle size={18} className="text-indigo-400" />
                                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.1em]">{mod.format}</span>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleEnroll(mod._id)}
                                                        disabled={enrolling === mod._id || trainings.some(t => t.title === mod.title)}
                                                        className={`px-10 py-4 rounded-[20px] text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl ${trainings.some(t => t.title === mod.title)
                                                            ? 'bg-emerald-500 text-white cursor-default shadow-emerald-200'
                                                            : 'bg-indigo-600 text-white hover:bg-slate-900 active:scale-95 shadow-indigo-100'
                                                            }`}
                                                    >
                                                        {trainings.some(t => t.title === mod.title) ? 'Enrolled' : enrolling === mod._id ? 'Enrolling...' : 'Enroll Now'}
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-50/20 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-indigo-100/40 transition-colors duration-500" />
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-full py-24 text-center bg-white rounded-[50px] border border-dashed border-gray-200 shadow-sm">
                                        <Layout size={64} className="mx-auto text-gray-100 mb-6" />
                                        <p className="text-gray-400 font-black uppercase tracking-[0.3em] text-[10px]">No courses published for this category</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'my-learning' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-in slide-in-from-bottom-4 duration-700">
                            <div className="bg-white rounded-[50px] p-10 shadow-2xl shadow-gray-100 border border-gray-100">
                                <div className="flex items-center justify-between mb-10">
                                    <h3 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">My Paths</h3>
                                    <div className="flex items-center space-x-2 bg-indigo-50 px-5 py-2 rounded-full">
                                        <Clock size={16} className="text-indigo-600" />
                                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Active</span>
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    {trainings.length > 0 ? (
                                        trainings.map((t) => (
                                            <div key={t._id} className="p-8 rounded-[40px] bg-gray-50/50 border border-gray-100 group transition-all duration-500 hover:bg-white hover:shadow-2xl hover:-translate-y-2 relative overflow-hidden">
                                                <div className="relative z-10">
                                                    <div className="flex items-start justify-between mb-4">
                                                        <div className="flex items-start space-x-5">
                                                            <div className="p-5 bg-white rounded-3xl shadow-sm group-hover:bg-indigo-600 transition-colors duration-500">
                                                                <PlayCircle size={32} className="text-indigo-600 group-hover:text-white transition-colors duration-500" />
                                                            </div>
                                                            <div>
                                                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-2 block">{t.category}</span>
                                                                <h5 className="font-black text-gray-900 group-hover:text-indigo-600 transition-colors tracking-tight text-xl uppercase">{t.title}</h5>
                                                                <div className="flex items-center space-x-4 mt-2">
                                                                    <p className="text-[11px] text-gray-400 font-bold uppercase tracking-tight opacity-70">{t.duration} • {t.provider}</p>
                                                                    {t.contentUrl && t.contentUrl !== '#' && (
                                                                        <a
                                                                            href={t.contentUrl}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="text-indigo-600 text-[10px] font-black uppercase tracking-widest hover:underline flex items-center"
                                                                        >
                                                                            Go to Course <ChevronRight size={12} className="ml-1" />
                                                                        </a>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className={`px-5 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${t.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                                                                }`}>
                                                                {t.status}
                                                            </span>
                                                            <p className="text-3xl font-black text-gray-900 mt-3 tracking-tighter">{t.progress}%</p>
                                                        </div>
                                                    </div>
                                                    {renderProgressBar(t.progress)}

                                                    <div className="mt-8">
                                                        {t.status === 'Completed' ? (
                                                            <div className="flex items-center justify-between bg-emerald-50 rounded-2xl p-4 border border-emerald-100/50">
                                                                <div className="flex items-center space-x-3">
                                                                    <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-200">
                                                                        <Award size={20} />
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-xs font-black text-emerald-900 uppercase">Certified</p>
                                                                        <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">Official document ready</p>
                                                                    </div>
                                                                </div>
                                                                <button
                                                                    onClick={() => handleDownloadCertificate(t._id, t.title)}
                                                                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-200 hover:-translate-y-0.5"
                                                                >
                                                                    Get Certificate
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center space-x-4">
                                                                <div className="flex-1">
                                                                    <input
                                                                        type="range"
                                                                        min="0"
                                                                        max="100"
                                                                        step="5"
                                                                        value={t.progress}
                                                                        onChange={(e) => {
                                                                            const val = parseInt(e.target.value);
                                                                            setTrainings(prev => prev.map(item => item._id === t._id ? { ...item, progress: val } : item));
                                                                        }}
                                                                        className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                                                    />
                                                                </div>
                                                                <button
                                                                    onClick={() => handleProgressUpdate(t._id, t.progress)}
                                                                    disabled={updatingId === t._id}
                                                                    className="px-6 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-gray-200 disabled:opacity-50 flex items-center gap-2 hover:-translate-y-0.5 active:translate-y-0"
                                                                >
                                                                    {updatingId === t._id ? <RefreshCw size={12} className="animate-spin" /> : <PlayCircle size={12} />}
                                                                    Save Progress
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-28 bg-gray-50 rounded-[50px] border border-dashed border-gray-200">
                                            <p className="text-gray-400 font-black uppercase tracking-[0.3em] text-[10px] mb-6">No active learning tracks found</p>
                                            <button
                                                onClick={() => setActiveTab('explorer')}
                                                className="px-10 py-4 bg-white rounded-2xl shadow-lg text-indigo-600 text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all border border-indigo-50"
                                            >
                                                Start Your Journey
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-10">
                                <div className="bg-indigo-600 rounded-[50px] p-12 text-white shadow-2xl shadow-indigo-100 relative overflow-hidden group">
                                    <div className="relative z-10">
                                        <Award size={80} className="mb-10 opacity-20 transform -rotate-12 group-hover:rotate-0 transition-transform duration-700" />
                                        <h3 className="text-4xl font-black tracking-tighter mb-4 uppercase">Elite Status</h3>
                                        <p className="text-indigo-100 font-medium text-lg mb-10 leading-relaxed opacity-80">Track your milestones and earn globally recognized certifications as you complete your modules.</p>
                                        <div className="flex gap-8">
                                            <div className="bg-white/10 backdrop-blur-2xl px-8 py-5 rounded-[32px] border border-white/10">
                                                <p className="text-4xl font-black tracking-tighter">02</p>
                                                <p className="text-[10px] uppercase font-black text-indigo-200 tracking-[0.2em] mt-2">Earned</p>
                                            </div>
                                            <div className="bg-white/10 backdrop-blur-2xl px-8 py-5 rounded-[32px] border border-white/10">
                                                <p className="text-4xl font-black tracking-tighter">05</p>
                                                <p className="text-[10px] uppercase font-black text-indigo-200 tracking-[0.2em] mt-2">Pending</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-24 -mt-24 blur-[80px] group-hover:scale-110 transition-transform duration-1000" />
                                </div>

                                <div className="bg-white rounded-[50px] p-10 shadow-xl shadow-gray-100 border border-gray-100">
                                    <h4 className="text-2xl font-black text-gray-900 tracking-tighter mb-10 flex items-center uppercase">
                                        <Lightbulb size={28} className="mr-4 text-amber-500" /> Smart Recommendations
                                    </h4>
                                    <div className="space-y-6">
                                        {[
                                            { title: 'System Architecture Design', tag: 'Architect Lead', trend: '+12% Skills' },
                                            { title: 'Effective Conflict Handling', tag: 'Leadership', trend: 'High Priority' }
                                        ].map((rec, i) => (
                                            <div key={i} className="flex items-center justify-between p-8 bg-gray-50/50 rounded-[32px] border border-transparent hover:border-indigo-50 hover:bg-white hover:shadow-2xl transition-all duration-500 group cursor-pointer">
                                                <div>
                                                    <p className="font-black text-gray-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tighter text-base">{rec.title}</p>
                                                    <div className="flex items-center space-x-4 mt-2">
                                                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">{rec.tag}</span>
                                                        <span className="h-1.5 w-1.5 bg-indigo-200 rounded-full" />
                                                        <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600">{rec.trend}</span>
                                                    </div>
                                                </div>
                                                <div className="p-3 bg-white rounded-2xl shadow-sm text-gray-300 group-hover:text-indigo-600 group-hover:shadow-md transition-all">
                                                    <Plus size={24} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'skill-gap' && (
                        <div className="animate-in slide-in-from-bottom-4 duration-700">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                                <div className="lg:col-span-2 bg-white rounded-[50px] p-12 shadow-2xl shadow-gray-100 border border-gray-100">
                                    <div className="flex items-center justify-between mb-12">
                                        <div>
                                            <h3 className="text-4xl font-black text-gray-900 tracking-tighter uppercase">Skill Matrix</h3>
                                            <p className="text-gray-500 font-medium mt-1">Goal: Senior Solutions Architect</p>
                                        </div>
                                        <BarChart3 size={40} className="text-indigo-600 opacity-20" />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        {skills.length > 0 ? skills.map((skill) => (
                                            <div key={skill._id} className="space-y-6 p-10 rounded-[40px] bg-gray-50/30 hover:bg-white hover:shadow-3xl transition-all duration-500 border border-transparent hover:border-indigo-50 group">
                                                <div className="flex justify-between items-center">
                                                    <h5 className="font-black text-gray-900 text-xl tracking-tighter uppercase">{skill.name}</h5>
                                                    <span className={`text-[10px] font-black px-5 py-2 rounded-full uppercase tracking-widest border shadow-sm ${skill.gap === 0 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                                                        }`}>
                                                        {skill.status}
                                                    </span>
                                                </div>
                                                <div className="space-y-4">
                                                    <div className="flex justify-between text-[11px] font-black uppercase tracking-widest">
                                                        <span className="text-gray-400">Current L{skill.currentLevel}</span>
                                                        <span className="text-indigo-600">Goal L{skill.requiredLevel}</span>
                                                    </div>
                                                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden flex shadow-inner">
                                                        <div className="h-full bg-indigo-600 rounded-full shadow-lg" style={{ width: `${(skill.currentLevel / 5) * 100}%` }} />
                                                        {skill.gap > 0 && (
                                                            <div className="h-full bg-indigo-100 rounded-r-full animate-pulse opacity-50" style={{ width: `${(skill.gap / 5) * 100}%` }} />
                                                        )}
                                                    </div>
                                                </div>
                                                {skill.gap > 0 && (
                                                    <div className="flex items-center text-[10px] text-rose-500 font-black uppercase tracking-[0.2em] bg-rose-50/30 p-3 rounded-2xl border border-rose-100">
                                                        <AlertCircle size={16} className="mr-3" /> Training Recommended
                                                    </div>
                                                )}
                                            </div>
                                        )) : (
                                            <div className="col-span-full text-center py-28 bg-gray-50 rounded-[50px] border border-dashed border-gray-200">
                                                <p className="text-gray-400 font-black uppercase tracking-[0.3em] text-[10px]">Awaiting proficiency assessment</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-10">
                                    <div className="bg-slate-900 rounded-[50px] p-12 text-white shadow-2xl relative overflow-hidden group">
                                        <h4 className="text-2xl font-black tracking-tighter mb-10 flex items-center uppercase">
                                            <Target size={32} className="mr-4 text-indigo-400" /> Career Roadmap
                                        </h4>
                                        <div className="space-y-10 relative">
                                            <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-indigo-500/20" />
                                            {[
                                                { label: 'Current Role', role: 'Full Stack Developer', completed: true },
                                                { label: 'Next Milestone', role: 'Lead Architect', completed: false },
                                                { label: 'Strategic Goal', role: 'Engineering Director', completed: false }
                                            ].map((step, i) => (
                                                <div key={i} className="flex items-center space-x-8 pl-1 relative z-10 group/step">
                                                    <div className={`w-7 h-7 rounded-full border-[8px] border-slate-900 shadow-2xl transition-all duration-500 ${step.completed ? 'bg-indigo-500 scale-125 shadow-indigo-500/40' : 'bg-slate-700'
                                                        }`} />
                                                    <div>
                                                        <p className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${step.completed ? 'text-indigo-400' : 'text-slate-500'}`}>{step.label}</p>
                                                        <p className="font-bold text-xl tracking-tighter group-hover/step:text-indigo-300 transition-colors uppercase mt-1">{step.role}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 rounded-full -mr-40 -mt-40 blur-[100px]" />
                                    </div>

                                    <div className="bg-white rounded-[50px] p-12 shadow-xl shadow-gray-100 border border-gray-100 text-center relative overflow-hidden group hover:shadow-3xl transition-all duration-500">
                                        <h4 className="text-xl font-black text-gray-900 tracking-tighter mb-8 uppercase tracking-widest">Skill Score</h4>
                                        <div className="inline-flex items-center justify-center w-40 h-40 bg-indigo-50 rounded-full border-[12px] border-white shadow-2xl relative z-10 group-hover:scale-110 transition-transform duration-700">
                                            <div className="text-center">
                                                <span className="text-5xl font-black text-indigo-600 italic">84</span>
                                                <span className="text-indigo-300 font-bold text-lg block -mt-1">/100</span>
                                            </div>
                                        </div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mt-10 relative z-10">Growth Velocity: High</p>
                                        <div className="absolute bottom-0 left-0 right-0 h-2 bg-indigo-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-1000" />
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
