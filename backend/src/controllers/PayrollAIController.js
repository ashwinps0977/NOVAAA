const Employee = require('../models/Employee');
const SalaryStructure = require('../models/SalaryStructure');
const Payroll = require('../models/Payroll');
const fs = require('fs');
const path = require('path');

// Helper to load policies
const loadPolicies = () => {
    try {
        const policyDir = path.join(__dirname, '../data/policies');
        let combinedPolicyText = "";

        if (fs.existsSync(policyDir)) {
            const files = fs.readdirSync(policyDir).filter(f => f.endsWith('.txt'));
            files.forEach(file => {
                const filePath = path.join(policyDir, file);
                const content = fs.readFileSync(filePath, 'utf-8');
                combinedPolicyText += `\n\n--- ${file} ---\n${content}`;
            });
        }
        return combinedPolicyText;
    } catch (error) {
        console.error("Error loading policies:", error);
        return "";
    }
};

// ... (Existing Analytic Algorithms: predictAttrition, analyzeFairness, forecastBudget) ...

// Algorithm 1: Attrition Risk Prediction
const predictAttrition = (employee, salaryStructure) => {
    let riskScore = 0;
    const factors = [];

    // 1. Salary Competitiveness
    const marketStandard = salaryStructure.baseSalary * 1.2;
    const currentSalary = employee.currentSalary || salaryStructure.baseSalary;

    if (currentSalary < marketStandard * 0.8) {
        riskScore += 40;
        factors.push('Significantly Underpaid');
    } else if (currentSalary < marketStandard) {
        riskScore += 20;
        factors.push('Slightly Underpaid');
    }

    // 2. Tenure
    const joinDate = new Date(employee.joiningDate || '2023-01-01');
    const yearsOfService = (new Date() - joinDate) / (1000 * 60 * 60 * 24 * 365);

    if (yearsOfService > 2 && yearsOfService < 5) {
        riskScore += 10;
        factors.push('Mid-level Tenure (Risk Zone)');
    }

    riskScore = Math.min(riskScore, 100);

    return {
        score: riskScore,
        level: riskScore > 50 ? 'High' : (riskScore > 20 ? 'Medium' : 'Low'),
        factors
    };
};

// Algorithm 2: Salary Fairness
const analyzeFairness = (employees, structures) => {
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
    const growthRate = 0.05; // 5% annual growth
    const months = [];
    let current = currentMonthlyPayroll;

    for (let i = 1; i <= 12; i++) {
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

    if (!query) {
        return res.status(400).json({ msg: 'Query is required' });
    }

    try {
        // Load policy context
        const policyContext = loadPolicies();
        const queryLower = query.toLowerCase();

        // Simple Local Matching for Payroll specific AI
        let answer = "";

        if (queryLower.includes('hra')) {
            answer = "According to our **Salary Policy**, HRA is calculated as 40% of the Basic Pay.";
        } else if (queryLower.includes('bonus')) {
            answer = "Performance bonuses are reviewed annually and credited by the 15th of April based on company performance.";
        } else if (queryLower.includes('salary') || queryLower.includes('pay')) {
            answer = "Salaries are credited on the 5th of every month. For specific queries, please refer to the Payslip Rules policy.";
        } else {
            // Find matched line in policies
            const lines = policyContext.split('\n');
            const match = lines.find(line => line.toLowerCase().includes(queryLower));
            if (match) {
                answer = `According to our policies: "${match.trim()}"`;
            } else {
                answer = "I'm sorry, I couldn't find specific information regarding that query in the payroll policies. Please contact HR for further assistance.";
            }
        }

        res.json({ answer });

    } catch (err) {
        console.error("AI Query Error:", err);
        res.status(500).json({
            msg: 'Local AI processing failed',
            error: err.message
        });
    }
};

// Policy Management Endpoints
exports.getPolicies = async (req, res) => {
    try {
        const policyDir = path.join(__dirname, '../data/policies');
        if (!fs.existsSync(policyDir)) {
            return res.json({ policies: [] });
        }

        const files = fs.readdirSync(policyDir);
        const policies = files.map((file, index) => {
            const stats = fs.statSync(path.join(policyDir, file));
            return {
                id: index + 1,
                title: file.replace(/_/g, ' ').replace('.txt', '').toUpperCase(),
                filename: file,
                category: file.includes('salary') ? 'Compensation' : file.includes('hr') ? 'General' : 'Compliance',
                lastUpdated: stats.mtime.toLocaleDateString(),
                size: (stats.size / 1024).toFixed(2) + ' KB'
            };
        });

        res.json({ policies });
    } catch (error) {
        console.error("Error listing policies:", error);
        res.status(500).json({ error: "Failed to list policies" });
    }
};

exports.getPolicy = async (req, res) => {
    try {
        const { filename } = req.params;
        const policyDir = path.join(__dirname, '../data/policies');
        const filePath = path.join(policyDir, filename);

        // Security check: ensure traversal attacks are prevented
        if (!filePath.startsWith(policyDir) || filename.includes('..')) {
            return res.status(400).json({ error: "Invalid filename" });
        }

        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf-8');
            res.json({ content });
        } else {
            res.status(404).json({ error: "Policy not found" });
        }
    } catch (error) {
        console.error("Error reading policy:", error);
        res.status(500).json({ error: "Failed to read policy" });
    }
};

exports.getModels = async (req, res) => {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();

        if (data.models) {
            res.json({ models: data.models.map(m => m.name) });
        } else {
            res.json({ error: "No models found", data });
        }
    } catch (e) {
        console.error("Error listing models:", e);
        res.status(500).json({ error: e.message });
    }
};
