const Salary = require('../models/Salary');
const SalaryQuery = require('../models/SalaryQuery');
const SalaryStructure = require('../models/SalaryStructure');
const Payroll = require('../models/Payroll');
const Employee = require('../models/Employee');
const { validationResult } = require('express-validator');

// @desc    Get salary history for current employee
// @route   GET /api/salary/history
// @access  Private
exports.getSalaryHistory = async (req, res) => {
    try {
        const salaries = await Salary.find({ employee: req.user.id }).sort({ createdAt: -1 });
        res.json(salaries);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get latest salary slip
// @route   GET /api/salary/latest
// @access  Private
exports.getLatestSalary = async (req, res) => {
    try {
        const salary = await Salary.findOne({ employee: req.user.id }).sort({ createdAt: -1 });
        if (!salary) {
            return res.status(404).json({ msg: 'No salary records found' });
        }
        res.json(salary);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
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
            basic,
            hra,
            da,
            pf,
            tax,
            bonus,
            deductions,
            netSalary,
            accountNumber,
            bankName,
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
            const taxableAmount = Math.min(annualIncome, rule.maxIncome) - rule.minIncome;
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
            const struct = emp.salaryStructure;
            const base = emp.currentSalary || struct.baseSalary;

            // Base Components
            let hra = (base * (struct.components.hra / 100));
            let da = (base * (struct.components.da / 100));
            let special = struct.components.specialAllowance || 0;

            // Add Variable Bonuses
            const empBonuses = periodBonuses.filter(b => b.employee.toString() === emp._id.toString());
            const totalBonus = empBonuses.reduce((sum, b) => sum + b.amount, 0);

            // Gross Salary
            const gross = base + hra + da + special + totalBonus;

            // Calculate Variable Deductions
            const empDeductions = periodDeductions.filter(d => d.employee.toString() === emp._id.toString());
            const totalVariableDeductions = empDeductions.reduce((sum, d) => sum + d.amount, 0);

            // Calculate Statutory Deductions
            const pf = (base * (struct.deductions.pf / 100));

            // Calculate Tax (Dynamic)
            let tax = (base * (struct.deductions.tax / 100)); // Default from structure
            if (taxRules.length > 0) {
                tax = calculateTax(gross * 12, taxRules); // Override with slab calculation
            }

            const totalDeductions = pf + tax + totalVariableDeductions;
            const netSalary = gross - totalDeductions;

            // Create or Update Salary Record
            let salary = await Salary.findOne({ employee: emp._id, month, year });
            if (!salary) {
                salary = new Salary({
                    employee: emp._id,
                    month,
                    year,
                    basic: base,
                    hra,
                    da,
                    pf,
                    tax,
                    bonus: totalBonus,
                    deductions: totalVariableDeductions,
                    netSalary,
                    status: 'Pending',
                    payroll: payroll._id,
                    accountNumber: emp.bankDetails?.accountNumber || 'N/A',
                    bankName: emp.bankDetails?.bankName || 'N/A'
                });
            } else if (salary.status === 'Pending') {
                salary.basic = base;
                salary.hra = hra;
                salary.da = da;
                salary.pf = pf;
                salary.tax = tax;
                salary.bonus = totalBonus;
                salary.deductions = totalVariableDeductions;
                salary.netSalary = netSalary;
                salary.accountNumber = emp.bankDetails?.accountNumber || 'N/A';
                salary.bankName = emp.bankDetails?.bankName || 'N/A';
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

        res.json({ msg: 'Payroll generated successfully', payroll, salaries: salaryRecords });
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
