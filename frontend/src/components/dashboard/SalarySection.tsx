import React, { useState, useEffect } from 'react';
import { DollarSign, Download, Calendar, Send, Briefcase, ShieldCheck, FileText, TrendingUp, Wallet, Receipt } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { API_BASE_URL } from '../../config';

const SalarySection = ({ userData }: { userData?: any }) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'payslips' | 'queries'>('overview');
    const [salaryData, setSalaryData] = useState<any>(null);
    const [salaryHistory, setSalaryHistory] = useState<any[]>([]);
    const [queries, setQueries] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

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

    const baseMonthly = userData?.salary || 0;
    const isMock = !salaryData;

    const earnings = {
        basic: salaryData?.basic || baseMonthly * 0.5,
        hra: salaryData?.hra || baseMonthly * 0.2,
        special: salaryData?.specialAllowance || baseMonthly * 0.15,
        conveyance: salaryData?.conveyanceAllowance || (isMock ? 1600 : 0),
        medical: salaryData?.medicalAllowance || (isMock ? 1250 : 0),
        internet: salaryData?.internetAllowance || (isMock ? 500 : 0),
        shiftProject: (salaryData?.shiftAllowance || 0) + (salaryData?.projectAllowance || 0),
        bonus: salaryData?.bonus || 0
    };

    const totalGross = earnings.basic + earnings.hra + earnings.special + earnings.conveyance + earnings.medical + earnings.internet + earnings.shiftProject + earnings.bonus;

    const pfVal = salaryData?.pf || earnings.basic * 0.12;
    const profTaxVal = salaryData?.professionalTax || (baseMonthly > 0 ? 200 : 0);

    // Simple Tax/TDS Calculation based on annual gross
    const annualGross = totalGross * 12;
    let tdsVal = salaryData?.incomeTaxTDS || 0;
    if (isMock && annualGross > 500000) {
        tdsVal = totalGross * 0.05; // 5% TDS for demo
    }

    const deductions = {
        pf: pfVal,
        profTax: profTaxVal,
        tax: tdsVal,
        insurance: salaryData?.insurancePremium || (isMock ? 500 : 0),
        loan: (salaryData?.loanDeduction || 0) + (salaryData?.advanceSalaryDeduction || 0),
        penalty: (salaryData?.latePenalty || 0) + (salaryData?.lop || 0),
        other: salaryData?.otherDeductions || 0
    };

    const totalDeductions = deductions.pf + deductions.profTax + deductions.tax + deductions.insurance + deductions.loan + deductions.penalty + deductions.other;
    const netSalaryDisplay = totalGross - totalDeductions;

    const fetchLatestSalary = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/salary/latest`, {
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
            const response = await fetch(`${API_BASE_URL}/salary/history`, {
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
            const response = await fetch(`${API_BASE_URL}/salary/queries`, {
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
        doc.setFontSize(22);
        doc.setTextColor(41, 128, 185);
        doc.text('NOVA WORKS', 105, 20, { align: 'center' });
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text('Detailed Payslip', 105, 30, { align: 'center' });
        doc.setFontSize(11);
        doc.text(`${salary.month} ${salary.year}`, 105, 38, { align: 'center' });

        doc.setFontSize(9);
        const emp = salary.employee || {};
        const startY = 50;
        doc.text(`Employee ID: ${emp._id || 'N/A'}`, 15, startY);
        doc.text(`Name: ${emp.name || 'N/A'}`, 15, startY + 5);
        doc.text(`Designation: ${emp.position || 'N/A'}`, 15, startY + 10);
        doc.text(`Department: ${emp.department || 'N/A'}`, 15, startY + 15);

        doc.text(`PAN: ${salary.pan || 'N/A'}`, 120, startY);
        doc.text(`Bank: ${salary.bankName || 'N/A'}`, 120, startY + 5);
        doc.text(`A/C: ${salary.accountNumber || 'N/A'}`, 120, startY + 10);
        doc.text(`IFSC: ${salary.ifsc || 'N/A'}`, 120, startY + 15);

        autoTable(doc, {
            startY: startY + 25,
            head: [['Earnings & Contributions', 'Amount', 'Deductions', 'Amount']],
            body: [
                ['Basic Pay', salary.basic?.toFixed(2), 'Provident Fund (PF)', salary.pf?.toFixed(2)],
                ['HRA', salary.hra?.toFixed(2), 'Income Tax (TDS)', salary.incomeTaxTDS?.toFixed(2)],
                ['Special Allowance', salary.specialAllowance?.toFixed(2), 'Professional Tax', salary.professionalTax?.toFixed(2)],
                ['Internet/Conveyance', ((salary.internetAllowance || 0) + (salary.conveyanceAllowance || 0)).toFixed(2), 'Insurance Premium', salary.insurancePremium?.toFixed(2)],
                ['Medical/Meal', ((salary.medicalAllowance || 0) + (salary.mealAllowance || 0)).toFixed(2), 'Loan/Advance', ((salary.loanDeduction || 0) + (salary.advanceSalaryDeduction || 0)).toFixed(2)],
                ['Employer PF', salary.employerPF?.toFixed(2), 'Late Penalty/LOP', ((salary.latePenalty || 0) + (salary.lop || 0)).toFixed(2)],
                ['Employer Insurance/ESI', ((salary.employerInsurance || 0) + (salary.esi || 0)).toFixed(2), 'Other Deductions', salary.otherDeductions?.toFixed(2)],
                ['Variable/Bonus', ((salary.bonus || 0) + (salary.performanceIncentive || 0)).toFixed(2), '', ''],
                [
                    { content: 'Gross Monthly', styles: { fontStyle: 'bold' } },
                    { content: (salary.basic + salary.hra + (salary.specialAllowance || 0) + (salary.bonus || 0)).toFixed(2), styles: { fontStyle: 'bold' } },
                    { content: 'Total Deductions', styles: { fontStyle: 'bold' } },
                    { content: (salary.pf + (salary.incomeTaxTDS || 0) + (salary.professionalTax || 0) + (salary.otherDeductions || 0)).toFixed(2), styles: { fontStyle: 'bold' } }
                ]
            ],
            theme: 'striped',
            headStyles: { fillColor: [63, 81, 181] },
            styles: { fontSize: 8 }
        });

        const finalY = (doc as any).lastAutoTable.finalY + 10;
        doc.setFillColor(245, 247, 250);
        doc.rect(15, finalY, 180, 15, 'F');
        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.text(`Net Payable: ₹${salary.netSalary?.toLocaleString()}`, 105, finalY + 10, { align: 'center' });

        doc.save(`NOVA_Payslip_${salary.month}_${salary.year}.pdf`);
    };

    const renderMoneyLine = (label: string, value: number, isNegative = false) => (
        <div className="flex justify-between items-center py-2.5 hover:bg-white/40 transition-colors px-2 rounded-lg group">
            <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors">{label}</span>
            <span className={`text-sm font-black tracking-tight ${isNegative ? 'text-red-500' : 'text-gray-900'}`}>
                {isNegative ? '-' : ''}₹{value?.toLocaleString() || '0'}
            </span>
        </div>
    );

    const handleSubmitQuery = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/salary/query`, {
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
        <div className="p-4 md:p-8 bg-gray-50/50 min-h-screen">
            {/* Header with Glassmorphism */}
            <div className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between space-y-4 md:space-y-0">
                <div>
                    <h2 className="text-4xl font-black text-gray-900 tracking-tighter flex items-center">
                        Salary <span className="text-indigo-600 ml-2">Analytics</span>
                    </h2>
                    <p className="text-gray-500 font-medium mt-1">Comprehensive compensation and benefits overview</p>
                </div>
                <div className="flex bg-white/80 backdrop-blur-md p-1 rounded-2xl shadow-sm border border-gray-100">
                    {(['overview', 'payslips', 'queries'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-2.5 rounded-xl text-sm font-bold capitalize transition-all duration-300 ${activeTab === tab
                                ? 'bg-indigo-600 text-white shadow-indigo-100 shadow-lg scale-100'
                                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50 scale-95'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {activeTab === 'overview' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {/* Section A: Profile Overview Card */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl shadow-indigo-100">
                            <div className="relative z-10 flex flex-col h-full justify-between">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <div className="flex items-center space-x-2 bg-white/10 px-3 py-1 rounded-full w-fit">
                                            <ShieldCheck size={14} className="text-indigo-200" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-100">Verified Employee Profile</span>
                                        </div>
                                        <h3 className="text-3xl font-black tracking-tight mt-4">{salaryData?.employee?.name || userData?.name || 'Loading...'}</h3>
                                        <p className="text-indigo-100/80 font-medium text-sm flex items-center">
                                            <Briefcase size={14} className="mr-2" /> {salaryData?.employee?.position || userData?.position} • {salaryData?.employee?.department || userData?.department}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[10px] uppercase font-black text-indigo-200 tracking-widest block mb-1">Current CTC (Annual)</span>
                                        <p className="text-4xl font-black tracking-tighter">₹{(salaryData?.employee?.currentCTC || userData?.currentCTC || 0).toLocaleString()}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-10 pt-8 border-t border-white/10">
                                    <div>
                                        <span className="text-[10px] uppercase font-bold text-indigo-200">Employee ID</span>
                                        <p className="font-bold text-sm truncate">EMP-{(userData?.id || salaryData?.employee?._id || '').toString().slice(-6).toUpperCase() || '—'}</p>
                                    </div>
                                    <div>
                                        <span className="text-[10px] uppercase font-bold text-indigo-200">Employment</span>
                                        <p className="font-bold text-sm">{salaryData?.employee?.employmentType || 'Full-time'}</p>
                                    </div>
                                    <div>
                                        <span className="text-[10px] uppercase font-bold text-indigo-200">Grade / Band</span>
                                        <p className="font-bold text-sm">{salaryData?.employee?.salaryGrade || 'C'} / {salaryData?.employee?.salaryBand || '1'}</p>
                                    </div>
                                    <div>
                                        <span className="text-[10px] uppercase font-bold text-indigo-200">Joining Date</span>
                                        <p className="font-bold text-sm">{(salaryData?.employee?.joiningDate || userData?.joiningDate) ? new Date(salaryData?.employee?.joiningDate || userData?.joiningDate).toLocaleDateString() : '—'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Net Pay Card */}
                        <div className="bg-white rounded-3xl p-8 shadow-xl shadow-gray-100 border border-gray-100 flex flex-col justify-between">
                            <div className="flex items-center space-x-4 mb-6">
                                <div className="p-3 bg-emerald-50 rounded-2xl">
                                    <Wallet className="text-emerald-600" size={24} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest">Net Payable</h4>
                                    <p className="text-[11px] text-gray-500 font-medium">For the month of {salaryData?.month}</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="text-center py-6 bg-gray-50/50 rounded-2xl border border-gray-50">
                                    <span className="text-sm text-gray-400 font-bold uppercase tracking-widest block mb-1">In Bank Account (Net)</span>
                                    <p className="text-5xl font-black text-gray-900 tracking-tighter">₹{netSalaryDisplay.toLocaleString()}</p>
                                    {!salaryData?.netSalary && userData?.salary && <p className="text-[10px] text-gray-400 mt-1 italic">Calculated based on monthly package</p>}
                                </div>
                                <div className="flex justify-between items-center text-xs px-2">
                                    <span className="text-gray-500 font-medium flex items-center"><Calendar size={12} className="mr-1.5" /> Next Credit</span>
                                    <span className="text-emerald-600 font-black">28th {salaryData?.month}, {salaryData?.year}</span>
                                </div>
                                <button onClick={() => handleDownloadPayslip(salaryData)} className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black text-sm hover:bg-black transition-colors shadow-lg shadow-gray-100 flex items-center justify-center space-x-2">
                                    <Download size={16} />
                                    <span>Download Latest Payslip</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Section B: Salary Structure Card */}
                        <div className="bg-white rounded-3xl p-8 shadow-xl shadow-gray-100 border border-gray-100 group transition-all duration-300 hover:shadow-2xl">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center space-x-3">
                                    <div className="p-3 bg-indigo-50 rounded-xl group-hover:bg-indigo-600 transition-colors">
                                        <DollarSign className="text-indigo-600 group-hover:text-white transition-colors" size={24} />
                                    </div>
                                    <h4 className="font-black text-gray-900 uppercase tracking-widest text-sm">A. Earnings Breakup</h4>
                                </div>
                                <TrendingUp size={18} className="text-emerald-500" />
                            </div>
                            <div className="bg-indigo-50/30 p-6 rounded-2xl space-y-2 mb-4 border border-indigo-50/50">
                                {renderMoneyLine('Basic Pay', earnings.basic)}
                                {renderMoneyLine('HRA', earnings.hra)}
                                {renderMoneyLine('Special Allowance', earnings.special)}
                                {renderMoneyLine('Conveyance Allowance', earnings.conveyance)}
                                {renderMoneyLine('Medical Allowance', earnings.medical)}
                                {renderMoneyLine('Internet Allowance', earnings.internet)}
                                {renderMoneyLine('Shift/Project Allow.', earnings.shiftProject)}
                                <div className="pt-4 mt-4 border-t border-indigo-100/50 flex justify-between items-center">
                                    <span className="text-xs font-black uppercase text-indigo-400">Total Monthly Gross</span>
                                    <span className="text-lg font-black text-indigo-600">₹{totalGross.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Section C: Deductions Card */}
                        <div className="bg-white rounded-3xl p-8 shadow-xl shadow-gray-100 border border-gray-100 group transition-all duration-300 hover:shadow-2xl">
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="p-3 bg-red-50 rounded-xl group-hover:bg-red-500 transition-colors">
                                    <Receipt className="text-red-500 group-hover:text-white transition-colors" size={24} />
                                </div>
                                <h4 className="font-black text-gray-900 uppercase tracking-widest text-sm">B. Deductions Section</h4>
                            </div>
                            <div className="bg-red-50/30 p-6 rounded-2xl space-y-2 border border-red-50/50 mb-6">
                                {renderMoneyLine('Provident Fund (PF)', deductions.pf, true)}
                                {renderMoneyLine('Professional Tax', deductions.profTax, true)}
                                {renderMoneyLine('Income Tax (TDS)', deductions.tax, true)}
                                {renderMoneyLine('Insurance Premium', deductions.insurance, true)}
                                {renderMoneyLine('Loan / Advance', deductions.loan, true)}
                                {renderMoneyLine('Late / LOP Penalty', deductions.penalty, true)}
                                <div className="pt-4 mt-4 border-t border-red-100/50 flex justify-between items-center">
                                    <span className="text-xs font-black uppercase text-red-400">Total Deductions</span>
                                    <span className="text-lg font-black text-red-600">-₹{totalDeductions.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'payslips' && (
                <div className="bg-white rounded-[32px] shadow-2xl shadow-gray-100 border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="p-8 border-b border-gray-50 flex justify-between items-center">
                        <div>
                            <h3 className="text-2xl font-black text-gray-900 tracking-tighter">Section G. Salary History</h3>
                            <p className="text-gray-500 text-sm font-medium">Record of all past disbursements</p>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/50">
                                <tr>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest text">Month & Year</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest text">Gross Salary</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest text">Net Salary</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest text">Deductions</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest text text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {salaryHistory.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50/30 transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center font-black text-gray-500 text-xs">
                                                    {item.month.slice(0, 3)}
                                                </div>
                                                <div>
                                                    <p className="font-black text-gray-900">{item.month}</p>
                                                    <p className="text-[10px] text-gray-400 font-bold">{item.year}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 font-bold text-gray-900">₹{(item.basic + item.hra + (item.specialAllowance || 0) + (item.bonus || 0)).toLocaleString()}</td>
                                        <td className="px-8 py-5 font-black text-indigo-600">₹{item.netSalary.toLocaleString()}</td>
                                        <td className="px-8 py-5 font-bold text-red-400">-₹{(item.pf + (item.incomeTaxTDS || 0) + (item.professionalTax || 0) + (item.insurancePremium || 0) + (item.loanDeduction || 0) + (item.advanceSalaryDeduction || 0) + (item.latePenalty || 0) + (item.lop || 0) + (item.otherDeductions || 0))?.toLocaleString()}</td>
                                        <td className="px-8 py-5">
                                            <button
                                                onClick={() => handleDownloadPayslip(item)}
                                                className="w-full flex items-center justify-center space-x-2 py-2.5 bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-sm"
                                            >
                                                <Download size={12} />
                                                <span>Download PDF</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'queries' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="bg-white rounded-[32px] p-8 shadow-2xl shadow-gray-100 border border-gray-100">
                        <div className="flex items-center space-x-4 mb-8">
                            <div className="p-3 bg-indigo-50 rounded-2xl">
                                <Send className="text-indigo-600" size={24} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 tracking-tighter">Support & Queries</h3>
                                <p className="text-gray-500 text-sm font-medium">Raise requests for corrections</p>
                            </div>
                        </div>
                        <form onSubmit={handleSubmitQuery} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Subject</label>
                                <input
                                    type="text"
                                    value={queryForm.subject}
                                    onChange={(e) => setQueryForm({ ...queryForm, subject: e.target.value })}
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none transition-all font-medium text-gray-800"
                                    placeholder="e.g., HRA Component discrepancy"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Detailed Description</label>
                                <textarea
                                    value={queryForm.description}
                                    onChange={(e) => setQueryForm({ ...queryForm, description: e.target.value })}
                                    rows={4}
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none transition-all font-medium text-gray-800 resize-none"
                                    placeholder="Describe your concern..."
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-indigo-600 text-white py-5 rounded-[20px] font-black text-sm uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 disabled:opacity-50 flex items-center justify-center space-x-2"
                            >
                                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (
                                    <>
                                        <Send size={16} />
                                        <span>Submit Ticket</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    <div className="space-y-6">
                        <h4 className="text-xl font-black text-gray-900 tracking-tighter px-4">Past Tickets</h4>
                        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                            {queries.map((query, idx) => (
                                <div key={idx} className="bg-white rounded-[24px] p-6 shadow-lg shadow-gray-100 border border-gray-100 group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-2 bg-indigo-50 rounded-xl">
                                            <FileText className="text-indigo-600" size={18} />
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${query.status === 'Resolved' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                                            }`}>
                                            {query.status}
                                        </span>
                                    </div>
                                    <p className="font-black text-gray-900 mb-1">{query.subject}</p>
                                    <p className="text-gray-500 text-sm font-medium line-clamp-2">{query.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SalarySection;
