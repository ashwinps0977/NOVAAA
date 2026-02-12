import React, { useState, useEffect } from 'react';
import {
    Plus,
    Brain,
    Layers,
    FileText
} from 'lucide-react';
import PayrollAIInsights from './PayrollAIInsights';
import SalaryComponentsManager from './SalaryComponentsManager';
import PayslipTemplate from './PayslipTemplate';

const HRPayrollSection = () => {
    const [activeTab, setActiveTab] = useState<'overview' | 'run-payroll' | 'structures' | 'insights' | 'components'>('overview');
    const [loading, setLoading] = useState(false);
    const [salaryStructures, setSalaryStructures] = useState<any[]>([]);
    const [payrollData, setPayrollData] = useState<any>(null);
    const [selectedMonth, setSelectedMonth] = useState(new Date().toLocaleString('default', { month: 'long' }));
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    // Payslip View State
    const [selectedPayslip, setSelectedPayslip] = useState<any>(null);

    // New Structure Form
    const [showStructureModal, setShowStructureModal] = useState(false);
    const [newStructure, setNewStructure] = useState({
        name: '',
        baseSalary: '',
        hra: 40,
        da: 20,
        pf: 12,
        tax: 0
    });

    useEffect(() => {
        fetchStructures();
        if (activeTab === 'run-payroll') {
            // defined but fetching only on action for payroll
        }
    }, [activeTab]);

    const fetchStructures = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5000/api/salary/structures', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setSalaryStructures(data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreateStructure = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const payload = {
                name: newStructure.name,
                baseSalary: Number(newStructure.baseSalary),
                components: {
                    hra: Number(newStructure.hra),
                    da: Number(newStructure.da),
                    specialAllowance: 0
                },
                deductions: {
                    pf: Number(newStructure.pf),
                    tax: Number(newStructure.tax)
                }
            };

            const res = await fetch('http://localhost:5000/api/salary/structure', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                alert('Salary Structure Created');
                setShowStructureModal(false);
                fetchStructures();
            } else {
                const err = await res.json();
                alert(err.msg || 'Failed');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleGeneratePayroll = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5000/api/salary/generate-payroll', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ month: selectedMonth, year: selectedYear })
            });

            if (res.ok) {
                const data = await res.json();
                setPayrollData(data);
            } else {
                const err = await res.json();
                alert(err.msg || 'Failed to generate payroll');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleProcessPayroll = async (status: 'Approved' | 'Paid') => {
        if (!payrollData?.payroll?._id) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5000/api/salary/payroll-status', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ payrollId: payrollData.payroll._id, status })
            });

            if (res.ok) {
                alert(`Payroll marked as ${status}`);
                const updated = await res.json();
                setPayrollData((prev: any) => ({ ...prev, payroll: updated }));
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Payroll & Salary</h2>
                    <p className="text-gray-600">Manage salary structures, generate payrolls, and track payments.</p>
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`px-4 py-2 rounded-lg ${activeTab === 'overview' ? 'bg-blue-100 text-blue-700' : 'bg-white text-gray-600'}`}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('run-payroll')}
                        className={`px-4 py-2 rounded-lg ${activeTab === 'run-payroll' ? 'bg-blue-100 text-blue-700' : 'bg-white text-gray-600'}`}
                    >
                        Run Payroll
                    </button>
                    <button
                        onClick={() => setActiveTab('structures')}
                        className={`px-4 py-2 rounded-lg ${activeTab === 'structures' ? 'bg-blue-100 text-blue-700' : 'bg-white text-gray-600'}`}
                    >
                        salary Structures
                    </button>
                    <button
                        onClick={() => setActiveTab('components')}
                        className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${activeTab === 'components' ? 'bg-orange-100 text-orange-700' : 'bg-white text-gray-600'}`}
                    >
                        <Layers size={18} />
                        <span>Components</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('insights')}
                        className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${activeTab === 'insights' ? 'bg-purple-100 text-purple-700' : 'bg-white text-gray-600'}`}
                    >
                        <Brain size={18} />
                        <span>AI Insights</span>
                    </button>
                </div>
            </div>

            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-gray-500 text-sm">Total Payroll Cost (Est.)</h3>
                        <p className="text-3xl font-bold text-gray-900 mt-2">$0</p>
                        <p className="text-xs text-gray-400 mt-1">Based on active structures</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-gray-500 text-sm">Active Structures</h3>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{salaryStructures.length}</p>
                    </div>
                </div>
            )}

            {activeTab === 'structures' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="font-semibold text-lg">Salary Structures</h3>
                        <button
                            onClick={() => setShowStructureModal(true)}
                            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                        >
                            <Plus size={18} />
                            <span>Add Structure</span>
                        </button>
                    </div>
                    <div className="p-6">
                        <div className="grid gap-4">
                            {salaryStructures.map(s => (
                                <div key={s._id} className="border p-4 rounded-lg flex justify-between items-center">
                                    <div>
                                        <h4 className="font-bold text-lg">{s.name}</h4>
                                        <p className="text-sm text-gray-500">Base: ${s.baseSalary}</p>
                                    </div>
                                    <div className="text-right text-sm text-gray-500">
                                        <p>HRA: {s.components.hra}%</p>
                                        <p>PF: {s.deductions.pf}%</p>
                                    </div>
                                </div>
                            ))}
                            {salaryStructures.length === 0 && <p className="text-gray-500 text-center">No structures found.</p>}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'run-payroll' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <div className="flex space-x-4 items-end">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                                <select
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(e.target.value)}
                                    className="border border-gray-300 rounded-lg px-4 py-2"
                                >
                                    {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                                        <option key={m} value={m}>{m}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                                <input
                                    type="number"
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                                    className="border border-gray-300 rounded-lg px-4 py-2 w-24"
                                />
                            </div>
                            <button
                                onClick={handleGeneratePayroll}
                                disabled={loading}
                                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                            >
                                {loading ? 'Processing...' : 'Generate Payroll'}
                            </button>
                        </div>
                    </div>

                    {payrollData && (
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-lg">
                                    Payroll Draft: {payrollData.payroll.month} {payrollData.payroll.year}
                                    <span className={`ml-3 px-3 py-1 rounded-full text-xs ${payrollData.payroll.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {payrollData.payroll.status}
                                    </span>
                                </h3>
                                <div className="space-x-3">
                                    {payrollData.payroll.status !== 'Paid' && (
                                        <>
                                            <button
                                                onClick={() => handleProcessPayroll('Approved')}
                                                className="px-4 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50"
                                            >
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleProcessPayroll('Paid')}
                                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                            >
                                                Mark as Paid
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 text-gray-500 text-sm">
                                        <tr>
                                            <th className="p-3">Employee</th>
                                            <th className="p-3">Basic</th>
                                            <th className="p-3">Additions</th>
                                            <th className="p-3">Deductions</th>
                                            <th className="p-3">Net Salary</th>
                                            <th className="p-3">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {payrollData.salaries.map((rec: any) => (
                                            <tr key={rec._id}>
                                                <td className="p-3 font-medium">Employee ID: {rec.employee}</td>
                                                <td className="p-3">${rec.basic}</td>
                                                <td className="p-3 text-green-600">+${rec.hra + rec.da + rec.bonus}</td>
                                                <td className="p-3 text-red-600">-${rec.deductions + rec.pf + rec.tax}</td>
                                                <td className="p-3 font-bold">${rec.netSalary}</td>
                                                <td className="p-3">
                                                    <span className={`px-2 py-0.5 rounded text-xs ${rec.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                                        }`}>{rec.status}</span>
                                                </td>
                                                <td className="p-3">
                                                    <button
                                                        onClick={() => setSelectedPayslip(rec)}
                                                        className="text-blue-600 hover:text-blue-800"
                                                        title="View Payslip"
                                                    >
                                                        <FileText size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Structure Modal */}
            {showStructureModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4">New Salary Structure</h3>
                        <form onSubmit={handleCreateStructure} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Structure Name</label>
                                <input
                                    required
                                    className="w-full border rounded-lg px-3 py-2"
                                    placeholder="e.g. Senior Developer - Grade A"
                                    value={newStructure.name}
                                    onChange={e => setNewStructure({ ...newStructure, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Base Salary ($)</label>
                                <input
                                    type="number"
                                    required
                                    className="w-full border rounded-lg px-3 py-2"
                                    value={newStructure.baseSalary}
                                    onChange={e => setNewStructure({ ...newStructure, baseSalary: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">HRA (%)</label>
                                    <input
                                        type="number"
                                        className="w-full border rounded-lg px-3 py-2"
                                        value={newStructure.hra}
                                        onChange={e => setNewStructure({ ...newStructure, hra: Number(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">DA (%)</label>
                                    <input
                                        type="number"
                                        className="w-full border rounded-lg px-3 py-2"
                                        value={newStructure.da}
                                        onChange={e => setNewStructure({ ...newStructure, da: Number(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">PF (%)</label>
                                    <input
                                        type="number"
                                        className="w-full border rounded-lg px-3 py-2"
                                        value={newStructure.pf}
                                        onChange={e => setNewStructure({ ...newStructure, pf: Number(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Tax (%)</label>
                                    <input
                                        type="number"
                                        className="w-full border rounded-lg px-3 py-2"
                                        value={newStructure.tax}
                                        onChange={e => setNewStructure({ ...newStructure, tax: Number(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowStructureModal(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Create Structure
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {activeTab === 'components' && <SalaryComponentsManager />}
            {activeTab === 'insights' && <PayrollAIInsights />}

            {/* Payslip Modal */}
            {selectedPayslip && (
                <PayslipTemplate
                    salary={selectedPayslip}
                    employee={{ name: 'Employee Name Placeholder' }} // In real app, populate from salary.employee population
                    structure={{ name: 'Grade Placeholder' }}
                    onClose={() => setSelectedPayslip(null)}
                />
            )}
        </div>
    );
};

export default HRPayrollSection;
