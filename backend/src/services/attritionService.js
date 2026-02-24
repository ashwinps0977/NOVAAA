const Employee = require('../models/Employee');
const EmployeePerformance = require('../models/EmployeePerformance');
const Attendance = require('../models/Attendance');
const Salary = require('../models/Salary');
const TrainingAssignment = require('../models/TrainingAssignment');
const Skill = require('../models/Skill');

/**
 * Service for calculating attrition metrics and predicting risk
 */
const attritionService = {
    /**
     * Calculates overall attrition rate and breakdowns
     */
    calculateAttritionStats: async () => {
        const allEmployees = await Employee.find();
        const inactiveEmployees = allEmployees.filter(emp => emp.status === 'inactive');

        const total = allEmployees.length || 1;
        const inactiveCount = inactiveEmployees.length;

        const stats = {
            overallRate: (inactiveCount / total) * 100,
            deptBreakdown: {},
            roleBreakdown: {},
            tenureBreakdown: {
                '< 1 year': 0,
                '1-3 years': 0,
                '3-5 years': 0,
                '5+ years': 0
            },
            monthlyTrend: {}, // Last 6 months
            performanceCorrelation: [
                { range: '0-60', rate: 0 },
                { range: '60-80', rate: 0 },
                { range: '80-100', rate: 0 }
            ],
            exitReasons: {}
        };

        // Department and Role breakdown
        inactiveEmployees.forEach(emp => {
            stats.deptBreakdown[emp.department] = (stats.deptBreakdown[emp.department] || 0) + 1;
            stats.roleBreakdown[emp.position || emp.role] = (stats.roleBreakdown[emp.position || emp.role] || 0) + 1;
            stats.exitReasons[emp.exitReason || 'Other'] = (stats.exitReasons[emp.exitReason || 'Other'] || 0) + 1;

            // Tenure calculation
            if (emp.joiningDate && emp.exitDate) {
                const tenureYears = (new Date(emp.exitDate) - new Date(emp.joiningDate)) / (1000 * 60 * 60 * 24 * 365);
                if (tenureYears < 1) stats.tenureBreakdown['< 1 year']++;
                else if (tenureYears < 3) stats.tenureBreakdown['1-3 years']++;
                else if (tenureYears < 5) stats.tenureBreakdown['3-5 years']++;
                else stats.tenureBreakdown['5+ years']++;
            }
        });

        return stats;
    },

    /**
     * Predicts attrition risk for active employees
     */
    predictRisk: async () => {
        const activeEmployees = await Employee.find({ status: 'active' });

        // Fetch performance, attendance, and salary data for context
        const performances = await EmployeePerformance.find();
        const attendance = await Attendance.find();

        const predictions = activeEmployees.map(emp => {
            let riskScore = 0;
            const factors = [];

            // 1. Performance Trend (Score dropping or very high performer with no promotion)
            const empPerf = performances.filter(p => p.name === emp.name).sort((a, b) => b.month.localeCompare(a.month));
            if (empPerf.length >= 2) {
                if (empPerf[0].kpiScore < empPerf[1].kpiScore - 10) {
                    riskScore += 25;
                    factors.push('Performance drop detected');
                }
            }
            if (emp.performanceScore > 90 && (!emp.promotionHistory || emp.promotionHistory.length === 0)) {
                riskScore += 20;
                factors.push('High performer, no recent promotion');
            }

            // 2. Attendance Pattern (Increasing late logins or absences)
            const empAttendance = attendance.filter(a => a.user.toString() === emp._id.toString());
            const lateCount = empAttendance.filter(a => a.status === 'late').length;
            if (lateCount > 5) {
                riskScore += 15;
                factors.push('Frequent late logins');
            }

            // 3. Salary vs Performance
            if (emp.performanceScore > 85 && emp.currentSalary < 50000) { // Arbitrary market threshold for demo
                riskScore += 15;
                factors.push('Salary below market average for performance');
            }

            // 4. Tenure (The "2-year itch")
            const tenureYears = (new Date() - new Date(emp.joiningDate)) / (1000 * 60 * 60 * 24 * 365);
            if (tenureYears > 1.8 && tenureYears < 2.5) {
                riskScore += 10;
                factors.push('Critical tenure period (approx. 2 years)');
            }

            return {
                id: emp._id,
                name: emp.name,
                role: emp.position || emp.role,
                department: emp.department,
                riskLevel: riskScore > 60 ? 'High' : (riskScore > 30 ? 'Medium' : 'Low'),
                riskPercentage: Math.min(riskScore + 10, 95), // Baseline 10%
                topReasons: factors.slice(0, 3)
            };
        });

        return predictions.sort((a, b) => b.riskPercentage - a.riskPercentage);
    }
};

module.exports = attritionService;
