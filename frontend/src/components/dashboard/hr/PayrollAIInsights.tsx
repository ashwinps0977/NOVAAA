import React, { useState, useEffect } from 'react';
import {
    Brain,
    TrendingUp,
    AlertTriangle,
    Search,
    MessageSquare,
    BarChart3,

} from 'lucide-react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    BarElement,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const PayrollAIInsights = () => {
    const [loading, setLoading] = useState(true);
    const [insights, setInsights] = useState<any>(null);
    const [query, setQuery] = useState('');
    const [aiResponse, setAiResponse] = useState('');
    const [queryLoading, setQueryLoading] = useState(false);

    useEffect(() => {
        fetchInsights();
    }, []);

    const fetchInsights = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5000/api/ai/insights', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setInsights(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAskAI = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setQueryLoading(true);
        setAiResponse('');

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5000/api/ai/query', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ query })
            });
            if (res.ok) {
                const data = await res.json();
                setAiResponse(data.answer);
            }
        } catch (err) {
            console.error(err);
            setAiResponse('Failed to get an answer from AI.');
        } finally {
            setQueryLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading AI Insights...</div>;

    const forecastChartData = {
        labels: insights?.forecast?.map((f: any) => f.month) || [],
        datasets: [
            {
                label: "Projected Payroll Cost",
                data: insights?.forecast?.map((f: any) => f.amount) || [],
                borderColor: "rgb(99, 102, 241)",
                backgroundColor: "rgba(99, 102, 241, 0.5)",
                tension: 0.4,
            }
        ]
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center space-x-3 text-indigo-600">
                <Brain size={28} />
                <h2 className="text-2xl font-bold">AI Payroll Intelligence</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. Attrition Risk */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                            <AlertTriangle size={20} className="text-orange-500" />
                            Attrition Risk Detection
                        </h3>
                        <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">AI Analysis</span>
                    </div>
                    <div className="space-y-3">
                        {insights?.attritionRisks?.length === 0 ? (
                            <p className="text-green-600 text-sm">No high-risk employees detected.</p>
                        ) : (
                            insights?.attritionRisks?.map((risk: any, idx: number) => (
                                <div key={idx} className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-100">
                                    <div>
                                        <p className="font-semibold text-gray-800">{risk.name}</p>
                                        <p className="text-xs text-red-600">{risk.level} Risk • {risk.factors.join(', ')}</p>
                                    </div>
                                    <span className="text-red-700 font-bold">{risk.score}%</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* 2. Ask AI */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                            <MessageSquare size={20} className="text-blue-500" />
                            Ask AI Assistant
                        </h3>
                    </div>
                    <div className="flex-1 bg-gray-50 rounded-lg p-4 mb-4 overflow-y-auto max-h-40 min-h-[100px]">
                        {aiResponse ? (
                            <p className="text-gray-700 text-sm leading-relaxed typing-effect">{aiResponse}</p>
                        ) : (
                            <p className="text-gray-400 text-sm italic">Example: "Why is salary low?", "Who needs a hike?", "Forecast budget"</p>
                        )}
                    </div>
                    <form onSubmit={handleAskAI} className="relative">
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Ask about payroll trends..."
                            className="w-full pl-4 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                        <button
                            type="submit"
                            disabled={queryLoading}
                            className="absolute right-2 top-2 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {queryLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Search size={20} />}
                        </button>
                    </form>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 3. Budget Forecast Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <TrendingUp size={20} className="text-purple-500" />
                        Payroll Cost Forecast (Next 12 Months)
                    </h3>
                    <div className="h-64 w-full">
                        <Line options={{ maintainAspectRatio: false }} data={forecastChartData} />
                    </div>
                </div>

                {/* 4. Salary Fairness / Anomaly */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 overflow-y-auto h-80">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <BarChart3 size={20} className="text-teal-500" />
                        Salary Fairness & Anomalies
                    </h3>
                    <div className="space-y-4">
                        {insights && Object.entries(insights.fairness).map(([role, data]: [string, any]) => (
                            <div key={role} className="border-b border-gray-100 pb-3 last:border-0">
                                <div className="flex justify-between mb-2">
                                    <span className="font-medium text-gray-700">{role}</span>
                                    <span className="text-xs text-gray-500">{data.headcount} Emps</span>
                                </div>
                                {data.outliers.length > 0 ? (
                                    <div className="space-y-1">
                                        {data.outliers.map((o: any, i: number) => (
                                            <div key={i} className="flex justify-between text-xs bg-yellow-50 p-2 rounded text-yellow-800">
                                                <span>{o.name}: ${o.salary}</span>
                                                <span className="font-bold">{o.issue}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-green-600">All salaries within fair range.</p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PayrollAIInsights;
