const Employee = require('../models/Employee');
const SalaryStructure = require('../models/SalaryStructure');
const Payroll = require('../models/Payroll');

// Algorithm 1: Attrition Risk Prediction
// Based on: Salary vs Market Ratio, Tenure, and simple random factors (simulation)
const predictAttrition = (employee, salaryStructure) => {
    let riskScore = 0;
    const factors = [];

    // 1. Salary Competitiveness
    // Assume "Market Standard" is 20% higher than base for simulation purposes
    const marketStandard = salaryStructure.baseSalary * 1.2;
    const currentSalary = employee.currentSalary || salaryStructure.baseSalary;

    if (currentSalary < marketStandard * 0.8) {
        riskScore += 40;
        factors.push('Significantly Underpaid');
    } else if (currentSalary < marketStandard) {
        riskScore += 20;
        factors.push('Slightly Underpaid');
    }

    // 2. Tenure (Mock calculation from joining date)
    const joinDate = new Date(employee.joiningDate || '2023-01-01');
    const yearsOfService = (new Date() - joinDate) / (1000 * 60 * 60 * 24 * 365);

    if (yearsOfService > 2 && yearsOfService < 5) {
        riskScore += 10; // Mid-level itch
        factors.push('Mid-level Tenure (Risk Zone)');
    }

    // Cap score
    riskScore = Math.min(riskScore, 100);

    return {
        score: riskScore,
        level: riskScore > 50 ? 'High' : (riskScore > 20 ? 'Medium' : 'Low'),
        factors
    };
};

// Algorithm 2: Salary Fairness (Bell Curve / Anomaly Detection)
const analyzeFairness = (employees, structures) => {
    // Group by Role/Structure
    const analysis = {};

    structures.forEach(struct => {
        const roleEmployees = employees.filter(e => e.salaryStructure && e.salaryStructure._id.toString() === struct._id.toString());
        if (roleEmployees.length === 0) return;

        const salaries = roleEmployees.map(e => e.currentSalary || struct.baseSalary).sort((a, b) => a - b);
        const avg = salaries.reduce((a, b) => a + b, 0) / salaries.length;
        const min = salaries[0];
        const max = salaries[salaries.length - 1];

        // Identify Outliers (+/- 20% from avg)
        const outliers = roleEmployees.filter(e => {
            const sal = e.currentSalary || struct.baseSalary;
            return sal < avg * 0.8 || sal > avg * 1.2;
        }).map(e => ({
            name: e.name,
            salary: e.currentSalary || struct.baseSalary,
            issue: (e.currentSalary || struct.baseSalary) < avg ? 'Underpaid' : 'Overpaid'
        }));

        analysis[struct.name] = {
            avg, min, max, outliers, headcount: roleEmployees.length
        };
    });

    return analysis;
};

// Algorithm 3: Budget Forecasting
const forecastBudget = (currentMonthlyPayroll) => {
    // Simple linear regression simulation
    const growthRate = 0.05; // 5% annual growth
    const months = [];
    let current = currentMonthlyPayroll;

    for (let i = 1; i <= 12; i++) {
        // Add random fluctuation and steady growth
        current = current * (1 + (growthRate / 12)) + (Math.random() * 1000);
        months.push({
            month: `Month +${i}`,
            amount: Math.round(current)
        });
    }
    return months;
};

exports.getPayrollInsights = async (req, res) => {
    try {
        const employees = await Employee.find().populate('salaryStructure');
        const salaryStructures = await SalaryStructure.find();

        // 1. Attrition Analysis
        const attritionRisks = employees.map(emp => {
            if (!emp.salaryStructure) return null;
            const risk = predictAttrition(emp, emp.salaryStructure);
            if (risk.level === 'High' || risk.level === 'Medium') {
                return { name: emp.name, role: emp.position, ...risk };
            }
            return null;
        }).filter(Boolean);

        // 2. Fairness Analysis
        const fairness = analyzeFairness(employees, salaryStructures);

        // 3. Forecast
        // Calculate current total
        const totalMonthly = employees.reduce((sum, emp) => {
            return sum + (emp.currentSalary || (emp.salaryStructure ? emp.salaryStructure.baseSalary : 0));
        }, 0);

        const forecast = forecastBudget(totalMonthly);

        res.json({
            attritionRisks,
            fairness,
            forecast,
            totalMonthly
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
};

exports.aiQuery = async (req, res) => {
    const { query } = req.body;
    const lowerQuery = query.toLowerCase();

    try {
        let answer = "I'm not sure about that. Try asking about 'salary anomalies', 'budget', or 'attrition'.";

        if (lowerQuery.includes('why') && lowerQuery.includes('salary') && lowerQuery.includes('low')) {
            answer = "Salary is determined by your designated Salary Structure band. If it seems low, it might be heavily weighted towards performance bonuses or your base pay is at the lower end of the band relative to market standards.";
        } else if (lowerQuery.includes('who') && (lowerQuery.includes('hike') || lowerQuery.includes('underpaid'))) {
            // Fetch underpaid logic
            const employees = await Employee.find().populate('salaryStructure');
            const underpaid = employees.filter(e => {
                if (!e.salaryStructure) return false;
                return (e.currentSalary || e.salaryStructure.baseSalary) < e.salaryStructure.baseSalary * 1.1; // Demo rule
            }).map(e => e.name).slice(0, 3).join(', ');
            answer = `Based on market analysis, the following employees might need a correction: ${underpaid || 'None found'}.`;
        } else if (lowerQuery.includes('costly') || lowerQuery.includes('expensive')) {
            // Mock department analysis
            answer = "The 'Engineering' department currently has the highest payroll cost due to recent senior hires.";
        } else if (lowerQuery.includes('budget') || lowerQuery.includes('forecast')) {
            answer = "Based on current trends, we project a 5% increase in payroll costs over the next fiscal year.";
        }

        res.json({ answer });

    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'AI Error' });
    }
};
