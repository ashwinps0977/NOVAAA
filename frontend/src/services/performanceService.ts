import { API_BASE_URL } from '../config';
const API_URL = `${API_BASE_URL}/analytics`;

export interface PerformanceStats {
    avgKpi: number;
    onTimeDelivery: number;
    goalCompletion: number;
    attritionRisk: 'Low' | 'Medium' | 'High';
    attritionRiskCount: number;
    topPerformers: Array<{
        name: string;
        score: number;
        role: string;
    }>;
    allEmployees: Array<{
        name: string;
        score: number;
        role: string;
        completion: number;
        onTime: number;
        risk: string;
        month: string;
        dept: string;
    }>;
    trends: Array<{
        month: string;
        score: number;
    }>;
    projects: Array<{
        name: string;
        contribution: number;
        productivity: number;
        time: number;
        output: number;
        budget: number;
    }>;
    attendance: {
        rate: number;
        lateIndex: 'Low' | 'Medium' | 'High';
        lateCount: number;
    };
    learning: {
        completionRate: number;
        certsEarned: number;
        totalSkills: number;
    };
}

export const performanceService = {
    getOverview: async (): Promise<PerformanceStats> => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/performance-overview`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch performance overview');
        }

        const data = await response.json();
        return data.stats;
    },

    exportReport: async (): Promise<void> => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/performance/export`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to export performance report');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Performance_Report_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
    },

    downloadPDF: async (stats: PerformanceStats): Promise<void> => {
        // We'll import jspdf dynamically to avoid bundle bloat if not used
        const { jsPDF } = await import('jspdf');
        const doc = new jsPDF();

        doc.setFontSize(22);
        doc.text('Strategic Performance Audit', 20, 20);

        doc.setFontSize(12);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);

        doc.setFontSize(16);
        doc.text('Core Metrics', 20, 45);
        doc.setFontSize(10);
        doc.text(`Average KPI: ${stats.avgKpi}`, 20, 55);
        doc.text(`On-Time Delivery: ${stats.onTimeDelivery}%`, 20, 62);
        doc.text(`Goal Completion: ${stats.goalCompletion}%`, 20, 69);
        doc.text(`Attrition Risk Status: ${stats.attritionRisk}`, 20, 76);

        doc.setFontSize(16);
        doc.text('Top Performers', 20, 90);
        stats.topPerformers.slice(0, 5).forEach((p, i) => {
            doc.text(`${i + 1}. ${p.name} (${p.role}) - Score: ${p.score}%`, 20, 100 + (i * 7));
        });

        doc.save(`Performance_Audit_HR_${new Date().toISOString().split('T')[0]}.pdf`);
    }
};
