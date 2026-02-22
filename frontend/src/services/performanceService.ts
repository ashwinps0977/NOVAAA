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
    }>;
    trends: Array<{
        month: string;
        score: number;
    }>;
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
    }
};
