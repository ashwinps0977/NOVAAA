/**
 * Utility to calculate CTC based on base salary and structure components
 */
const calculateEmployeeCTC = (baseSalary, structure = null) => {
    // Basic is typically 50% of the gross salary if not specified
    const basic = baseSalary * 0.5;

    // Default components percentages (as used in generatePayroll)
    const hraPercent = structure?.components?.hra || 40; // 40% of Basic
    const hra = basic * (hraPercent / 100);

    // Other allowances (Monthly)
    const specialAllowance = structure?.components?.specialAllowance || 0;
    const conveyanceAllowance = structure?.components?.conveyanceAllowance || 0;
    const medicalAllowance = structure?.components?.medicalAllowance || 1250;
    const internetAllowance = structure?.components?.internetAllowance || 500;
    const mealAllowance = structure?.components?.mealAllowance || 2200;
    const shiftAllowance = structure?.components?.shiftAllowance || 0;
    const projectAllowance = structure?.components?.projectAllowance || 0;
    const performancePay = structure?.components?.performancePay || 0;

    const monthlyGross = basic + hra + specialAllowance + conveyanceAllowance +
        medicalAllowance + internetAllowance + mealAllowance +
        shiftAllowance + projectAllowance + performancePay;

    // Employer Contributions (Monthly)
    const employerPF = basic * (structure?.employerContributions?.pf || 0.12);
    const employerInsurance = structure?.employerContributions?.insurance || 500;
    const gratuity = basic * (structure?.employerContributions?.gratuity || 0.0481);
    const esi = (basic < 21000) ? (basic * (structure?.employerContributions?.esi || 0.0325)) : 0;

    const monthlyCTC = monthlyGross + employerPF + employerInsurance + gratuity + esi;
    const annualCTC = monthlyCTC * 12;

    return {
        monthlyGross,
        monthlyCTC,
        annualCTC,
        breakup: {
            basic,
            hra,
            allowances: monthlyGross - basic - hra,
            employerContributions: employerPF + employerInsurance + gratuity + esi
        }
    };
};

module.exports = {
    calculateEmployeeCTC
};
