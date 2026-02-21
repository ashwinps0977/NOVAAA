import React, { useState } from 'react';
import {
    X, Send, Paperclip, MessageSquare,
    Calendar, CheckCircle2, FileText, Download
} from 'lucide-react';
import { taskService } from '../../../services/taskService';
import type { Task } from '../../../services/taskService';

interface TaskDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    task: Task;
    onTaskUpdate: (updatedTask: Task) => void;
}

const TaskDetailsModal = ({ isOpen, onClose, task, onTaskUpdate }: TaskDetailsModalProps) => {
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState<'details' | 'comments' | 'attachments'>('details');

    if (!isOpen) return null;

    const handleAddComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setIsSubmitting(true);
        try {
            const res = await taskService.addComment(task._id, newComment);
            if (res.success) {
                onTaskUpdate(res.task);
                setNewComment('');
            }
        } catch (error) {
            console.error('Failed to add comment', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUploadDummy = async () => {
        // Simulating a file upload for dummy demo
        const dummyUrl = `https://nova-docs.s3.amazonaws.com/proof_${Math.floor(Math.random() * 1000)}.pdf`;
        try {
            console.log('Uploading and attaching:', dummyUrl);
            const res = await taskService.uploadAttachment(task._id, dummyUrl);
            if (res.success) {
                onTaskUpdate(res.task);
            }
        } catch (error) {
            console.error('Upload failed', error);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleString('en-US', {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[80] p-4">
            <div className="bg-white rounded-[32px] w-full max-w-2xl h-[600px] shadow-2xl overflow-hidden flex flex-col animate-slideUp">
                {/* Header */}
                <div className="p-8 pb-4 flex justify-between items-start">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                                {task.project}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${task.priority === 'high' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                task.priority === 'medium' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                    'bg-blue-50 text-blue-600 border-blue-100'
                                }`}>
                                {task.priority} Priority
                            </span>
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 italic tracking-tight uppercase">{task.title}</h2>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-gray-50 rounded-2xl transition-all text-gray-400 hover:text-gray-900 border border-transparent hover:border-gray-100">
                        <X size={20} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="px-8 flex gap-6 border-b border-gray-50">
                    {(['details', 'comments', 'attachments'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-4 text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === tab ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            {tab}
                            {activeTab === tab && <div className="absolute bottom-[-1px] left-0 w-full h-[3px] bg-indigo-600 rounded-full" />}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    {activeTab === 'details' && (
                        <div className="space-y-8">
                            <div className="space-y-3">
                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Description</h4>
                                <p className="text-gray-600 leading-relaxed text-sm font-medium bg-gray-50/50 p-6 rounded-3xl border border-gray-100/50 italic">
                                    "{task.description || 'No description provided.'}"
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="p-6 bg-indigo-50/30 rounded-3xl border border-indigo-50/50">
                                    <div className="flex items-center gap-3 text-indigo-600 mb-2">
                                        <Calendar size={18} />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Due Date</span>
                                    </div>
                                    <p className="text-sm font-black text-gray-800">{new Date(task.dueDate).toLocaleDateString()}</p>
                                </div>
                                <div className="p-6 bg-emerald-50/30 rounded-3xl border border-emerald-50/50">
                                    <div className="flex items-center gap-3 text-emerald-600 mb-2">
                                        <CheckCircle2 size={18} />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Status</span>
                                    </div>
                                    <p className="text-sm font-black text-gray-800 uppercase tracking-tighter">{task.status.replace('_', ' ')}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'comments' && (
                        <div className="flex flex-col h-full">
                            <div className="flex-1 space-y-6 mb-6">
                                {task.comments?.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-300 gap-3 grayscale opacity-50">
                                        <MessageSquare size={40} strokeWidth={1} />
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em]">No discourse yet</p>
                                    </div>
                                ) : (
                                    task.comments?.map((comment, i) => (
                                        <div key={i} className="flex gap-4 items-start group">
                                            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-xs font-black shadow-lg shadow-indigo-200">
                                                {comment.author?.name?.charAt(0) || '?'}
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-black text-gray-900 italic">{comment.author?.name || 'Unknown User'}</span>
                                                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">{formatDate(comment.createdAt)}</span>
                                                </div>
                                                <div className="bg-gray-50/80 p-4 rounded-2xl border border-gray-100 text-sm text-gray-600 font-medium group-hover:bg-white transition-all group-hover:shadow-sm">
                                                    {comment.text}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <form onSubmit={handleAddComment} className="relative mt-auto">
                                <input
                                    type="text"
                                    placeholder="Add to the conversation..."
                                    className="w-full pl-6 pr-14 py-4 bg-gray-50 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-gray-400"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                />
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !newComment.trim()}
                                    className="absolute right-2 top-2 p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-lg shadow-indigo-300 active:scale-90"
                                >
                                    <Send size={16} />
                                </button>
                            </form>
                        </div>
                    )}

                    {activeTab === 'attachments' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center bg-indigo-600 p-6 rounded-3xl shadow-xl shadow-indigo-100">
                                <div className="text-white">
                                    <h4 className="text-sm font-black italic uppercase tracking-tight">Proof of Work</h4>
                                    <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest mt-1">Upload reports, files, or deliverables</p>
                                </div>
                                <button
                                    onClick={handleUploadDummy}
                                    className="px-6 py-3 bg-white text-indigo-600 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:shadow-white/20 transition-all active:scale-95 flex items-center gap-2"
                                >
                                    <Paperclip size={14} /> Upload File
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {task.attachments?.length === 0 ? (
                                    <div className="col-span-2 h-40 border-2 border-dashed border-gray-100 rounded-[32px] flex flex-col items-center justify-center text-gray-300 gap-3">
                                        <FileText size={32} strokeWidth={1} />
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em]">Repository Empty</p>
                                    </div>
                                ) : (
                                    task.attachments?.map((_url, i) => (
                                        <div key={i} className="p-4 bg-white border border-gray-100 rounded-2xl flex items-center justify-between hover:shadow-md transition-all group">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                                    <FileText size={18} />
                                                </div>
                                                <div className="overflow-hidden">
                                                    <p className="text-xs font-black truncate w-40 text-gray-800 italic">proof_submission_{i + 1}.pdf</p>
                                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">PDF Document • 2.4 MB</p>
                                                </div>
                                            </div>
                                            <button className="p-2 hover:bg-gray-50 rounded-xl text-gray-400 hover:text-indigo-600 transition-colors">
                                                <Download size={16} />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { 
                    background: #f1f5f9; 
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #e2e8f0; }
            `}</style>
        </div>
    );
};

export default TaskDetailsModal;
