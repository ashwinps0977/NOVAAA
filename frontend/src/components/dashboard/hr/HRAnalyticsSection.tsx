import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../../config';
import {
    Users,
    UserPlus,
    UserMinus,
    DollarSign,
    GraduationCap,
    Target,
    Calendar,
    ShieldCheck,
    Brain,
    Filter,
    Download,
    ChevronDown,
    TrendingUp,
    AlertCircle,
    MapPin,
    Briefcase,
    Clock,
    Zap
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    LineChart,
    Line,
    ScatterChart,
    Scatter,
    ZAxis
} from 'recharts';

type Section = 'workforce' | 'hiring' | 'attrition' | 'payroll' | 'training' | 'performance' | 'attendance' | 'compliance' | 'predictive' | 'reports';

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const HRAnalyticsSection = () => {
    const [activeSection, setActiveSection] = useState<Section>('workforce');
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        dateRange: 'month',
        department: 'all',
        location: 'all'
    });
    const [reportFilters, setReportFilters] = useState({
        department: '',
        position: '',
        minPerformance: ''
    });
    const [attritionData, setAttritionData] = useState<any>(null);
    const [predictions, setPredictions] = useState<any[]>([]);
    const [aiQuery, setAiQuery] = useState('');
    const [aiResponse, setAiResponse] = useState('');
    const [aiLoading, setAiLoading] = useState(false);

    useEffect(() => {
        if (activeSection !== 'reports') {
            fetchAnalyticsData();
        } else {
            // Initial fetch or when report section is opened (optional, maybe wait for button click)
            handleGenerateReport();
        }
    }, [activeSection, filters.dateRange]);

    const fetchAnalyticsData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const endpoint = activeSection === 'predictive' ? 'ai-insights' : activeSection;
            const res = await fetch(`${API_BASE_URL}/analytics/${endpoint}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await res.json();
            if (result.success) {
                setData(result.stats || result.suggestions);

                // Fetch extra attrition data if needed
                if (activeSection === 'attrition') {
                    fetchAttritionExtended();
                }
            }
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAttritionExtended = async () => {
        try {
            const token = localStorage.getItem('token');
            const [predRes, insightRes] = await Promise.all([
                fetch(`${API_BASE_URL}/analytics/attrition/prediction`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${API_BASE_URL}/analytics/attrition/insights`, { headers: { 'Authorization': `Bearer ${token}` } })
            ]);

            const predData = await predRes.json();
            const insightData = await insightRes.json();

            if (predData.success) setPredictions(predData.predictions);
            if (insightData.success) setAttritionData(insightData);
        } catch (error) {
            console.error('Error fetching extended attrition data:', error);
        }
    };

    const handleAttritionAiQuery = async () => {
        if (!aiQuery.trim()) return;
        setAiLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/analytics/attrition/insights?query=${encodeURIComponent(aiQuery)}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await res.json();
            if (result.success) {
                setAiResponse(result.answer);
            }
        } catch (error) {
            console.error('AI Attrition Query error:', error);
        } finally {
            setAiLoading(false);
        }
    };

    const handleGenerateReport = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const queryParams = new URLSearchParams(reportFilters as any).toString();
            const res = await fetch(`${API_BASE_URL}/analytics/custom-report?${queryParams}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await res.json();
            if (result.success) {
                setData(result.report);
            }
        } catch (error) {
            console.error('Error generating report:', error);
        } finally {
            setLoading(false);
        }
    };

    const exportToCSV = () => {
        if (!data) return;

        let csvContent = "";
        if (Array.isArray(data)) {
            // It's a report (array of employees)
            const headers = Object.keys(data[0]).join(",");
            const rows = data.map(item => Object.values(item).join(","));
            csvContent = [headers, ...rows].join("\n");
        } else {
            // It's a stats object - flatten it for simple export
            csvContent = "Metric,Value\n";
            Object.entries(data).forEach(([key, val]) => {
                if (typeof val === 'object') {
                    Object.entries(val as object).forEach(([subKey, subVal]) => {
                        csvContent += `${key}_${subKey},${subVal}\n`;
                    });
                } else {
                    csvContent += `${key},${val}\n`;
                }
            });
        }

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `hr_analytics_${activeSection}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const renderCard = (title: string, value: string | number, change: string, trend: 'up' | 'down', icon: any) => {
        const Icon = icon;
        return (
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                        <Icon size={24} />
                    </div>
                    <div className={`flex items-center text-xs font-bold ${trend === 'up' ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {trend === 'up' ? <TrendingUp size={14} className="mr-1" /> : <ChevronDown size={14} className="mr-1" />}
                        {change}
                    </div>
                </div>
                <h3 className="text-gray-500 text-sm font-medium mb-1">{title}</h3>
                <p className="text-3xl font-black text-gray-900">{value}</p>
            </div>
        );
    };

    const renderWorkforce = () => (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {renderCard('Total Workforce', data?.totalEmployees || 0, '+12%', 'up', Users)}
                {renderCard('Female Representation', `${data?.femalePercentage || 0}%`, '+2%', 'up', MapPin)}
                {renderCard('Avg Tenure', `${data?.avgTenureYears || 0} yrs`, '-0.1', 'down', Clock)}
                {renderCard('Active Vacancies', data?.activeVacancies || 0, '+5', 'up', Briefcase)}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-black text-gray-900 mb-6">Department Distribution</h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={Object.entries(data?.departmentWise || {}).map(([name, value]) => ({ name, value }))}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 500 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 500 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="value" fill="#4F46E5" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-black text-gray-900 mb-6">Gender Diversity</h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={Object.entries(data?.genderRatio || {}).map(([name, value]) => ({ name, value }))}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {Object.entries(data?.genderRatio || {}).map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" align="center" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderHiring = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {renderCard('Avg Time to Hire', `${data?.timeToHire || 0} Days`, '-4d', 'up', UserPlus)}
                {renderCard('Offer Acceptance', `${Math.round(data?.offerAcceptanceRate || 0)}%`, '+5%', 'up', Zap)}
                {renderCard('Cost per Hire', `$${(data?.costPerHire || 0).toLocaleString()}`, '-$200', 'up', DollarSign)}
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-lg font-black text-gray-900 mb-6">Source Performance</h3>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart layout="vertical" data={Object.entries(data?.sourceDistribution || {}).map(([name, value]) => ({ name, value }))}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F3F4F6" />
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={100} />
                            <Tooltip />
                            <Bar dataKey="value" fill="#10B981" radius={[0, 6, 6, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );

    const renderAttrition = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-gray-500 text-sm font-medium mb-1">Overall Attrition %</p>
                    <p className="text-3xl font-black text-rose-600">{Math.round(data?.overallRate || 0)}%</p>
                    <div className="mt-2 flex items-center text-rose-500 text-[10px] font-bold">
                        <TrendingUp size={12} className="mr-1" /> +1.2% vs last month
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-gray-500 text-sm font-medium mb-1">High Risk Count</p>
                    <p className="text-3xl font-black text-amber-600">{predictions.filter(p => p.riskLevel === 'High').length}</p>
                    <div className="mt-2 flex items-center text-amber-500 text-[10px] font-bold uppercase">
                        AI Predicted Alerts
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-gray-500 text-sm font-medium mb-1">Avg Tenure</p>
                    <p className="text-3xl font-black text-indigo-600">{data?.avgTenureYears || 0} yrs</p>
                    <div className="mt-2 text-gray-400 text-[10px] font-bold">In-house historical avg</div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-gray-500 text-sm font-medium mb-1">Top Churn Dept</p>
                    <p className="text-3xl font-black text-gray-900">{data?.topChurnDept?.name || 'None'}</p>
                    <div className="mt-2 text-rose-500 text-[10px] font-bold">{data?.overallRate > 0 ? `${Math.round(data?.overallRate)}% Rate` : '0% Rate'}</div>
                </div>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-black text-gray-900 mb-6">Attrition Trend (Last 6 Months)</h3>
                    <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={Object.entries(data?.monthlyTrend || { 'Jan': 2, 'Feb': 3, 'Mar': 2, 'Apr': 4, 'May': 3, 'Jun': 5 }).map(([name, value]) => ({ name, value }))}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip />
                                <Line type="monotone" dataKey="value" stroke="#EF4444" strokeWidth={3} dot={{ r: 4, fill: '#EF4444' }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-black text-gray-900 mb-6">Main Exit Reasons (AI Derived)</h3>
                    <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={Object.entries(attritionData?.topReasons || { 'Salary': 40, 'Balance': 30, 'Career': 20, 'Other': 10 }).map(([name, value]) => ({ name, value }))}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    label
                                >
                                    {Object.entries(attritionData?.topReasons || {}).map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-black text-gray-900 mb-6">Tenure vs Attrition (Histogram)</h3>
                    <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={Object.entries(data?.tenureBreakdown || {}).map(([name, value]) => ({ name, value }))}>
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="value" fill="#10B981" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-black text-gray-900 mb-6">Salary Growth vs Attrition (Scatter)</h3>
                    <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" dataKey="growth" name="Salary Growth" unit="%" />
                                <YAxis type="number" dataKey="risk" name="Attrition Risk" unit="%" />
                                <ZAxis type="number" dataKey="tenure" range={[60, 400]} name="Tenure" />
                                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                                <Scatter name="Employees" data={[
                                    { growth: 5, risk: 80, tenure: 1 },
                                    { growth: 15, risk: 30, tenure: 3 },
                                    { growth: 10, risk: 50, tenure: 2 },
                                    { growth: 2, risk: 90, tenure: 1.5 },
                                    { growth: 20, risk: 10, tenure: 5 },
                                ]} fill="#8B5CF6" />
                            </ScatterChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* AI Attrition Prediction Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-indigo-50/30">
                    <h3 className="text-lg font-black text-gray-900 flex items-center">
                        <ShieldCheck className="mr-2 text-indigo-600" /> AI Attrition Risk List
                    </h3>
                    <span className="px-3 py-1 bg-white rounded-full text-[10px] font-black text-indigo-600 border border-indigo-100 uppercase tracking-tighter">
                        Updated Live
                    </span>
                </div>
                <table className="w-full text-left">
                    <thead className="bg-gray-50/50">
                        <tr>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase">Employee</th>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase">Risk Level</th>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase">Risk %</th>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase">Top Contributing Factors</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {predictions.slice(0, 10).map((p, i) => (
                            <tr key={i} className="hover:bg-gray-50/80 transition-all group">
                                <td className="px-6 py-4">
                                    <p className="font-bold text-gray-900">{p.name}</p>
                                    <p className="text-[10px] text-gray-500 uppercase">{p.role} • {p.department}</p>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-tighter ${p.riskLevel === 'High' ? 'bg-rose-100 text-rose-700' :
                                        p.riskLevel === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                                        }`}>
                                        {p.riskLevel}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className="flex-grow bg-gray-100 h-1.5 rounded-full overflow-hidden w-16">
                                            <div
                                                className={`h-full rounded-full ${p.riskLevel === 'High' ? 'bg-rose-500' : 'bg-amber-500'}`}
                                                style={{ width: `${p.riskPercentage}%` }}
                                            />
                                        </div>
                                        <span className="text-xs font-black text-gray-700">{p.riskPercentage}%</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-wrap gap-1">
                                        {p.topReasons?.map((r: string, idx: number) => (
                                            <span key={idx} className="bg-gray-100 px-2 py-0.5 rounded text-[9px] font-medium text-gray-600 border border-gray-200">
                                                {r}
                                            </span>
                                        ))}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* NLP/RAG AI Insights Chat */}
            <div className="bg-indigo-900 rounded-3xl p-8 text-white shadow-2xl shadow-indigo-900/40 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                    <Brain size={120} />
                </div>
                <div className="relative z-10 max-w-2xl">
                    <h3 className="text-2xl font-black mb-2 flex items-center">
                        <Zap className="mr-3 text-amber-400" /> Attrition Intelligence (NLP)
                    </h3>
                    <p className="text-indigo-200 text-sm mb-6 leading-relaxed">
                        Query the exit interview database and AI models to understand why people are leaving.
                        Ask about specific departments or general trends.
                    </p>

                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={aiQuery}
                            onChange={(e) => setAiQuery(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleAttritionAiQuery()}
                            placeholder="e.g. why is attrition high in sales?"
                            className="flex-grow bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder:text-white/30"
                        />
                        <button
                            onClick={handleAttritionAiQuery}
                            disabled={aiLoading}
                            className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-black text-sm transition-all"
                        >
                            {aiLoading ? 'Thinking...' : 'Analyze'}
                        </button>
                    </div>

                    {aiResponse && (
                        <div className="mt-6 p-5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 animate-in fade-in slide-in-from-top-2 duration-500">
                            <p className="text-sm leading-relaxed text-indigo-50 italic">
                                "{aiResponse}"
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    const renderPayroll = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {renderCard('Total Budget', `$${(data?.totalPayrollCost || 0).toLocaleString()}`, '+8%', 'up', DollarSign)}
                {renderCard('Avg Salary', `$${Math.round((data?.totalPayrollCost || 0) / (data?.totalEmployees || 45)).toLocaleString()}`, '+2.5%', 'up', TrendingUp)}
                {renderCard('Overtime Cost', `$${(data?.overtimePayout || 0).toLocaleString()}`, '-15%', 'up', Clock)}
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-lg font-black text-gray-900 mb-6">Monthly Payroll Trend</h3>
                <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={Object.entries(data?.monthlyTrend || {}).map(([name, value]) => ({ name, value }))}>
                            <defs>
                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} />
                            <YAxis axisLine={false} tickLine={false} />
                            <Tooltip />
                            <Area type="monotone" dataKey="value" stroke="#4F46E5" fillOpacity={1} fill="url(#colorValue)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );

    const renderTraining = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderCard('Training ROI', '18.4%', '+2.1%', 'up', GraduationCap)}
                {renderCard('Training Hours', `${data?.totalTrainingHours || 0}h`, '+140h', 'up', Clock)}
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-lg font-black text-gray-900 mb-6">Least Completed Trainings</h3>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={Object.entries(data?.leastCompletedTrainings || {}).map(([name, value]) => ({ name, value }))}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} />
                            <YAxis axisLine={false} tickLine={false} />
                            <Tooltip />
                            <Bar dataKey="value" fill="#F59E0B" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );

    const renderPerformance = () => (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-lg font-black text-gray-900 mb-6">Departmental Performance Index</h3>
                <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={Object.entries(data?.deptPerformance || {}).map(([name, value]) => ({ name, value }))}>
                            <PolarGrid />
                            <PolarAngleAxis dataKey="name" />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} />
                            <Radar name="Performance" dataKey="value" stroke="#4F46E5" fill="#4F46E5" fillOpacity={0.6} />
                            <Tooltip />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h4 className="font-black text-emerald-600 mb-4 flex items-center"><Target className="mr-2" /> Top Performers</h4>
                    <div className="space-y-3">
                        {data?.topPerformers?.map((p: any, i: number) => (
                            <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                                <span className="font-bold text-gray-900">{p.name}</span>
                                <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-black">{p.score}%</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h4 className="font-black text-rose-600 mb-4 flex items-center"><AlertCircle className="mr-2" /> Needs Coaching</h4>
                    <div className="space-y-3">
                        {data?.lowPerformers?.map((p: any, i: number) => (
                            <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                                <span className="font-bold text-gray-900">{p.name}</span>
                                <span className="px-2 py-1 bg-rose-100 text-rose-700 rounded-lg text-xs font-black">{p.score}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderAttendance = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {renderCard('Attendance Rate', `${Math.round(data?.attendanceRate || 0)}%`, '-2%', 'down', Calendar)}
                {renderCard('Absenteeism', data?.absenteeism || 0, '+1', 'up', UserMinus)}
                {renderCard('Late Frequency', data?.lateLoginFrequency || 0, '-8%', 'up', Clock)}
            </div>
            <div className="bg-amber-50 border border-amber-100 p-6 rounded-2xl">
                <h3 className="text-lg font-black text-amber-900 mb-4 flex items-center">
                    <Zap className="mr-2" /> Burnout Discovery (AI Alert)
                </h3>
                <div className="space-y-4">
                    {data?.burnoutRisk?.map((risk: any, i: number) => (
                        <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-amber-100 flex justify-between items-center">
                            <div>
                                <p className="font-black text-gray-900">{risk.name}</p>
                                <p className="text-sm text-gray-500">{risk.reason}</p>
                            </div>
                            <span className="px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-xs font-black uppercase">
                                {risk.risk} Risk
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderCompliance = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {renderCard('Violations', data?.policyViolations || 0, '0', 'up', ShieldCheck)}
                {renderCard('Pending Docs', data?.pendingDocuments || 0, '-3', 'up', Filter)}
                {renderCard('Training Comp', `${data?.trainingCompliance || 0}%`, '+5%', 'up', GraduationCap)}
                {renderCard('Audit Ready', `${data?.auditReadiness || 0}/100`, '+2', 'up', Target)}
            </div>
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                <h3 className="text-xl font-black text-gray-900 mb-6">Compliance Status by Department</h3>
                <div className="space-y-6">
                    {['Engineering', 'Sales', 'HR', 'Finance'].map(dept => (
                        <div key={dept} className="space-y-2">
                            <div className="flex justify-between text-sm font-bold">
                                <span>{dept}</span>
                                <span>{dept === 'Engineering' ? '98%' : dept === 'Sales' ? '82%' : '100%'}</span>
                            </div>
                            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full ${dept === 'Sales' ? 'bg-amber-500' : 'bg-indigo-600'}`}
                                    style={{ width: dept === 'Engineering' ? '98%' : dept === 'Sales' ? '82%' : '100%' }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderPredictiveAI = () => (
        <div className="space-y-6">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 rounded-3xl text-white">
                <div className="flex items-center space-x-3 mb-6">
                    <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                        <Brain size={32} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black">AI Predictive Insights</h2>
                        <p className="text-indigo-100 opacity-80">Machine Learning generated forecasts and alerts</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data?.map?.((insight: any, i: number) => (
                        <div key={i} className="bg-white/10 backdrop-blur-xl p-6 rounded-2xl border border-white/20 hover:bg-white/20 transition-all cursor-pointer">
                            <div className="flex justify-between items-start mb-4">
                                <span className="px-2 py-1 bg-indigo-500 rounded-lg text-[10px] font-black uppercase tracking-wider">
                                    {insight.type}
                                </span>
                                <Zap size={18} className="text-amber-400" />
                            </div>
                            <h4 className="text-lg font-black mb-2">{insight.target}</h4>
                            <p className="text-sm text-indigo-50 opacity-90 mb-4">{insight.insight}</p>
                            <div className="p-3 bg-emerald-500/20 rounded-xl border border-emerald-500/30 text-emerald-200 text-xs font-bold">
                                💡 Suggestion: {insight.action}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderReports = () => (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-wrap gap-4 items-end">
                <div className="flex-grow min-w-[200px]">
                    <label className="block text-xs font-black text-gray-400 uppercase mb-2">Department</label>
                    <select
                        value={reportFilters.department}
                        onChange={(e) => setReportFilters({ ...reportFilters, department: e.target.value })}
                        className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="">All Departments</option>
                        <option value="Engineering">Engineering</option>
                        <option value="Sales">Sales</option>
                        <option value="HR">HR</option>
                        <option value="Finance">Finance</option>
                    </select>
                </div>
                <div className="flex-grow min-w-[200px]">
                    <label className="block text-xs font-black text-gray-400 uppercase mb-2">Position</label>
                    <select
                        value={reportFilters.position}
                        onChange={(e) => setReportFilters({ ...reportFilters, position: e.target.value })}
                        className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="">All Roles</option>
                        <option value="Developer">Developer</option>
                        <option value="Manager">Manager</option>
                        <option value="Senior Developer">Senior Developer</option>
                        <option value="Product Manager">Product Manager</option>
                    </select>
                </div>
                <div className="flex-grow min-w-[200px]">
                    <label className="block text-xs font-black text-gray-400 uppercase mb-2">Min Performance (%)</label>
                    <input
                        type="number"
                        value={reportFilters.minPerformance}
                        onChange={(e) => setReportFilters({ ...reportFilters, minPerformance: e.target.value })}
                        className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500"
                        placeholder="e.g. 70"
                    />
                </div>
                <button
                    onClick={handleGenerateReport}
                    className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-black text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20"
                >
                    Generate Report
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase">Employee</th>
                            <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase">Department</th>
                            <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase">Position</th>
                            <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase">Performance</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {data?.length > 0 ? data.map((emp: any, i: number) => (
                            <tr key={i} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-bold text-gray-900">{emp.name}</td>
                                <td className="px-6 py-4 text-gray-500 text-sm">{emp.department}</td>
                                <td className="px-6 py-4 text-gray-500 text-sm">{emp.position}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-lg text-xs font-black ${emp.performanceScore >= 80 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                        }`}>
                                        {emp.performanceScore}%
                                    </span>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-gray-400 font-bold uppercase text-xs">
                                    No records found for the given filters
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const navItems = [
        { id: 'workforce', label: 'Workforce', icon: Users },
        { id: 'hiring', label: 'Hiring', icon: UserPlus },
        { id: 'attrition', label: 'Attrition', icon: UserMinus },
        { id: 'payroll', label: 'Payroll', icon: DollarSign },
        { id: 'training', label: 'Training', icon: GraduationCap },
        { id: 'performance', label: 'Performance', icon: Target },
        { id: 'attendance', label: 'Attendance', icon: Calendar },
        { id: 'compliance', label: 'Compliance', icon: ShieldCheck },
        { id: 'predictive', label: 'AI Predict', icon: Brain },
        { id: 'reports', label: 'Reports', icon: Filter },
    ];

    return (
        <div className="p-4 md:p-8 bg-gray-50/50 min-h-screen">
            {/* Header */}
            <div className="mb-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tighter flex items-center">
                        Strategic <span className="text-indigo-600 ml-2">Analytics</span>
                    </h1>
                    <p className="text-gray-500 font-medium mt-1">Data-driven insights for workforce management</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex bg-white p-1.5 rounded-xl border border-gray-100 shadow-sm">
                        {['month', 'quarter', 'year'].map(range => (
                            <button
                                key={range}
                                onClick={() => setFilters({ ...filters, dateRange: range })}
                                className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${filters.dateRange === range ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:bg-gray-50'
                                    }`}
                            >
                                {range.toUpperCase()}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={exportToCSV}
                        className="p-2.5 bg-white rounded-xl border border-gray-100 text-gray-500 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm"
                    >
                        <Download size={20} />
                    </button>
                </div>
            </div>

            <div className="flex flex-col xl:flex-row gap-8">
                {/* Sidebar Navigation */}
                <div className="xl:w-64 flex-shrink-0">
                    <nav className="flex xl:flex-col gap-2 overflow-x-auto pb-4 xl:pb-0 scrollbar-hide">
                        {navItems.map(item => {
                            const Icon = item.icon;
                            const isActive = activeSection === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveSection(item.id as Section)}
                                    className={`flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all flex-shrink-0 ${isActive
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                                        : 'bg-white text-gray-500 border border-gray-100 hover:border-indigo-200 hover:text-indigo-600'
                                        }`}
                                >
                                    <Icon size={18} />
                                    <span className="text-sm font-black tracking-tight">{item.label}</span>
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Main Content Area */}
                <div className="flex-grow">
                    {loading ? (
                        <div className="h-96 flex items-center justify-center">
                            <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                        </div>
                    ) : (
                        <div>
                            {activeSection === 'workforce' && renderWorkforce()}
                            {activeSection === 'hiring' && renderHiring()}
                            {activeSection === 'attrition' && renderAttrition()}
                            {activeSection === 'payroll' && renderPayroll()}
                            {activeSection === 'training' && renderTraining()}
                            {activeSection === 'performance' && renderPerformance()}
                            {activeSection === 'attendance' && renderAttendance()}
                            {activeSection === 'compliance' && renderCompliance()}
                            {activeSection === 'predictive' && renderPredictiveAI()}
                            {activeSection === 'reports' && renderReports()}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HRAnalyticsSection;
