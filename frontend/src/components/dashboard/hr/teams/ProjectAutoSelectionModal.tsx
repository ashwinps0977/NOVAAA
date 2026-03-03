import { useState, useEffect } from 'react';
import { X, Sparkles, Plus, Trash2, Calendar, Target, Users, Award } from 'lucide-react';
import { teamService } from '../../../../services/teamService';

interface ProjectAutoSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const ProjectAutoSelectionModal = ({ isOpen, onClose, onSuccess }: ProjectAutoSelectionModalProps) => {
    const [loading, setLoading] = useState(false);
    const [availableSkills, setAvailableSkills] = useState<string[]>([]);
    const [formData, setFormData] = useState({
        projectName: '',
        description: '',
        priority: 'Medium',
        minExperience: 0,
        memberCount: 3,
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        requiredSkills: [{ skill: '', level: 3 }]
    });

    useEffect(() => {
        if (isOpen) {
            fetch('http://localhost:5000/api/skills/unique-names', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            })
                .then(res => res.json())
                .then(data => {
                    if (data.success) setAvailableSkills(data.skills || []);
                })
                .catch(err => console.error('Failed to fetch skills:', err));
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleAddSkill = () => {
        setFormData({
            ...formData,
            requiredSkills: [...formData.requiredSkills, { skill: '', level: 3 }]
        });
    };

    const handleRemoveSkill = (index: number) => {
        const newSkills = [...formData.requiredSkills];
        newSkills.splice(index, 1);
        setFormData({ ...formData, requiredSkills: newSkills });
    };

    const handleSkillChange = (index: number, field: string, value: any) => {
        const newSkills = [...formData.requiredSkills];
        (newSkills[index] as any)[field] = value;
        setFormData({ ...formData, requiredSkills: newSkills });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Target End Date Validation
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const targetDate = new Date(formData.endDate);

        if (targetDate <= today) {
            alert('Attention: Please enter the correct date. The Target End Date must be after the current day.');
            return;
        }

        // Additional validation for Skill Matrix
        const hasEmptySkills = formData.requiredSkills.some(rs => !rs.skill);
        if (hasEmptySkills) {
            alert('Please select a skill for all required skill entries.');
            return;
        }

        setLoading(true);
        try {
            const res = await teamService.autoSelectTeam(formData);
            if (res.success) {
                alert(`Success! Team "${res.team.name}" formed with ${res.team.lead} as Lead.`);
                onSuccess();
                onClose();
            } else {
                alert(res.message || 'Team formation failed.');
            }
        } catch (err) {
            alert('Failed to connect to AI engine.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-[32px] w-full max-w-2xl shadow-2xl overflow-hidden animate-slideUp border border-indigo-100 flex flex-col max-h-[90vh]">
                <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-6 flex justify-between items-center text-white shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                            <Sparkles className="animate-pulse" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black italic tracking-tight">INTELLIGENT TEAM FORMATION</h3>
                            <p className="text-[10px] uppercase font-bold opacity-70 tracking-widest">AI-Driven Skill & Performance Matching</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-full transition-all">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
                    {/* Project Basics */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="col-span-2">
                            <label className="text-[10px] font-black uppercase text-indigo-600 mb-2 block tracking-widest">Project Name</label>
                            <input
                                required
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold focus:border-indigo-500 focus:bg-white outline-none transition-all"
                                placeholder="Quantum Core Platform..."
                                value={formData.projectName}
                                onChange={e => setFormData({ ...formData, projectName: e.target.value })}
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="text-[10px] font-black uppercase text-indigo-600 mb-2 block tracking-widest">Description</label>
                            <textarea
                                required
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3 text-sm font-bold focus:border-indigo-500 focus:bg-white outline-none transition-all h-24 resize-none"
                                placeholder="Describe the project scope and complexity..."
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Requirements */}
                    <div className="grid grid-cols-3 gap-6">
                        <div>
                            <label className="text-[10px] font-black uppercase text-indigo-600 mb-2 block tracking-widest flex items-center gap-1.5"><Target size={12} /> Priority</label>
                            <select
                                required
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold"
                                value={formData.priority}
                                onChange={e => setFormData({ ...formData, priority: e.target.value })}
                            >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase text-indigo-600 mb-2 block tracking-widest flex items-center gap-1.5"><Award size={12} /> Min Exp (Yrs)</label>
                            <input
                                required
                                type="number"
                                min="0"
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold"
                                value={formData.minExperience}
                                onChange={e => setFormData({ ...formData, minExperience: parseInt(e.target.value) })}
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase text-indigo-600 mb-2 block tracking-widest flex items-center gap-1.5"><Users size={12} /> Team Size</label>
                            <input
                                required
                                type="number"
                                min="1"
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold"
                                value={formData.memberCount}
                                onChange={e => setFormData({ ...formData, memberCount: parseInt(e.target.value) })}
                            />
                        </div>
                    </div>

                    {/* Skill Requirements */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <label className="text-[10px] font-black uppercase text-indigo-600 tracking-widest">Required Skill Matrix</label>
                            <button
                                type="button"
                                onClick={handleAddSkill}
                                className="bg-indigo-50 text-indigo-600 p-1.5 rounded-lg hover:bg-indigo-100 transition-all flex items-center gap-1 text-[10px] font-black"
                            >
                                <Plus size={14} strokeWidth={3} /> ADD SKILL
                            </button>
                        </div>
                        <div className="space-y-3">
                            {formData.requiredSkills.map((rs, idx) => (
                                <div key={idx} className="flex gap-3 items-center animate-fadeIn">
                                    <select
                                        className="flex-1 bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-bold focus:border-indigo-500 focus:bg-white outline-none transition-all"
                                        value={rs.skill}
                                        onChange={e => handleSkillChange(idx, 'skill', e.target.value)}
                                        required
                                    >
                                        <option value="">Select Skill...</option>
                                        {(availableSkills || []).map(s => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>
                                    <select
                                        required
                                        className="w-32 bg-slate-50 border-2 border-slate-100 rounded-xl px-3 py-3 text-sm font-bold"
                                        value={rs.level}
                                        onChange={e => handleSkillChange(idx, 'level', parseInt(e.target.value))}
                                    >
                                        <option value={1}>L1 - Basic</option>
                                        <option value={2}>L2 - Novice</option>
                                        <option value={3}>L3 - Competent</option>
                                        <option value={4}>L4 - Advanced</option>
                                        <option value={5}>L5 - Master</option>
                                    </select>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveSkill(idx)}
                                        className="text-slate-300 hover:text-rose-500 transition-all p-2"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="text-[10px] font-black uppercase text-indigo-600 mb-2 block tracking-widest flex items-center gap-1.5"><Calendar size={12} /> Start Date</label>
                            <input
                                required
                                type="date"
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3 text-sm font-bold"
                                value={formData.startDate}
                                onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase text-indigo-600 mb-2 block tracking-widest flex items-center gap-1.5"><Calendar size={12} /> Target End Date</label>
                            <input
                                required
                                type="date"
                                min={new Date(new Date().getTime() + 86400000).toISOString().split('T')[0]}
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3 text-sm font-bold"
                                value={formData.endDate}
                                onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="pt-4 sticky bottom-0 bg-white pb-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-5 rounded-[24px] font-black text-sm uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-3 ${loading
                                ? 'bg-indigo-300 cursor-not-allowed text-white/50'
                                : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-500/40'
                                }`}
                        >
                            {loading ? (
                                <><div className="w-5 h-5 border-4 border-white/20 border-t-white rounded-full animate-spin" /> RUNNING RANKING ENGINE...</>
                            ) : (
                                <><Plus strokeWidth={4} size={20} /> INITIATE AUTO-SELECTION</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
            <style>{`
                @keyframes slideUp {
                    from { transform: translateY(50px) scale(0.95); opacity: 0; }
                    to { transform: translateY(0) scale(1); opacity: 1; }
                }
                .animate-slideUp { animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
            `}</style>
        </div>
    );
};

export default ProjectAutoSelectionModal;
