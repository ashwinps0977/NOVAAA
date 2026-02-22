import { useState, useEffect } from 'react';
import {
  Users,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Target,
  DollarSign,
  Brain,
  BarChart3,
  Shield,
  Award,
  GraduationCap,
  FileText,
  Download,
  Settings,
  Bell,
  LogOut,
  ChevronRight,
  Home,
  Heart,
  Zap,
  Eye,
  Clock,
  Star,
  Send,
  UserCheck,
  Building,
  Lightbulb,
  MessageSquare,
  ThumbsUp
} from 'lucide-react';
import DashboardLayout from '../components/dashboard/DashboardLayout';

const AdminDashboard = () => {
  const [userData, setUserData] = useState<any>(null);
  const [activeSection, setActiveSection] = useState('overview');
  const [aiAssistantMessage, setAiAssistantMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<any[]>([
    { id: 1, sender: 'ai', message: "Hello, I'm your AI Strategic Advisor. I can help analyze workforce trends, predict risks, and optimize organizational strategy. How can I assist you today?" }
  ]);

  const [executiveStats] = useState({
    totalWorkforce: 156,
    headcountGrowth: '+18%',
    attritionRate: '5.2%',
    productivityIndex: 86,
    workforceUtilization: 78,
    costPerHire: '$4,850',
    hiringPipeline: 42,
    retentionSuccess: 92,
    trainingROI: 184,
    complianceScore: 94
  });

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setUserData(user);
    }
  }, []);

  // Mock data for various sections
  const departmentPerformance = [
    { department: 'Engineering', employees: 65, performance: 4.8, attritionRisk: 'Low', productivity: 92, costPerEmp: '$125K' },
    { department: 'Sales', employees: 28, performance: 3.9, attritionRisk: 'High', productivity: 78, costPerEmp: '$98K' },
    { department: 'Design', employees: 15, performance: 4.2, attritionRisk: 'Medium', productivity: 85, costPerEmp: '$110K' },
    { department: 'Marketing', employees: 18, performance: 4.5, attritionRisk: 'Low', productivity: 88, costPerEmp: '$95K' },
    { department: 'HR & Ops', employees: 22, performance: 4.7, attritionRisk: 'Low', productivity: 91, costPerEmp: '$85K' },
    { department: 'Finance', employees: 8, performance: 4.9, attritionRisk: 'Low', productivity: 94, costPerEmp: '$120K' },
  ];

  const attritionRiskData = [
    { id: 1, department: 'Sales', riskScore: 82, employeesAtRisk: 8, estimatedCost: '$320K', primaryDriver: 'Compensation' },
    { id: 2, department: 'Design', riskScore: 65, employeesAtRisk: 3, estimatedCost: '$120K', primaryDriver: 'Career Growth' },
    { id: 3, department: 'Engineering', riskScore: 42, employeesAtRisk: 5, estimatedCost: '$250K', primaryDriver: 'Burnout Risk' },
    { id: 4, department: 'Customer Support', riskScore: 58, employeesAtRisk: 4, estimatedCost: '$95K', primaryDriver: 'Workload' },
  ];

  const hiringPipeline = [
    { stage: 'Approved Roles', count: 24, conversion: '100%', avgDays: 0 },
    { stage: 'Sourcing', count: 18, conversion: '75%', avgDays: 7 },
    { stage: 'Interviewing', count: 12, conversion: '67%', avgDays: 14 },
    { stage: 'Offered', count: 8, conversion: '67%', avgDays: 21 },
    { stage: 'Accepted', count: 6, conversion: '75%', avgDays: 28 },
    { stage: 'Onboarded', count: 6, conversion: '100%', avgDays: 35 },
  ];

  const topPerformers = [
    { id: 1, name: 'Sarah Johnson', department: 'Engineering', performance: 4.9, impact: 'High', tenure: '3.2y' },
    { id: 2, name: 'Michael Chen', department: 'Sales', performance: 4.8, impact: 'Very High', tenure: '2.8y' },
    { id: 3, name: 'Emma Davis', department: 'Design', performance: 4.7, impact: 'High', tenure: '1.5y' },
    { id: 4, name: 'David Wilson', department: 'Engineering', performance: 4.7, impact: 'Medium', tenure: '4.1y' },
  ];

  const financialMetrics = [
    { category: 'Salaries', amount: '$12.5M', trend: '+12%', impact: 'High' },
    { category: 'Benefits', amount: '$2.8M', trend: '+8%', impact: 'Medium' },
    { category: 'Training', amount: '$850K', trend: '+25%', impact: 'High' },
    { category: 'Recruitment', amount: '$420K', trend: '+15%', impact: 'Medium' },
    { category: 'Attrition Cost', amount: '$950K', trend: '-5%', impact: 'High' },
  ];

  const skillGapAnalysis = [
    { skill: 'AI/ML Engineering', current: 8, needed: 15, gap: 7, priority: 'Critical' },
    { skill: 'Data Science', current: 12, needed: 20, gap: 8, priority: 'High' },
    { skill: 'Cloud Architecture', current: 6, needed: 12, gap: 6, priority: 'High' },
    { skill: 'Product Management', current: 5, needed: 8, gap: 3, priority: 'Medium' },
    { skill: 'UX Research', current: 4, needed: 6, gap: 2, priority: 'Medium' },
  ];

  const complianceStatus = [
    { area: 'Labor Regulations', status: 'Compliant', score: 98, lastAudit: '30 days ago' },
    { area: 'Data Privacy', status: 'Compliant', score: 96, lastAudit: '45 days ago' },
    { area: 'Safety Standards', status: 'Needs Review', score: 82, lastAudit: '90 days ago' },
    { area: 'Diversity Reporting', status: 'Compliant', score: 94, lastAudit: '60 days ago' },
    { area: 'Training Compliance', status: 'At Risk', score: 76, lastAudit: '120 days ago' },
  ];

  const sentimentMetrics = [
    { metric: 'Overall Satisfaction', score: 84, trend: '+5%', category: 'Positive' },
    { metric: 'Work-Life Balance', score: 78, trend: '+3%', category: 'Neutral' },
    { metric: 'Growth Opportunities', score: 72, trend: '+8%', category: 'Improving' },
    { metric: 'Leadership Trust', score: 88, trend: '+6%', category: 'Positive' },
    { metric: 'Team Collaboration', score: 85, trend: '+4%', category: 'Positive' },
  ];

  const aiSuggestions = [
    "Show me attrition risk by department",
    "Predict workforce needs for next quarter",
    "Analyze cost per employee trends",
    "Generate executive summary for board",
    "Identify skill gaps in engineering",
    "Compare hiring efficiency across departments"
  ];

  const strategicAlerts = [
    { id: 1, title: 'High Attrition Risk in Sales', severity: 'High', department: 'Sales', time: '2 hours ago', action: 'Review retention strategy' },
    { id: 2, title: 'Hiring Bottleneck in Engineering', severity: 'Medium', department: 'Engineering', time: '1 day ago', action: 'Optimize interview process' },
    { id: 3, title: 'Compliance Review Needed', severity: 'Medium', department: 'All', time: '3 days ago', action: 'Schedule safety audit' },
    { id: 4, title: 'Training ROI Exceeds Target', severity: 'Low', department: 'HR', time: '1 week ago', action: 'Consider scaling program' },
  ];

  const sendAiMessage = () => {
    if (!aiAssistantMessage.trim()) return;

    const newMessage = { id: chatHistory.length + 1, sender: 'user', message: aiAssistantMessage };
    setChatHistory([...chatHistory, newMessage]);

    // Simulate AI response based on query
    setTimeout(() => {
      let aiResponse = '';
      if (aiAssistantMessage.toLowerCase().includes('attrition')) {
        aiResponse = `Analysis: Sales department shows 82% attrition risk affecting 8 employees. Primary driver: Compensation gaps. Estimated impact: $320K. Recommendation: Review compensation bands, implement retention bonuses, and enhance career path visibility.`;
      } else if (aiAssistantMessage.toLowerCase().includes('workforce') && aiAssistantMessage.toLowerCase().includes('need')) {
        aiResponse = 'Based on growth projections and current utilization rates, I recommend hiring 12-15 technical roles (8-10 engineers, 2-3 data scientists) and 4-6 non-technical roles in Q1 2025. Critical gaps: AI/ML engineering (7 gap), Data Science (8 gap).';
      } else if (aiAssistantMessage.toLowerCase().includes('cost')) {
        aiResponse = `Current workforce costs: $12.5M annually with 12% YoY increase. Cost per employee: $80K average. Highest cost departments: Engineering ($125K/emp), Finance ($120K/emp). Recommendations: Optimize hiring mix, evaluate contractor ratios, implement productivity-linked bonuses.`;
      } else if (aiAssistantMessage.toLowerCase().includes('summary') || aiAssistantMessage.toLowerCase().includes('board')) {
        aiResponse = `Executive Summary: Workforce stable with 156 employees (+18% growth). Productivity at 86/100. Key risks: Sales attrition (82% risk), Engineering skill gaps. Opportunities: Training ROI 184%, sentiment improving (+5%). Strategic focus: Retention programs, technical hiring, compliance review.`;
      } else {
        aiResponse = `I understand you're asking about "${aiAssistantMessage}". I can help with: strategic workforce planning, financial analysis, risk prediction, compliance monitoring, and executive reporting. Please specify your area of interest for detailed insights.`;
      }

      const aiResponseObj = { id: chatHistory.length + 2, sender: 'ai', message: aiResponse };
      setChatHistory(prev => [...prev, aiResponseObj]);
    }, 1000);

    setAiAssistantMessage('');
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'workforce':
        return (
          <div className="space-y-6">
            {/* Workforce Overview */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Workforce Intelligence</h2>
                  <p className="text-gray-600 mt-1">Strategic workforce analytics and optimization insights</p>
                </div>
                <div className="flex items-center space-x-3">
                  <button className="flex items-center space-x-2 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors">
                    <Download className="w-4 h-4" />
                    <span>Export Report</span>
                  </button>
                </div>
              </div>

              {/* Department Performance Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Department Performance Heatmap</h3>
                  <div className="space-y-3">
                    {departmentPerformance.map((dept, index) => (
                      <div key={index} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <Building className="w-5 h-5 text-gray-500" />
                            <span className="font-medium text-gray-900">{dept.department}</span>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${dept.attritionRisk === 'High' ? 'bg-red-100 text-red-700' :
                              dept.attritionRisk === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-green-100 text-green-700'
                            }`}>
                            {dept.attritionRisk} Risk
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 mt-3">
                          <div className="text-center">
                            <p className="text-sm text-gray-600">Employees</p>
                            <p className="text-lg font-bold text-gray-900">{dept.employees}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-600">Performance</p>
                            <div className="flex items-center justify-center">
                              <Star className="w-4 h-4 text-yellow-500 mr-1" />
                              <p className="text-lg font-bold text-gray-900">{dept.performance}/5.0</p>
                            </div>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-600">Productivity</p>
                            <p className="text-lg font-bold text-gray-900">{dept.productivity}%</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Skill Availability Matrix</h3>
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100 mb-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <Lightbulb className="w-6 h-6 text-blue-600" />
                      <h4 className="font-bold text-gray-900">Critical Skill Gaps</h4>
                    </div>
                    <div className="space-y-3">
                      {skillGapAnalysis.slice(0, 3).map((skill, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                          <div>
                            <p className="font-medium text-gray-900">{skill.skill}</p>
                            <p className="text-sm text-gray-600">{skill.current} current / {skill.needed} needed</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${skill.priority === 'Critical' ? 'bg-red-100 text-red-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                            Gap: {skill.gap}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-4 rounded-lg border border-emerald-100">
                    <div className="flex items-center space-x-3 mb-4">
                      <Heart className="w-6 h-6 text-emerald-600" />
                      <h4 className="font-bold text-gray-900">Employee Sentiment Index</h4>
                    </div>
                    <div className="space-y-2">
                      {sentimentMetrics.map((metric, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">{metric.metric}</span>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{metric.score}/100</span>
                            <span className={`text-xs ${metric.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                              {metric.trend}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'attrition':
        return (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Attrition Risk & Retention Strategy</h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-red-600">Estimated Attrition Cost</p>
                        <p className="text-2xl font-bold text-red-700">$950K</p>
                        <p className="text-xs text-red-600 mt-1">Annual impact</p>
                      </div>
                      <DollarSign className="w-8 h-8 text-red-500" />
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-emerald-600">Retention Success Rate</p>
                        <p className="text-2xl font-bold text-emerald-700">{executiveStats.retentionSuccess}%</p>
                        <p className="text-xs text-emerald-600 mt-1">+8% from last year</p>
                      </div>
                      <UserCheck className="w-8 h-8 text-emerald-500" />
                    </div>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-800 mb-4">Department-wise Risk Analysis</h3>
                <div className="space-y-4">
                  {attritionRiskData.map((risk) => (
                    <div key={risk.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium text-gray-900">{risk.department} Department</h4>
                          <p className="text-sm text-gray-500">{risk.employeesAtRisk} employees at risk • Primary driver: {risk.primaryDriver}</p>
                        </div>
                        <div className="flex items-center">
                          <div className="mr-4 text-right">
                            <div className="text-lg font-bold text-red-600">{risk.riskScore}%</div>
                            <div className="text-xs text-gray-500">Risk Score</div>
                          </div>
                          <div className="w-16 h-16">
                            <div className="relative w-16 h-16">
                              <svg className="w-full h-full" viewBox="0 0 36 36">
                                <path
                                  d="M18 2.0845
                                    a 15.9155 15.9155 0 0 1 0 31.831
                                    a 15.9155 15.9155 0 0 1 0 -31.831"
                                  fill="none"
                                  stroke="#E5E7EB"
                                  strokeWidth="3"
                                />
                                <path
                                  d="M18 2.0845
                                    a 15.9155 15.9155 0 0 1 0 31.831
                                    a 15.9155 15.9155 0 0 1 0 -31.831"
                                  fill="none"
                                  stroke="#EF4444"
                                  strokeWidth="3"
                                  strokeDasharray={`${risk.riskScore}, 100`}
                                />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div className="text-sm">
                          <span className="text-gray-600">Estimated cost impact: </span>
                          <span className="font-bold text-gray-900">{risk.estimatedCost}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200">
                            View Strategy
                          </button>
                          <button className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-sm hover:bg-emerald-200">
                            Run Simulation
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">AI Retention Strategies</h3>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100 mb-6">
                  <div className="flex items-start space-x-3">
                    <Brain className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-800">Root Cause Analysis</p>
                      <p className="text-sm text-blue-600 mt-1">
                        Top drivers: Compensation (35%), Career growth (28%), Workload (22%), Management (15%).
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <h4 className="font-medium text-gray-700">What-if Scenarios</h4>
                  <div className="space-y-2">
                    <div className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">10% Salary Increase</span>
                        <span className="text-xs text-emerald-600">-32% attrition risk</span>
                      </div>
                      <p className="text-xs text-gray-600">Cost: $1.25M • ROI: 142%</p>
                    </div>
                    <div className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">Flexible Work Policy</span>
                        <span className="text-xs text-emerald-600">-18% attrition risk</span>
                      </div>
                      <p className="text-xs text-gray-600">Cost: $85K • ROI: 210%</p>
                    </div>
                    <div className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">Career Path Programs</span>
                        <span className="text-xs text-emerald-600">-25% attrition risk</span>
                      </div>
                      <p className="text-xs text-gray-600">Cost: $150K • ROI: 185%</p>
                    </div>
                  </div>
                </div>

                <button className="w-full flex items-center justify-center space-x-2 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors">
                  <Download className="w-4 h-4" />
                  <span>Download Risk Report</span>
                </button>
              </div>
            </div>
          </div>
        );

      case 'hiring':
        return (
          <div className="space-y-6">
            {/* Hiring Strategy Overview */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Hiring Strategy & Talent Pipeline</h2>
                  <p className="text-gray-600 mt-1">AI-powered hiring analytics and demand forecasting</p>
                </div>
                <button className="flex items-center space-x-2 bg-emerald-500 text-white py-2 px-4 rounded-lg hover:bg-emerald-600 transition-colors">
                  <Brain className="w-4 h-4" />
                  <span>Generate Forecast</span>
                </button>
              </div>

              {/* Hiring Pipeline Analytics */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Hiring Pipeline Efficiency</h3>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                  {hiringPipeline.map((stage, index) => (
                    <div key={index} className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
                      <div className="text-center">
                        <p className="text-sm text-gray-600 mb-1">{stage.stage}</p>
                        <p className="text-2xl font-bold text-gray-900 mb-1">{stage.count}</p>
                        <p className="text-xs text-blue-600 font-medium">{stage.conversion} conversion</p>
                        <p className="text-xs text-gray-500 mt-1">{stage.avgDays} days avg</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Hiring Forecast */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Brain className="w-6 h-6 text-purple-600" />
                      <h3 className="text-xl font-bold text-gray-900">AI Hiring Demand Forecast</h3>
                    </div>
                    <p className="text-gray-600">Predictive analysis based on growth projections and skill gaps</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-purple-600">24-30</p>
                    <p className="text-sm text-gray-600">Projected hires Q1 2025</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center space-x-3 mb-3">
                      <Target className="w-5 h-5 text-blue-500" />
                      <span className="font-medium text-gray-900">Critical Roles</span>
                    </div>
                    <p className="text-sm text-gray-600">8-10 Senior Engineers, 3-5 Data Scientists, 2 AI/ML Specialists</p>
                  </div>

                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center space-x-3 mb-3">
                      <Clock className="w-5 h-5 text-emerald-500" />
                      <span className="font-medium text-gray-900">Time-to-Hire Target</span>
                    </div>
                    <p className="text-sm text-gray-600">35 days average (Current: 42 days)</p>
                  </div>

                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center space-x-3 mb-3">
                      <DollarSign className="w-5 h-5 text-purple-500" />
                      <span className="font-medium text-gray-900">Cost Optimization</span>
                    </div>
                    <p className="text-sm text-gray-600">Potential 15% reduction through process automation</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Hiring Quality Metrics */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Hiring Quality & Performance</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <UserCheck className="w-5 h-5 text-emerald-500" />
                      <span className="text-sm">Candidate Satisfaction</span>
                    </div>
                    <span className="font-bold text-emerald-600">4.6/5.0</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Award className="w-5 h-5 text-blue-500" />
                      <span className="text-sm">Hiring Manager Satisfaction</span>
                    </div>
                    <span className="font-bold text-blue-600">4.3/5.0</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <TrendingUp className="w-5 h-5 text-purple-500" />
                      <span className="text-sm">6-Month Retention Rate</span>
                    </div>
                    <span className="font-bold text-purple-600">94%</span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
                  <h4 className="font-bold text-gray-900 mb-3">AI Recommendations</h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5" />
                      <span>Implement structured interviews to improve quality score by 15%</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5" />
                      <span>Focus on technical skills assessment to reduce 6-month attrition</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5" />
                      <span>Automate screening for high-volume roles to reduce time-to-hire</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );

      case 'financial':
        return (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Financial & Cost Analytics</h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm opacity-90">Total Workforce Cost</p>
                        <p className="text-3xl font-bold mt-2">$12.5M</p>
                        <p className="text-sm opacity-90 mt-1">Annual expenditure</p>
                      </div>
                      <DollarSign className="w-8 h-8 opacity-90" />
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm opacity-90">Training ROI</p>
                        <p className="text-3xl font-bold mt-2">184%</p>
                        <p className="text-sm opacity-90 mt-1">Return on investment</p>
                      </div>
                      <TrendingUp className="w-8 h-8 opacity-90" />
                    </div>
                  </div>
                </div>

                {/* Cost Breakdown */}
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Workforce Cost Breakdown</h3>
                <div className="space-y-4">
                  {financialMetrics.map((metric, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-4">
                        <div className={`w-3 h-3 rounded-full ${metric.impact === 'High' ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
                        <div>
                          <h4 className="font-medium text-gray-900">{metric.category}</h4>
                          <p className="text-sm text-gray-500">{metric.impact} impact category</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">{metric.amount}</p>
                        <p className={`text-sm ${metric.trend.startsWith('+') ? 'text-red-600' : 'text-emerald-600'}`}>
                          {metric.trend} from last year
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Cost Per Employee Analysis */}
                <div className="mt-8">
                  <h4 className="font-medium text-gray-700 mb-3">Cost Per Employee Analysis</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Users className="w-4 h-4 text-blue-500" />
                        <span className="font-medium">Average Cost</span>
                      </div>
                      <p className="text-sm text-gray-600">$80,128 per employee annually</p>
                    </div>
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Building className="w-4 h-4 text-purple-500" />
                        <span className="font-medium">Highest Cost Dept</span>
                      </div>
                      <p className="text-sm text-gray-600">Engineering at $125K per employee</p>
                    </div>
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Target className="w-4 h-4 text-emerald-500" />
                        <span className="font-medium">Efficiency Target</span>
                      </div>
                      <p className="text-sm text-gray-600">Reduce to $75K through optimization</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Financial Insights</h3>
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-100">
                    <div className="flex items-start space-x-3">
                      <Brain className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-blue-800">Cost Optimization</p>
                        <p className="text-sm text-blue-600 mt-1">
                          Potential 15% savings through hiring mix optimization and automation
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-4 rounded-lg border border-emerald-100">
                    <div className="flex items-start space-x-3">
                      <TrendingUp className="w-5 h-5 text-emerald-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-emerald-800">High ROI Areas</p>
                        <p className="text-sm text-emerald-600 mt-1">
                          Training programs show 184% ROI, retention initiatives at 142% ROI
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="font-medium text-gray-700 mb-3">Attrition Cost Estimation</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Current Annual Cost</span>
                          <span className="text-sm font-medium text-red-600">$950K</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">With Interventions</span>
                          <span className="text-sm font-medium text-emerald-600">$520K</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Potential Savings</span>
                          <span className="text-sm font-medium text-blue-600">$430K</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button className="w-full mt-4 flex items-center justify-center space-x-2 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors">
                    <Download className="w-4 h-4" />
                    <span>Download Financial Report</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'training':
        return (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Training & Future Readiness</h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-blue-600">Training Investment</p>
                        <p className="text-2xl font-bold text-blue-700">$850K</p>
                        <p className="text-xs text-blue-600 mt-1">Annual budget</p>
                      </div>
                      <GraduationCap className="w-8 h-8 text-blue-500" />
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-emerald-600">Training ROI</p>
                        <p className="text-2xl font-bold text-emerald-700">184%</p>
                        <p className="text-xs text-emerald-600 mt-1">Return on investment</p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-emerald-500" />
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-purple-600">Skill Coverage</p>
                        <p className="text-2xl font-bold text-purple-700">68%</p>
                        <p className="text-xs text-purple-600 mt-1">Future needs covered</p>
                      </div>
                      <Target className="w-8 h-8 text-purple-500" />
                    </div>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-800 mb-4">Skill Gap Forecast</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Skill Area</th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Current</th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Needed</th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Gap</th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Priority</th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">AI Recommendation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {skillGapAnalysis.map((skill, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="py-4 px-4 font-medium text-gray-900">{skill.skill}</td>
                          <td className="py-4 px-4">{skill.current}</td>
                          <td className="py-4 px-4">{skill.needed}</td>
                          <td className="py-4 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${skill.gap > 5 ? 'bg-red-100 text-red-700' :
                                skill.gap > 2 ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-green-100 text-green-700'
                              }`}>
                              {skill.gap} gap
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${skill.priority === 'Critical' ? 'bg-red-100 text-red-700' :
                                skill.priority === 'High' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-blue-100 text-blue-700'
                              }`}>
                              {skill.priority}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-600">
                            {skill.priority === 'Critical' ? 'Immediate external hire + upskilling' :
                              skill.priority === 'High' ? 'Accelerated training program' :
                                'Internal development program'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">AI Upskilling Strategy</h3>
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
                    <div className="flex items-start space-x-3">
                      <Brain className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-blue-800">Strategic Focus</p>
                        <p className="text-sm text-blue-600 mt-1">
                          Prioritize AI/ML and Cloud skills for 2025. Partner with 3 training providers for accelerated programs.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="font-medium text-gray-700 mb-3">Leadership Pipeline</h4>
                    <div className="space-y-2">
                      <div className="p-3 border border-gray-200 rounded-lg">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium">Ready Now</span>
                          <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs">
                            8 candidates
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">For Director+ roles</p>
                      </div>
                      <div className="p-3 border border-gray-200 rounded-lg">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium">1-2 Year Pipeline</span>
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                            15 candidates
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">Manager to Director path</p>
                      </div>
                      <div className="p-3 border border-gray-200 rounded-lg">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium">Emerging Talent</span>
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                            24 candidates
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">High-potential employees</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="font-medium text-gray-700 mb-3">Training Effectiveness</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Completion Rate</span>
                          <span className="text-sm font-medium text-emerald-600">94%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Skill Improvement</span>
                          <span className="text-sm font-medium text-blue-600">+32% avg</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Application Rate</span>
                          <span className="text-sm font-medium text-purple-600">78%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button className="w-full mt-4 flex items-center justify-center space-x-2 bg-purple-500 text-white py-2 px-4 rounded-lg hover:bg-purple-600 transition-colors">
                    <FileText className="w-4 h-4" />
                    <span>Generate Training Plan</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'compliance':
        return (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Policy Compliance & Risk Management</h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm opacity-90">Overall Compliance Score</p>
                        <p className="text-3xl font-bold mt-2">{executiveStats.complianceScore}%</p>
                        <p className="text-sm opacity-90 mt-1">Audit ready</p>
                      </div>
                      <Shield className="w-8 h-8 opacity-90" />
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm opacity-90">Open Violations</p>
                        <p className="text-3xl font-bold mt-2">3</p>
                        <p className="text-sm opacity-90 mt-1">Requiring action</p>
                      </div>
                      <AlertCircle className="w-8 h-8 opacity-90" />
                    </div>
                  </div>
                </div>

                {/* Compliance Status */}
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Compliance Status by Area</h3>
                <div className="space-y-4">
                  {complianceStatus.map((item, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${item.status === 'Compliant' ? 'bg-emerald-500' :
                              item.status === 'Needs Review' ? 'bg-yellow-500' :
                                'bg-red-500'
                            }`}></div>
                          <div>
                            <h4 className="font-medium text-gray-900">{item.area}</h4>
                            <p className="text-sm text-gray-500">Last audit: {item.lastAudit}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">{item.score}%</p>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${item.status === 'Compliant' ? 'bg-emerald-100 text-emerald-700' :
                              item.status === 'Needs Review' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                            }`}>
                            {item.status}
                          </span>
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${item.score >= 90 ? 'bg-emerald-500' :
                                item.score >= 80 ? 'bg-yellow-500' :
                                  'bg-red-500'
                              }`}
                            style={{ width: `${item.score}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Risk Alerts & Actions</h3>
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-red-50 to-pink-50 p-4 rounded-lg border border-red-100">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-red-800">High Priority</p>
                        <p className="text-sm text-red-600 mt-1">
                          Safety Standards compliance at 82% - requires immediate review before Q1 audit.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-yellow-50 to-amber-50 p-4 rounded-lg border border-yellow-100">
                    <div className="flex items-start space-x-3">
                      <Clock className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-yellow-800">Upcoming Deadlines</p>
                        <p className="text-sm text-yellow-600 mt-1">
                          Diversity reporting due in 30 days. Training compliance audit in 45 days.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="font-medium text-gray-700 mb-3">AI Recommendations</h4>
                    <div className="space-y-2">
                      <div className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <div className="flex items-center space-x-3">
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                          <span className="text-sm">Schedule safety training refresher</span>
                        </div>
                      </div>
                      <div className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <div className="flex items-center space-x-3">
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                          <span className="text-sm">Update policy documentation</span>
                        </div>
                      </div>
                      <div className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <div className="flex items-center space-x-3">
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                          <span className="text-sm">Conduct mock audit for at-risk areas</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button className="w-full mt-4 flex items-center justify-center space-x-2 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors">
                    <Download className="w-4 h-4" />
                    <span>Download Compliance Report</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'sentiment':
        return (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Organizational Sentiment & Culture Analytics</h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-emerald-600">Overall Satisfaction</p>
                        <p className="text-2xl font-bold text-emerald-700">84/100</p>
                        <p className="text-xs text-emerald-600 mt-1">+5% from last quarter</p>
                      </div>
                      <ThumbsUp className="w-8 h-8 text-emerald-500" />
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-blue-600">Leadership Trust</p>
                        <p className="text-2xl font-bold text-blue-700">88/100</p>
                        <p className="text-xs text-blue-600 mt-1">+6% from last quarter</p>
                      </div>
                      <Award className="w-8 h-8 text-blue-500" />
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-yellow-600">Burnout Risk</p>
                        <p className="text-2xl font-bold text-yellow-700">18%</p>
                        <p className="text-xs text-yellow-600 mt-1">At-risk employees</p>
                      </div>
                      <AlertCircle className="w-8 h-8 text-yellow-500" />
                    </div>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-800 mb-4">Sentiment Heatmap by Department</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {departmentPerformance.map((dept, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-medium text-gray-900">{dept.department}</span>
                        <div className={`w-3 h-3 rounded-full ${dept.performance >= 4.5 ? 'bg-emerald-500' :
                            dept.performance >= 4.0 ? 'bg-yellow-500' :
                              'bg-red-500'
                          }`}></div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Engagement</span>
                          <span className="font-medium">{Math.floor(Math.random() * 20) + 80}/100</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Feedback Trend</span>
                          <span className={`font-medium ${Math.random() > 0.5 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {Math.random() > 0.5 ? '+' : ''}{Math.floor(Math.random() * 10) + 1}%
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Burnout Risk</span>
                          <span className="font-medium">{Math.floor(Math.random() * 30) + 10}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8">
                  <h4 className="font-medium text-gray-700 mb-3">Feedback Trend Analysis</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Positive Mentions</p>
                        <p className="text-2xl font-bold text-gray-900">68%</p>
                        <p className="text-xs text-emerald-600">+12% from last quarter</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Constructive Feedback</p>
                        <p className="text-2xl font-bold text-gray-900">24%</p>
                        <p className="text-xs text-blue-600">+4% from last quarter</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Negative Concerns</p>
                        <p className="text-2xl font-bold text-gray-900">8%</p>
                        <p className="text-xs text-red-600">-3% from last quarter</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Culture Health Insights</h3>
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
                    <div className="flex items-start space-x-3">
                      <Brain className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-blue-800">Culture Health Score</p>
                        <p className="text-sm text-blue-600 mt-1">
                          86/100 - Strong positive trend. Areas of strength: Collaboration, Innovation, Leadership Trust.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="font-medium text-gray-700 mb-3">Engagement vs Attrition Correlation</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">High Engagement Teams</span>
                          <span className="text-sm font-medium text-emerald-600">3% attrition</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Medium Engagement</span>
                          <span className="text-sm font-medium text-yellow-600">8% attrition</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Low Engagement</span>
                          <span className="text-sm font-medium text-red-600">22% attrition</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="font-medium text-gray-700 mb-3">AI Recommendations</h4>
                    <div className="space-y-2">
                      <div className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <div className="flex items-center space-x-3">
                          <MessageSquare className="w-4 h-4 text-blue-500" />
                          <span className="text-sm">Increase leadership visibility in Sales</span>
                        </div>
                      </div>
                      <div className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <div className="flex items-center space-x-3">
                          <Heart className="w-4 h-4 text-red-500" />
                          <span className="text-sm">Address burnout in Engineering</span>
                        </div>
                      </div>
                      <div className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <div className="flex items-center space-x-3">
                          <Zap className="w-4 h-4 text-purple-500" />
                          <span className="text-sm">Enhance recognition programs</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button className="w-full mt-4 flex items-center justify-center space-x-2 bg-purple-500 text-white py-2 px-4 rounded-lg hover:bg-purple-600 transition-colors">
                    <Download className="w-4 h-4" />
                    <span>Download Culture Report</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'ai-advisor':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex items-center space-x-3">
                <Brain className="w-8 h-8 text-emerald-600" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">AI Strategic Advisor (CEO Mode)</h2>
                  <p className="text-gray-600 mt-1">Multi-step reasoning, analytics execution, and decision impact analysis</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 h-[600px]">
              <div className="lg:col-span-2 border-r">
                <div className="h-[500px] overflow-y-auto p-6 space-y-4">
                  {chatHistory.map((chat) => (
                    <div key={chat.id} className={`flex ${chat.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-2xl p-4 ${chat.sender === 'user' ? 'bg-blue-500 text-white rounded-br-none' : 'bg-gray-100 text-gray-800 rounded-bl-none'}`}>
                        {chat.sender === 'ai' && (
                          <div className="flex items-center space-x-2 mb-2">
                            <Brain className="w-4 h-4 text-emerald-600" />
                            <span className="text-sm font-medium text-emerald-700">Strategic Advisor</span>
                          </div>
                        )}
                        <p>{chat.message}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t p-4">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={aiAssistantMessage}
                      onChange={(e) => setAiAssistantMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendAiMessage()}
                      placeholder="Ask strategic questions, request analysis, or generate reports..."
                      className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                    />
                    <button
                      onClick={sendAiMessage}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <h3 className="font-semibold text-gray-800 mb-4">Strategic Commands</h3>
                <div className="space-y-3">
                  {aiSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => setAiAssistantMessage(suggestion)}
                      className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>

                <div className="mt-8">
                  <h3 className="font-semibold text-gray-800 mb-4">Agentic Capabilities</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm text-gray-600">Multi-step strategic analysis</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm text-gray-600">Predictive modeling</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm text-gray-600">What-if scenario simulation</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm text-gray-600">Board-ready report generation</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="font-semibold text-gray-800 mb-4">Recent Strategic Analysis</h3>
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                        <span>Sales attrition root cause analysis</span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>Q1 2025 workforce forecast</span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span>Training ROI optimization model</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'reports':
        return (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Reports & Board-Ready Outputs</h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm opacity-90">AI-Generated Reports</p>
                        <p className="text-3xl font-bold mt-2">24</p>
                        <p className="text-sm opacity-90 mt-1">This month</p>
                      </div>
                      <FileText className="w-8 h-8 opacity-90" />
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm opacity-90">Executive Dashboards</p>
                        <p className="text-3xl font-bold mt-2">8</p>
                        <p className="text-sm opacity-90 mt-1">Custom created</p>
                      </div>
                      <BarChart3 className="w-8 h-8 opacity-90" />
                    </div>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Reports</h3>
                <div className="space-y-4">
                  <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <div>
                          <h4 className="font-medium text-gray-900">Monthly Executive Summary</h4>
                          <p className="text-sm text-gray-500">December 2024 • Comprehensive organizational analysis</p>
                        </div>
                      </div>
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                        Generated
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center space-x-4">
                        <button className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm">
                          <Download className="w-4 h-4" />
                          <span>PDF</span>
                        </button>
                        <button className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm">
                          <Download className="w-4 h-4" />
                          <span>PPT</span>
                        </button>
                        <button className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm">
                          <Eye className="w-4 h-4" />
                          <span>Preview</span>
                        </button>
                      </div>
                      <span className="text-sm text-gray-500">Generated 2 hours ago</span>
                    </div>
                  </div>

                  <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <div>
                          <h4 className="font-medium text-gray-900">Attrition Risk Analysis</h4>
                          <p className="text-sm text-gray-500">Q4 2024 • Department-wise risk assessment</p>
                        </div>
                      </div>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                        Updated
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center space-x-4">
                        <button className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm">
                          <Download className="w-4 h-4" />
                          <span>Excel</span>
                        </button>
                        <button className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm">
                          <Download className="w-4 h-4" />
                          <span>PDF</span>
                        </button>
                      </div>
                      <span className="text-sm text-gray-500">Updated today</span>
                    </div>
                  </div>

                  <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <TrendingUp className="w-5 h-5 text-emerald-600" />
                        <div>
                          <h4 className="font-medium text-gray-900">Performance & Productivity Report</h4>
                          <p className="text-sm text-gray-500">Annual 2024 • Department rankings and trends</p>
                        </div>
                      </div>
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                        Scheduled
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center space-x-4">
                        <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200">
                          Generate Now
                        </button>
                        <button className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm">
                          <Eye className="w-4 h-4" />
                          <span>Template</span>
                        </button>
                      </div>
                      <span className="text-sm text-gray-500">Due Jan 15, 2025</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Report Templates</h3>
                <div className="space-y-4">
                  <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-3 mb-3">
                      <Building className="w-5 h-5 text-blue-600" />
                      <span className="font-medium">Board Meeting Package</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">Complete set of executive reports for board presentations</p>
                    <button className="w-full px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200">
                      Use Template
                    </button>
                  </div>

                  <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-3 mb-3">
                      <Users className="w-5 h-5 text-purple-600" />
                      <span className="font-medium">Workforce Planning</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">Strategic workforce analysis and forecasting template</p>
                    <button className="w-full px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm hover:bg-purple-200">
                      Use Template
                    </button>
                  </div>

                  <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-3 mb-3">
                      <DollarSign className="w-5 h-5 text-emerald-600" />
                      <span className="font-medium">Financial Review</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">HR financial metrics and cost analysis template</p>
                    <button className="w-full px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-sm hover:bg-emerald-200">
                      Use Template
                    </button>
                  </div>

                  <div className="mt-8">
                    <h4 className="font-medium text-gray-700 mb-3">Custom Report Generator</h4>
                    <div className="space-y-2">
                      <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                        <option>Select report type</option>
                        <option>Executive Summary</option>
                        <option>Department Analysis</option>
                        <option>Financial Review</option>
                        <option>Risk Assessment</option>
                      </select>
                      <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                        <option>Select time period</option>
                        <option>Last Quarter</option>
                        <option>Last 6 Months</option>
                        <option>Year to Date</option>
                        <option>Full Year</option>
                      </select>
                      <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                        <option>Select format</option>
                        <option>PDF Report</option>
                        <option>Excel Data</option>
                        <option>PowerPoint</option>
                        <option>Dashboard</option>
                      </select>
                      <button className="w-full flex items-center justify-center space-x-2 bg-emerald-500 text-white py-2 px-4 rounded-lg hover:bg-emerald-600 transition-colors">
                        <Brain className="w-4 h-4" />
                        <span>Generate with AI</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <>
            {/* Executive Welcome Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="text-2xl font-bold mb-2">Executive Dashboard, {userData?.name || 'CEO'}! 👑</h1>
                  <p className="text-indigo-100">AI-driven strategic insights for organizational leadership</p>
                </div>
                <div className="mt-4 md:mt-0">
                  <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                    <Brain className="w-5 h-5" />
                    <span className="font-semibold">AI Insights: 3 strategic alerts pending review</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Executive Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Workforce</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{executiveStats.totalWorkforce}</p>
                  </div>
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <div className="mt-3 flex items-center text-xs">
                  <TrendingUp className="w-3 h-3 text-emerald-500 mr-1" />
                  <span className="text-emerald-600">{executiveStats.headcountGrowth} growth</span>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Productivity</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{executiveStats.productivityIndex}</p>
                  </div>
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <Zap className="w-5 h-5 text-emerald-600" />
                  </div>
                </div>
                <div className="mt-3 text-xs text-gray-500">Index score /100</div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Attrition Risk</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{executiveStats.attritionRate}</p>
                  </div>
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  </div>
                </div>
                <div className="mt-3 flex items-center text-xs">
                  <TrendingDown className="w-3 h-3 text-red-500 mr-1" />
                  <span className="text-red-600">-0.8% from last month</span>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Cost per Hire</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{executiveStats.costPerHire}</p>
                  </div>
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-amber-600" />
                  </div>
                </div>
                <div className="mt-3 flex items-center text-xs">
                  <TrendingDown className="w-3 h-3 text-emerald-500 mr-1" />
                  <span className="text-emerald-600">Below industry avg.</span>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Compliance</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{executiveStats.complianceScore}%</p>
                  </div>
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-green-600" />
                  </div>
                </div>
                <div className="mt-3 text-xs text-gray-500">Audit readiness score</div>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Strategic Alerts & AI Summary */}
              <div className="lg:col-span-2 space-y-6">
                {/* Strategic Alerts */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Strategic Alerts & Recommendations</h2>
                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                      {strategicAlerts.filter(a => a.severity === 'High').length} high priority
                    </span>
                  </div>

                  <div className="space-y-3">
                    {strategicAlerts.map((alert) => (
                      <div key={alert.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className={`w-3 h-3 rounded-full ${alert.severity === 'High' ? 'bg-red-500' : alert.severity === 'Medium' ? 'bg-yellow-500' : 'bg-blue-500'}`}></div>
                          <div>
                            <h3 className="font-medium text-gray-900">{alert.title}</h3>
                            <p className="text-sm text-gray-500">{alert.department} • {alert.time}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${alert.severity === 'High' ? 'bg-red-100 text-red-700' : alert.severity === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>
                            {alert.severity}
                          </span>
                          <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200">
                            {alert.action}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Executive Summary */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">AI-Generated Executive Summary</h2>
                    <Brain className="w-6 h-6 text-indigo-600" />
                  </div>

                  <div className="space-y-4">
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <div className="flex items-center space-x-3 mb-3">
                        <TrendingUp className="w-5 h-5 text-emerald-500" />
                        <span className="font-medium text-gray-900">Positive Trends</span>
                      </div>
                      <p className="text-sm text-gray-600">Productivity increased to 86/100 (+8%). Training ROI at 184%. Employee satisfaction up 5% to 84/100. Hiring efficiency improved with $4,850 cost per hire.</p>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <div className="flex items-center space-x-3 mb-3">
                        <AlertCircle className="w-5 h-5 text-amber-500" />
                        <span className="font-medium text-gray-900">Strategic Risks</span>
                      </div>
                      <p className="text-sm text-gray-600">Sales department shows 82% attrition risk (8 employees). Critical skill gaps in AI/ML (7 gap). Safety compliance at 82% needs review. Burnout risk at 18% in Engineering.</p>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <div className="flex items-center space-x-3 mb-3">
                        <Target className="w-5 h-5 text-blue-500" />
                        <span className="font-medium text-gray-900">Recommended Actions</span>
                      </div>
                      <p className="text-sm text-gray-600">1) Review Sales retention strategy, 2) Accelerate AI/ML hiring, 3) Schedule compliance audit, 4) Implement Engineering wellness program, 5) Optimize training budget allocation.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Top Performers & Quick Insights */}
              <div className="space-y-6">
                {/* Top Performers */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Top Performers</h2>
                    <Award className="w-5 h-5 text-yellow-500" />
                  </div>

                  <div className="space-y-4">
                    {topPerformers.map((performer) => (
                      <div key={performer.id} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <span className="font-medium text-gray-900">{performer.name}</span>
                            <p className="text-sm text-gray-500">{performer.department} • {performer.tenure} tenure</p>
                          </div>
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-500 mr-1" />
                            <span className="font-bold">{performer.performance}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className={`px-2 py-1 rounded text-xs ${performer.impact === 'Very High' ? 'bg-purple-100 text-purple-700' : performer.impact === 'High' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                            {performer.impact} Impact
                          </span>
                          <button className="text-xs text-blue-600 hover:text-blue-700">View Details →</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Strategic Insights */}
                <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-6 border border-blue-100">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Strategic Insights</h2>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                      <div className="flex items-center space-x-3">
                        <DollarSign className="w-4 h-4 text-emerald-500" />
                        <span className="text-sm">Training ROI</span>
                      </div>
                      <span className="font-bold text-emerald-600">184%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                      <div className="flex items-center space-x-3">
                        <Users className="w-4 h-4 text-red-500" />
                        <span className="text-sm">Employees at High Risk</span>
                      </div>
                      <span className="font-bold text-red-600">15</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                      <div className="flex items-center space-x-3">
                        <Clock className="w-4 h-4 text-blue-500" />
                        <span className="text-sm">Avg Time-to-Hire</span>
                      </div>
                      <span className="font-bold text-blue-600">42 days</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                      <div className="flex items-center space-x-3">
                        <Heart className="w-4 h-4 text-purple-500" />
                        <span className="text-sm">Culture Score</span>
                      </div>
                      <span className="font-bold text-purple-600">86/100</span>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Executive Actions</h2>
                  <div className="space-y-2">
                    <button onClick={() => setActiveSection('ai-advisor')} className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <Brain className="w-5 h-5 text-emerald-600" />
                        <span>Consult AI Strategic Advisor</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </button>
                    <button onClick={() => setActiveSection('reports')} className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <span>Generate Board Report</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </button>
                    <button onClick={() => setActiveSection('financial')} className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <DollarSign className="w-5 h-5 text-emerald-600" />
                        <span>Review Financial Analytics</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        );
    }
  };

  // Sidebar navigation items for Admin/CEO
  const navItems = [
    { id: 'overview', label: 'Executive Overview', icon: Home, highlight: true },
    { id: 'workforce', label: 'Workforce Analytics', icon: Users },
    { id: 'attrition', label: 'Attrition Strategy', icon: AlertCircle, highlight: true },
    { id: 'hiring', label: 'Hiring Strategy', icon: UserCheck },
    { id: 'financial', label: 'Financial Analytics', icon: DollarSign },
    { id: 'training', label: 'Training & Skills', icon: GraduationCap },
    { id: 'compliance', label: 'Compliance & Risk', icon: Shield },
    { id: 'sentiment', label: 'Culture Analytics', icon: Heart },
    { id: 'ai-advisor', label: 'AI Strategic Advisor', icon: Brain, highlight: true },
    { id: 'reports', label: 'Reports & Board', icon: FileText },
    { id: 'governance', label: 'System Governance', icon: Settings },
  ];

  return (
    <DashboardLayout
      role="admin"
      userName={userData?.name || 'CEO'}
      userEmail={userData?.email || ''}
    >
      <div className="flex">
        {/* Sidebar Navigation */}
        <div className="w-64 flex-shrink-0 bg-white border-r border-gray-200 min-h-screen p-4">
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Executive Command Center</h2>
            <p className="text-sm text-gray-500">AI-powered strategic leadership</p>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${activeSection === item.id
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-50'
                    } ${item.highlight ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200' : ''}`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-5 h-5 ${activeSection === item.id ? 'text-blue-600' : 'text-gray-500'}`} />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  {item.highlight && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </button>
              );
            })}

            <div className="pt-4 mt-4 border-t">
              <button className="w-full flex items-center space-x-3 p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </nav>

          <div className="mt-8 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100">
            <div className="flex items-center space-x-3 mb-2">
              <Brain className="w-5 h-5 text-indigo-600" />
              <span className="font-medium text-indigo-800">Strategic AI Status</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-indigo-700">Analyses Completed</span>
                <span className="text-sm font-medium">24 today</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-indigo-700">Prediction Accuracy</span>
                <span className="text-sm font-medium">92%</span>
              </div>
              <div className="text-xs text-indigo-600 mt-2">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                  <span>All systems optimal</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="space-y-6">
            {/* Header with Breadcrumb */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span
                  className="font-medium text-gray-700 cursor-pointer hover:text-blue-600 transition-colors"
                  onClick={() => setActiveSection('overview')}
                >
                  Executive Dashboard
                </span>
                <ChevronRight className="w-4 h-4" />
                <span className="capitalize">{activeSection.replace('-', ' ')}</span>
              </div>

              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Bell className="w-5 h-5 text-gray-600" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                </div>
                <div className="text-sm">
                  <span className="font-medium">Last updated: </span>
                  <span className="text-gray-600">Today, 3:15 PM</span>
                </div>
              </div>
            </div>

            {/* Render Active Section */}
            {renderSection()}

            {/* Footer Note */}
            <div className="text-center text-sm text-gray-500 pt-4">
              <p>Executive AI-Powered Dashboard • Predictive Analytics • Strategic Decision Support</p>
              <p className="mt-1">All data is mock data for demonstration purposes • Confidential</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;