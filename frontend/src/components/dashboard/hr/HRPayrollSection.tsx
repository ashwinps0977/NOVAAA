import React, { useState, useEffect } from 'react';
import {
    Plus,
    Brain,
    Layers,
    FileText,
    DollarSign
} from 'lucide-react';
import PayrollAIInsights from './PayrollAIInsights';
import SalaryComponentsManager from './SalaryComponentsManager';
import PayslipTemplate from './PayslipTemplate';
import { API_BASE_URL } from '../../../config';

const HRPayrollSection = () => {
    const [activeTab, setActiveTab] = useState<'overview' | 'run-payroll' | 'structures' | 'insights' | 'components' | 'salary-list'>('overview');
    const [loading, setLoading] = useState(false);
    const [salaryStructures, setSalaryStructures] = useState<any[]>([]);
    const [payrollData, setPayrollData] = useState<any>(null);
    const [employeeSalaries, setEmployeeSalaries] = useState<any[]>([]);
    const [selectedMonth, setSelectedMonth] = useState(new Date().toLocaleString('default', { month: 'long' }));
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [totalPayroll, setTotalPayroll] = useState(0);
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

    const fetchEmployeeSalaries = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/salary/hr/salary-list`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setEmployeeSalaries(data);
                // Calculate total monthly payroll cost
                const total = data.reduce((sum: number, emp: any) => sum + (emp.salary || 0), 0);
                setTotalPayroll(total);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const fetchStructures = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/salary/structures`, {
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

            const res = await fetch(`${API_BASE_URL}/salary/structure`, {
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

    const fetchCurrentPayroll = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/salary/payroll/${selectedMonth}/${selectedYear}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setPayrollData(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleGeneratePayroll = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/salary/generate-payroll`, {
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
            const res = await fetch(`${API_BASE_URL}/salary/payroll-status`, {
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

    useEffect(() => {
        fetchStructures();
        fetchEmployeeSalaries();
    }, []);

    useEffect(() => {
        if (activeTab === 'run-payroll') {
            fetchCurrentPayroll();
        }
    }, [selectedMonth, selectedYear, activeTab]);

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
                        Salary Structures
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
                    <button
                        onClick={() => setActiveTab('salary-list')}
                        className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${activeTab === 'salary-list' ? 'bg-green-100 text-green-700' : 'bg-white text-gray-600'}`}
                    >
                        <DollarSign size={18} />
                        <span>Employee Salaries</span>
                    </button>
                </div>
            </div>

            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-gray-500 text-sm">Total Payroll Cost (Est.)</h3>
                        <p className="text-3xl font-bold text-gray-900 mt-2">₹{totalPayroll.toLocaleString()}</p>
                        <p className="text-xs text-gray-400 mt-1">Monthly estimate based on active employee salaries</p>
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
                                        <p>HRA: {s.components?.hra || 0}%</p>
                                        <p>PF: {s.deductions?.pf || 0}%</p>
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

                    {payrollData && (payrollData.payroll || payrollData.salaries?.length > 0) ? (
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-lg">
                                    Payroll Draft: {payrollData.payroll?.month} {payrollData.payroll?.year}
                                    <span className={`ml-3 px-3 py-1 rounded-full text-xs ${payrollData.payroll?.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {payrollData.payroll?.status || 'Draft'}
                                    </span>
                                </h3>
                                <div className="space-x-3">
                                    {payrollData.payroll?.status !== 'Paid' && (
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
                                        {(payrollData.salaries || []).map((rec: any) => (
                                            <tr key={rec._id}>
                                                <td className="p-3 font-medium">
                                                    <div>{rec.employee?.name || "Unknown"}</div>
                                                    <div className="text-xs text-gray-400">
                                                        {typeof rec.employee === 'object'
                                                            ? (rec.employee?.employeeId || rec.employee?._id?.toString())
                                                            : rec.employee}
                                                    </div>
                                                </td>
                                                <td className="p-3 font-mono">₹{rec.basic?.toLocaleString() || 0}</td>
                                                <td className="p-3 text-green-600 font-medium">+₹{((rec.hra || 0) + (rec.da || 0) + (rec.bonus || 0)).toLocaleString()}</td>
                                                <td className="p-3 text-red-600 font-medium">-₹{((rec.deductions || 0) + (rec.pf || 0) + (rec.tax || 0)).toLocaleString()}</td>
                                                <td className="p-3 font-bold text-gray-900">₹{rec.netSalary?.toLocaleString() || 0}</td>
                                                <td className="p-3">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${rec.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                                        }`}>{rec.status || 'Pending'}</span>
                                                </td>
                                                <td className="p-3">
                                                    <button
                                                        onClick={() => setSelectedPayslip(rec)}
                                                        className="text-blue-600 hover:text-blue-800 transition-colors"
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
                    ) : (
                        payrollData && (
                            <div className="p-20 text-center">
                                <FileText size={48} className="mx-auto text-gray-300 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900">No Payroll Data</h3>
                                <p className="text-gray-500">No payroll has been generated for {selectedMonth} {selectedYear} yet.</p>
                            </div>
                        )
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

            {activeTab === 'salary-list' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h3 className="font-bold text-lg">Employee Salary Directory</h3>
                        <p className="text-sm text-gray-500">Overview of active employee compensation packages</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider">
                                <tr>
                                    <th className="p-4">Employee</th>
                                    <th className="p-4">ID & Join Date</th>
                                    <th className="p-4">Position & Dept</th>
                                    <th className="p-4">Monthly Salary</th>
                                    <th className="p-4">Annual CTC</th>
                                    <th className="p-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {employeeSalaries.map((emp: any) => (
                                    <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4">
                                            <div className="font-bold text-gray-900">{emp.name}</div>
                                            <div className="text-xs text-gray-500">{emp.email}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-sm font-medium">{emp.employeeId}</div>
                                            <div className="text-xs text-gray-400">{new Date(emp.joiningDate).toLocaleDateString()}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-sm">{emp.position}</div>
                                            <div className="text-xs text-gray-500">{emp.department}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-sm font-bold text-gray-900">₹{emp.salary?.toLocaleString()}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-sm font-black text-indigo-600">₹{emp.currentCTC?.toLocaleString()}</div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${emp.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                {emp.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {employeeSalaries.length === 0 && (
                            <div className="p-10 text-center text-gray-500">No employee salary records found.</div>
                        )}
                    </div>
                </div>
            )}

            {/* Payslip Modal */}
            {selectedPayslip && (
                <PayslipTemplate
                    salary={selectedPayslip}
                    employee={typeof selectedPayslip.employee === 'object' ? selectedPayslip.employee : (employeeSalaries.find(e => e.id === selectedPayslip.employee) || { name: 'Employee' })}
                    structure={salaryStructures.find(s => s._id === (typeof selectedPayslip.employee === 'object' ? selectedPayslip.employee._id : selectedPayslip.employee)?.salaryStructure) || { name: 'Professional Services' }}
                    onClose={() => setSelectedPayslip(null)}
                />
            )}
        </div>
    );
};

export default HRPayrollSection;
