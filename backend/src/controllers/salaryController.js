const Salary = require('../models/Salary');
const SalaryQuery = require('../models/SalaryQuery');
const SalaryStructure = require('../models/SalaryStructure');
const Payroll = require('../models/Payroll');
const Employee = require('../models/Employee');
const { validationResult } = require('express-validator');

// 1. Get salary history for current employee
exports.getSalaryHistory = async (req, res) => {
    try {
        const emp = await Employee.findOne({ email: req.user.email });
        if (!emp) return res.status(404).json({ message: 'Employee profile not found' });

        const salaries = await Salary.find({ employee: emp._id })
            .populate('employee')
            .sort({ createdAt: -1 });
        res.json(salaries);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// 2. Get latest salary slip
exports.getLatestSalary = async (req, res) => {
    try {
        // Find existing employee record first
        const emp = await Employee.findOne({ email: req.user.email });
        if (!emp) return res.status(404).json({ message: 'Employee profile not found' });

        const salary = await Salary.findOne({ employee: emp._id })
            .populate('employee')
            .sort({ createdAt: -1 });

        if (!salary) {
            return res.status(404).json({ message: 'No salary record found' });
        }
        res.json(salary);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Raise a salary query
// @route   POST /api/salary/query
// @access  Private
exports.raiseQuery = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { subject, description, category } = req.body;

    try {
        const newQuery = new SalaryQuery({
            employee: req.user.id,
            subject,
            description,
            category
        });

        const query = await newQuery.save();
        res.json(query);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get my salary queries
// @route   GET /api/salary/queries
// @access  Private
exports.getQueries = async (req, res) => {
    try {
        const queries = await SalaryQuery.find({ employee: req.user.id }).sort({ createdAt: -1 });
        res.json(queries);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Seed dummy salary data (For testing purposes only)
// @route   POST /api/salary/seed
// @access  Private
exports.seedSalary = async (req, res) => {
    try {
        const { month, year, basic, hra, da, pf, tax, bonus, deductions, netSalary, accountNumber, bankName } = req.body;

        // Check if salary already exists for this month/year
        let salary = await Salary.findOne({ employee: req.user.id, month, year });
        if (salary) {
            return res.status(400).json({ msg: 'Salary already exists for this month' });
        }

        const newSalary = new Salary({
            employee: req.user.id,
            month,
            year,
            ...req.body,
            status: 'Paid'
        });

        salary = await newSalary.save();
        res.json(salary);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// --- HR/Admin Functions ---

// 1. Create/Update Salary Structure
exports.createSalaryStructure = async (req, res) => {
    const { name, baseSalary, components, deductions } = req.body;
    try {
        let structure = await SalaryStructure.findOne({ name });
        if (structure) {
            return res.status(400).json({ msg: 'Salary Structure already exists' });
        }
        structure = new SalaryStructure({
            name,
            baseSalary,
            components,
            deductions
        });
        await structure.save();
        res.json(structure);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.getSalaryStructures = async (req, res) => {
    try {
        const structures = await SalaryStructure.find({ isActive: true });
        res.json(structures);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// 2. Assign Salary Structure to Employee
exports.assignSalaryStructure = async (req, res) => {
    const { employeeId, salaryStructureId, currentSalary } = req.body;
    try {
        const employee = await Employee.findById(employeeId);
        if (!employee) return res.status(404).json({ msg: 'Employee not found' });

        employee.salaryStructure = salaryStructureId;
        if (currentSalary) employee.currentSalary = currentSalary;

        await employee.save();
        res.json({ msg: 'Salary structure assigned', employee });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

const TaxRule = require('../models/TaxRule');
const Bonus = require('../models/Bonus');
const Deduction = require('../models/Deduction');

// Helper: Calculate Tax based on slabs
const calculateTax = (annualIncome, taxRules) => {
    let tax = 0;
    // Sort rules by minIncome
    const rules = taxRules.sort((a, b) => a.minIncome - b.minIncome);

    // Simplified slab calculation
    for (const rule of rules) {
        if (annualIncome > rule.minIncome) {
            const taxableAmount = Math.min(annualIncome, rule.maxIncome || Infinity) - rule.minIncome;
            tax += (taxableAmount * (rule.percentage / 100));
        }
    }
    return tax / 12; // Monthly Tax
};

// 3. Generate Monthly Payroll (Preview/Draft)
exports.generatePayroll = async (req, res) => {
    const { month, year } = req.body;
    try {
        // Check if payroll already exists
        let payroll = await Payroll.findOne({ month, year });
        if (payroll && payroll.status === 'Paid') {
            return res.status(400).json({ msg: 'Payroll already paid for this month' });
        }

        if (!payroll) {
            payroll = new Payroll({
                month,
                year,
                processedBy: req.user.id,
                status: 'Draft'
            });
        }

        // Fetch dependencies
        const employees = await Employee.find({
            salaryStructure: { $exists: true }
        }).populate('salaryStructure');

        const taxRules = await TaxRule.find({ isActive: true });

        // Fetch Bonuses and Deductions for this period
        const periodBonuses = await Bonus.find({
            'payrollPeriod.month': month,
            'payrollPeriod.year': year,
            status: 'Approved'
        });

        const periodDeductions = await Deduction.find({
            'payrollPeriod.month': month,
            'payrollPeriod.year': year,
            status: 'Approved'
        });

        let totalAmount = 0;
        const salaryRecords = [];

        for (const emp of employees) {
            if (!emp.salaryStructure) {
                console.warn(`Employee ${emp._id} has no salary structure assigned. Skipping.`);
                continue;
            }

            const struct = emp.salaryStructure;
            const base = emp.currentSalary || struct.baseSalary;

            // Section B: Earnings Calculation
            let hra = (base * (struct.components.hra / 100));
            let specialAllowance = struct.components.specialAllowance || 0;
            let conveyanceAllowance = struct.components.conveyanceAllowance || 0;
            let medicalAllowance = struct.components.medicalAllowance || 1250; // Default if not in structure
            let internetAllowance = struct.components.internetAllowance || 500; // Default if not in structure
            let transportAllowance = struct.components.transportAllowance || 0;
            let mealAllowance = struct.components.mealAllowance || 2200; // Default if not in structure
            let shiftAllowance = struct.components.shiftAllowance || 0;
            let projectAllowance = struct.components.projectAllowance || 0;
            let performancePay = struct.components.performancePay || 0;

            // Add Variable Bonuses
            const empBonuses = periodBonuses.filter(b => b.employee.toString() === emp._id.toString());
            const totalBonus = empBonuses.reduce((sum, b) => sum + b.amount, 0);

            // Granular Variable Earnings (from bonus model or direct input)
            let performanceIncentive = 0; // Example, could come from Bonus model with specific type
            let salesCommission = 0;
            let projectBonus = 0;
            let spotAward = 0;
            let referralBonus = 0;

            // Aggregate all earnings
            const totalEarnings = base + hra + specialAllowance + conveyanceAllowance +
                medicalAllowance + internetAllowance + transportAllowance +
                mealAllowance + shiftAllowance + projectAllowance +
                performancePay + totalBonus + performanceIncentive +
                salesCommission + projectBonus + spotAward + referralBonus;

            // Employer Contributions
            let employerPF = base * (struct.employerContributions?.pf || 0.12); // Default 12%
            let employerInsurance = struct.employerContributions?.insurance || 500; // Default
            let gratuity = base * (struct.employerContributions?.gratuity || 0.0481); // Rough estimation
            let esi = (base < 21000) ? (base * (struct.employerContributions?.esi || 0.0325)) : 0; // Default 3.25%

            // Section C: Deductions
            let pf = (base * (struct.deductions.pf / 100));
            let professionalTax = struct.deductions.professionalTax || 200; // Default
            let insurancePremium = struct.deductions.insurancePremium || 300; // Default

            // Calculate Tax (Dynamic)
            let incomeTaxTDS = 0;
            if (taxRules.length > 0) {
                incomeTaxTDS = calculateTax(totalEarnings * 12, taxRules);
            }

            // Calculate Variable Deductions
            const empDeductions = periodDeductions.filter(d => d.employee.toString() === emp._id.toString());
            const totalVariableDeductions = empDeductions.reduce((sum, d) => sum + d.amount, 0);

            // Granular Variable Deductions (from deduction model or direct input)
            let loanDeduction = 0;
            let advanceSalaryDeduction = 0;
            let latePenalty = 0;
            let lop = 0;

            // Aggregate all deductions
            const totalDeductions = pf + professionalTax + insurancePremium + incomeTaxTDS +
                totalVariableDeductions + loanDeduction + advanceSalaryDeduction +
                latePenalty + lop;

            const netSalary = totalEarnings - totalDeductions;

            // Create or Update Salary Record
            let salary = await Salary.findOne({ employee: emp._id, month, year });
            if (!salary) {
                salary = new Salary({
                    employee: emp._id,
                    month,
                    year,
                    basic: base,
                    hra,
                    specialAllowance,
                    conveyanceAllowance,
                    medicalAllowance,
                    internetAllowance,
                    transportAllowance,
                    mealAllowance,
                    shiftAllowance,
                    projectAllowance,
                    performancePay,
                    bonus: totalBonus, // Aggregate from Bonus model
                    performanceIncentive,
                    salesCommission,
                    projectBonus,
                    spotAward,
                    referralBonus,
                    employerPF,
                    employerInsurance,
                    gratuity,
                    esi,
                    pf,
                    professionalTax,
                    insurancePremium,
                    incomeTaxTDS,
                    otherDeductions: totalVariableDeductions,
                    netSalary,
                    status: 'Pending',
                    payroll: payroll._id,
                    accountNumber: emp.bankDetails?.accountNumber || 'N/A',
                    bankName: emp.bankDetails?.bankName || 'N/A',
                    ifsc: emp.bankDetails?.ifscCode || 'N/A',
                    pan: emp.bankDetails?.panNumber || 'N/A',
                    taxRegime: emp.taxRegime || 'New'
                });
            } else if (salary.status === 'Pending') {
                salary.basic = base;
                salary.hra = hra;
                salary.specialAllowance = specialAllowance;
                salary.conveyanceAllowance = conveyanceAllowance;
                salary.medicalAllowance = medicalAllowance;
                salary.internetAllowance = internetAllowance;
                salary.transportAllowance = transportAllowance;
                salary.mealAllowance = mealAllowance;
                salary.shiftAllowance = shiftAllowance;
                salary.performancePay = performancePay;
                salary.bonus = totalBonus;
                salary.pf = pf;
                salary.professionalTax = professionalTax;
                salary.insurancePremium = insurancePremium;
                salary.incomeTaxTDS = incomeTaxTDS;
                salary.otherDeductions = totalVariableDeductions;
                salary.netSalary = netSalary;
                salary.accountNumber = emp.bankDetails?.accountNumber || 'N/A';
                salary.bankName = emp.bankDetails?.bankName || 'N/A';
                salary.ifsc = emp.bankDetails?.ifscCode || 'N/A';
                salary.pan = emp.bankDetails?.panNumber || 'N/A';
                salary.taxRegime = emp.taxRegime || 'New';
                salary.payroll = payroll._id;
            }

            await salary.save();
            salaryRecords.push(salary);
            totalAmount += netSalary;
        }

        payroll.totalAmount = totalAmount;
        payroll.details = {
            totalEmployees: salaryRecords.length,
            manualAdjustments: 0
        };
        await payroll.save();

        // Populate employee data before sending back
        const populatedSalaries = await Salary.find({ _id: { $in: salaryRecords.map(s => s._id) } }).populate('employee', 'name email employeeId');

        const salariesWithIds = populatedSalaries.map(s => {
            const obj = s.toObject();
            if (obj.employee && typeof obj.employee === 'object') {
                obj.employee.employeeId = `EMP-${obj.employee._id.toString().slice(-6).toUpperCase()}`;
            }
            return obj;
        });

        res.json({ msg: 'Payroll generated successfully', payroll, salaries: salariesWithIds });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// 4. Update specific employee salary (Bonus/Deduction)
exports.updateSalaryComponent = async (req, res) => {
    const { salaryId, type, amount, reason } = req.body; // type: 'bonus' or 'deduction'
    try {
        const salary = await Salary.findById(salaryId);
        if (!salary) return res.status(404).json({ msg: 'Salary record not found' });

        if (salary.status === 'Paid') return res.status(400).json({ msg: 'Cannot update paid salary' });

        if (type === 'bonus') {
            salary.bonus = (salary.bonus || 0) + Number(amount);
            salary.netSalary += Number(amount);
        } else if (type === 'deduction') {
            salary.deductions = (salary.deductions || 0) + Number(amount);
            salary.netSalary -= Number(amount);
        }

        salary.auditLog.push({
            action: `Updated ${type}`,
            changedBy: req.user.id,
            details: `${reason} - Amount: ${amount}`
        });

        await salary.save();
        res.json(salary);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// 5. Approve/Pay Payroll
exports.processPayrollStatus = async (req, res) => {
    const { payrollId, status } = req.body; // 'Approved' or 'Paid'
    try {
        const payroll = await Payroll.findById(payrollId);
        if (!payroll) return res.status(404).json({ msg: 'Payroll not found' });

        payroll.status = status;
        if (status === 'Approved') payroll.approvedBy = req.user.id;
        if (status === 'Paid') {
            payroll.paidAt = Date.now();
            // Mark all linked salaries as Paid
            await Salary.updateMany({ payroll: payrollId }, { status: 'Paid', paymentDate: Date.now() });
        }

        await payroll.save();
        res.json(payroll);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
// 6. Get all employees salary list for HR
const { calculateEmployeeCTC } = require('../utils/salaryUtils');

exports.getHRSalaryList = async (req, res) => {
    try {
        const employees = await Employee.find({ role: 'employee' }).populate('salaryStructure');

        const salaryList = await Promise.all(employees.map(async (emp) => {
            // If currentCTC is 0, calculate it on the fly
            let ctc = emp.currentCTC || 0;
            if (ctc === 0 && (emp.salary || emp.currentSalary)) {
                const base = emp.salary || emp.currentSalary;
                const calculated = calculateEmployeeCTC(base, emp.salaryStructure);
                ctc = calculated.annualCTC;

                // Save it for future use
                emp.currentCTC = ctc;
                await emp.save();
            }

            return {
                id: emp._id,
                employeeId: `EMP-${emp._id.toString().slice(-6).toUpperCase()}`,
                name: emp.name,
                email: emp.email,
                department: emp.department,
                position: emp.position,
                salary: emp.salary || emp.currentSalary || 0,
                currentCTC: ctc,
                joiningDate: emp.joiningDate,
                status: emp.status
            };
        }));

        res.json(salaryList);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// 7. Get payroll by month/year
exports.getPayrollByMonth = async (req, res) => {
    const { month, year } = req.params;
    try {
        const payroll = await Payroll.findOne({ month, year });
        if (!payroll) return res.json({ payroll: null, salaries: [] });

        const salaries = await Salary.find({ payroll: payroll._id }).populate('employee', 'name email employeeId salaryStructure');

        const salariesWithIds = salaries.map(s => {
            const obj = s.toObject();
            if (obj.employee && typeof obj.employee === 'object') {
                obj.employee.employeeId = `EMP-${obj.employee._id.toString().slice(-6).toUpperCase()}`;
            }
            return obj;
        });

        res.json({ payroll, salaries: salariesWithIds });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
