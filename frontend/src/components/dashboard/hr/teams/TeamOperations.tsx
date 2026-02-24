import { useState } from 'react';
import {
    Users, Star, TrendingUp, Award, X, Target, Shield, Zap,
    Clock, BarChart3, Trash2,
    CheckCircle2, AlertCircle
} from 'lucide-react';

interface TeamOperationsProps {
    teams: any[];
}

const TeamOperations = ({ teams }: TeamOperationsProps) => {
    const [selectedTeam, setSelectedTeam] = useState<any>(null);

    if (!teams || teams.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-200 m-4">
                <Users size={48} className="text-gray-300 mb-4" />
                <h3 className="text-lg font-black text-gray-400 uppercase tracking-widest">No Active Teams</h3>
                <p className="text-xs font-bold text-gray-300 uppercase mt-2">Initialize a project to form a team</p>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto p-2 space-y-8 custom-scrollbar">
            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-6 rounded-[24px] text-white shadow-xl shadow-indigo-200">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-1">Total Teams</p>
                    <h2 className="text-3xl font-black italic">{teams.length}</h2>
                </div>
                <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">Avg Performance</p>
                    <h2 className="text-3xl font-black italic text-gray-800">
                        {(teams.filter(Boolean).reduce((acc, t) => acc + (t.averagePerformanceScore || 0), 0) / (teams.filter(Boolean).length || 1)).toFixed(1)}%
                    </h2>
                </div>
                <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">Avg Progress</p>
                    <h2 className="text-3xl font-black italic text-gray-800">
                        {(teams.filter(Boolean).reduce((acc, t) => acc + (t.teamProgress || 0), 0) / (teams.filter(Boolean).length || 1)).toFixed(1)}%
                    </h2>
                </div>
                <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">Success Rate</p>
                    <h2 className="text-3xl font-black italic text-indigo-600">HIGH</h2>
                </div>
            </div>

            {/* Team Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {(teams || []).filter(Boolean).map((team, idx) => (
                    <div
                        key={idx}
                        onClick={() => setSelectedTeam(team)}
                        className="bg-white rounded-[32px] border border-slate-100 shadow-xl overflow-hidden group hover:scale-[1.01] transition-all hover:shadow-indigo-100 cursor-pointer"
                    >
                        <div className="bg-slate-50 px-8 py-6 flex justify-between items-center border-b border-slate-100">
                            <div>
                                <h3 className="text-lg font-black italic text-slate-800 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{team.teamName}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${team.teamStatus === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'
                                        }`}>
                                        {team.teamStatus}
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                                        <TrendingUp size={10} /> {team.projectId?.projectName || 'Internal Task'}
                                    </span>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1 flex items-center justify-end gap-1">
                                    <Star size={10} fill="currentColor" /> Lead
                                </div>
                                <p className="text-sm font-black text-slate-700">{team.teamLead?.name || 'Unassigned'}</p>
                            </div>
                        </div>

                        <div className="p-8 grid grid-cols-3 gap-6">
                            <div className="flex flex-col items-center">
                                <div className="relative w-16 h-16 flex items-center justify-center font-black text-xl text-indigo-600 italic">
                                    {Math.round(team.teamHealth ?? team.teamPerformanceScore ?? 0)}%
                                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                                        <circle cx="32" cy="32" r="28" fill="none" stroke="#f1f5f9" strokeWidth="6" />
                                        <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="6" strokeDasharray={176} strokeDashoffset={176 - (176 * (team.teamHealth ?? team.teamPerformanceScore ?? 0)) / 100} className="text-indigo-500" />
                                    </svg>
                                </div>
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-3">Team Health</span>
                            </div>

                            <div className="flex flex-col items-center">
                                <div className="relative w-16 h-16 flex items-center justify-center font-black text-xl text-emerald-600 italic">
                                    {Math.round(team.projectId?.progressPercentage ?? team.teamProgress ?? 0)}%
                                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                                        <circle cx="32" cy="32" r="28" fill="none" stroke="#f1f5f9" strokeWidth="6" />
                                        <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="6" strokeDasharray={176} strokeDashoffset={176 - (176 * (team.projectId?.progressPercentage ?? team.teamProgress ?? 0)) / 100} className="text-emerald-500" />
                                    </svg>
                                </div>
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-3">Completion</span>
                            </div>

                            <div className="flex flex-col items-center">
                                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-indigo-500">
                                    <Users size={24} />
                                </div>
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-3">{team.members?.length || 0} Members</span>
                            </div>
                        </div>

                        {/* Member Peek */}
                        <div className="px-8 pb-8 pt-2">
                            <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Award size={10} /> Skill Matrix Coverage</span>
                                    <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Optimized</span>
                                </div>
                                <div className="flex -space-x-2">
                                    {(team?.members || []).filter(Boolean).slice(0, 5).map((m: any, i: number) => (
                                        <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-indigo-100 flex items-center justify-center text-[10px] font-black text-indigo-600 uppercase shadow-sm">
                                            {m?.name?.charAt(0) || 'U'}
                                        </div>
                                    ))}
                                    {(team?.members || []).filter(Boolean).length > 5 && (
                                        <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-black text-slate-600 shadow-sm">
                                            +{(team?.members || []).filter(Boolean).length - 5}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Team Details Modal */}
            {selectedTeam && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[40px] shadow-2xl overflow-hidden flex flex-col animate-slideUp">
                        {/* Header */}
                        <div className="bg-slate-50 px-10 py-8 border-b border-slate-100 flex justify-between items-start">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                                        <Users size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black italic text-slate-900 uppercase tracking-tight">{selectedTeam.teamName}</h2>
                                        <p className="text-xs font-black text-indigo-500 uppercase tracking-[0.2em]">{selectedTeam.projectId?.projectName || 'Internal Operations'}</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-slate-100 shadow-sm">
                                        <Shield size={12} className="text-indigo-500" />
                                        <span className="text-[10px] font-black text-slate-600 uppercase">Lead: {selectedTeam.teamLead?.name || 'Unassigned'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 shadow-sm">
                                        <Zap size={12} className="text-emerald-500" />
                                        <span className="text-[10px] font-black text-emerald-600 uppercase">Status: {selectedTeam.teamStatus || 'Idle'}</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedTeam(null)}
                                className="p-3 bg-white hover:bg-slate-50 rounded-2xl border border-slate-100 transition-all text-slate-400 hover:text-slate-600"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Left Column: Project Info & Risks */}
                                <div className="space-y-6">
                                    {/* Project Info Card */}
                                    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <Target size={14} className="text-indigo-500" /> Project Brief
                                        </h4>
                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Description</p>
                                                <p className="text-xs text-slate-600 leading-relaxed">
                                                    {selectedTeam.projectId?.description || 'No description provided for this project.'}
                                                </p>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Priority</p>
                                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${selectedTeam.projectId?.priority === 'High' ? 'bg-rose-50 text-rose-600' :
                                                        selectedTeam.projectId?.priority === 'Medium' ? 'bg-amber-50 text-amber-600' :
                                                            'bg-emerald-50 text-emerald-600'
                                                        }`}>
                                                        {selectedTeam.projectId?.priority || 'Normal'}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Risk Level</p>
                                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${(selectedTeam.riskAnalysis?.level === 'High' || (selectedTeam.riskAnalysis?.overdueTasks || 0) > 2) ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                                                        }`}>
                                                        {selectedTeam.riskAnalysis?.level || 'Low Risk'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Clock size={14} className="text-slate-400" />
                                                    <div>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase">Deadline</p>
                                                        <p className="text-xs font-bold text-slate-700">
                                                            {selectedTeam.projectId?.deadline ? new Date(selectedTeam.projectId.deadline).toLocaleDateString() : 'N/A'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase">Remaining</p>
                                                    <p className="text-xs font-bold text-indigo-600">
                                                        {selectedTeam.projectId?.deadline ?
                                                            `${Math.ceil((new Date(selectedTeam.projectId.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} Days`
                                                            : 'N/A'
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Delete Project Action */}
                                    <button
                                        onClick={async () => {
                                            if (window.confirm(`Are you SURE you want to delete project "${selectedTeam.projectId?.projectName}" ? This will dissolve the team.`)) {
                                                try {
                                                    const res = await fetch(`http://localhost:5000/api/projects/${selectedTeam.projectId?._id}`, {
                                                        method: 'DELETE',
                                                        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                                                    });
                                                    if (res.ok) {
                                                        alert('Project deleted and team dissolved.');
                                                        window.location.reload();
                                                    }
                                                } catch (err) {
                                                    console.error('Delete failed', err);
                                                }
                                            }
                                        }}
                                        className="w-full py-4 bg-white hover:bg-rose-50 text-rose-500 border border-slate-100 hover:border-rose-200 rounded-3xl transition-all flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest group"
                                    >
                                        <Trash2 size={14} className="group-hover:scale-110 transition-transform" />
                                        Delete Project
                                    </button >
                                </div >

                                {/* Center Column: Workload & Skills */}
                                < div className="space-y-6" >
                                    {/* Workload Distribution */}
                                    < div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm" >
                                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                                            <BarChart3 size={14} className="text-indigo-500" /> Workload Balance
                                        </h4>
                                        <div className="space-y-5">
                                            {[selectedTeam.teamLead, ...(selectedTeam.members || [])].filter(Boolean).map((m: any, i: number) => (
                                                <div key={i}>
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="text-[10px] font-bold text-slate-600 truncate max-w-[120px]">{m?.name || 'Unknown'}</span>
                                                        <span className={`text-[10px] font-black ${(m?.currentCapacity || 0) > 85 ? 'text-rose-500' : 'text-slate-400'}`}>
                                                            {m?.currentCapacity || 0}%
                                                        </span>
                                                    </div>
                                                    <div className="h-1.5 bg-slate-50 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full transition-all duration-1000 ${(m?.currentCapacity || 0) > 85 ? 'bg-rose-500' :
                                                                (m?.currentCapacity || 0) > 60 ? 'bg-amber-400' : 'bg-emerald-400'
                                                                }`}
                                                            style={{ width: `${m?.currentCapacity || 0}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div >

                                    {/* Skill Gaps */}
                                    < div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm" >
                                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                                            <Award size={14} className="text-indigo-500" /> Skill Matrix Gap
                                        </h4>
                                        <div className="space-y-3">
                                            {(selectedTeam.skillGapAnalysis?.requiredSkills || []).filter(Boolean).map((skill: any, i: number) => {
                                                const skillName = skill?.skill || skill?.name || '';
                                                const isAvailable = (selectedTeam.skillGapAnalysis?.availableSkills || []).filter(Boolean).some((s: any) => s?.name?.toLowerCase() === skillName.toLowerCase() || s?.skill?.toLowerCase() === skillName.toLowerCase());
                                                return (
                                                    <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`} />
                                                            <span className="text-xs font-bold text-slate-700">{skillName || 'Unknown Skill'}</span>
                                                        </div>
                                                        {isAvailable ?
                                                            <CheckCircle2 size={14} className="text-emerald-500" /> :
                                                            <span className="text-[8px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-1">
                                                                <AlertCircle size={10} /> MISSING
                                                            </span>
                                                        }
                                                    </div>
                                                );
                                            })}
                                            {(!selectedTeam.skillGapAnalysis?.requiredSkills || selectedTeam.skillGapAnalysis.requiredSkills.length === 0) && (
                                                <p className="text-[10px] text-slate-400 italic text-center">No specific skill requirements set.</p>
                                            )}
                                        </div>
                                    </div >
                                </div >

                                {/* Right Column: Core Metrics & roster */}
                                < div className="space-y-6" >
                                    <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
                                        <div className="absolute -right-4 -top-4 opacity-10">
                                            <TrendingUp size={120} />
                                        </div>
                                        <h4 className="text-xs font-black text-indigo-200 uppercase tracking-widest mb-6 flex items-center gap-2">
                                            <Star size={14} /> Efficiency Score
                                        </h4>
                                        <div className="relative z-10">
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-5xl font-black italic">{Math.round(selectedTeam.teamPerformanceScore || 0)}</span>
                                                <span className="text-xl font-bold opacity-60">%</span>
                                            </div>
                                            <p className="text-[10px] font-bold text-indigo-100 uppercase tracking-widest mt-4">Top Performer: {selectedTeam.teamLead?.name}</p>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4">Team Roster</h4>
                                        <div className="space-y-4">
                                            {/* Lead */}
                                            {selectedTeam.teamLead && (
                                                <div className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-2xl transition-colors">
                                                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-sm uppercase">
                                                        {selectedTeam.teamLead?.name?.charAt(0) || 'L'}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-xs font-black text-slate-800">{selectedTeam.teamLead?.name}</p>
                                                        <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">Team Lead</p>
                                                    </div>
                                                </div>
                                            )}
                                            {/* Members */}
                                            {(selectedTeam.members || []).filter(Boolean).map((m: any, i: number) => (
                                                <div key={i} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-2xl transition-colors border-t border-slate-50 pt-3">
                                                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 font-black text-sm uppercase">
                                                        {m?.name?.charAt(0) || 'M'}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-xs font-black text-slate-800">{m?.name || 'Unknown'}</p>
                                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{m?.position || 'Member'}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="h-1 w-12 bg-slate-100 rounded-full overflow-hidden">
                                                            <div className="h-full bg-emerald-500" style={{ width: `${m?.performanceScore || 0}%` }} />
                                                        </div>
                                                        <span className="text-[8px] font-black text-slate-400 uppercase">{m?.performanceScore || 0}%</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div >
                            </div >
                        </div >
                    </div >
                </div >
            )}

            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUp { from { opacity: 0; transform: translateY(40px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
                .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
                .animate-slideUp { animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
            `}</style>
        </div >
    );
};

export default TeamOperations;
