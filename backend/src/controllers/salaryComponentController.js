const Bonus = require('../models/Bonus');
const Deduction = require('../models/Deduction');
const TaxRule = require('../models/TaxRule');
const Employee = require('../models/Employee');

// Bonus Controller
exports.getBonuses = async (req, res) => {
    try {
        const bonuses = await Bonus.find().populate('employee', 'name email').sort({ createdAt: -1 });
        res.json(bonuses);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.addBonus = async (req, res) => {
    try {
        const { employeeId, amount, type, reason, month, year } = req.body;
        const bonus = new Bonus({
            employee: employeeId,
            amount,
            type,
            reason,
            payrollPeriod: { month, year },
            status: 'Approved' // Direct approvals for now via HR dashboard
        });
        await bonus.save();
        res.status(201).json(bonus);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.deleteBonus = async (req, res) => {
    try {
        await Bonus.findByIdAndDelete(req.params.id);
        res.json({ message: 'Bonus removed' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Deduction Controller
exports.getDeductions = async (req, res) => {
    try {
        const deductions = await Deduction.find().populate('employee', 'name email').sort({ createdAt: -1 });
        res.json(deductions);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.addDeduction = async (req, res) => {
    try {
        const { employeeId, amount, type, reason, month, year } = req.body;
        const deduction = new Deduction({
            employee: employeeId,
            amount,
            type,
            reason,
            payrollPeriod: { month, year },
            status: 'Approved'
        });
        await deduction.save();
        res.status(201).json(deduction);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.deleteDeduction = async (req, res) => {
    try {
        await Deduction.findByIdAndDelete(req.params.id);
        res.json({ message: 'Deduction removed' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

// TaxRule Controller
exports.getTaxRules = async (req, res) => {
    try {
        const rules = await TaxRule.find({ isActive: true }).sort({ minIncome: 1 });
        res.json(rules);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.addTaxRule = async (req, res) => {
    try {
        const { name, minIncome, maxIncome, percentage, financialYear } = req.body;
        const rule = new TaxRule({
            name,
            minIncome,
            maxIncome,
            percentage,
            financialYear
        });
        await rule.save();
        res.status(201).json(rule);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.deleteTaxRule = async (req, res) => {
    try {
        await TaxRule.findByIdAndUpdate(req.params.id, { isActive: false });
        res.json({ message: 'Tax Rule deactivated' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};
