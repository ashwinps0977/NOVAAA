import { useState, useEffect } from 'react';
import {
    Building2, Users, FileText, DollarSign, Calendar,
    Brain, Mail, Shield, Globe, Zap, Database,
    GitBranch, Save, Plus, Trash2,
    ChevronRight, CheckCircle, Lock
} from 'lucide-react';
import { API_BASE_URL } from '../../../config';

const categories = [
    { id: 'organization', label: 'Organization', icon: Building2 },
    { id: 'users', label: 'User & Roles', icon: Users },
    { id: 'policies', label: 'Policies', icon: FileText },
    { id: 'payroll', label: 'Payroll', icon: DollarSign },
    { id: 'leave', label: 'Leave & Attendance', icon: Calendar },
    { id: 'ai', label: 'AI & Automation', icon: Brain },
    { id: 'notifications', label: 'Notifications', icon: Mail },
    { id: 'security', label: 'Security & Compliance', icon: Shield },
    { id: 'data', label: 'Data & Reports', icon: Database },
    { id: 'integrations', label: 'Integrations', icon: Globe },
    { id: 'rag', label: 'AI Training (RAG)', icon: Zap },
    { id: 'workflow', label: 'Workflow', icon: GitBranch },
];

const HRSettingsSection = () => {
    const [activeTab, setActiveTab] = useState('organization');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [settings, setSettings] = useState<any>(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/hr-settings`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setSettings(data.settings);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpdate = async (category: string, data: any) => {
        setLoading(true);
        setMessage('');
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/hr-settings/${category}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });

            if (res.ok) {
                const result = await res.json();
                setSettings(result.settings);
                setMessage('Settings updated successfully!');
                setTimeout(() => setMessage(''), 3000);
            } else {
                setMessage('Failed to update settings');
            }
        } catch (err) {
            setMessage('Error updating settings');
        } finally {
            setLoading(false);
        }
    };

    if (!settings) return <div className="p-8 text-center text-gray-500">Loading settings...</div>;

    const renderPanel = () => {
        switch (activeTab) {
            case 'organization':
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="flex flex-col space-y-2">
                                <label className="text-sm font-medium text-gray-700">Company Name</label>
                                <input
                                    className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={settings.organization.name}
                                    onChange={(e) => setSettings({ ...settings, organization: { ...settings.organization, name: e.target.value } })}
                                />
                            </div>
                            <div className="flex flex-col space-y-2">
                                <label className="text-sm font-medium text-gray-700">Brand Color</label>
                                <div className="flex space-x-2">
                                    <input
                                        type="color"
                                        className="h-10 w-20 p-1 rounded-lg border cursor-pointer"
                                        value={settings.organization.brandColor}
                                        onChange={(e) => setSettings({ ...settings, organization: { ...settings.organization, brandColor: e.target.value } })}
                                    />
                                    <input
                                        className="flex-1 px-4 py-2 border rounded-lg outline-none"
                                        value={settings.organization.brandColor}
                                        onChange={(e) => setSettings({ ...settings, organization: { ...settings.organization, brandColor: e.target.value } })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-semibold text-gray-900 border-b pb-2">Working Hours</h3>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="flex flex-col space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Shift Start</label>
                                    <input
                                        type="time"
                                        className="px-4 py-2 border rounded-lg outline-none"
                                        value={settings.organization.workingHours.start}
                                        onChange={(e) => setSettings({ ...settings, organization: { ...settings.organization, workingHours: { ...settings.organization.workingHours, start: e.target.value } } })}
                                    />
                                </div>
                                <div className="flex flex-col space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Shift End</label>
                                    <input
                                        type="time"
                                        className="px-4 py-2 border rounded-lg outline-none"
                                        value={settings.organization.workingHours.end}
                                        onChange={(e) => setSettings({ ...settings, organization: { ...settings.organization, workingHours: { ...settings.organization.workingHours, end: e.target.value } } })}
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            disabled={loading}
                            onClick={() => handleUpdate('organization', settings.organization)}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-all flex items-center space-x-2 shadow-lg hover:shadow-blue-200 disabled:opacity-50"
                        >
                            {loading ? <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <Save className="w-4 h-4" />}
                            <span>Save Organization Settings</span>
                        </button>
                    </div>
                );

            case 'ai':
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-2xl border border-indigo-100 mb-6">
                            <div className="flex items-center space-x-3 mb-4">
                                <Brain className="w-6 h-6 text-indigo-600" />
                                <h3 className="text-lg font-bold text-indigo-900">AI Engine Control Center</h3>
                            </div>
                            <p className="text-sm text-indigo-700 mb-6">Manage how AI powers your HR operations, from screening candidates to predicting employee turnover.</p>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-indigo-100">
                                    <div>
                                        <h4 className="font-semibold text-gray-900">Resume Screening Threshold</h4>
                                        <p className="text-xs text-gray-500">Minimum score for automatic shortlisting</p>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <input
                                            type="range"
                                            className="w-32 h-2 bg-indigo-200 rounded-lg appearance-none cursor-pointer"
                                            value={settings.aiAutomation.resumeScreeningThreshold}
                                            onChange={(e) => setSettings({ ...settings, aiAutomation: { ...settings.aiAutomation, resumeScreeningThreshold: parseInt(e.target.value) } })}
                                        />
                                        <span className="font-bold text-indigo-600 w-8">{settings.aiAutomation.resumeScreeningThreshold}%</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-indigo-100">
                                    <div>
                                        <h4 className="font-semibold text-gray-900">Attrition Sensitivity</h4>
                                        <p className="text-xs text-gray-500">How aggressive the turnover prediction model should be</p>
                                    </div>
                                    <select
                                        className="bg-indigo-50 px-3 py-1 rounded-lg border-indigo-200 outline-none text-sm font-medium text-indigo-700"
                                        value={settings.aiAutomation.attritionPredictionSensitivity}
                                        onChange={(e) => setSettings({ ...settings, aiAutomation: { ...settings.aiAutomation, attritionPredictionSensitivity: e.target.value } })}
                                    >
                                        <option>Low</option>
                                        <option>Medium</option>
                                        <option>High</option>
                                    </select>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-indigo-100">
                                    <div>
                                        <h4 className="font-semibold text-gray-900">AI Chatbot Tone</h4>
                                        <p className="text-xs text-gray-500">Personality of the employee-facing assistant</p>
                                    </div>
                                    <select
                                        className="bg-indigo-50 px-3 py-1 rounded-lg border-indigo-200 outline-none text-sm font-medium text-indigo-700"
                                        value={settings.aiAutomation.aiChatbotTone}
                                        onChange={(e) => setSettings({ ...settings, aiAutomation: { ...settings.aiAutomation, aiChatbotTone: e.target.value } })}
                                    >
                                        <option>Friendly</option>
                                        <option>Professional</option>
                                        <option>Formal</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <button
                            disabled={loading}
                            onClick={() => handleUpdate('aiAutomation', settings.aiAutomation)}
                            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-all flex items-center space-x-2 shadow-lg hover:shadow-indigo-200"
                        >
                            <CheckCircle className="w-4 h-4" />
                            <span>Apply AI Updates</span>
                        </button>
                    </div>
                );

            case 'payroll':
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                        <div className="bg-white p-6 rounded-2xl border border-teal-100 shadow-sm">
                            <h3 className="text-lg font-bold text-teal-900 mb-4 flex items-center">
                                <DollarSign className="w-5 h-5 mr-2" /> Payroll Configuration
                            </h3>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="flex flex-col space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Pay Cycle</label>
                                        <select
                                            className="px-4 py-2 border rounded-lg outline-none"
                                            value={settings.payroll.payCycle}
                                            onChange={(e) => setSettings({ ...settings, payroll: { ...settings.payroll, payCycle: e.target.value } })}
                                        >
                                            <option>Monthly</option>
                                            <option>Bi-weekly</option>
                                            <option>Weekly</option>
                                        </select>
                                    </div>
                                    <div className="flex flex-col space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Tax Slab Rules (Brief)</label>
                                        <textarea
                                            className="px-4 py-2 border rounded-lg outline-none h-24"
                                            placeholder="Standard 10% for > 50k..."
                                            value={settings.payroll.bonusRules}
                                            onChange={(e) => setSettings({ ...settings, payroll: { ...settings.payroll, bonusRules: e.target.value } })}
                                        />
                                    </div>
                                </div>
                                <div className="bg-teal-50 p-4 rounded-xl space-y-3">
                                    <h4 className="font-semibold text-teal-800 text-sm">Active Allowances</h4>
                                    {['HRA', 'Conveyance', 'Medical', 'Special'].map(all => (
                                        <div key={all} className="flex items-center justify-between text-sm bg-white p-2 rounded-lg border border-teal-100">
                                            <span>{all}</span>
                                            <span className="text-teal-600 font-bold">Enabled</span>
                                        </div>
                                    ))}
                                    <button className="w-full py-1 text-xs text-teal-600 font-bold border-2 border-dashed border-teal-200 rounded-lg hover:bg-teal-100 transition-colors">
                                        + Add Global Allowance
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button
                            disabled={loading}
                            onClick={() => handleUpdate('payroll', settings.payroll)}
                            className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition-all flex items-center space-x-2"
                        >
                            <Save className="w-4 h-4" />
                            <span>Save Payroll Rules</span>
                        </button>
                    </div>
                );

            case 'users':
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-900">Access Control & Role Management</h3>
                            <button className="flex items-center space-x-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 font-medium transition-colors">
                                <Plus className="w-4 h-4" />
                                <span>Create HR User</span>
                            </button>
                        </div>

                        <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">User</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Role</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Modules</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {[
                                        { name: 'Admin User', role: 'Super Admin', modules: 'All' },
                                        { name: 'Sarah Recruiter', role: 'Recruiter', modules: 'Recruitment, AI' },
                                        { name: 'Mike Manager', role: 'Manager', modules: 'Performance, Leave' }
                                    ].map((u, i) => (
                                        <tr key={i} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-gray-900">{u.name}</td>
                                            <td className="px-6 py-4"><span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold">{u.role}</span></td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{u.modules}</td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="text-gray-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );

            case 'policies':
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900">Official HR Polices</h3>
                            <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium transition-all shadow-sm">
                                <Plus className="w-4 h-4" />
                                <span>Upload New Policy</span>
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {['Leave Policy', 'Salary Policy', 'Code of Conduct', 'WFH Policy'].map(p => (
                                <div key={p} className="p-4 border rounded-2xl flex items-center justify-between hover:border-blue-300 transition-colors group">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">{p}</p>
                                            <p className="text-xs text-gray-500">v1.2 • Last updated 2 days ago</p>
                                        </div>
                                    </div>
                                    <button className="text-gray-400 hover:text-blue-600 font-medium text-sm">View History</button>
                                </div>
                            ))}
                        </div>
                    </div>
                );

            case 'leave':
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                        <div className="bg-white p-6 rounded-2xl border border-orange-100 shadow-sm">
                            <h3 className="text-lg font-bold text-orange-900 mb-6 flex items-center">
                                <Calendar className="w-5 h-5 mr-2" /> Global Leave Control Panel
                            </h3>
                            <div className="grid grid-cols-3 gap-6 mb-8">
                                <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100">
                                    <p className="text-xs font-bold text-orange-600 uppercase mb-1">Max SL / Year</p>
                                    <input type="number" className="bg-transparent text-2xl font-black text-orange-900 outline-none w-full" defaultValue={12} />
                                </div>
                                <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100">
                                    <p className="text-xs font-bold text-orange-600 uppercase mb-1">Max CL / Year</p>
                                    <input type="number" className="bg-transparent text-2xl font-black text-orange-900 outline-none w-full" defaultValue={10} />
                                </div>
                                <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100">
                                    <p className="text-xs font-bold text-orange-600 uppercase mb-1">WFH Monthly Limit</p>
                                    <input type="number" className="bg-transparent text-2xl font-black text-orange-900 outline-none w-full" defaultValue={4} />
                                </div>
                            </div>
                            <div className="flex items-center space-x-2 mb-4">
                                <input type="checkbox" className="w-4 h-4 text-orange-600 rounded" defaultChecked />
                                <span className="text-sm font-medium text-gray-700">Enable half-day leave requests</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <input type="checkbox" className="w-4 h-4 text-orange-600 rounded" defaultChecked />
                                <span className="text-sm font-medium text-gray-700">Allow leave carry-forward to next year</span>
                            </div>
                        </div>
                        <button className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-all flex items-center space-x-2">
                            <Save className="w-4 h-4" />
                            <span>Update Leave Rules</span>
                        </button>
                    </div>
                );

            case 'rag':
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-8 rounded-3xl border border-purple-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8">
                                <Zap className="w-20 h-20 text-purple-200/50" />
                            </div>
                            <h3 className="text-2xl font-black text-purple-900 mb-2">Knowledge Base & RAG</h3>
                            <p className="text-purple-700 mb-8 max-w-lg">Train the AI Assistant on your company's specific DNA. Upload handbooks, policy PDFs, and rulebooks to the vector database.</p>

                            <div className="flex items-center space-x-4 mb-8">
                                <button className="bg-purple-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-purple-200 hover:bg-purple-700 transition-all">
                                    Sync Vector Database
                                </button>
                                <button className="bg-white text-purple-600 px-8 py-3 rounded-2xl font-bold border border-purple-200 hover:bg-purple-50 transition-all">
                                    View Training Logs
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-white/50 backdrop-blur-sm rounded-2xl border border-purple-100">
                                    <h4 className="font-bold text-gray-900 mb-1">Documents Indexed</h4>
                                    <p className="text-3xl font-black text-purple-600">42</p>
                                </div>
                                <div className="p-4 bg-white/50 backdrop-blur-sm rounded-2xl border border-purple-100">
                                    <h4 className="font-bold text-gray-900 mb-1">Knowledge Coverage</h4>
                                    <p className="text-3xl font-black text-purple-600">94.2%</p>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'security':
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                        <div className="bg-white p-6 rounded-2xl border border-red-100 shadow-sm">
                            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                                <Shield className="w-5 h-5 mr-2 text-red-600" /> Security Enforcement
                            </h3>
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-bold text-gray-900">Two-Factor Authentication (MFA)</p>
                                        <p className="text-sm text-gray-500">Require MFA for all HR and Manager roles</p>
                                    </div>
                                    <div className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" defaultChecked />
                                        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                                    </div>
                                </div>
                                <div className="flex flex-col space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Minimum Password Length</label>
                                    <input type="number" className="px-4 py-2 border rounded-lg outline-none w-32" defaultValue={8} />
                                </div>
                                <div className="flex items-center justify-between border-t pt-6">
                                    <div>
                                        <p className="font-bold text-gray-900">Session Timeout</p>
                                        <p className="text-sm text-gray-500">Auto logout after inactivity (minutes)</p>
                                    </div>
                                    <input type="number" className="px-4 py-2 border rounded-lg outline-none w-32" defaultValue={60} />
                                </div>
                            </div>
                        </div>
                        <button className="bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-black transition-all flex items-center space-x-2">
                            <Lock className="w-4 h-4" />
                            <span>Update Security Protocols</span>
                        </button>
                    </div>
                );
        }
    };

    return (
        <div className="flex bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-100 min-h-[700px]">
            {/* Settings Sidebar */}
            <div className="w-80 bg-gray-50 border-r border-gray-200 p-6">
                <div className="flex items-center space-x-3 mb-10 px-2">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                        <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Admin Console</h2>
                        <p className="text-xs text-gray-500 font-medium tracking-wider uppercase">System Control</p>
                    </div>
                </div>

                <nav className="space-y-1">
                    {categories.map((cat) => {
                        const Icon = cat.icon;
                        return (
                            <button
                                key={cat.id}
                                onClick={() => setActiveTab(cat.id)}
                                className={`w-full flex items-center space-x-3 p-3 rounded-2xl transition-all duration-200 ${activeTab === cat.id
                                    ? 'bg-white text-blue-600 shadow-md ring-1 ring-black/5'
                                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                                    }`}
                            >
                                <div className={`p-2 rounded-xl transition-colors ${activeTab === cat.id ? 'bg-blue-600 text-white' : 'bg-gray-100'
                                    }`}>
                                    <Icon className="w-5 h-5 flex-shrink-0" />
                                </div>
                                <span className="font-bold text-sm">{cat.label}</span>
                                {activeTab === cat.id && <ChevronRight className="w-4 h-4 ml-auto" />}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Main Panel */}
            <div className="flex-1 p-8 overflow-y-auto max-h-[85vh]">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                            {categories.find(c => c.id === activeTab)?.label}
                        </h1>
                        <p className="text-gray-500 mt-1 font-medium">Control global parameters and automation rules</p>
                    </div>
                    {message && (
                        <div className="bg-green-50 text-green-700 px-6 py-3 rounded-2xl border border-green-100 flex items-center space-x-3 animate-in zoom-in slide-in-from-right-10">
                            <div className="bg-green-500 rounded-full p-1"><CheckCircle className="w-4 h-4 text-white" /></div>
                            <span className="font-bold">{message}</span>
                        </div>
                    )}
                </div>

                <div className="bg-white">
                    {renderPanel()}
                </div>
            </div>
        </div>
    );
};

export default HRSettingsSection;
