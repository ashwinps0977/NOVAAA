import React, { useState, useEffect } from 'react';
import {
    BarChart3,
    Library,
    Users,
    Target,
    Plus,
    Search,
    Filter,
    MoreVertical,
    CheckCircle,
    Clock,
    AlertCircle,
    ChevronRight,
    FileText,
    Video,
    Award,
    Trash2,
    ArrowUpRight,
    Zap,
    Briefcase,
    ShieldCheck,
    Star
} from 'lucide-react';
import { API_BASE_URL } from '../../../config';

const HRTrainingSection = () => {
    const [activeTab, setActiveTab] = useState<'analytics' | 'library' | 'assignments' | 'skills'>('analytics');
    const [stats, setStats] = useState<any>(null);
    const [modules, setModules] = useState<any[]>([]);
    const [skillGaps, setSkillGaps] = useState<any[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModuleModal, setShowModuleModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);

    // New Module State
    const [newModule, setNewModule] = useState({
        title: '',
        description: '',
        category: 'Technical',
        format: 'Video',
        duration: '',
        difficulty: 'Beginner',
        trainerName: '',
        skillTags: [] as string[]
    });

    // New Assignment State
    const [newAssignment, setNewAssignment] = useState({
        moduleId: '',
        department: '',
        role: '',
        priority: 'Medium',
        deadline: '',
        isMandatory: true
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const [statsRes, modulesRes, empRes, gapsRes] = await Promise.all([
                fetch(`${API_BASE_URL}/trainings/stats`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${API_BASE_URL}/trainings/modules`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${API_BASE_URL}/hr/employees`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${API_BASE_URL}/skills/org-gaps`, { headers: { 'Authorization': `Bearer ${token}` } })
            ]);

            if (statsRes.ok) {
                const data = await statsRes.json();
                setStats(data.stats);
            }
            if (modulesRes.ok) {
                const data = await modulesRes.json();
                setModules(data.modules);
            }
            if (empRes.ok) {
                const data = await empRes.json();
                setEmployees(data.employees || []);
            }
            if (gapsRes.ok) {
                const data = await gapsRes.json();
                setSkillGaps(data.skillGaps || []);
            }
        } catch (error) {
            console.error('Error fetching HR training data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateModule = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/trainings/modules`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newModule)
            });

            if (response.ok) {
                setShowModuleModal(false);
                fetchData();
            }
        } catch (error) {
            console.error('Error creating module:', error);
        }
    };

    const handleAssignTraining = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/trainings/assign`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newAssignment)
            });

            if (response.ok) {
                setShowAssignModal(false);
                fetchData();
            }
        } catch (error) {
            console.error('Error assigning training:', error);
        }
    };

    const renderStatCard = (title: string, value: any, icon: any, color: string) => (
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-2xl ${color} bg-opacity-10 text-opacity-100`}>
                    {icon}
                </div>
                <div className="flex items-center text-xs font-bold text-gray-400">
                    <ArrowUpRight size={14} className="mr-1" />
                    +12%
                </div>
            </div>
            <h4 className="text-gray-500 text-xs font-black uppercase tracking-widest">{title}</h4>
            <p className="text-3xl font-black text-gray-900 mt-1">{value}</p>
        </div>
    );

    return (
        <div className="p-4 md:p-8 bg-gray-50/30 min-h-screen">
            {/* Header Section */}
            <div className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                <div>
                    <h2 className="text-4xl font-black text-gray-900 tracking-tighter flex items-center">
                        Training <span className="text-emerald-600 ml-2">& Development Hub</span>
                    </h2>
                    <p className="text-gray-500 font-medium mt-1">Manage workforce skills, certifications, and learning progress</p>
                </div>

                <div className="flex bg-white/80 backdrop-blur-md p-1.5 rounded-2xl shadow-sm border border-gray-100">
                    {[
                        { id: 'analytics', label: 'Dashboard', icon: <BarChart3 size={14} /> },
                        { id: 'library', label: 'Library', icon: <Library size={14} /> },
                        { id: 'assignments', label: 'Assignments', icon: <Users size={14} /> },
                        { id: 'skills', label: 'Skill Gap', icon: <Target size={14} /> }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 flex items-center space-x-2 ${activeTab === tab.id
                                ? 'bg-emerald-600 text-white shadow-emerald-100 shadow-lg scale-100'
                                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50 scale-95'
                                }`}
                        >
                            {tab.icon}
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center h-64">
                    <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin mb-4" />
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Loading training matrix...</p>
                </div>
            ) : (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {/* DASHBOARD TAB */}
                    {activeTab === 'analytics' && (
                        <div className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {renderStatCard('Total Assigned', stats?.totalAssigned || 0, <Users size={20} />, 'bg-blue-500 text-blue-500')}
                                {renderStatCard('Completed', stats?.completed || 0, <CheckCircle size={20} />, 'bg-emerald-500 text-emerald-500')}
                                {renderStatCard('In Progress', stats?.inProgress || 0, <Clock size={20} />, 'bg-amber-500 text-amber-500')}
                                {renderStatCard('Overdue', stats?.overdue || 0, <AlertCircle size={20} />, 'bg-rose-500 text-rose-500')}
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 bg-white p-8 rounded-[40px] border border-gray-100 shadow-xl shadow-gray-100/50">
                                    <div className="flex items-center justify-between mb-8">
                                        <h3 className="text-xl font-black text-gray-900 tracking-tight">Organization Progress</h3>
                                        <div className="flex space-x-2">
                                            <span className="flex items-center text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full">
                                                84% Average
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        {Object.entries(stats?.byCategory || {}).map(([cat, count]: [string, any]) => (
                                            <div key={cat} className="space-y-2">
                                                <div className="flex justify-between text-xs font-black uppercase tracking-widest text-gray-400">
                                                    <span>{cat}</span>
                                                    <span className="text-gray-900 font-black">{count} Assignments</span>
                                                </div>
                                                <div className="h-3 bg-gray-50 rounded-full overflow-hidden border border-gray-100">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                                                        style={{ width: `${(count / (stats?.totalAssigned || 1)) * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="bg-slate-900 p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden group">
                                        <div className="relative z-10">
                                            <Zap size={32} className="text-amber-400 mb-4" />
                                            <h4 className="text-xl font-black tracking-tight mb-2">AI Insights</h4>
                                            <p className="text-slate-400 text-sm font-medium leading-relaxed">
                                                Based on current skill gaps, 74% of developers need "Cloud Infrastructure" training.
                                            </p>
                                            <button className="mt-6 flex items-center text-[10px] font-black uppercase tracking-widest text-emerald-400 group-hover:translate-x-1 transition-transform">
                                                View Skills Heatmap <ChevronRight size={14} className="ml-1" />
                                            </button>
                                        </div>
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -mr-16 -mt-16 blur-3xl" />
                                    </div>

                                    <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
                                        <h4 className="text-sm font-black text-gray-900 mb-4 uppercase tracking-widest">Active Trainers</h4>
                                        <div className="space-y-3">
                                            {[
                                                { name: 'Sarah Chen', course: 'Adv. React', type: 'Internal' },
                                                { name: 'Cloud Academy', course: 'AWS SAA', type: 'External' }
                                            ].map((trainer, i) => (
                                                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-900">{trainer.name}</p>
                                                        <p className="text-[10px] text-gray-400 font-medium">{trainer.course}</p>
                                                    </div>
                                                    <span className="text-[9px] font-black uppercase tracking-tighter bg-white px-2 py-0.5 rounded-lg border border-gray-100">
                                                        {trainer.type}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* LIBRARY TAB */}
                    {activeTab === 'library' && (
                        <div className="space-y-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="relative flex-1 max-w-md">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Search course library..."
                                        className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all shadow-sm"
                                    />
                                </div>
                                <button
                                    onClick={() => setShowModuleModal(true)}
                                    className="flex items-center justify-center space-x-2 bg-emerald-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all"
                                >
                                    <Plus size={16} />
                                    <span>Create Module</span>
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {modules.map((mod) => (
                                    <div key={mod._id} className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-xl shadow-gray-100/50 group hover:-translate-y-1 transition-all duration-500">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
                                                {mod.format === 'Video' ? <Video size={20} /> : <FileText size={20} />}
                                            </div>
                                            <button className="text-gray-300 hover:text-rose-500 transition-colors">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                        <div className="mb-4">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-1 block">{mod.category}</span>
                                            <h4 className="text-xl font-black text-gray-900 tracking-tight leading-7">{mod.title}</h4>
                                        </div>
                                        <p className="text-gray-500 text-xs font-medium line-clamp-2 mb-6 leading-relaxed">
                                            {mod.description}
                                        </p>
                                        <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                                            <div className="flex space-x-3">
                                                <div className="flex items-center text-[10px] font-bold text-gray-400">
                                                    <Clock size={12} className="mr-1" /> {mod.duration}
                                                </div>
                                                <div className="flex items-center text-[10px] font-bold text-gray-400">
                                                    <Star size={12} className="mr-1" /> {mod.difficulty}
                                                </div>
                                            </div>
                                            <button className="text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:translate-x-1 transition-transform">
                                                Details
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ASSIGNMENTS TAB */}
                    {activeTab === 'assignments' && (
                        <div className="space-y-8">
                            <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-xl shadow-gray-100/50">
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h3 className="text-2xl font-black text-gray-900 tracking-tighter">Bulk Assignment Engine</h3>
                                        <p className="text-gray-500 text-sm font-medium mt-1">Assign learning paths based on roles, departments, or individual needs</p>
                                    </div>
                                    <button
                                        onClick={() => setShowAssignModal(true)}
                                        className="bg-emerald-600 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-500/20"
                                    >
                                        New Assignment
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <div className="p-6 rounded-[32px] bg-slate-50 border border-slate-100 flex flex-col items-center text-center">
                                        <Briefcase className="text-emerald-600 mb-4" size={32} />
                                        <h4 className="font-black text-gray-900 mb-2 uppercase tracking-widest text-xs">By Role</h4>
                                        <p className="text-[11px] text-gray-500 font-medium mb-6">Assign training to all Developers, HRs, or Managers at once.</p>
                                        <select className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-emerald-500">
                                            <option>Select Role</option>
                                            <option>Developer</option>
                                            <option>Manager</option>
                                            <option>HR</option>
                                        </select>
                                    </div>
                                    <div className="p-6 rounded-[32px] bg-slate-50 border border-slate-100 flex flex-col items-center text-center">
                                        <Users className="text-blue-600 mb-4" size={32} />
                                        <h4 className="font-black text-gray-900 mb-2 uppercase tracking-widest text-xs">By Department</h4>
                                        <p className="text-[11px] text-gray-500 font-medium mb-6">Assign training to specific departments across the org.</p>
                                        <select className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-emerald-500">
                                            <option>Select Department</option>
                                            <option>IT</option>
                                            <option>Human Resources</option>
                                            <option>Finance</option>
                                        </select>
                                    </div>
                                    <div className="p-6 rounded-[32px] bg-slate-50 border border-slate-100 flex flex-col items-center text-center">
                                        <Target className="text-rose-600 mb-4" size={32} />
                                        <h4 className="font-black text-gray-900 mb-2 uppercase tracking-widest text-xs">Skill Based</h4>
                                        <p className="text-[11px] text-gray-500 font-medium mb-6">Auto-assign based on individual skill gaps identified by AI.</p>
                                        <button className="w-full p-2.5 bg-rose-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-rose-200">
                                            Run AI Auto-assignment
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-[40px] overflow-hidden border border-gray-100 shadow-sm">
                                <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                                    <h4 className="font-black text-gray-900 uppercase tracking-widest text-xs">Recent Assignments</h4>
                                    <div className="flex space-x-2">
                                        <button className="p-2 text-gray-400 hover:text-emerald-600"><Filter size={18} /></button>
                                        <button className="p-2 text-gray-400 hover:text-emerald-600"><MoreVertical size={18} /></button>
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-gray-50/50">
                                                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Employee</th>
                                                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Training Module</th>
                                                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                                                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Progress</th>
                                                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Deadline</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {employees.slice(0, 5).map((emp, i) => (
                                                <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center space-x-3">
                                                            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-black text-xs">
                                                                {emp.name.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-gray-900">{emp.name}</p>
                                                                <p className="text-[10px] text-gray-400 font-medium">{emp.role}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <p className="text-xs font-bold text-gray-700">Advancing Cyber Security</p>
                                                        <p className="text-[9px] text-rose-500 font-bold uppercase tracking-tighter">High Priority</p>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter bg-amber-50 text-amber-600">
                                                            In Progress
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center space-x-2">
                                                            <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                                <div className="h-full bg-emerald-500" style={{ width: '45%' }} />
                                                            </div>
                                                            <span className="text-[10px] font-black">45%</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-[10px] font-bold text-gray-500 italic">
                                                        Dec 24, 2024
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SKILLS TAB */}
                    {activeTab === 'skills' && (
                        <div className="space-y-8">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-xl shadow-gray-100/50">
                                    <div className="flex items-center justify-between mb-8">
                                        <h3 className="text-2xl font-black text-gray-900 tracking-tighter">Skill Heatmap</h3>
                                        <div className="flex space-x-2">
                                            <span className="flex items-center text-[10px] font-black text-rose-500 uppercase tracking-widest bg-rose-50 px-3 py-1 rounded-full">
                                                4 Gaps Detected
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        {skillGaps.length > 0 ? skillGaps.slice(0, 5).map((skill, i) => (
                                            <div key={i} className="space-y-3">
                                                <div className="flex justify-between items-end">
                                                    <div>
                                                        <p className="text-sm font-black text-gray-900">{skill.skill}</p>
                                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Across {skill.employeeCount} Employees</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xl font-black text-gray-900">{skill.available}%</p>
                                                        <p className="text-[9px] font-black text-rose-500 uppercase">Gap: {Math.max(0, skill.required - skill.available)}%</p>
                                                    </div>
                                                </div>
                                                <div className="h-3 bg-gray-50 rounded-full overflow-hidden flex space-x-0.5 border border-gray-100 p-0.5">
                                                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${skill.available}%` }} />
                                                    <div className="h-full bg-rose-200/50 rounded-full animate-pulse" style={{ width: `${Math.max(0, skill.required - skill.available)}%` }} />
                                                </div>
                                            </div>
                                        )) : (
                                            <div className="text-center py-10">
                                                <p className="text-gray-400 text-xs font-black uppercase">No skill gaps detected</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="bg-emerald-600 p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden">
                                        <div className="relative z-10">
                                            <Award size={48} className="mb-6 opacity-20" />
                                            <h3 className="text-3xl font-black tracking-tighter mb-2">Auto-Certification</h3>
                                            <p className="text-emerald-100 font-medium text-sm mb-6">
                                                Certificates are automatically generated and attached to employee profiles upon 100% completion.
                                            </p>
                                            <div className="flex gap-4">
                                                <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl">
                                                    <p className="text-2xl font-black">124</p>
                                                    <p className="text-[10px] uppercase font-bold text-emerald-200">Issued</p>
                                                </div>
                                                <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl">
                                                    <p className="text-2xl font-black">12</p>
                                                    <p className="text-[10px] uppercase font-bold text-emerald-200">Pending</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
                                        <h4 className="text-lg font-black text-gray-900 tracking-tighter mb-6 flex items-center">
                                            <ShieldCheck size={20} className="mr-2 text-blue-500" /> Compliance Status
                                        </h4>
                                        <div className="space-y-4">
                                            {[
                                                { title: 'Annual Security Quiz', status: '98%', color: 'text-emerald-500' },
                                                { title: 'POSH Training', status: '100%', color: 'text-emerald-500' },
                                                { title: 'Data Privacy', status: '82%', color: 'text-blue-500' }
                                            ].map((item, i) => (
                                                <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-dotted border-gray-200 hover:bg-white hover:border-solid hover:shadow-lg transition-all cursor-default">
                                                    <p className="font-bold text-gray-900 text-sm">{item.title}</p>
                                                    <span className={`text-[11px] font-black ${item.color}`}>{item.status}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* CREATE MODULE MODAL */}
            {showModuleModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-[40px] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-10 animate-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h3 className="text-3xl font-black text-gray-900 tracking-tighter">Create Module</h3>
                                <p className="text-gray-500 font-medium">Design a new training course for the library</p>
                            </div>
                            <button onClick={() => setShowModuleModal(false)} className="p-3 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all">
                                <Plus size={24} className="rotate-45" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateModule} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Course Title</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                                        value={newModule.title}
                                        onChange={(e) => setNewModule({ ...newModule, title: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Category</label>
                                    <select
                                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-900 outline-none"
                                        value={newModule.category}
                                        onChange={(e) => setNewModule({ ...newModule, category: e.target.value })}
                                    >
                                        <option>Technical</option>
                                        <option>Soft Skills</option>
                                        <option>Compliance</option>
                                        <option>Security</option>
                                        <option>Onboarding</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Description</label>
                                <textarea
                                    required
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 h-24"
                                    value={newModule.description}
                                    onChange={(e) => setNewModule({ ...newModule, description: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Duration</label>
                                    <input
                                        placeholder="e.g. 2 hrs"
                                        type="text"
                                        className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-xl font-bold text-gray-900 outline-none"
                                        value={newModule.duration}
                                        onChange={(e) => setNewModule({ ...newModule, duration: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Format</label>
                                    <select
                                        className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-xl font-bold text-gray-900 outline-none"
                                        value={newModule.format}
                                        onChange={(e) => setNewModule({ ...newModule, format: e.target.value })}
                                    >
                                        <option>Video</option>
                                        <option>PDF</option>
                                        <option>Live Session</option>
                                        <option>Quiz-based</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Difficulty</label>
                                    <select
                                        className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-xl font-bold text-gray-900 outline-none"
                                        value={newModule.difficulty}
                                        onChange={(e) => setNewModule({ ...newModule, difficulty: e.target.value })}
                                    >
                                        <option>Beginner</option>
                                        <option>Intermediate</option>
                                        <option>Advanced</option>
                                    </select>
                                </div>
                            </div>

                            <div className="pt-6">
                                <button type="submit" className="w-full py-5 bg-emerald-600 text-white rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-[1.01] transition-all">
                                    Publish Course Module
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ASSIGN MODAL */}
            {showAssignModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-[40px] w-full max-w-xl shadow-2xl p-10 animate-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h3 className="text-3xl font-black text-gray-900 tracking-tighter">New Assignment</h3>
                                <p className="text-gray-500 font-medium">Deploy training packages to workforce</p>
                            </div>
                            <button onClick={() => setShowAssignModal(false)} className="p-3 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all">
                                <Plus size={24} className="rotate-45" />
                            </button>
                        </div>

                        <form onSubmit={handleAssignTraining} className="space-y-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Select Module</label>
                                <select
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-900 outline-none"
                                    value={newAssignment.moduleId}
                                    onChange={(e) => setNewAssignment({ ...newAssignment, moduleId: e.target.value })}
                                >
                                    <option value="">Select a training</option>
                                    {modules.map(m => (
                                        <option key={m._id} value={m._id}>{m.title}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Target Department</label>
                                    <select
                                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-900 outline-none"
                                        value={newAssignment.department}
                                        onChange={(e) => setNewAssignment({ ...newAssignment, department: e.target.value })}
                                    >
                                        <option value="">All Departments</option>
                                        <option>IT</option>
                                        <option>Finance</option>
                                        <option>Human Resources</option>
                                        <option>Sales</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Priority</label>
                                    <select
                                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-900 outline-none"
                                        value={newAssignment.priority}
                                        onChange={(e) => setNewAssignment({ ...newAssignment, priority: e.target.value })}
                                    >
                                        <option>High</option>
                                        <option>Medium</option>
                                        <option>Low</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Deadline Date</label>
                                <input
                                    required
                                    type="date"
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                                    value={newAssignment.deadline}
                                    onChange={(e) => setNewAssignment({ ...newAssignment, deadline: e.target.value })}
                                />
                            </div>

                            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <input
                                    type="checkbox"
                                    id="mandatory"
                                    className="w-5 h-5 accent-emerald-600"
                                    checked={newAssignment.isMandatory}
                                    onChange={(e) => setNewAssignment({ ...newAssignment, isMandatory: e.target.checked })}
                                />
                                <label htmlFor="mandatory" className="text-sm font-bold text-gray-700">Mark as Mandatory Training</label>
                            </div>

                            <div className="pt-6">
                                <button type="submit" className="w-full py-5 bg-emerald-600 text-white rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-[1.01] transition-all">
                                    Run Assignment Pipeline
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HRTrainingSection;
