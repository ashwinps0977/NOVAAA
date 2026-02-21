import { useState, useEffect } from 'react';
import {
    Users,
    Target,
    Clock,
    BarChart3,
    TrendingUp,
    TrendingDown,
    Award,
    AlertTriangle,
    MessageSquare,
    CheckCircle2,
    Search,
    ChevronRight,
    Filter,
    Download,
    Calendar,
    Brain,
    Zap,
    MoreVertical,
    Star,
    ShieldCheck,
    UserPlus,
    Briefcase,
    FileText,
    Activity,
    HeartPulse
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
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    AreaChart,
    Area
} from 'recharts';
import { performanceService } from '../../../services/performanceService';
import type { PerformanceStats } from '../../../services/performanceService';

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];

const HRPerformanceSection = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
    const [performanceStats, setPerformanceStats] = useState<PerformanceStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await performanceService.getOverview();
                setPerformanceStats(data);
                if (data.allEmployees && data.allEmployees.length > 0 && !selectedEmployee) {
                    setSelectedEmployee(data.allEmployees[0]);
                }
            } catch (err) {
                console.error('Error fetching performance stats:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    // Mock Data
    const employees = [
        { id: '1', name: 'John Doe', role: 'Senior Developer', dept: 'Engineering', score: 92, rating: 'A', trend: 'up', risk: 'low', skills: ['React', 'Node.js', 'System Design'], completion: 98, onTime: 95 },
        { id: '2', name: 'Jane Smith', role: 'UI/UX Designer', dept: 'Design', score: 88, rating: 'B+', trend: 'up', risk: 'low', skills: ['Figma', 'Prototyping', 'User Research'], completion: 92, onTime: 90 },
        { id: '3', name: 'Michael Brown', role: 'Project Manager', dept: 'Product', score: 75, rating: 'B', trend: 'stable', risk: 'medium', skills: ['Agile', 'Planning', 'Stakeholder Mgt'], completion: 85, onTime: 82 },
        { id: '4', name: 'Sarah Wilson', role: 'Sales Lead', dept: 'Sales', score: 95, rating: 'A+', trend: 'up', risk: 'low', skills: ['Negotiation', 'Lead Gen', 'CRM'], completion: 100, onTime: 98 },
        { id: '5', name: 'David Lee', role: 'QA Engineer', dept: 'Engineering', score: 65, rating: 'C', trend: 'down', risk: 'high', skills: ['Selenium', 'Testing', 'Automation'], completion: 70, onTime: 65 },
    ];

    // Data handling: Use real data from backend if available, otherwise fallback to mock
    const displayEmployees = performanceStats?.allEmployees || employees;

    const projectStats = [
        { name: 'Project Alpha', contribution: 85, productivity: 92, time: 120, output: 110, budget: 100 },
        { name: 'Project Beta', contribution: 70, productivity: 85, time: 90, output: 88, budget: 95 },
        { name: 'Project Gamma', contribution: 45, productivity: 65, time: 150, output: 70, budget: 110 },
    ];

    const performanceHistory = [
        { month: 'Jan', score: 82 },
        { month: 'Feb', score: 85 },
        { month: 'Mar', score: 84 },
        { month: 'Apr', score: 88 },
        { month: 'May', score: 91 },
        { month: 'Jun', score: 90 },
    ];

    const skillGrowth = [
        { subject: 'Technical', A: 120, fullMark: 150 },
        { subject: 'Communication', A: 98, fullMark: 150 },
        { subject: 'Leadership', A: 86, fullMark: 150 },
        { subject: 'Teamwork', A: 99, fullMark: 150 },
        { subject: 'Planning', A: 85, fullMark: 150 },
    ];

    const feedbackData = [
        { name: 'Positive', value: 75 },
        { name: 'Neutral', value: 15 },
        { name: 'Negative', value: 10 },
    ];

    const tabs = [
        { id: 'overview', label: 'Overview', icon: BarChart3 },
        { id: 'individual', label: 'Individual Profile', icon: Users },
        { id: 'projects', label: 'Project Performance', icon: Briefcase },
        { id: 'attendance', label: 'Attendance & Discipline', icon: Clock },
        { id: 'skills', label: 'Skills & Learning', icon: Brain },
        { id: 'feedback', label: '360° Feedback', icon: MessageSquare },
        { id: 'productivity', label: 'Productivity Analytics', icon: Activity },
        { id: 'risk', label: 'AI Risk & Prediction', icon: HeartPulse },
        { id: 'comparison', label: 'Comparison & Ranking', icon: ArrowLeftRight },
        { id: 'reports', label: 'Reports', icon: FileText },
        { id: 'ai-insights', label: 'AI Insights', icon: Zap },
    ];

    // Render Helpers
    const renderCard = (title: string, value: any, subtext: string, trend?: 'up' | 'down' | 'stable', Icon?: any) => (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${Icon ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-50 text-gray-600'}`}>
                    {Icon ? <Icon size={24} /> : <Activity size={24} />}
                </div>
                {trend && (
                    <div className={`flex items-center text-xs font-bold ${trend === 'up' ? 'text-emerald-500' : trend === 'down' ? 'text-rose-500' : 'text-amber-500'}`}>
                        {trend === 'up' ? <TrendingUp size={16} className="mr-1" /> : trend === 'down' ? <TrendingDown size={16} className="mr-1" /> : <Clock size={16} className="mr-1" />}
                        {trend === 'up' ? '+12.5%' : trend === 'down' ? '-4.2%' : 'Stable'}
                    </div>
                )}
            </div>
            <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
            <p className="text-xs text-gray-400 mt-1">{subtext}</p>
        </div>
    );

    const renderOverview = () => {
        if (loading) {
            return (
                <div className="h-[400px] flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            );
        }

        if (!performanceStats) return null;

        return (
            <div className="space-y-6 animate-in fade-in duration-500">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {renderCard('Avg KPI Score', performanceStats.avgKpi.toString(), 'Current period average', 'up', Target)}
                    {renderCard('On-Time Delivery', `${performanceStats.onTimeDelivery}%`, 'Achievement rate', 'up', Clock)}
                    {renderCard('Goal Completion', `${performanceStats.goalCompletion}%`, 'Target accomplishment', 'stable', CheckCircle2)}
                    {renderCard('Attrition Risk', performanceStats.attritionRisk, `${performanceStats.attritionRiskCount} high-risk detected`, performanceStats.attritionRisk === 'Low' ? 'down' : 'up', HeartPulse)}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                            <TrendingUp className="mr-2 text-indigo-600" /> Organizational Performance Trend
                        </h3>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={performanceStats.trends}>
                                    <defs>
                                        <linearGradient id="performanceGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} />
                                    <YAxis axisLine={false} tickLine={false} />
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                    <Area type="monotone" dataKey="score" stroke="#4F46E5" strokeWidth={3} fillOpacity={1} fill="url(#performanceGradient)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                            <Star className="mr-2 text-amber-500" /> Top Performers (Global)
                        </h3>
                        <div className="space-y-4">
                            {performanceStats.topPerformers.map((emp, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                                            {emp.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 text-sm">{emp.name}</h4>
                                            <p className="text-xs text-gray-500">{emp.role}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`px-2 py-1 rounded-lg text-xs font-bold ${emp.score >= 90 ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                                            {emp.score}%
                                        </span>
                                        <div className="flex space-x-1 mt-1">
                                            {[1, 2, 3, 4, 5].map(s => (
                                                <div key={s} className={`w-1 h-1 rounded-full ${s <= (emp.score / 20) ? 'bg-indigo-500' : 'bg-gray-300'}`}></div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderIndividual = () => (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search employee by name, role or department..."
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="flex items-center justify-center space-x-2 px-6 py-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium">
                    <Filter className="w-4 h-4" />
                    <span>Filters</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-4 h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                    {displayEmployees
                        .filter(e => e.name.toLowerCase().includes(searchTerm.toLowerCase()))
                        .map((emp: any) => (
                            <div
                                key={emp.id || emp.name}
                                onClick={() => setSelectedEmployee(emp)}
                                className={`p-4 rounded-2xl border transition-all cursor-pointer ${selectedEmployee?.name === emp.name
                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-600/20'
                                    : 'bg-white text-gray-900 border-gray-100 hover:border-indigo-200'
                                    }`}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center space-x-3">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${selectedEmployee?.name === emp.name ? 'bg-white/20' : 'bg-indigo-50 text-indigo-600'}`}>
                                            {emp.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="font-bold">{emp.name}</h4>
                                            <p className={`text-xs ${selectedEmployee?.name === emp.name ? 'text-indigo-100' : 'text-gray-500'}`}>{emp.role}</p>
                                        </div>
                                    </div>
                                    <span className={`text-lg font-black ${selectedEmployee?.name === emp.name ? 'text-white' : 'text-indigo-600'}`}>
                                        {emp.rating || (emp.score >= 90 ? 'A+' : emp.score >= 80 ? 'A' : 'B')}
                                    </span>
                                </div>
                            </div>
                        ))}
                </div>

                <div className="lg:col-span-2">
                    {selectedEmployee ? (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 animate-in slide-in-from-right duration-500">
                            <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
                                <div className="flex items-center space-x-6">
                                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center text-3xl font-bold shadow-lg">
                                        {selectedEmployee.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-black text-gray-900 tracking-tight">{selectedEmployee.name}</h2>
                                        <p className="text-gray-500 font-medium">{selectedEmployee.role} {selectedEmployee.dept ? `• ${selectedEmployee.dept}` : ''}</p>
                                        <div className="flex items-center mt-2 space-x-4">
                                            <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                                                <TrendingUp size={12} className="mr-1" /> Performance Improving
                                            </span>
                                            <span className={`flex items-center text-xs font-bold px-2 py-1 rounded-lg ${selectedEmployee.risk === 'low' ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'}`}>
                                                Retention: {selectedEmployee.risk?.toUpperCase()} RISK
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-center bg-gray-50 p-4 rounded-2xl border border-gray-100 min-w-[120px]">
                                    <p className="text-xs text-gray-400 font-black uppercase tracking-wider mb-1">Overall Score</p>
                                    <p className="text-4xl font-black text-indigo-600">{selectedEmployee.score}</p>
                                    <div className="flex justify-center mt-1">
                                        {[1, 2, 3, 4, 5].map(s => (
                                            <Star key={s} size={12} className={s <= (selectedEmployee.score / 20) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'} />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <h4 className="font-bold text-gray-900 border-b pb-2">Key Performance Indicators</h4>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="font-medium text-gray-600">Task Completion Rate</span>
                                                <span className="font-bold text-indigo-600">{selectedEmployee.completion}%</span>
                                            </div>
                                            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${selectedEmployee.completion}%` }}></div>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="font-medium text-gray-600">On-Time Delivery %</span>
                                                <span className="font-bold text-emerald-600">{selectedEmployee.onTime}%</span>
                                            </div>
                                            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${selectedEmployee.onTime}%` }}></div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-indigo-50 p-4 rounded-2xl">
                                        <h5 className="text-sm font-bold text-indigo-900 mb-2 flex items-center">
                                            <Award size={16} className="mr-2" /> Recent Achievements
                                        </h5>
                                        <ul className="text-xs text-indigo-700 space-y-2">
                                            <li className="flex items-center"><ChevronRight size={12} className="mr-1" /> Successfully delivered Project Alpha on-time</li>
                                            <li className="flex items-center"><ChevronRight size={12} className="mr-1" /> Achieved highest customer satisfaction rating</li>
                                        </ul>
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-6 rounded-2xl">
                                    <h4 className="font-bold text-gray-900 mb-4">Skill Proficiency</h4>
                                    <div className="h-[200px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={skillGrowth}>
                                                <PolarGrid stroke="#E5E7EB" />
                                                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#6B7280' }} />
                                                <Radar name="Skills" dataKey="A" stroke="#4F46E5" fill="#4F46E5" fillOpacity={0.6} />
                                            </RadarChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mt-4">
                                        {(selectedEmployee.skills || []).map((s: string) => (
                                            <span key={s} className="px-3 py-1 bg-white border border-gray-100 rounded-lg text-xs font-bold text-gray-600 shadow-sm">
                                                {s}
                                            </span>
                                        ))}
                                        {(!selectedEmployee.skills || selectedEmployee.skills.length === 0) && (
                                            <span className="text-xs text-gray-400 italic">No skills recorded in performance profile</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 flex justify-end space-x-4">
                                <button className="px-6 py-2 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors flex items-center">
                                    <FileText className="w-4 h-4 mr-2" /> Export PDF
                                </button>
                                <button className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20">
                                    Update Goal
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 p-12">
                            <Users size={64} className="mb-4 opacity-20" />
                            <p className="text-lg font-bold">Select an employee</p>
                            <p className="text-sm">Click on an employee from the list to view their detailed performance profile</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    const renderProjects = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Productivity per Project</h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={projectStats}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip />
                                <Bar dataKey="productivity" fill="#10B981" radius={[6, 6, 0, 0]} name="Productivity %" />
                                <Bar dataKey="contribution" fill="#4F46E5" radius={[6, 6, 0, 0]} name="Contribution %" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-rose-50 border border-rose-100 p-6 rounded-2xl">
                    <h3 className="text-lg font-black text-rose-900 mb-4 flex items-center">
                        <AlertTriangle className="mr-2" /> Bottleneck Detection
                    </h3>
                    <div className="space-y-4">
                        <div className="bg-white p-4 rounded-xl border border-rose-200">
                            <div className="flex justify-between items-start mb-2">
                                <span className="font-bold text-gray-900">Project Gamma - Delays</span>
                                <span className="px-2 py-1 bg-rose-100 text-rose-700 rounded-lg text-[10px] font-black uppercase">Critical</span>
                            </div>
                            <p className="text-xs text-gray-500 mb-4">Resource utilization at 112%. 3 high-priority tasks pending for more than 48 hours.</p>
                            <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">DL</div>
                                <p className="text-xs font-medium text-gray-600">Suggested Action: Assign David Lee to assist Sarah Wilson</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-tighter">Project Name</th>
                            <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-tighter">Avg. Task Completion</th>
                            <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-tighter">Resource Utilization</th>
                            <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-tighter">Success Rate</th>
                            <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-tighter">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {projectStats.map((p, i) => (
                            <tr key={i} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-bold text-gray-900">{p.name}</td>
                                <td className="px-6 py-4 font-medium text-gray-500">{p.time}h total</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm font-bold text-gray-700">{p.productivity}%</span>
                                        <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                            <div className={`h-full rounded-full ${p.productivity > 90 ? 'bg-indigo-600' : 'bg-amber-500'}`} style={{ width: `${p.productivity}%` }}></div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-lg text-xs font-black ${p.output > 100 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                        {p.output > 100 ? 'EXCELLENT' : 'STABLE'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <button className="p-2 text-gray-400 hover:text-indigo-600 transition-colors">
                                        <MoreVertical size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderAttendance = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {renderCard('Attendence %', '94.2%', 'Monthly avg', 'up', Calendar)}
                {renderCard('Late Login Index', 'Low', '2.1 incidents / week', 'down', Clock)}
                {renderCard('Absenteeism Index', '0.4', 'Healthy range (<1.0)', 'stable', Activity)}
                {renderCard('WFH Ratio', '40%', 'Hybrid workplace', 'stable', UserPlus)}
            </div>

            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h3 className="text-xl font-black text-gray-900">Attendance Correlation</h3>
                        <p className="text-sm text-gray-500">Linking attendance patterns to performance scores</p>
                    </div>
                    <button className="p-3 bg-gray-50 rounded-xl text-gray-400 hover:text-indigo-600 transition-colors">
                        <Download size={20} />
                    </button>
                </div>

                <div className="space-y-8">
                    {displayEmployees.slice(0, 3).map((emp: any) => (
                        <div key={emp.id || emp.name} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                            <div className="md:col-span-3 flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600 text-xs">
                                    {emp.name.charAt(0)}
                                </div>
                                <span className="font-bold text-gray-900 text-sm">{emp.name}</span>
                            </div>
                            <div className="md:col-span-7 h-2 bg-gray-100 rounded-full overflow-hidden flex">
                                <div className="h-full bg-emerald-500" style={{ width: '85%' }} title="Present"></div>
                                <div className="h-full bg-amber-400" style={{ width: '10%' }} title="Late"></div>
                                <div className="h-full bg-rose-500" style={{ width: '5%' }} title="Absent"></div>
                            </div>
                            <div className="md:col-span-2 text-right">
                                <span className="text-sm font-black text-indigo-600">{emp.score} KPI</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-start space-x-3">
                    <AlertTriangle className="text-amber-500 flex-shrink-0" />
                    <p className="text-xs text-amber-800 font-medium">
                        <strong>Insight:</strong> 15% drop in performance scores for employees with {'>'}3 late logins per month. Suggest reviewing commute benefits or shift flexibility.
                    </p>
                </div>
            </div>
        </div>
    );

    const renderSkills = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                        <TrendingUp className="mr-2 text-indigo-600" /> Organizational Skill Growth
                    </h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={performanceHistory}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip />
                                <Area type="monotone" dataKey="score" stroke="#10B981" fill="#10B981" fillOpacity={0.1} strokeWidth={3} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Learning Metrics</h3>
                    <div className="space-y-6">
                        <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="font-bold text-indigo-900 text-sm">Training Completion %</h4>
                                <span className="text-lg font-black text-indigo-600">88%</span>
                            </div>
                            <div className="h-2 bg-indigo-200 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-600 rounded-full" style={{ width: '88%' }}></div>
                            </div>
                            <p className="text-[10px] text-indigo-500 mt-2 font-bold uppercase">12 employees pending Cybersecurity training</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm text-center">
                                <Award className="mx-auto text-amber-500 mb-2" size={24} />
                                <p className="text-xs text-gray-400 font-black uppercase mb-1">Certs Earned</p>
                                <p className="text-2xl font-black text-gray-900">42</p>
                            </div>
                            <div className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm text-center">
                                <Brain className="mx-auto text-blue-500 mb-2" size={24} />
                                <p className="text-xs text-gray-400 font-black uppercase mb-1">Avg Upskill Time</p>
                                <p className="text-2xl font-black text-gray-900">14d</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Skill Stagnation Alert</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {displayEmployees.filter((e: any) => e.score < 70).slice(0, 3).map((emp: any) => (
                        <div key={emp.id || emp.name} className="p-4 bg-rose-50 border border-rose-100 rounded-xl">
                            <div className="flex items-center space-x-3 mb-3">
                                <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                                    {emp.name.charAt(0)}
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 text-sm">{emp.name}</h4>
                                    <p className="text-[10px] text-rose-600 font-black uppercase">Low score detected</p>
                                </div>
                            </div>
                            <button className="w-full py-2 bg-white border border-rose-200 rounded-lg text-xs font-bold text-rose-700 hover:bg-rose-100 transition-colors">
                                Assign Training
                            </button>
                        </div>
                    ))}
                    {displayEmployees.filter((e: any) => e.score < 70).length === 0 && (
                        <p className="text-gray-400 text-sm italic col-span-3">No skill stagnation alerts detected at this time.</p>
                    )}
                </div>
            </div>
        </div>
    );

    const renderFeedback = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm lg:col-span-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Sentiment Analysis</h3>
                    <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={feedbackData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {feedbackData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                        <h4 className="text-xs font-black text-blue-900 uppercase mb-2 flex items-center">
                            <Brain size={14} className="mr-1" /> NLP Insight
                        </h4>
                        <p className="text-xs text-blue-700 font-medium italic">
                            "75% of feedback is positive. Primary strengths identified: Team Player, Fast Learner. Areas for improvement: Stakeholder Communication."
                        </p>
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center">
                        <MessageSquare className="mr-2 text-indigo-600" /> Recent 360° Feedback
                    </h3>
                    {[1, 2].map(i => (
                        <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:border-indigo-200 transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold">JD</div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-sm">Feedback for John Doe</h4>
                                        <p className="text-xs text-gray-500">From: Peer (Jane Smith) • 2 days ago</p>
                                    </div>
                                </div>
                                <div className="flex space-x-1">
                                    {[1, 2, 3, 4, 5].map(s => (
                                        <Star key={s} size={14} className={s <= 4 ? 'text-amber-400 fill-amber-400' : 'text-gray-300'} />
                                    ))}
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 italic mb-4">
                                "John is an exceptional team player. He helped me debug the payment gateway issue over the weekend. His technical knowledge is deep, though he sometimes misses status update meetings."
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-[10px] font-black uppercase">👍 Team Player</span>
                                <span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-[10px] font-black uppercase">👍 Problem Solver</span>
                                <span className="px-2 py-1 bg-rose-50 text-rose-700 rounded-lg text-[10px] font-black uppercase">👎 Communication</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderProductivity = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {renderCard('Tasks Completed', '1,240', 'Org-wide this month', 'up', CheckCircle2)}
                {renderCard('Avg Resolution Time', '4.2h', '-15% from last month', 'up', Clock)}
                {renderCard('Output per Hour', '8.5 units', 'Exceeding target 7.0', 'up', Activity)}
                {renderCard('Resource Efficiency', '92%', 'Optimal utilization', 'stable', Zap)}
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                    <Activity className="mr-2 text-indigo-600" /> Productivity Pulse
                </h3>
                <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={performanceHistory}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                            <XAxis dataKey="month" axisLine={false} tickLine={false} />
                            <YAxis axisLine={false} tickLine={false} />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="score" stroke="#4F46E5" strokeWidth={3} dot={{ r: 6, fill: '#4F46E5', strokeWidth: 2, stroke: '#fff' }} name="Output Variance" />
                            <Line
                                type="monotone"
                                data={performanceHistory.map((h, i) => ({ month: h.month, target: [80, 82, 85, 82, 88, 90][i] }))}
                                dataKey="target"
                                stroke="#10B981"
                                strokeDasharray="5 5"
                                name="Target Trend"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );

    const renderRisk = () => (
        <div className="space-y-6 animate-in slide-in-from-bottom duration-700">
            <div className="bg-gradient-to-br from-indigo-700 to-indigo-900 p-8 rounded-3xl text-white shadow-xl shadow-indigo-900/30">
                <div className="flex items-center space-x-4 mb-8">
                    <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-md">
                        <HeartPulse size={36} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black tracking-tight">AI Retention Risk Analytics</h2>
                        <p className="text-indigo-100/80">Predictive modeling for attrition and burnout</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white/10 backdrop-blur-xl p-6 rounded-2xl border border-white/20">
                        <p className="text-xs font-black uppercase tracking-widest text-indigo-200 mb-2">Churn Probability</p>
                        <p className="text-5xl font-black">12.4%</p>
                        <p className="text-xs mt-4 text-emerald-300 font-bold flex items-center">
                            <TrendingDown size={14} className="mr-1" /> -2.1% lower than market avg
                        </p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-xl p-6 rounded-2xl border border-white/20">
                        <p className="text-xs font-black uppercase tracking-widest text-indigo-200 mb-2">Burnout Index</p>
                        <p className="text-5xl font-black text-amber-400">Low</p>
                        <p className="text-xs mt-4 text-indigo-100 font-medium">85% employees report healthy work-life balance</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-xl p-6 rounded-2xl border border-white/20">
                        <p className="text-xs font-black uppercase tracking-widest text-indigo-200 mb-2">Job Satisfaction</p>
                        <p className="text-5xl font-black text-emerald-400">8.4<span className="text-lg opacity-50">/10</span></p>
                        <div className="h-1.5 w-full bg-white/20 rounded-full mt-4 overflow-hidden">
                            <div className="h-full bg-emerald-400" style={{ width: '84%' }}></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                        <AlertTriangle className="mr-2 text-rose-500" /> High Attrition Risk Profiles
                    </h3>
                    <div className="space-y-4">
                        {displayEmployees.filter((e: any) => e.risk === 'high').map((emp: any) => (
                            <div key={emp.id || emp.name} className="p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 rounded-full bg-white text-rose-600 border border-rose-200 flex items-center justify-center font-bold">
                                        {emp.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-sm">{emp.name}</h4>
                                        <p className="text-xs text-gray-500">Reason: Detected attrition risk markers</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="px-3 py-1 bg-rose-600 text-white rounded-lg text-[10px] font-black">ACTION NEEDED</span>
                                </div>
                            </div>
                        ))}
                        {displayEmployees.filter((e: any) => e.risk === 'high').length === 0 && (
                            <p className="text-gray-400 text-sm italic">No high attrition risk profiles detected.</p>
                        )}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                        <Brain className="mr-2 text-indigo-600" /> AI Suggestions
                    </h3>
                    <div className="space-y-4">
                        <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl relative overflow-hidden">
                            <Zap className="absolute -right-2 -bottom-2 text-indigo-100 w-24 h-24 rotate-12" />
                            <p className="text-xs font-black text-indigo-900 uppercase mb-2">Internal Transfer Suggestion</p>
                            <p className="text-sm text-indigo-700 font-medium relative z-10">
                                Move David Lee to the "Security Operations" team. His skills align 92% with the new role, reducing churn risk by estimated 45%.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderComparison = () => (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-wrap gap-4 items-center mb-8">
                <div className="flex-grow min-w-[200px]">
                    <label className="block text-xs font-black text-gray-400 uppercase mb-2">Compare By</label>
                    <select className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500">
                        <option>Employee vs Employee</option>
                        <option>Team vs Team</option>
                        <option>Dept vs Dept</option>
                    </select>
                </div>
                <div className="flex-grow min-w-[200px]">
                    <label className="block text-xs font-black text-gray-400 uppercase mb-2">Entity A</label>
                    <select className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500">
                        <option>John Doe</option>
                        <option>Engineering Team</option>
                    </select>
                </div>
                <div className="flex-grow min-w-[200px]">
                    <label className="block text-xs font-black text-gray-400 uppercase mb-2">Entity B</label>
                    <select className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500">
                        <option>Sarah Wilson</option>
                        <option>Sales Team</option>
                    </select>
                </div>
                <button className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-black text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 mt-6">
                    Compare Entities
                </button>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-xl font-black text-gray-900 mb-10 text-center">Head-to-Head Comparison</h3>
                <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skillGrowth.map((s) => ({
                            ...s,
                            B: Math.random() * 50 + 80
                        }))}>
                            <PolarGrid />
                            <PolarAngleAxis dataKey="subject" />
                            <PolarRadiusAxis angle={30} domain={[0, 150]} />
                            <Radar name="John Doe" dataKey="A" stroke="#4F46E5" fill="#4F46E5" fillOpacity={0.5} />
                            <Radar name="Sarah Wilson" dataKey="B" stroke="#10B981" fill="#10B981" fillOpacity={0.5} />
                            <Legend />
                            <Tooltip />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );

    const renderReports = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between group hover:border-indigo-500 transition-all cursor-pointer">
                    <div className="w-12 h-12 bg-indigo-50 rounded-xl text-indigo-600 flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        <FileText size={24} />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 mb-1">Monthly Review PDF</h4>
                        <p className="text-xs text-gray-500 mb-4">Complete performance audit for Feb 2026</p>
                        <button className="flex items-center text-indigo-600 text-xs font-black uppercase tracking-widest">
                            Download Report <ChevronRight size={14} className="ml-1" />
                        </button>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between group hover:border-indigo-500 transition-all cursor-pointer">
                    <div className="w-12 h-12 bg-emerald-50 rounded-xl text-emerald-600 flex items-center justify-center mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                        <BarChart3 size={24} />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 mb-1">KPI Scorecard CSV</h4>
                        <p className="text-xs text-gray-500 mb-4">Export raw KPI scores and achievement data</p>
                        <button className="flex items-center text-emerald-600 text-xs font-black uppercase tracking-widest">
                            Export Data <ChevronRight size={14} className="ml-1" />
                        </button>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between group hover:border-indigo-500 transition-all cursor-pointer">
                    <div className="w-12 h-12 bg-amber-50 rounded-xl text-amber-600 flex items-center justify-center mb-6 group-hover:bg-amber-600 group-hover:text-white transition-all">
                        <ShieldCheck size={24} />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 mb-1">Compliance & Audit Notes</h4>
                        <p className="text-xs text-gray-500 mb-4">Security and policy adherence documentation</p>
                        <button className="flex items-center text-amber-600 text-xs font-black uppercase tracking-widest">
                            View Documents <ChevronRight size={14} className="ml-1" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-gray-50 border-2 border-dashed border-gray-200 p-12 rounded-2xl text-center">
                <UserPlus className="mx-auto text-gray-300 mb-4" size={48} />
                <h3 className="text-lg font-bold text-gray-600">Auto-generated Appraisal Packs</h3>
                <p className="text-sm text-gray-400 max-w-md mx-auto mt-2">
                    System automatically generates comprehensive review documents for managers based on available KPIs, task completion, and achievement tags.
                </p>
                <button className="mt-6 px-8 py-3 bg-white border border-gray-200 rounded-xl font-bold text-sm text-gray-700 hover:bg-gray-50 transition-all shadow-sm">
                    Generate Appraisal History
                </button>
            </div>
        </div>
    );

    const renderAIInsights = () => (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 rounded-3xl text-white">
                <div className="flex items-center space-x-3 mb-6">
                    <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                        <Zap size={32} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black tracking-tight">AI Strategic Insights</h2>
                        <p className="text-blue-100 opacity-80">Root cause analysis and predictive suggestions</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white/10 backdrop-blur-xl p-6 rounded-2xl border border-white/20">
                        <h4 className="text-lg font-bold mb-4 flex items-center">
                            <Brain size={18} className="mr-2" /> "Why is John's performance low?"
                        </h4>
                        <div className="space-y-4">
                            <div className="flex items-start space-x-2">
                                <div className="w-1 h-1 rounded-full bg-white mt-2"></div>
                                <p className="text-sm">Technical bottlenecks in <strong>Project Gamma</strong> caused a 15% delay in deliverables.</p>
                            </div>
                            <div className="flex items-start space-x-2">
                                <div className="w-1 h-1 rounded-full bg-white mt-2"></div>
                                <p className="text-sm">Burnout risk detected: High workload (Avg 12h/day) for 3 consecutive weeks.</p>
                            </div>
                            <div className="p-3 bg-emerald-500/20 rounded-xl border border-emerald-500/30 text-emerald-200 text-xs font-bold mt-4">
                                💡 AI Suggestion: Clear upcoming schedule and provide 2 days R&R.
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-xl p-6 rounded-2xl border border-white/20">
                        <h4 className="text-lg font-bold mb-4 flex items-center">
                            <Star size={18} className="mr-2 text-amber-300" /> "Who should be promoted?"
                        </h4>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-white/10 rounded-xl">
                                <div>
                                    <p className="font-bold">Sarah Wilson</p>
                                    <p className="text-xs opacity-70">Readiness Score: 95%</p>
                                </div>
                                <ChevronRight size={18} />
                            </div>
                            <div className="flex justify-between items-center p-3 bg-white/10 rounded-xl opacity-60">
                                <div>
                                    <p className="font-bold">Jane Smith</p>
                                    <p className="text-xs opacity-70">Readiness Score: 85%</p>
                                </div>
                                <ChevronRight size={18} />
                            </div>
                            <p className="text-[10px] text-blue-200 font-bold uppercase tracking-widest mt-4">Based on LEADERSHIP tags & CONSISTENT A+ ratings</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <button className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm text-left group hover:border-indigo-500 transition-all">
                    <h4 className="font-bold text-gray-900 mb-2 group-hover:text-indigo-600">Which team is underperforming?</h4>
                    <p className="text-sm text-gray-500">Analyze team-wide metrics to identify productivity gaps.</p>
                </button>
                <button className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm text-left group hover:border-indigo-500 transition-all">
                    <h4 className="font-bold text-gray-900 mb-2 group-hover:text-indigo-600">Who needs training?</h4>
                    <p className="text-sm text-gray-500">Skill-gap analysis based on upcoming project requirements.</p>
                </button>
            </div>
        </div>
    );

    return (
        <div className="p-4 md:p-8 bg-gray-50/50 min-h-screen">
            {/* Header */}
            <div className="mb-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tighter flex items-center">
                        Strategic <span className="text-indigo-600 ml-2">Performance</span>
                    </h1>
                    <p className="text-gray-500 font-medium mt-1">AI-powered workforce excellence portal</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex bg-white p-1.5 rounded-xl border border-gray-100 shadow-sm">
                        <button className="px-4 py-1.5 rounded-lg text-xs font-black bg-indigo-600 text-white shadow-lg shadow-indigo-600/20">QUARTERLY</button>
                        <button className="px-4 py-1.5 rounded-lg text-xs font-black text-gray-500 hover:bg-gray-50">ANNUAL</button>
                    </div>
                    <button className="p-2.5 bg-white rounded-xl border border-gray-100 text-gray-500 hover:text-indigo-600 transition-all shadow-sm">
                        <Download size={20} />
                    </button>
                </div>
            </div>

            <div className="flex flex-col xl:flex-row gap-8">
                {/* Navigation */}
                <div className="xl:w-64 flex-shrink-0">
                    <nav className="flex xl:flex-col gap-2 overflow-x-auto pb-4 xl:pb-0 scrollbar-hide">
                        {tabs.map(tab => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all flex-shrink-0 ${isActive
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                                        : 'bg-white text-gray-500 border border-gray-100 hover:border-indigo-200 hover:text-indigo-600'
                                        }`}
                                >
                                    <Icon size={18} />
                                    <span className="text-sm font-black tracking-tight">{tab.label}</span>
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Content */}
                <div className="flex-grow min-h-[600px]">
                    {activeTab === 'overview' && renderOverview()}
                    {activeTab === 'individual' && renderIndividual()}
                    {activeTab === 'projects' && renderProjects()}
                    {activeTab === 'attendance' && renderAttendance()}
                    {activeTab === 'skills' && renderSkills()}
                    {activeTab === 'feedback' && renderFeedback()}
                    {activeTab === 'productivity' && renderProductivity()}
                    {activeTab === 'risk' && renderRisk()}
                    {activeTab === 'comparison' && renderComparison()}
                    {activeTab === 'reports' && renderReports()}
                    {activeTab === 'ai-insights' && renderAIInsights()}
                </div>
            </div>
        </div>
    );
};

// Internal utility component for the arrow icon used in Comparison
const ArrowLeftRight = ({ size, className }: { size: number, className?: string }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M20 17h-16M20 17l-4-4M20 17l-4 4M4 7h16M4 7l4-4M4 7l4 4" />
    </svg>
);

export default HRPerformanceSection;
