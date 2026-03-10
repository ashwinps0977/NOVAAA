import { useState, useEffect } from 'react';
import {
    User, Shield, Bell, Laptop, Briefcase,
    FileText, Brain, CreditCard, GraduationCap,
    Trash2, AlertTriangle, Globe, Clock, Palette,
    Save, CheckCircle, ChevronRight, Upload, Download,
    Smartphone, History, Lock
} from 'lucide-react';
import { API_BASE_URL } from '../../config';

const SettingsSection = ({ user, onUpdate }: { user: any, onUpdate: () => void }) => {
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [settings, setSettings] = useState<any>(null);

    // Form states
    const [profileForm, setProfileForm] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        address: user?.address || '',
        emergencyContact: user?.emergencyContact || { name: '', relation: '', phone: '' }
    });

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [payrollForm, setPayrollForm] = useState({
        bankName: settings?.bankDetails?.bankName || '',
        accountNumber: settings?.bankDetails?.accountNumber || ''
    });

    const [newSkill, setNewSkill] = useState('');

    useEffect(() => {
        fetchSettings();
    }, []);

    useEffect(() => {
        if (settings) {
            setPayrollForm({
                bankName: settings.bankDetails?.bankName || '',
                accountNumber: settings.bankDetails?.accountNumber || ''
            });
        }
    }, [settings]);

    const fetchSettings = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/settings`, {
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

    const handleUpdate = async (category: string, data: any, method: string = 'PUT') => {
        setLoading(true);
        setMessage('');
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/settings/${category}`, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });
            if (res.ok) {
                setMessage('Settings updated successfully!');
                fetchSettings();
                onUpdate();
                if (category === 'security/password') {
                    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                }

                // Immediate theme application
                if (category === 'preferences' && data.theme) {
                    localStorage.setItem('theme', data.theme);
                    if (data.theme === 'dark') {
                        document.documentElement.classList.add('dark');
                    } else {
                        document.documentElement.classList.remove('dark');
                    }
                }
            } else {
                const error = await res.json();
                setMessage(error.message || 'Update failed. Please try again.');
            }
        } catch (err) {
            setMessage('Update failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'work-info', label: 'Work Info', icon: Briefcase },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'preferences', label: 'Preferences', icon: Palette },
        { id: 'work-prefs', label: 'Work & HR', icon: Laptop },
        { id: 'documents', label: 'Documents', icon: FileText },
        { id: 'ai', label: 'AI & Smart', icon: Brain },
        { id: 'payroll', label: 'Payroll & Bank', icon: CreditCard },
        { id: 'learning', label: 'Growth', icon: GraduationCap },
        { id: 'account', label: 'Management', icon: AlertTriangle },
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'profile':
                return (
                    <div className="space-y-6">
                        <div className="flex items-center space-x-4 mb-6">
                            <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center border-4 border-white shadow-sm overflow-hidden">
                                {user?.profilePhoto ? <img src={user.profilePhoto} alt="Profile" /> : <User className="w-10 h-10 text-blue-500" />}
                            </div>
                            <input
                                type="file"
                                id="profile-upload"
                                className="hidden"
                                accept="image/*"
                                onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                            handleUpdate('profile-photo', { photo: reader.result }, 'POST');
                                        };
                                        reader.readAsDataURL(file);
                                    }
                                }}
                            />
                            <button
                                onClick={() => document.getElementById('profile-upload')?.click()}
                                className="text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 px-4 py-2 rounded-lg transition-colors"
                            >
                                Change Photo
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    value={profileForm.name}
                                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    value={profileForm.phone}
                                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                <textarea
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    rows={2}
                                    value={profileForm.address}
                                    onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="pt-4 border-t">
                            <h4 className="font-semibold text-gray-800 mb-4">Emergency Contact</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <input placeholder="Name" className="px-4 py-2 border rounded-lg" value={profileForm.emergencyContact.name} onChange={(e) => setProfileForm({ ...profileForm, emergencyContact: { ...profileForm.emergencyContact, name: e.target.value } })} />
                                <input placeholder="Relation" className="px-4 py-2 border rounded-lg" value={profileForm.emergencyContact.relation} onChange={(e) => setProfileForm({ ...profileForm, emergencyContact: { ...profileForm.emergencyContact, relation: e.target.value } })} />
                                <input placeholder="Phone" className="px-4 py-2 border rounded-lg" value={profileForm.emergencyContact.phone} onChange={(e) => setProfileForm({ ...profileForm, emergencyContact: { ...profileForm.emergencyContact, phone: e.target.value } })} />
                            </div>
                        </div>
                        <button
                            disabled={loading}
                            onClick={() => handleUpdate('profile', profileForm)}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
                        >
                            {loading ? <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <Save className="w-4 h-4" />}
                            <span>{loading ? 'Saving...' : 'Save Profile'}</span>
                        </button>
                    </div>
                );

            case 'work-info':
                return (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-gray-50 rounded-xl border">
                                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Employee ID</p>
                                <p className="font-semibold text-gray-900">{user?.employeeId ? `EMP-${user.employeeId.slice(-6).toUpperCase()}` : 'N/A'}</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl border">
                                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Department</p>
                                <p className="font-semibold text-gray-900">{user?.department}</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl border">
                                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Designation</p>
                                <p className="font-semibold text-gray-900">{user?.position}</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl border">
                                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Joining Date</p>
                                <p className="font-semibold text-gray-900">{user?.joiningDate ? new Date(user.joiningDate).toLocaleDateString() : 'N/A'}</p>
                            </div>
                        </div>
                        <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex items-start space-x-3">
                            <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5" />
                            <p className="text-sm text-amber-800">Work information is read-only. Contact HR at hr@nova.com to update these details if they are incorrect.</p>
                        </div>
                    </div>
                );

            case 'security':
                return (
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><Lock className="w-4 h-4" /> Change Password</h4>
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                if (passwordForm.newPassword !== passwordForm.confirmPassword) {
                                    alert('Passwords do not match');
                                    return;
                                }
                                handleUpdate('security/password', {
                                    currentPassword: passwordForm.currentPassword,
                                    newPassword: passwordForm.newPassword
                                });
                            }} className="space-y-4 max-w-sm">
                                <input
                                    type="password"
                                    placeholder="Current Password"
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    value={passwordForm.currentPassword}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                    required
                                />
                                <input
                                    type="password"
                                    placeholder="New Password"
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    value={passwordForm.newPassword}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                    required
                                />
                                <input
                                    type="password"
                                    placeholder="Confirm New Password"
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    value={passwordForm.confirmPassword}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                    required
                                />
                                <button
                                    type="submit"
                                    className="bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-black transition-colors disabled:opacity-50"
                                    disabled={loading}
                                >
                                    {loading ? 'Updating...' : 'Update Password'}
                                </button>
                            </form>
                        </div>
                        <div className="pt-6 border-t">
                            <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><Smartphone className="w-4 h-4" /> Two-Factor Authentication</h4>
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border">
                                <div>
                                    <p className="font-medium text-gray-900 text-sm">Enable Email OTP</p>
                                    <p className="text-xs text-gray-500">Adds an extra layer of security to your account.</p>
                                </div>
                                <button
                                    onClick={() => handleUpdate('security/2fa', { enabled: !settings?.security?.twoFactorEnabled })}
                                    className={`w-12 h-6 rounded-full transition-colors relative ${settings?.security?.twoFactorEnabled ? 'bg-green-500' : 'bg-gray-300'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${settings?.security?.twoFactorEnabled ? 'translate-x-7' : 'translate-x-1'}`}></div>
                                </button>
                            </div>
                        </div>
                        <div className="pt-6 border-t">
                            <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><History className="w-4 h-4" /> Login History</h4>
                            <div className="space-y-2">
                                {settings?.security?.loginHistory?.map((log: any, i: number) => (
                                    <div key={i} className="flex justify-between items-center p-3 text-sm border-b last:border-0 hover:bg-gray-50 rounded-lg transition-colors">
                                        <div className="flex items-center space-x-3">
                                            <Laptop className="w-4 h-4 text-gray-400" />
                                            <div>
                                                <p className="font-medium">{log.device || 'Chrome - Windows'}</p>
                                                <p className="text-xs text-gray-500">{log.ip || '192.168.1.1'}</p>
                                            </div>
                                        </div>
                                        <span className="text-gray-400 text-xs">{new Date(log.time).toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );

            case 'preferences':
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2"><Palette className="w-4 h-4" /> Theme</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => handleUpdate('preferences', { theme: 'light' })}
                                        className={`p-4 border rounded-xl flex flex-col items-center gap-2 transition-all ${settings?.preferences?.theme === 'light' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                                    >
                                        <div className="w-full h-8 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded"></div>
                                        <span className={`text-sm font-medium ${settings?.preferences?.theme === 'light' ? 'text-blue-600' : 'text-gray-500 dark:text-gray-400'}`}>Light</span>
                                    </button>
                                    <button
                                        onClick={() => handleUpdate('preferences', { theme: 'dark' })}
                                        className={`p-4 border rounded-xl flex flex-col items-center gap-2 transition-all ${settings?.preferences?.theme === 'dark' ? 'border-blue-500 bg-blue-900 text-white shadow-lg shadow-blue-900/20' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                                    >
                                        <div className="w-full h-8 bg-gray-800 dark:bg-gray-700 border border-gray-600 rounded"></div>
                                        <span className={`text-sm font-medium ${settings?.preferences?.theme === 'dark' ? 'text-white' : 'text-gray-400'}`}>Dark</span>
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2"><Globe className="w-4 h-4" /> Language</label>
                                    <select
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                        value={settings?.preferences?.language}
                                        onChange={(e) => handleUpdate('preferences', { language: e.target.value })}
                                    >
                                        <option value="en">English (US)</option>
                                        <option value="es">Spanish</option>
                                        <option value="fr">French</option>
                                        <option value="hi">Hindi</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2"><Clock className="w-4 h-4" /> Timezone</label>
                                    <select
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                        value={settings?.preferences?.timezone}
                                        onChange={(e) => handleUpdate('preferences', { timezone: e.target.value })}
                                    >
                                        <option value="UTC">UTC (GMT+0)</option>
                                        <option value="IST">IST (GMT+5:30)</option>
                                        <option value="EST">EST (GMT-5)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="pt-6 border-t">
                            <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><Bell className="w-4 h-4" /> Notification Preferences</h4>
                            <div className="space-y-3">
                                {settings?.notifications && Object.entries({
                                    email: 'Email Notifications',
                                    sms: 'SMS Alerts',
                                    inApp: 'In-app Notifications',
                                    salaryUpdates: 'Salary Updates',
                                    leaveUpdates: 'Leave Updates',
                                    hrAnnouncements: 'HR Announcements',
                                    aiAlerts: 'AI Alerts'
                                }).map(([key, label]) => (
                                    <div key={key} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100/50 dark:border-gray-700/50">
                                        <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">{label}</span>
                                        <button
                                            onClick={() => handleUpdate('notifications', { [key]: !settings.notifications[key] })}
                                            className={`w-10 h-5 rounded-full transition-all relative ${settings.notifications[key] ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}
                                        >
                                            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${settings.notifications[key] ? 'translate-x-5.5' : 'translate-x-0.5'}`}></div>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );

            case 'work-prefs':
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Work Location</label>
                                <div className="space-y-2">
                                    {['WFH', 'Office', 'Hybrid'].map((loc) => (
                                        <button
                                            key={loc}
                                            onClick={() => handleUpdate('work-preferences', { workLocation: loc })}
                                            className={`w-full p-3 rounded-lg border text-left flex items-center justify-between ${settings?.workPreferences?.workLocation === loc ? 'border-blue-500 bg-blue-50 text-blue-700' : 'hover:bg-gray-50'}`}
                                        >
                                            <span>{loc}</span>
                                            {settings?.workPreferences?.workLocation === loc && <CheckCircle className="w-4 h-4" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Shift</label>
                                <select
                                    className="w-full px-4 py-2 border rounded-lg"
                                    value={settings?.workPreferences?.preferredShift}
                                    onChange={(e) => handleUpdate('work-preferences', { preferredShift: e.target.value })}
                                >
                                    <option value="Day Shift (9 AM - 6 PM)">Day Shift (9 AM - 6 PM)</option>
                                    <option value="Night Shift (9 PM - 6 AM)">Night Shift (9 PM - 6 AM)</option>
                                    <option value="Flexible Hours">Flexible Hours</option>
                                </select>
                            </div>
                        </div>
                    </div>
                );

            case 'documents':
                return (
                    <div className="space-y-6">
                        <input
                            type="file"
                            id="doc-upload"
                            className="hidden"
                            onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    handleUpdate('documents', { type: 'Other', name: file.name, url: '#' }, 'POST');
                                }
                            }}
                        />
                        <div
                            onClick={() => document.getElementById('doc-upload')?.click()}
                            className="p-8 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                        >
                            <Upload className="w-10 h-10 text-gray-400 mb-3" />
                            <p className="font-medium text-gray-700">Click to upload new document</p>
                            <p className="text-xs text-gray-500 mt-1">PDF, PNG up to 10MB (Resume, Certificates, ID Proof)</p>
                        </div>
                        <div className="space-y-3">
                            <h4 className="font-semibold text-gray-800">Your Documents</h4>
                            {(settings?.documents?.length > 0 ? settings.documents : [{ name: 'Offer Letter.pdf', type: 'contract' }, { name: 'Latest_Payslip.pdf', type: 'payslip' }]).map((doc: any, i: number) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-white border rounded-xl hover:shadow-sm transition-shadow">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                                            <FileText className="w-5 h-5 text-red-500" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 text-sm">{doc.name}</p>
                                            <p className="text-xs text-gray-500">Uploaded on {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : 'Jan 15, 2026'}</p>
                                        </div>
                                    </div>
                                    <button className="p-2 text-gray-400 hover:text-blue-500 transition-colors">
                                        <Download className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                );

            case 'ai':
                return (
                    <div className="space-y-6">
                        <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl text-white shadow-lg">
                            <div className="flex items-center space-x-4 mb-4">
                                <Brain className="w-10 h-10" />
                                <div>
                                    <h3 className="text-xl font-bold">NOVA AI Settings</h3>
                                    <p className="text-blue-100 text-sm opacity-90">Personalize your AI Assistant experience.</p>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-white border rounded-xl">
                                <div>
                                    <p className="font-semibold text-gray-900 text-sm">Enable AI HR Assistant</p>
                                    <p className="text-xs text-gray-500">Allow AI to help with leaves and queries.</p>
                                </div>
                                <button
                                    onClick={() => handleUpdate('ai-settings', { enabled: !settings?.aiSettings?.enabled })}
                                    className={`w-12 h-6 rounded-full transition-colors relative ${settings?.aiSettings?.enabled ? 'bg-blue-600' : 'bg-gray-300'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${settings?.aiSettings?.enabled ? 'translate-x-7' : 'translate-x-1'}`}></div>
                                </button>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">AI Response Tone</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {['Formal', 'Friendly', 'Professional'].map((tone) => (
                                        <button
                                            key={tone}
                                            onClick={() => handleUpdate('ai-settings', { tone: tone.toLowerCase() })}
                                            className={`px-4 py-2 border rounded-lg text-sm font-medium transition-all ${settings?.aiSettings?.tone === tone.toLowerCase() ? 'bg-blue-50 border-blue-500 text-blue-700' : 'hover:bg-gray-50'}`}
                                        >
                                            {tone}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'payroll':
                return (
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <h4 className="font-semibold text-gray-800 flex items-center gap-2"><CreditCard className="w-4 h-4" /> Bank Account Details</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-500 mb-1 font-bold uppercase text-[10px]">Bank Name</label>
                                    <input
                                        placeholder="e.g. Chase Bank"
                                        className="w-full px-4 py-2 border rounded-lg"
                                        value={payrollForm.bankName || settings?.bankDetails?.bankName}
                                        onChange={(e) => setPayrollForm({ ...payrollForm, bankName: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-500 mb-1 font-bold uppercase text-[10px]">Account Number</label>
                                    <input
                                        placeholder="XXXX XXXX XXXX"
                                        className="w-full px-4 py-2 border rounded-lg"
                                        value={payrollForm.accountNumber || settings?.bankDetails?.accountNumber}
                                        onChange={(e) => setPayrollForm({ ...payrollForm, accountNumber: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="pt-6 border-t">
                            <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><FileText className="w-4 h-4" /> Tax Regime</h4>
                            <div className="grid grid-cols-2 gap-3 max-w-sm">
                                {['Old', 'New'].map((reg) => (
                                    <button
                                        key={reg}
                                        onClick={() => handleUpdate('payroll', { taxRegime: reg })}
                                        className={`p-3 border rounded-xl font-medium ${settings?.taxRegime === reg ? 'border-blue-500 bg-blue-50 text-blue-700' : 'hover:bg-gray-50'}`}
                                    >
                                        {reg} Regime
                                    </button>
                                ))}
                            </div>
                        </div>
                        <button
                            disabled={loading}
                            onClick={() => handleUpdate('payroll', { bankDetails: payrollForm })}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : 'Save Payroll Details'}
                        </button>
                    </div>
                );

            case 'learning':
                return (
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><GraduationCap className="w-4 h-4" /> Interested Skills</h4>
                            <div className="flex flex-wrap gap-2 text-sm mb-4">
                                {(settings?.learning || []).map((skill: string, i: number) => (
                                    <span key={i} className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-100 flex items-center gap-2">
                                        {skill}
                                        <button
                                            onClick={() => {
                                                const updated = settings.learning.filter((_: any, idx: number) => idx !== i);
                                                handleUpdate('learning', { learning: updated });
                                            }}
                                            className="hover:text-red-500"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                            <div className="flex gap-2 max-w-sm">
                                <input
                                    placeholder="Add new skill..."
                                    className="flex-1 px-4 py-1 border rounded-lg text-sm"
                                    value={newSkill}
                                    onChange={(e) => setNewSkill(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter' && newSkill.trim()) {
                                            handleUpdate('learning', { learning: [...(settings?.learning || []), newSkill.trim()] });
                                            setNewSkill('');
                                        }
                                    }}
                                />
                                <button
                                    onClick={() => {
                                        if (newSkill.trim()) {
                                            handleUpdate('learning', { learning: [...(settings?.learning || []), newSkill.trim()] });
                                            setNewSkill('');
                                        }
                                    }}
                                    className="bg-emerald-600 text-white px-4 py-1 rounded-lg text-sm hover:bg-emerald-700 transition-colors"
                                >
                                    Add
                                </button>
                            </div>
                        </div>
                    </div>
                );

            case 'account':
                return (
                    <div className="space-y-8">
                        <div className="p-4 bg-gray-50 rounded-xl border space-y-4">
                            <h4 className="font-semibold text-gray-800">Advanced Account Management</h4>
                            <div className="space-y-2">
                                <button
                                    onClick={async () => {
                                        const token = localStorage.getItem('token');
                                        const res = await fetch(`${API_BASE_URL}/settings/export-data`, {
                                            headers: { 'Authorization': `Bearer ${token}` }
                                        });
                                        if (res.ok) {
                                            const data = await res.json();
                                            const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
                                            const url = window.URL.createObjectURL(blob);
                                            const a = document.createElement('a');
                                            a.href = url;
                                            a.download = 'my-nova-data.json';
                                            a.click();
                                        }
                                    }}
                                    className="w-full text-left p-2 text-sm text-gray-600 hover:text-blue-600 flex items-center justify-between group"
                                >
                                    <span>Download All My Data (.JSON)</span>
                                    <Download className="w-4 h-4 opacity-0 group-hover:opacity-100" />
                                </button>
                                <button className="w-full text-left p-2 text-sm text-gray-600 hover:text-blue-600 flex items-center justify-between group">
                                    <span>Export Login History</span>
                                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100" />
                                </button>
                                <button className="w-full text-left p-2 text-sm text-gray-600 hover:text-blue-600 flex items-center justify-between group">
                                    <span>Manage Privacy Consents</span>
                                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100" />
                                </button>
                            </div>
                        </div>
                        <div className="p-6 border border-red-100 bg-red-50 rounded-2xl">
                            <h4 className="font-bold text-red-800 mb-2 flex items-center gap-2"><Trash2 className="w-5 h-5" /> Danger Zone</h4>
                            <p className="text-sm text-red-700 mb-6">Once you deactivate or delete your account, there is no going back. Please be certain.</p>
                            <div className="flex flex-wrap gap-3">
                                <button
                                    onClick={async () => {
                                        if (confirm('Are you sure you want to deactivate your account?')) {
                                            const token = localStorage.getItem('token');
                                            const res = await fetch(`${API_BASE_URL}/settings/account`, {
                                                method: 'DELETE',
                                                headers: { 'Authorization': `Bearer ${token}` }
                                            });
                                            if (res.ok) {
                                                alert('Account deactivated. Logging out...');
                                                localStorage.removeItem('token');
                                                window.location.reload();
                                            }
                                        }
                                    }}
                                    className="bg-white border border-red-200 text-red-700 px-4 py-2 rounded-lg font-semibold hover:bg-red-100 transition-colors"
                                >
                                    Deactivate Account
                                </button>
                                <button className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors shadow-lg shadow-red-200">Delete Account</button>
                            </div>
                        </div>
                    </div>
                );

            default:
                return <div>Select a category from the left.</div>
        }
    };

    return (
        <div className="flex bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-800 min-h-[700px]">
            {/* Settings Sidebar */}
            <div className="w-72 bg-gray-50/50 dark:bg-gray-800/50 border-r border-gray-100 dark:border-gray-800 p-6">
                <div className="mb-8">
                    <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">User Settings</h2>
                    <p className="text-xs text-gray-400 mt-1">Manage your account & preferences</p>
                </div>
                <nav className="space-y-1">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${isActive
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/20 translate-x-1'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400'
                                    }`}
                            >
                                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                                <span className={`text-sm font-medium ${isActive ? 'font-bold' : ''}`}>{tab.label}</span>
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Main Settings Panel */}
            <div className="flex-1 p-10 bg-white dark:bg-gray-900">
                <div className="max-w-3xl">
                    <div className="mb-8 flex items-center justify-between">
                        <div>
                            <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{tabs.find(t => t.id === activeTab)?.label}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Configure your {activeTab.replace('-', ' ')} settings</p>
                        </div>
                        {message && (
                            <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg border border-emerald-100 text-sm flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" />
                                {message}
                            </div>
                        )}
                    </div>

                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {renderTabContent()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsSection;
