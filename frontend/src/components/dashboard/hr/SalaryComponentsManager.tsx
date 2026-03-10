import { useState, useEffect } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import { API_BASE_URL } from '../../../config';

const SalaryComponentsManager = () => {
    const [activeTab, setActiveTab] = useState<'bonus' | 'deduction' | 'tax'>('bonus');
    const [loading, setLoading] = useState(true);
    const [bonuses, setBonuses] = useState<any[]>([]);
    const [deductions, setDeductions] = useState<any[]>([]);
    const [taxRules, setTaxRules] = useState<any[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        employeeId: '',
        amount: '',
        type: '',
        reason: '',
        month: new Date().toLocaleString('default', { month: 'long' }),
        year: new Date().getFullYear(),
        // For Tax Rules
        name: '',
        minIncome: '',
        maxIncome: '',
        percentage: '',
        financialYear: '2025-2026'
    });

    useEffect(() => {
        fetchData();
        fetchEmployees();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const endpoint = activeTab === 'bonus' ? 'bonuses' : activeTab === 'deduction' ? 'deductions' : 'tax-rules';
            const res = await fetch(`${API_BASE_URL}/salary/${endpoint}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                if (activeTab === 'bonus') setBonuses(data);
                else if (activeTab === 'deduction') setDeductions(data);
                else setTaxRules(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchEmployees = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/hr/employees`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setEmployees(data.employees || []);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const endpoint = activeTab === 'bonus' ? 'bonus' : activeTab === 'deduction' ? 'deduction' : 'tax-rule';

            const payload = activeTab === 'tax' ? {
                name: formData.name,
                minIncome: Number(formData.minIncome),
                maxIncome: Number(formData.maxIncome),
                percentage: Number(formData.percentage),
                financialYear: formData.financialYear
            } : {
                employeeId: formData.employeeId,
                amount: Number(formData.amount),
                type: formData.type,
                reason: formData.reason,
                month: formData.month,
                year: Number(formData.year)
            };

            const res = await fetch(`${API_BASE_URL}/salary/${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setShowModal(false);
                fetchData();
                setFormData({ ...formData, amount: '', reason: '', type: '', name: '', minIncome: '', maxIncome: '', percentage: '' });
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure?')) return;
        try {
            const token = localStorage.getItem('token');
            const endpoint = activeTab === 'bonus' ? 'bonus' : activeTab === 'deduction' ? 'deduction' : 'tax-rule';
            const res = await fetch(`${API_BASE_URL}/salary/${endpoint}/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold mb-6">Manage Salary Components</h2>

            {/* Tabs */}
            <div className="flex space-x-4 mb-6 border-b border-gray-100 max-w-md">
                <button
                    onClick={() => setActiveTab('bonus')}
                    className={`pb-2 px-1 ${activeTab === 'bonus' ? 'border-b-2 border-green-500 text-green-600 font-medium' : 'text-gray-500'}`}
                >
                    Bonuses
                </button>
                <button
                    onClick={() => setActiveTab('deduction')}
                    className={`pb-2 px-1 ${activeTab === 'deduction' ? 'border-b-2 border-red-500 text-red-600 font-medium' : 'text-gray-500'}`}
                >
                    Deductions
                </button>
                <button
                    onClick={() => setActiveTab('tax')}
                    className={`pb-2 px-1 ${activeTab === 'tax' ? 'border-b-2 border-blue-500 text-blue-600 font-medium' : 'text-gray-500'}`}
                >
                    Tax Rules
                </button>
            </div>

            {/* Content Areas */}
            {activeTab === 'bonus' && (
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-gray-700">Employee Bonuses</h3>
                        <button
                            onClick={() => setShowModal(true)}
                            className="flex items-center space-x-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-lg text-sm hover:bg-green-100">
                            <Plus size={16} /> <span>Add Bonus</span>
                        </button>
                    </div>
                    {loading ? <p>Loading...</p> : (
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500">
                                <tr>
                                    <th className="p-3">Employee</th>
                                    <th className="p-3">Type</th>
                                    <th className="p-3">Amount</th>
                                    <th className="p-3">Period</th>
                                    <th className="p-3">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bonuses.map((b: any) => (
                                    <tr key={b._id} className="border-b last:border-0 hover:bg-gray-50">
                                        <td className="p-3 font-medium">{b.employee?.name}</td>
                                        <td className="p-3 text-xs">{b.type}</td>
                                        <td className="p-3 font-bold text-green-600">₹{b.amount.toLocaleString()}</td>
                                        <td className="p-3 text-gray-500">{b.payrollPeriod?.month} {b.payrollPeriod?.year}</td>
                                        <td className="p-3">
                                            <button onClick={() => handleDelete(b._id)} className="text-red-500 hover:text-red-700">
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {bonuses.length === 0 && <tr><td colSpan={5} className="p-10 text-center text-gray-400">No bonuses found.</td></tr>}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {activeTab === 'deduction' && (
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-gray-700">Employee Deductions</h3>
                        <button
                            onClick={() => setShowModal(true)}
                            className="flex items-center space-x-2 bg-red-50 text-red-700 px-3 py-1.5 rounded-lg text-sm hover:bg-red-100">
                            <Plus size={16} /> <span>Add Deduction</span>
                        </button>
                    </div>
                    {loading ? <p>Loading...</p> : (
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500">
                                <tr>
                                    <th className="p-3">Employee</th>
                                    <th className="p-3">Type</th>
                                    <th className="p-3">Amount</th>
                                    <th className="p-3">Period</th>
                                    <th className="p-3">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {deductions.map((d: any) => (
                                    <tr key={d._id} className="border-b last:border-0 hover:bg-gray-50">
                                        <td className="p-3 font-medium">{d.employee?.name}</td>
                                        <td className="p-3 text-xs">{d.type}</td>
                                        <td className="p-3 font-bold text-red-600">₹{d.amount.toLocaleString()}</td>
                                        <td className="p-3 text-gray-500">{d.payrollPeriod?.month} {d.payrollPeriod?.year}</td>
                                        <td className="p-3">
                                            <button onClick={() => handleDelete(d._id)} className="text-red-500 hover:text-red-700">
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {deductions.length === 0 && <tr><td colSpan={5} className="p-10 text-center text-gray-400">No deductions found.</td></tr>}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {activeTab === 'tax' && (
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-gray-700">Income Tax Slabs</h3>
                        <button
                            onClick={() => setShowModal(true)}
                            className="flex items-center space-x-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-sm hover:bg-blue-100">
                            <Plus size={16} /> <span>Add Rule</span>
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {taxRules.map((r: any) => (
                            <div key={r._id} className="border p-4 rounded-xl flex justify-between items-center bg-gray-50 relative group">
                                <button
                                    onClick={() => handleDelete(r._id)}
                                    className="absolute -top-2 -right-2 bg-white text-red-500 p-1 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                    <X size={14} />
                                </button>
                                <div>
                                    <p className="font-bold text-gray-800">{r.name}</p>
                                    <p className="text-xs text-blue-600 font-bold">{r.financialYear}</p>
                                    <p className="text-xs text-gray-500 mt-1">₹{r.minIncome.toLocaleString()} - ₹{r.maxIncome.toLocaleString()}</p>
                                </div>
                                <div className="bg-blue-600 text-white px-3 py-1 rounded-lg font-black text-lg">
                                    {r.percentage}%
                                </div>
                            </div>
                        ))}
                        {taxRules.length === 0 && <p className="text-center text-gray-400 py-10">No tax rules defined.</p>}
                    </div>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold uppercase tracking-tight text-gray-800">
                                {activeTab === 'tax' ? 'New Tax Rule' : `Add ${activeTab}`}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {activeTab !== 'tax' ? (
                                <>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Select Employee</label>
                                        <select
                                            required
                                            className="w-full border rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={formData.employeeId}
                                            onChange={e => setFormData({ ...formData, employeeId: e.target.value })}
                                        >
                                            <option value="">-- Choose --</option>
                                            {employees.map(e => <option key={e._id} value={e._id}>{e.name} ({e.email})</option>)}
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Amount (₹)</label>
                                            <input
                                                type="number" required placeholder="0.00"
                                                className="w-full border rounded-xl px-4 py-2 text-sm"
                                                value={formData.amount}
                                                onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Type</label>
                                            <input
                                                required placeholder="e.g. Performance"
                                                className="w-full border rounded-xl px-4 py-2 text-sm"
                                                value={formData.type}
                                                onChange={e => setFormData({ ...formData, type: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Month</label>
                                            <select
                                                className="w-full border rounded-xl px-4 py-2 text-sm"
                                                value={formData.month}
                                                onChange={e => setFormData({ ...formData, month: e.target.value })}
                                            >
                                                {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                                                    <option key={m} value={m}>{m}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Year</label>
                                            <input
                                                type="number"
                                                className="w-full border rounded-xl px-4 py-2 text-sm"
                                                value={formData.year}
                                                onChange={e => setFormData({ ...formData, year: Number(e.target.value) })}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Reason (Optional)</label>
                                        <textarea
                                            placeholder="Details..."
                                            className="w-full border rounded-xl px-4 py-2 text-sm h-20"
                                            value={formData.reason}
                                            onChange={e => setFormData({ ...formData, reason: e.target.value })}
                                        ></textarea>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Slab Name</label>
                                        <input
                                            required placeholder="e.g. Standard Slab A"
                                            className="w-full border rounded-xl px-4 py-2 text-sm"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Min Income (₹)</label>
                                            <input
                                                type="number" required placeholder="0"
                                                className="w-full border rounded-xl px-4 py-2 text-sm"
                                                value={formData.minIncome}
                                                onChange={e => setFormData({ ...formData, minIncome: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Max Income (₹)</label>
                                            <input
                                                type="number" required placeholder="9999999"
                                                className="w-full border rounded-xl px-4 py-2 text-sm"
                                                value={formData.maxIncome}
                                                onChange={e => setFormData({ ...formData, maxIncome: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Percentage (%)</label>
                                            <input
                                                type="number" required placeholder="5"
                                                className="w-full border rounded-xl px-4 py-2 text-sm"
                                                value={formData.percentage}
                                                onChange={e => setFormData({ ...formData, percentage: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">FY</label>
                                            <input
                                                required placeholder="2025-2026"
                                                className="w-full border rounded-xl px-4 py-2 text-sm"
                                                value={formData.financialYear}
                                                onChange={e => setFormData({ ...formData, financialYear: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </>
                            )}
                            <button
                                type="submit"
                                className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg"
                            >
                                Confirm and Create
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SalaryComponentsManager;
