import React, { useState, useEffect } from 'react';
import { DollarSign, Download, Calendar, CreditCard, PieChart, AlertCircle, TrendingUp, FileText, Send } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const SalarySection = () => {
    const [activeTab, setActiveTab] = useState<'overview' | 'payslips' | 'queries'>('overview');
    const [salaryData, setSalaryData] = useState<any>(null);
    const [salaryHistory, setSalaryHistory] = useState<any[]>([]);
    const [queries, setQueries] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Query Form State
    const [queryForm, setQueryForm] = useState({
        subject: '',
        category: 'Payslip Correction',
        description: ''
    });

    useEffect(() => {
        fetchLatestSalary();
        fetchSalaryHistory();
        fetchQueries();
    }, []);

    const fetchLatestSalary = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/salary/latest', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setSalaryData(data);
            }
        } catch (error) {
            console.error('Error fetching latest salary:', error);
        }
    };

    const fetchSalaryHistory = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/salary/history', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setSalaryHistory(data);
            }
        } catch (error) {
            console.error('Error fetching salary history:', error);
        }
    };

    const fetchQueries = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/salary/queries', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setQueries(data);
            }
        } catch (error) {
            console.error('Error fetching queries:', error);
        }
    };

    const handleDownloadPayslip = (salary: any) => {
        const doc = new jsPDF();

        // Header
        doc.setFontSize(22);
        doc.setTextColor(41, 128, 185);
        doc.text('NOVA WORKS', 105, 20, { align: 'center' });

        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text('Payslip', 105, 30, { align: 'center' });
        doc.setFontSize(12);
        doc.text(`${salary.month} ${salary.year}`, 105, 38, { align: 'center' });

        // Employee Details
        doc.setFontSize(10);
        doc.text(`Employee ID: ${salary.employee}`, 15, 50); // In real app, name would be populated
        doc.text(`Bank Account: ${salary.accountNumber}`, 15, 56);
        doc.text(`Bank Name: ${salary.bankName}`, 15, 62);
        doc.text(`Payment Date: ${new Date(salary.paymentDate).toLocaleDateString()}`, 150, 50);

        // Earnings Table
        autoTable(doc, {
            startY: 70,
            head: [['Earnings', 'Amount', 'Deductions', 'Amount']],
            body: [
                ['Basic Salary', salary.basic.toFixed(2), 'Provident Fund (PF)', salary.pf.toFixed(2)],
                ['HRA', salary.hra.toFixed(2), 'Income Tax', salary.tax.toFixed(2)],
                ['DA', salary.da.toFixed(2), 'Other Deductions', salary.deductions.toFixed(2)],
                ['Bonus', salary.bonus.toFixed(2), '', ''],
                ['Total Earnings', (salary.basic + salary.hra + salary.da + salary.bonus).toFixed(2), 'Total Deductions', (salary.pf + salary.tax + salary.deductions).toFixed(2)]
            ],
            theme: 'grid',
            headStyles: { fillColor: [41, 128, 185] },
            styles: { fontSize: 10 }
        });

        const finalY = (doc as any).lastAutoTable.finalY + 10;

        // Net Pay Box
        doc.setFillColor(236, 240, 241);
        doc.rect(15, finalY, 180, 20, 'F');
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(`Net Payable: $${salary.netSalary.toFixed(2)}`, 105, finalY + 13, { align: 'center' });

        // Footer
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text('This is a computer-generated document and does not require a signature.', 105, 280, { align: 'center' });

        doc.save(`Payslip_${salary.month}_${salary.year}.pdf`);
    };

    const handleSubmitQuery = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/salary/query', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(queryForm)
            });

            if (response.ok) {
                alert('Query submitted successfully!');
                setQueryForm({ subject: '', category: 'Payslip Correction', description: '' });
                fetchQueries();
            } else {
                alert('Failed to submit query');
            }
        } catch (error) {
            console.error('Error submitting query:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 min-h-[600px]">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Salary & Payslips</h2>
                    <p className="text-gray-500">Manage your earnings, download payslips and raise queries</p>
                </div>
                <div className="flex gap-2 mt-4 md:mt-0">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'overview' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('payslips')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'payslips' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        Payslips
                    </button>
                    <button
                        onClick={() => setActiveTab('queries')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'queries' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        Queries
                    </button>
                </div>
            </div>

            {activeTab === 'overview' && (
                <div className="space-y-6">
                    {!salaryData ? (
                        <div className="text-center py-20 bg-gray-50 rounded-lg">
                            <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">No salary data available yet.</p>
                        </div>
                    ) : (
                        <>
                            {/* Key Stats Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <p className="text-blue-100 text-sm font-medium">Net Salary (Latest)</p>
                                            <h3 className="text-3xl font-bold mt-1">${salaryData.netSalary?.toLocaleString()}</h3>
                                        </div>
                                        <div className="p-2 bg-white/20 rounded-lg">
                                            <DollarSign className="w-6 h-6 text-white" />
                                        </div>
                                    </div>
                                    <div className="flex items-center text-sm text-blue-100">
                                        <Calendar className="w-4 h-4 mr-1" />
                                        <span>{salaryData.month} {salaryData.year}</span>
                                    </div>
                                </div>

                                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <p className="text-gray-500 text-sm font-medium">Next Pay Date</p>
                                            <h3 className="text-2xl font-bold text-gray-900 mt-1">
                                                {new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toLocaleDateString()}
                                            </h3>
                                        </div>
                                        <div className="p-2 bg-purple-50 rounded-lg">
                                            <TrendingUp className="w-6 h-6 text-purple-600" />
                                        </div>
                                    </div>
                                    <p className="text-sm text-green-600 font-medium">On schedule</p>
                                </div>

                                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <p className="text-gray-500 text-sm font-medium">Bank Account</p>
                                            <h3 className="text-xl font-bold text-gray-900 mt-1">{salaryData.bankName}</h3>
                                        </div>
                                        <div className="p-2 bg-green-50 rounded-lg">
                                            <CreditCard className="w-6 h-6 text-green-600" />
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-600">{salaryData.accountNumber}</p>
                                </div>
                            </div>

                            {/* Detailed Breakdown */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                                        <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                                        Earnings
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center py-2 border-b border-gray-200">
                                            <span className="text-gray-600">Basic Salary</span>
                                            <span className="font-medium text-gray-900">${salaryData.basic?.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b border-gray-200">
                                            <span className="text-gray-600">HRA</span>
                                            <span className="font-medium text-gray-900">${salaryData.hra?.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b border-gray-200">
                                            <span className="text-gray-600">Special Allowance (DA)</span>
                                            <span className="font-medium text-gray-900">${salaryData.da?.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2">
                                            <span className="text-gray-600">Bonus</span>
                                            <span className="font-medium text-gray-900">${salaryData.bonus?.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-3 mt-2 bg-green-100 px-3 rounded-lg">
                                            <span className="font-bold text-green-800">Total Earnings</span>
                                            <span className="font-bold text-green-800">
                                                ${(salaryData.basic + salaryData.hra + salaryData.da + salaryData.bonus).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                                        <PieChart className="w-5 h-5 mr-2 text-red-600" />
                                        Deductions
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center py-2 border-b border-gray-200">
                                            <span className="text-gray-600">Provident Fund (PF)</span>
                                            <span className="font-medium text-gray-900">${salaryData.pf?.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b border-gray-200">
                                            <span className="text-gray-600">Income Tax</span>
                                            <span className="font-medium text-gray-900">${salaryData.tax?.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2">
                                            <span className="text-gray-600">Other Deductions</span>
                                            <span className="font-medium text-gray-900">${salaryData.deductions?.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-3 mt-10 bg-red-100 px-3 rounded-lg">
                                            <span className="font-bold text-red-800">Total Deductions</span>
                                            <span className="font-bold text-red-800">
                                                ${(salaryData.pf + salaryData.tax + salaryData.deductions).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}

            {activeTab === 'payslips' && (
                <div className="space-y-4">
                    <div className="overflow-hidden rounded-lg border border-gray-200">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month/Year</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gross Pay</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deductions</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net Pay</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {salaryHistory.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                                            No payslips found
                                        </td>
                                    </tr>
                                ) : (
                                    salaryHistory.map((item) => (
                                        <tr key={item._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {item.month} {item.year}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                ${(item.basic + item.hra + item.da + item.bonus).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-red-500">
                                                -${(item.pf + item.tax + item.deductions).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">
                                                ${item.netSalary.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => handleDownloadPayslip(item)}
                                                    className="text-blue-600 hover:text-blue-900 flex items-center justify-end"
                                                >
                                                    <Download className="w-4 h-4 mr-1" />
                                                    Download
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'queries' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1">
                        <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Raise a Query</h3>
                            <form onSubmit={handleSubmitQuery} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <select
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        value={queryForm.category}
                                        onChange={(e) => setQueryForm({ ...queryForm, category: e.target.value })}
                                    >
                                        <option>Payslip Correction</option>
                                        <option>Salary Discrepancy</option>
                                        <option>Tax Query</option>
                                        <option>Bonus Query</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        placeholder="Brief subject..."
                                        required
                                        value={queryForm.subject}
                                        onChange={(e) => setQueryForm({ ...queryForm, subject: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        rows={4}
                                        placeholder="Describe your issue detailed..."
                                        required
                                        value={queryForm.description}
                                        onChange={(e) => setQueryForm({ ...queryForm, description: e.target.value })}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                                >
                                    {loading ? 'Submitting...' : (
                                        <>
                                            <Send className="w-4 h-4 mr-2" />
                                            Submit Query
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>

                    <div className="lg:col-span-2">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Query History</h3>
                        <div className="space-y-4">
                            {queries.length === 0 ? (
                                <div className="text-center py-10 border border-dashed border-gray-300 rounded-xl">
                                    <p className="text-gray-500">No previous queries.</p>
                                </div>
                            ) : (
                                queries.map((query) => (
                                    <div key={query._id} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-shadow">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center space-x-2">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${query.status === 'Open' ? 'bg-blue-100 text-blue-800' :
                                                    query.status === 'Resolved' ? 'bg-green-100 text-green-800' :
                                                        'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {query.status}
                                                </span>
                                                <h4 className="font-semibold text-gray-900">{query.subject}</h4>
                                            </div>
                                            <span className="text-xs text-gray-500">
                                                {new Date(query.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-3">{query.description}</p>

                                        {query.adminResponse && (
                                            <div className="mt-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                                <p className="text-xs font-bold text-gray-700 mb-1">HR Response:</p>
                                                <p className="text-sm text-gray-600">{query.adminResponse}</p>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SalarySection;


