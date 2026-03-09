import React from 'react';

interface PayslipProps {
    salary: any;
    employee: any;
    structure: any;
    onClose: () => void;
}

const PayslipTemplate: React.FC<PayslipProps> = ({ salary, employee, structure, onClose }) => {

    const handlePrint = () => {
        window.print();
    };

    // Simple number to words converter (for demonstration)
    const numberToWords = (num: number) => {
        const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
        const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

        let strNum = num.toString();
        if (strNum.length > 9) return 'overflow';
        let n: any = ('000000000' + strNum).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
        if (!n) return '';
        let str = '';
        str += (Number(n[1]) !== 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
        str += (Number(n[2]) !== 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
        str += (Number(n[3]) !== 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
        str += (Number(n[4]) !== 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
        str += (Number(n[5]) !== 0) ? ((str !== '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) + 'Only ' : '';
        return str;
    };

    // In a real scenario, special allowance is often the balancing figure
    const totalEarnings = (salary.basic || 0) + (salary.hra || 0) + (salary.da || 0) + (salary.specialAllowance || 0) + (salary.bonus || 0) +
        (salary.medicalAllowance || 0) + (salary.conveyanceAllowance || 0) + (salary.mealAllowance || 0);

    const totalDeductions = (salary.pf || 0) + (salary.incomeTaxTDS || salary.tax || 0) + (salary.otherDeductions || salary.deductions || 0) + (salary.professionalTax || 0);

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white max-w-4xl w-full shadow-2xl rounded-lg overflow-hidden my-auto">
                {/* Print Control Bar */}
                <div className="bg-gray-100 p-4 flex justify-between items-center print:hidden border-b">
                    <h2 className="text-lg font-bold text-gray-700">Payslip Preview</h2>
                    <div className="space-x-3">
                        <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:text-gray-900 border rounded-lg">Close</button>
                        <button onClick={handlePrint} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Print / Save PDF</button>
                    </div>
                </div>

                {/* Payslip Content */}
                <div className="p-8 print:p-0" id="printable-payslip">
                    {/* Header */}
                    <div className="text-center border-b pb-6 mb-6">
                        <h1 className="text-3xl font-bold text-blue-600 uppercase tracking-wide">NOVA AI INC.</h1>
                        <p className="text-gray-500">Tech Hub, Innovation Sector, Phase 2, Bangalore, KA</p>
                        <h3 className="text-xl font-semibold mt-4 text-gray-700 border-t pt-4 inline-block px-10">Payslip for {salary.month} {salary.year}</h3>
                    </div>

                    {/* Employee Details Grid */}
                    <div className="grid grid-cols-2 gap-x-12 gap-y-4 text-sm mb-8 border-b pb-6">
                        <div>
                            <p className="text-gray-500 uppercase text-[10px] font-bold">Employee Name</p>
                            <p className="font-bold text-gray-800 text-lg">{employee?.name || 'Authorized Personnel'}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 uppercase text-[10px] font-bold">Employee ID</p>
                            <p className="font-bold text-gray-800">EMP-{salary.employee?.toString().slice(-6).toUpperCase()}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 uppercase text-[10px] font-bold">Designation / Grade</p>
                            <p className="font-bold text-gray-800">{structure?.name || 'Professional Services'}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 uppercase text-[10px] font-bold">Bank Account Details</p>
                            <p className="font-bold text-gray-800">{salary.bankName || 'HDFC Bank'} - {salary.accountNumber || '********1234'}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 uppercase text-[10px] font-bold">Tax Regime</p>
                            <p className="font-bold text-gray-800">{salary.taxRegime || 'New'}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 uppercase text-[10px] font-bold">Payment Date</p>
                            <p className="font-bold text-gray-800">{new Date(salary.paymentDate || Date.now()).toLocaleDateString()}</p>
                        </div>
                    </div>

                    {/* Salary Breakdown Table */}
                    <div className="grid grid-cols-2 gap-8 mb-8">
                        {/* Earnings */}
                        <div className="border rounded-lg overflow-hidden">
                            <div className="bg-gray-50 px-4 py-2 border-b font-bold text-gray-700">Earnings</div>
                            <div className="divide-y text-sm">
                                <div className="flex justify-between px-4 py-2">
                                    <span>Basic Salary</span>
                                    <span className="font-semibold">₹{salary.basic?.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between px-4 py-2">
                                    <span>HRA</span>
                                    <span className="font-semibold">₹{salary.hra?.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between px-4 py-2">
                                    <span>Special Allowance</span>
                                    <span className="font-semibold">₹{salary.specialAllowance?.toLocaleString() || '0'}</span>
                                </div>
                                {salary.medicalAllowance > 0 && (
                                    <div className="flex justify-between px-4 py-2">
                                        <span>Medical Allowance</span>
                                        <span className="font-semibold">₹{salary.medicalAllowance.toLocaleString()}</span>
                                    </div>
                                )}
                                {salary.conveyanceAllowance > 0 && (
                                    <div className="flex justify-between px-4 py-2">
                                        <span>Conveyance Allowance</span>
                                        <span className="font-semibold">₹{salary.conveyanceAllowance.toLocaleString()}</span>
                                    </div>
                                )}
                                {salary.bonus > 0 && (
                                    <div className="flex justify-between px-4 py-2 text-green-700 font-bold bg-green-50">
                                        <span>Bonus / Variable Pay</span>
                                        <span>₹{salary.bonus.toLocaleString()}</span>
                                    </div>
                                )}
                            </div>
                            <div className="bg-blue-50 px-4 py-2 border-t flex justify-between font-bold text-blue-900 italic">
                                <span>Total Earnings (A)</span>
                                <span>₹{totalEarnings.toLocaleString()}</span>
                            </div>
                        </div>

                        {/* Deductions */}
                        <div className="border rounded-lg overflow-hidden h-fit">
                            <div className="bg-gray-50 px-4 py-2 border-b font-bold text-gray-700">Deductions</div>
                            <div className="divide-y text-sm">
                                <div className="flex justify-between px-4 py-2">
                                    <span>Provident Fund (PF)</span>
                                    <span className="font-semibold">₹{salary.pf?.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between px-4 py-2">
                                    <span>Income Tax (TDS)</span>
                                    <span className="font-semibold">₹{(salary.incomeTaxTDS || salary.tax || 0).toLocaleString()}</span>
                                </div>
                                {salary.professionalTax > 0 && (
                                    <div className="flex justify-between px-4 py-2">
                                        <span>Professional Tax</span>
                                        <span className="font-semibold">₹{salary.professionalTax.toLocaleString()}</span>
                                    </div>
                                )}
                                {(salary.otherDeductions > 0 || salary.deductions > 0) && (
                                    <div className="flex justify-between px-4 py-2 text-red-700 font-bold bg-red-50">
                                        <span>Other Deductions</span>
                                        <span>₹{(salary.otherDeductions || salary.deductions).toLocaleString()}</span>
                                    </div>
                                )}
                            </div>
                            <div className="bg-red-50 px-4 py-2 border-t flex justify-between font-bold text-red-900 italic">
                                <span>Total Deductions (B)</span>
                                <span>₹{totalDeductions.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Net Pay Highlight */}
                    <div className="bg-indigo-600 border border-indigo-700 rounded-xl p-6 mb-12 flex justify-between items-center text-white print:bg-white print:text-black print:border-black">
                        <div>
                            <p className="text-white/70 text-xs uppercase tracking-widest font-bold print:text-black">Net Monthly Payable Amount</p>
                            <p className="text-sm mt-1">Amount in words: <span className="italic font-medium">{numberToWords(salary.netSalary)}</span></p>
                        </div>
                        <div className="text-4xl font-black">
                            ₹{salary.netSalary.toLocaleString()}
                        </div>
                    </div>

                    {/* Footer / Signatures */}
                    <div className="grid grid-cols-2 gap-20 mt-20 pt-10">
                        <div className="text-center">
                            <div className="border-t border-gray-400 w-2/3 mx-auto"></div>
                            <p className="mt-2 font-bold text-gray-700 uppercase text-xs">Employee Signature</p>
                        </div>
                        <div className="text-center">
                            <div className="border-t border-gray-400 w-2/3 mx-auto"></div>
                            <p className="mt-2 font-bold text-gray-700 uppercase text-xs">Authorized Signatory</p>
                            <p className="text-[10px] text-gray-400/80 font-bold">DIGITALLY SIGNED DOCUMENT</p>
                        </div>
                    </div>

                    <div className="mt-16 text-center text-[10px] text-gray-400 border-t pt-4">
                        <p>This is a computer-generated payslip and does not require a physical signature. System ID: {salary._id}</p>
                        <p className="mt-1 font-bold">NOVA AI - EMPOWERING HUMAN RESOURCES</p>
                    </div>
                </div>
            </div>

            {/* Print Styles */}
            <style>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #printable-payslip, #printable-payslip * {
                        visibility: visible;
                    }
                    #printable-payslip {
                        position: absolute;
                        left: 0;
                        right: 0;
                        top: 0;
                        width: 100%;
                        padding: 0;
                        margin: 0;
                    }
                    .fixed {
                        position: relative !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default PayslipTemplate;
