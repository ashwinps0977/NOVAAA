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

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white max-w-4xl w-full shadow-2xl rounded-lg overflow-hidden my-auto">
                {/* Print Control Bar */}
                <div className="bg-gray-100 p-4 flex justify-between items-center print:hidden border-b">
                    <h2 className="text-lg font-bold text-gray-700">Payslip Preview</h2>
                    <div className="space-x-3">
                        <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:text-gray-900">Close</button>
                        <button onClick={handlePrint} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Print / Save PDF</button>
                    </div>
                </div>

                {/* Payslip Content */}
                <div className="p-8 print:p-0" id="printable-payslip">
                    {/* Header */}
                    <div className="text-center border-b pb-6 mb-6">
                        <h1 className="text-3xl font-bold text-gray-800 uppercase tracking-wide">NOVA INC.</h1>
                        <p className="text-gray-500">123 Tech Park, Innovation Way, Silicon Valley, CA</p>
                        <h3 className="text-xl font-semibold mt-4 text-gray-700">Payslip for {salary.month} {salary.year}</h3>
                    </div>

                    {/* Employee Details Grid */}
                    <div className="grid grid-cols-2 gap-x-12 gap-y-4 text-sm mb-8 border-b pb-6">
                        <div>
                            <p className="text-gray-500">Employee Name</p>
                            <p className="font-bold text-gray-800 text-lg">{employee?.name || 'Unknown'}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Employee ID</p>
                            <p className="font-bold text-gray-800">EMP-{salary.employee.toString().slice(-6).toUpperCase()}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Department / Designation</p>
                            <p className="font-bold text-gray-800">{structure?.name || 'Standard Grade'}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Bank Account</p>
                            <p className="font-bold text-gray-800">{salary.bankName} - {salary.accountNumber}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Working Days</p>
                            <p className="font-bold text-gray-800">30</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Payment Date</p>
                            <p className="font-bold text-gray-800">{new Date(salary.paymentDate || Date.now()).toLocaleDateString()}</p>
                        </div>
                    </div>

                    {/* Salary Breakdown Table */}
                    <div className="grid grid-cols-2 gap-8 mb-8">
                        {/* Earnings */}
                        <div className="border rounded-lg overflow-hidden">
                            <div className="bg-gray-50 px-4 py-2 border-b font-bold text-gray-700">Earnings</div>
                            <div className="divide-y">
                                <div className="flex justify-between px-4 py-2">
                                    <span>Basic Salary</span>
                                    <span>{salary.basic.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between px-4 py-2">
                                    <span>HRA</span>
                                    <span>{salary.hra.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between px-4 py-2">
                                    <span>DA</span>
                                    <span>{salary.da.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between px-4 py-2">
                                    <span>Special Allowance</span>
                                    <span>{((salary.netSalary + salary.deductions) - (salary.basic + salary.hra + salary.da + (salary.bonus || 0))).toLocaleString()}</span>
                                </div>
                                {salary.bonus > 0 && (
                                    <div className="flex justify-between px-4 py-2 text-green-700 font-medium">
                                        <span>Bonus / Incentive</span>
                                        <span>{salary.bonus.toLocaleString()}</span>
                                    </div>
                                )}
                            </div>
                            <div className="bg-gray-50 px-4 py-2 border-t flex justify-between font-bold">
                                <span>Total Earnings</span>
                                <span>{(salary.netSalary + salary.deductions + salary.pf + salary.tax).toLocaleString()}</span>
                            </div>
                        </div>

                        {/* Deductions */}
                        <div className="border rounded-lg overflow-hidden h-fit">
                            <div className="bg-gray-50 px-4 py-2 border-b font-bold text-gray-700">Deductions</div>
                            <div className="divide-y">
                                <div className="flex justify-between px-4 py-2">
                                    <span>Provident Fund (PF)</span>
                                    <span>{salary.pf.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between px-4 py-2">
                                    <span>Income Tax</span>
                                    <span>{salary.tax.toLocaleString()}</span>
                                </div>
                                {salary.deductions > 0 && (
                                    <div className="flex justify-between px-4 py-2 text-orange-700 font-medium">
                                        <span>Other Deductions</span>
                                        <span>{salary.deductions.toLocaleString()}</span>
                                    </div>
                                )}
                            </div>
                            <div className="bg-gray-50 px-4 py-2 border-t flex justify-between font-bold">
                                <span>Total Deductions</span>
                                <span>{(salary.deductions + salary.pf + salary.tax).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Net Pay Highlight */}
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-6 mb-12 flex justify-between items-center print:bg-gray-50 print:border-gray-200">
                        <div>
                            <p className="text-gray-500 text-sm uppercase tracking-wider font-semibold">Net Payable Salary</p>
                            <p className="text-sm text-gray-500 mt-1">Amount in words: <span className="italic">Please implement number to words util</span></p>
                        </div>
                        <div className="text-3xl font-bold text-blue-800 print:text-black">
                            ${salary.netSalary.toLocaleString()}
                        </div>
                    </div>

                    {/* Footer / Signatures */}
                    <div className="grid grid-cols-2 gap-20 mt-20 pt-10">
                        <div className="text-center">
                            <div className="border-t border-gray-400 w-2/3 mx-auto"></div>
                            <p className="mt-2 font-medium text-gray-600">Employee Signature</p>
                        </div>
                        <div className="text-center">
                            <div className="border-t border-gray-400 w-2/3 mx-auto"></div>
                            <p className="mt-2 font-medium text-gray-600">Authorized Signatory</p>
                            <p className="text-xs text-gray-400">NOVA HR Dept.</p>
                        </div>
                    </div>

                    <div className="mt-12 text-center text-xs text-gray-400">
                        <p>This is a computer-generated document. System ID: {salary._id}</p>
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
                        top: 0;
                        width: 100%;
                        padding: 20px;
                    }
                }
            `}</style>
        </div>
    );
};

export default PayslipTemplate;
