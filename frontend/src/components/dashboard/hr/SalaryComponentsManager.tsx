import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

const SalaryComponentsManager = () => {
    const [activeTab, setActiveTab] = useState<'bonus' | 'deduction' | 'tax'>('bonus');

    // Mock Data (In real integration, this would fetch from backend)
    const [bonuses] = useState([
        { id: 1, type: 'Performance', amount: 500, employee: 'John Doe', status: 'Pending' }
    ]);
    const [deductions] = useState([
        { id: 1, type: 'Advance', amount: 200, employee: 'Jane Smith', status: 'Approved' }
    ]);
    const [taxRules] = useState([
        { id: 1, name: 'Standard Slab 1', range: '0 - 50k', percent: 5 }
    ]);

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
                        <button className="flex items-center space-x-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-lg text-sm hover:bg-green-100">
                            <Plus size={16} /> <span>Add Bonus</span>
                        </button>
                    </div>
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500">
                            <tr>
                                <th className="p-3">Employee</th>
                                <th className="p-3">Type</th>
                                <th className="p-3">Amount</th>
                                <th className="p-3">Status</th>
                                <th className="p-3">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bonuses.map((b: any) => (
                                <tr key={b.id} className="border-b last:border-0">
                                    <td className="p-3">{b.employee}</td>
                                    <td className="p-3">{b.type}</td>
                                    <td className="p-3 font-medium text-green-600">+${b.amount}</td>
                                    <td className="p-3">
                                        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded">{b.status}</span>
                                    </td>
                                    <td className="p-3 text-red-500 cursor-pointer"><Trash2 size={16} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'deduction' && (
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-gray-700">Employee Deductions</h3>
                        <button className="flex items-center space-x-2 bg-red-50 text-red-700 px-3 py-1.5 rounded-lg text-sm hover:bg-red-100">
                            <Plus size={16} /> <span>Add Deduction</span>
                        </button>
                    </div>
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500">
                            <tr>
                                <th className="p-3">Employee</th>
                                <th className="p-3">Reason</th>
                                <th className="p-3">Amount</th>
                                <th className="p-3">Status</th>
                                <th className="p-3">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {deductions.map((d: any) => (
                                <tr key={d.id} className="border-b last:border-0">
                                    <td className="p-3">{d.employee}</td>
                                    <td className="p-3">{d.type}</td>
                                    <td className="p-3 font-medium text-red-600">-${d.amount}</td>
                                    <td className="p-3">
                                        <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded">{d.status}</span>
                                    </td>
                                    <td className="p-3 text-red-500 cursor-pointer"><Trash2 size={16} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'tax' && (
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-gray-700">Income Tax Slabs</h3>
                        <button className="flex items-center space-x-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-sm hover:bg-blue-100">
                            <Plus size={16} /> <span>Add Rule</span>
                        </button>
                    </div>
                    <div className="space-y-3">
                        {taxRules.map((r: any) => (
                            <div key={r.id} className="border p-3 rounded-lg flex justify-between items-center">
                                <div>
                                    <p className="font-medium">{r.name}</p>
                                    <p className="text-xs text-gray-500">Range: {r.range}</p>
                                </div>
                                <div className="font-bold text-gray-700">{r.percent}% Tax</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

        </div>
    );
};

export default SalaryComponentsManager;
