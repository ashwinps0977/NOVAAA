import { useState, useEffect, useRef } from 'react';
import {
  CheckCircle,
  Clock,
  TrendingUp,
  Award,
  Calendar,
  Zap,
  User,
  Home,
  CalendarDays,
  Briefcase,
  Target,
  GraduationCap,
  DollarSign,
  Bell,
  MessageCircle,
  Settings,
  LogOut,
  ChevronRight,
  Upload,
  Eye,
  Download,
  Search,
  HelpCircle,
  Heart,
  Coffee,
  Sun,
  Thermometer,
  Brain,
  Scale,
  AlertCircle,
  CheckSquare,
  FileCheck,
  ShieldCheck,
  Plus,
  Send,
  Star
} from 'lucide-react';
import DashboardLayout from '../components/dashboard/DashboardLayout';

const EmployeeDashboard = () => {
  const [userData, setUserData] = useState<any>(null);
  const [activeSection, setActiveSection] = useState('overview');
  const [attendanceStatus] = useState<'present' | 'absent' | 'leave'>('present');
  // AI Chat State
  // Replacing old chat history with new structure for compatibility with new UI
  const [messages, setMessages] = useState<{ sender: 'user' | 'bot', text: string }[]>([
    { sender: 'bot', text: 'Hello! I am your Agentic HR Assistant. I can check your leave balance or even apply for leave for you. Try saying "Apply for sick leave tomorrow".' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (e: React.FormEvent | React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMsg = inputMessage;
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const token = localStorage.getItem('token');
      // Use standard fetch to backend
      const response = await fetch('http://localhost:5000/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: userMsg })
      });

      const data = await response.json();

      if (data.success) {
        setMessages(prev => [...prev, { sender: 'bot', text: data.reply }]);

        // Handle Actions
        if (data.action === 'OPEN_LEAVE_MODAL') {
          if (data.data) {
            setLeaveForm(prev => ({
              ...prev,
              ...data.data
            }));
          }
          setShowApplyModal(true);
        }
        if (data.action === 'LEAVE_SUBMITTED') {
          // Maybe auto-refresh leaves
          fetchLeaves();
        }
      } else {
        setMessages(prev => [...prev, { sender: 'bot', text: 'Sorry, I encountered an error processing your request.' }]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { sender: 'bot', text: 'Network error. Please try again.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  const [stats] = useState({
    completedTasks: 42,
    pendingTasks: 8,
    productivityScore: 87,
    streakDays: 14,
    leaveBalance: 12,
    pendingApprovals: 3,
    workLifeBalance: 78,
    skillGap: 2
  });

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setUserData(user);
    }
  }, []);

  // Mock data for various sections
  const tasks = [
    { id: 1, title: 'Complete Q4 Report', due: 'Today', priority: 'high', status: 'pending', project: 'Quarterly Review' },
    { id: 2, title: 'Team Meeting Prep', due: 'Tomorrow', priority: 'medium', status: 'pending', project: 'Team Sync' },
    { id: 3, title: 'Client Presentation', due: 'Dec 15', priority: 'high', status: 'completed', project: 'Sales' },
    { id: 4, title: 'Training Module', due: 'Dec 18', priority: 'low', status: 'pending', project: 'Learning' },
  ];

  const goals = [
    { id: 1, title: 'Complete Certification', progress: 80, dueDate: 'Mar 2024', kpi: 'Technical Skills' },
    { id: 2, title: 'Lead Project Successfully', progress: 40, dueDate: 'Jun 2024', kpi: 'Leadership' },
    { id: 3, title: 'Skill Development', progress: 60, dueDate: 'Dec 2024', kpi: 'Personal Growth' },
  ];

  const trainingCourses = [
    { id: 1, title: 'React Advanced Patterns', provider: 'Internal', duration: '8h', progress: 30, status: 'in-progress' },
    { id: 2, title: 'Leadership Skills', provider: 'Coursera', duration: '20h', progress: 0, status: 'not-started' },
    { id: 3, title: 'Data Visualization', provider: 'Udemy', duration: '12h', progress: 100, status: 'completed' },
  ];

  const notifications = [
    { id: 1, title: 'Leave Approved', message: 'Your sick leave has been approved', time: '2h ago', read: false },
    { id: 2, title: 'New Policy Update', message: 'Updated remote work policy', time: '1d ago', read: true },
    { id: 3, title: 'Performance Review', message: 'Schedule your Q4 review', time: '2d ago', read: false },
  ];

  const policies = [
    { id: 1, title: 'Code of Conduct', category: 'General', lastUpdated: '2024-01-01' },
    { id: 2, title: 'Leave Policy', category: 'HR', lastUpdated: '2024-01-05' },
    { id: 3, title: 'Remote Work Policy', category: 'Operations', lastUpdated: '2024-01-10' },
  ];

  const aiChatSuggestions = [
    "How many sick leaves do I have?",
    "What is the maternity leave policy?",
    "Explain the attendance policy",
    "How to apply for leave?"
  ];

  // Attendance state
  const [attendanceData, setAttendanceData] = useState<any>(null);
  const [attendanceLoading, setAttendanceLoading] = useState(false);

  const fetchAttendance = async () => {
    try {
      setAttendanceLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/attendance/my-history', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setAttendanceData(data);
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setAttendanceLoading(false);
    }
  };

  useEffect(() => {
    if (activeSection === 'attendance') {
      fetchAttendance();
    }
  }, [activeSection]);

  const handleCheckOut = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/attendance/checkout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        alert('Checked out successfully');
        fetchAttendance();
      } else {
        alert('Failed to check out');
      }
    } catch (error) {
      console.error('Check out error:', error);
    }
  };

  const handleDownloadReport = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/attendance/download-report', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `attendance_report.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Failed to download report');
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('Error downloading report');
    }
  };

  // Leave State
  const [leaveData, setLeaveData] = useState<any>({ leaves: [], balances: { Sick: 0, Casual: 0, Earned: 0 } });
  const [leaveLoading, setLeaveLoading] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    type: 'Sick',
    startDate: '',
    endDate: '',
    reason: ''
  });

  const fetchLeaves = async () => {
    try {
      setLeaveLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/leave/my-leaves', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setLeaveData(data);
      }
    } catch (error) {
      console.error('Fetch leaves error:', error);
    } finally {
      setLeaveLoading(false);
    }
  };

  // Projects State
  const [myProjects, setMyProjects] = useState<any[]>([]);
  const [projectUpdateModal, setProjectUpdateModal] = useState<{ show: boolean; project: any; status: string; feedback: string }>({
    show: false,
    project: null,
    status: '',
    feedback: ''
  });

  const fetchMyProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/projects/my-projects', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setMyProjects(data.projects || []);
      }
    } catch (error) {
      console.error('Fetch my projects error:', error);
    }
  };

  const handleUpdateProjectStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectUpdateModal.project) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/projects/${projectUpdateModal.project._id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: projectUpdateModal.status,
          feedback: projectUpdateModal.feedback
        })
      });

      if (response.ok) {
        alert('Project status updated successfully');
        setProjectUpdateModal({ show: false, project: null, status: '', feedback: '' });
        fetchMyProjects();
      } else {
        alert('Failed to update project status');
      }
    } catch (error) {
      console.error('Update project status error:', error);
    }
  };

  useEffect(() => {
    if (activeSection === 'leave') {
      fetchLeaves();
    }
    if (activeSection === 'projects') {
      fetchMyProjects();
    }
  }, [activeSection]);

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/leave/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(leaveForm)
      });

      if (response.ok) {
        alert('Leave application submitted successfully');
        setLeaveForm({ type: 'Sick', startDate: '', endDate: '', reason: '' });
        fetchLeaves();
      } else {
        alert('Failed to submit leave application');
      }
    } catch (error) {
      console.error('Apply leave error:', error);
    }
  };

  const handleCancelLeave = async (id: string) => {
    if (!window.confirm('Are you sure you want to cancel this leave request?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/leave/${id}/cancel`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert('Leave request cancelled');
        fetchLeaves();
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to cancel leave');
      }
    } catch (error) {
      console.error('Cancel leave error:', error);
    }
  };



  const handleLogout = async () => {
    // Attempt to check out before logging out
    try {
      const token = localStorage.getItem('token');
      await fetch('http://localhost:5000/api/attendance/checkout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('Logout checkout failed:', error);
    }

    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login'; // Force refresh/redirect
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'profile':
        return (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile & Personal Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Basic Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">Full Name</span>
                    <span className="font-medium">{userData?.name || 'Employee Name'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">Employee ID</span>
                    <span className="font-medium">EMP-{userData?.id || '001'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">Department</span>
                    <span className="font-medium">Engineering</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">Position</span>
                    <span className="font-medium">Senior Developer</span>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-800 mt-6">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-gray-600">{userData?.email || 'employee@company.com'}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-gray-600">+1 (555) 123-4567</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-gray-600">123 Main St, City, Country</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Emergency Contact</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Jane Doe</span>
                    <span className="text-sm text-gray-500">Spouse</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div className="mb-1">
                      <span>+1 (555) 987-6543</span>
                    </div>
                    <div>
                      <span>jane.doe@email.com</span>
                    </div>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-800 mt-6">Profile Completeness</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Profile Progress</span>
                    <span className="font-medium">85%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: '85%' }}></div>
                  </div>
                  <p className="text-sm text-gray-500">Complete your profile by adding missing information</p>
                </div>

                <button className="w-full mt-4 flex items-center justify-center space-x-2 bg-emerald-500 text-white py-2 px-4 rounded-lg hover:bg-emerald-600 transition-colors">
                  <Upload className="w-4 h-4" />
                  <span>Upload Documents</span>
                </button>
              </div>
            </div>
          </div>
        );

      case 'attendance':
        const todayRecord = attendanceData?.today;
        const isPresent = !!todayRecord;
        const isCheckedOut = !!todayRecord?.checkOut;

        // Generate calendar days for current month
        const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
        const calendarDays = Array.from({ length: daysInMonth }, (_, i) => {
          const d = new Date();
          d.setDate(i + 1);
          const dateStr = d.toISOString().split('T')[0];
          const record = attendanceData?.history?.find((r: any) => r.date === dateStr);

          let status = 'absent';
          if (record) status = record.status;
          if (d.getDay() === 0 || d.getDay() === 6) status = 'holiday'; // Simple weekend logic
          if (d > new Date()) status = 'future';

          return { date: d, status, record };
        });

        return (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Attendance Management</h2>

            {attendanceLoading ? (
              <div className="text-center py-10">Loading attendance data...</div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg p-6 text-white mb-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold mb-2">Today's Attendance</h3>
                        <div className="flex items-center space-x-4">
                          <div className={`px-4 py-2 rounded-lg ${isPresent ? 'bg-green-500' : 'bg-red-500'}`}>
                            <span className="font-semibold">{isPresent ? 'PRESENT' : 'NOT CHECKED IN'}</span>
                          </div>
                          <div>
                            {todayRecord?.checkIn && <p className="text-sm opacity-90">Check-in: {new Date(todayRecord.checkIn).toLocaleTimeString()}</p>}
                            {todayRecord?.checkOut && <p className="text-sm opacity-90">Check-out: {new Date(todayRecord.checkOut).toLocaleTimeString()}</p>}
                          </div>
                        </div>
                      </div>
                      {isPresent && !isCheckedOut && (
                        <button
                          onClick={handleCheckOut}
                          className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors"
                        >
                          Check Out
                        </button>
                      )}
                      {isCheckedOut && (
                        <div className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg">Checked Out</div>
                      )}
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Monthly Calendar ({new Date().toLocaleString('default', { month: 'long' })})</h3>
                  <div className="grid grid-cols-7 gap-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="text-center font-medium text-gray-600 py-2">
                        {day}
                      </div>
                    ))}
                    {calendarDays.map((day, index) => (
                      <div key={index} className={`p-2 border rounded-lg text-center 
                      ${day.status === 'present' ? 'bg-green-50 border-green-200' :
                          day.status === 'holiday' ? 'bg-purple-50 border-purple-200' :
                            day.status === 'leave' ? 'bg-yellow-50 border-yellow-200' :
                              day.status === 'future' ? 'bg-gray-50 border-gray-100 opacity-50' :
                                'bg-red-50 border-red-200'}`}>
                        <div className="font-medium">{day.date.getDate()}</div>
                        <div className={`text-xs mt-1 
                        ${day.status === 'present' ? 'text-green-600' :
                            day.status === 'holiday' ? 'text-purple-600' :
                              day.status === 'leave' ? 'text-yellow-600' :
                                day.status === 'future' ? 'text-gray-400' :
                                  'text-red-600'}`}>
                          {day.status === 'future' ? '-' : day.status}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Attendance Summary</h3>
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600">Total Recorded</span>
                        <span className="font-bold text-gray-900">{attendanceData?.summary?.totalDays || 0}</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600">Present Days</span>
                        <span className="font-bold text-green-600">{attendanceData?.summary?.presentDays || 0}</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600">Absent Days</span>
                        <span className="font-bold text-red-600">{attendanceData?.summary?.absentDays || 0}</span>
                      </div>
                    </div>

                    <button className="w-full flex items-center justify-center space-x-2 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors" onClick={handleDownloadReport}>
                      <Download className="w-4 h-4" />
                      <span>Download Attendance Report</span>
                    </button>

                    <div className="mt-6">
                      <h4 className="font-medium text-gray-700 mb-3">AI Insights</h4>
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
                        <div className="flex items-start space-x-3">
                          <Brain className="w-5 h-5 text-blue-600 mt-0.5" />
                          <div>
                            <p className="font-medium text-blue-800">Attendance Trend Analysis</p>
                            <p className="text-sm text-blue-600 mt-1">Your attendance is consistent. Great job maintaining punctuality!</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'leave':
        return (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Leave Management</h2>

            {leaveLoading ? (
              <div className="text-center py-10">Loading leave data...</div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-green-600">Sick Leave</p>
                          <p className="text-2xl font-bold text-green-700">{leaveData.balances?.Sick || 0} days</p>
                        </div>
                        <Heart className="w-8 h-8 text-green-500" />
                      </div>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-blue-600">Casual Leave</p>
                          <p className="text-2xl font-bold text-blue-700">{leaveData.balances?.Casual || 0} days</p>
                        </div>
                        <Coffee className="w-8 h-8 text-blue-500" />
                      </div>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-purple-600">Earned Leave</p>
                          <p className="text-2xl font-bold text-purple-700">{leaveData.balances?.Earned || 0} days</p>
                        </div>
                        <Award className="w-8 h-8 text-purple-500" />
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-800">Leave Requests</h3>
                      <button
                        onClick={() => setShowApplyModal(true)}
                        className="flex items-center space-x-2 bg-emerald-500 text-white py-2 px-4 rounded-lg hover:bg-emerald-600 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Apply for Leave</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {leaveData.leaves?.length > 0 ? (
                        leaveData.leaves.map((leave: any) => (
                          <div key={leave._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                            <div>
                              <div className="flex items-center space-x-3">
                                <span className="font-medium">{leave.type}</span>
                                <span className={`px-2 py-1 rounded-full text-xs ${leave.status === 'Approved' ? 'bg-green-100 text-green-700' :
                                  leave.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-red-100 text-red-700'
                                  }`}>
                                  {leave.status}
                                </span>
                              </div>
                              <p className="text-sm text-gray-500 mt-1">
                                {leave.startDate} to {leave.endDate} ({leave.days} days) - {leave.reason}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              {leave.status === 'Pending' && (
                                <>
                                  <button
                                    onClick={() => handleCancelLeave(leave._id)}
                                    className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200 transition-colors"
                                  >
                                    Cancel
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-500">No leave history found.</div>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">AI Leave Suggestions</h3>
                  <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-4 rounded-lg border border-emerald-100 mb-6">
                    <div className="flex items-start space-x-3">
                      <Brain className="w-5 h-5 text-emerald-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-emerald-800">Smart Leave Planning</p>
                        <p className="text-sm text-emerald-600 mt-1">
                          Based on your balance and team calendar, consider taking leave on Feb 12-14 for optimal coverage.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-700 mb-3">Upcoming Holidays</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between py-2 border-b">
                        <span className="text-gray-600">New Year's Day</span>
                        <span className="font-medium">Jan 1</span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b">
                        <span className="text-gray-600">Spring Festival</span>
                        <span className="font-medium">Feb 10-12</span>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <span className="text-gray-600">Labor Day</span>
                        <span className="font-medium">May 1</span>
                      </div>
                    </div>
                  </div>

                  <button className="w-full mt-4 flex items-center justify-center space-x-2 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors">
                    <Calendar className="w-4 h-4" />
                    <span>View Holiday Calendar</span>
                  </button>
                </div>
              </div>
            )}

            {/* Apply Leave Modal */}
            {showApplyModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl p-6 w-full max-w-md">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Apply for Leave</h3>
                    <button onClick={() => setShowApplyModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                  </div>
                  <form onSubmit={(e) => {
                    handleApplyLeave(e);
                    setShowApplyModal(false);
                  }}>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type</label>
                        <select
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={leaveForm.type}
                          onChange={(e) => setLeaveForm({ ...leaveForm, type: e.target.value })}
                        >
                          <option value="Sick">Sick Leave</option>
                          <option value="Casual">Casual Leave</option>
                          <option value="Earned">Earned Leave</option>
                          <option value="Unpaid">Unpaid Leave</option>
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                          <input
                            type="date"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            value={leaveForm.startDate}
                            onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                            required
                            min={new Date().toISOString().split('T')[0]}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                          <input
                            type="date"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            value={leaveForm.endDate}
                            onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                            required
                            min={new Date().toISOString().split('T')[0]}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                        <textarea
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                          rows={3}
                          value={leaveForm.reason}
                          onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                          required
                        ></textarea>
                      </div>
                      <button type="submit" className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                        Submit Application
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        );

      case 'ai-chat':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-[600px] grid grid-cols-1 lg:grid-cols-3">
            <div className="lg:col-span-2 flex flex-col border-r border-gray-100">
              <div className="p-4 border-b flex items-center justify-between bg-blue-50 rounded-tl-xl">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Brain className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">NOVA AI Agent</h3>
                    <p className="text-xs text-blue-600">Powered by Local NLP • Trained on HR Policies</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.sender === 'bot' && (
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                        <Brain className="w-4 h-4 text-blue-600" />
                      </div>
                    )}
                    <div className={`max-w-[80%] p-3 rounded-xl shadow-sm ${msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                      }`}>
                      <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                      <Brain className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 rounded-bl-none">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 bg-white border-t rounded-bl-xl">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                    placeholder="Ask me anything (e.g., 'Apply for sick leave tomorrow due to fever')..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSendMessage(e);
                    }}
                  />
                  <button
                    onClick={handleSendMessage}
                    className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                    disabled={isTyping}
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-xs text-center text-gray-400 mt-2">
                  The AI Agent can apply for leave on your behalf. Try: "Apply for sick leave tomorrow".
                </p>
              </div>
            </div>

            <div className="p-6 overflow-y-auto">
              <h3 className="font-semibold text-gray-800 mb-4">Quick Questions</h3>
              <div className="space-y-3">
                {aiChatSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setInputMessage(suggestion);
                      // Optional: You could auto-focus the input here if you had a ref to it
                    }}
                    className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>

              <div className="mt-8">
                <h3 className="font-semibold text-gray-800 mb-4">Capabilities</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <CheckSquare className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm text-gray-600">Leave & Attendance Queries</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckSquare className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm text-gray-600">Policy Explanation</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckSquare className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm text-gray-600">Onboarding Help</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckSquare className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm text-gray-600">Escalation to HR</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'performance':
        return (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Performance & Appraisal</h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg p-6 text-white">
                    <h3 className="text-lg font-bold mb-2">Current Rating</h3>
                    <div className="flex items-end space-x-2">
                      <span className="text-4xl font-bold">4.2</span>
                      <span className="text-lg opacity-90">/ 5.0</span>
                    </div>
                    <div className="flex items-center mt-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className={`w-5 h-5 ${star <= 4 ? 'fill-current' : ''}`} />
                      ))}
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg p-6 text-white">
                    <h3 className="text-lg font-bold mb-2">Goal Completion</h3>
                    <div className="flex items-end space-x-2">
                      <span className="text-4xl font-bold">75%</span>
                      <span className="text-lg opacity-90">On Track</span>
                    </div>
                    <p className="mt-2 text-sm opacity-90">3 of 4 goals completed this quarter</p>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-800 mb-4">Goals & KPIs</h3>
                <div className="space-y-4">
                  {goals.map((goal) => (
                    <div key={goal.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900">{goal.title}</h4>
                          <p className="text-sm text-gray-500">{goal.kpi} • Due: {goal.dueDate}</p>
                        </div>
                        <span className="text-lg font-bold text-blue-600">{goal.progress}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500" style={{ width: `${goal.progress}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">AI Performance Insights</h3>
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-100">
                    <div className="flex items-start space-x-3">
                      <Brain className="w-5 h-5 text-purple-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-purple-800">Strength Areas</p>
                        <p className="text-sm text-purple-600 mt-1">Excellent technical skills and project delivery. Consider mentoring junior team members.</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-100">
                    <div className="flex items-start space-x-3">
                      <Target className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-blue-800">Improvement Suggestions</p>
                        <p className="text-sm text-blue-600 mt-1">Focus on improving presentation skills. Recommended training: "Effective Communication"</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="font-medium text-gray-700 mb-3">Recent Feedback</h4>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">From Manager</p>
                          <p className="text-sm text-gray-600">Great work on the Q4 project! Excellent technical implementation.</p>
                          <p className="text-xs text-gray-400 mt-1">2 weeks ago</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button className="w-full mt-4 flex items-center justify-center space-x-2 bg-emerald-500 text-white py-2 px-4 rounded-lg hover:bg-emerald-600 transition-colors">
                    <FileCheck className="w-4 h-4" />
                    <span>Submit Self-Evaluation</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'training':
        return (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Training & Skill Development</h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-6 text-white">
                    <h3 className="text-lg font-bold mb-2">Skill Gap</h3>
                    <div className="flex items-end space-x-2">
                      <span className="text-4xl font-bold">{stats.skillGap}</span>
                      <span className="text-lg opacity-90">skills identified</span>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-lg p-6 text-white">
                    <h3 className="text-lg font-bold mb-2">Learning Progress</h3>
                    <div className="flex items-end space-x-2">
                      <span className="text-4xl font-bold">45%</span>
                      <span className="text-lg opacity-90">completed</span>
                    </div>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-800 mb-4">Recommended Courses</h3>
                <div className="space-y-4">
                  {trainingCourses.map((course) => (
                    <div key={course.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{course.title}</h4>
                          <p className="text-sm text-gray-500">{course.provider} • {course.duration}</p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="w-24">
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${course.progress === 100 ? 'bg-green-500' : course.progress > 50 ? 'bg-blue-500' : 'bg-yellow-500'}`}
                                style={{ width: `${course.progress}%` }}
                              ></div>
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${course.status === 'completed' ? 'bg-green-100 text-green-700' : course.status === 'in-progress' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                            {course.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">AI Learning Path</h3>
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-lg border border-indigo-100 mb-6">
                  <div className="flex items-start space-x-3">
                    <Brain className="w-5 h-5 text-indigo-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-indigo-800">Personalized Recommendations</p>
                      <p className="text-sm text-indigo-600 mt-1">
                        Based on your role and performance, focus on: Leadership, Advanced React, Data Analytics
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="font-medium text-gray-700 mb-3">Skills Assessment</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-600">React.js</span>
                        <span className="text-sm font-medium text-gray-900">90%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500" style={{ width: '90%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-600">Leadership</span>
                        <span className="text-sm font-medium text-gray-900">70%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500" style={{ width: '70%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-600">Communication</span>
                        <span className="text-sm font-medium text-gray-900">60%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-yellow-500" style={{ width: '60%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                <button className="w-full flex items-center justify-center space-x-2 bg-purple-500 text-white py-2 px-4 rounded-lg hover:bg-purple-600 transition-colors">
                  <Upload className="w-4 h-4" />
                  <span>Upload Certifications</span>
                </button>
              </div>
            </div>
          </div>
        );

      case 'salary':
        return (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Salary & Payslip (Demo Data)</h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-800">Academic Project Notice</p>
                  <p className="text-sm text-yellow-600 mt-1">
                    This section contains mock data for demonstration purposes only.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg p-6 text-white mb-6">
                  <h3 className="text-lg font-bold mb-2">Current Month Salary</h3>
                  <div className="flex items-end space-x-2">
                    <span className="text-4xl font-bold">$8,500</span>
                    <span className="text-lg opacity-90">Net Amount</span>
                  </div>
                  <p className="mt-2 text-sm opacity-90">Paid on January 31, 2024</p>
                </div>

                <h3 className="text-lg font-semibold text-gray-800 mb-4">Salary Structure</h3>
                <div className="space-y-3">
                  {[
                    { name: 'Basic Salary', amount: 5000 },
                    { name: 'House Rent Allowance', amount: 2000 },
                    { name: 'Special Allowance', amount: 1000 },
                    { name: 'Performance Bonus', amount: 500 },
                    { name: 'Tax Deduction', amount: -800 },
                    { name: 'Provident Fund', amount: -600 },
                    { name: 'Health Insurance', amount: -200 },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between py-3 border-b">
                      <span className="text-gray-600">{item.name}</span>
                      <span className={`font-medium ${item.amount < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                        ${Math.abs(item.amount)} {item.amount < 0 ? '-' : '+'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Payslips</h3>
                <div className="space-y-3">
                  {[
                    { month: 'December 2023', amount: 8500, status: 'Paid' },
                    { month: 'November 2023', amount: 8200, status: 'Paid' },
                    { month: 'October 2023', amount: 8500, status: 'Paid' },
                    { month: 'September 2023', amount: 8000, status: 'Paid' },
                  ].map((payslip, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{payslip.month}</span>
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                          {payslip.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Net Amount</span>
                        <span className="font-bold text-gray-900">${payslip.amount}</span>
                      </div>
                      <button className="w-full mt-3 flex items-center justify-center space-x-2 text-blue-600 hover:text-blue-700 text-sm">
                        <Eye className="w-4 h-4" />
                        <span>View Details</span>
                      </button>
                    </div>
                  ))}
                </div>

                <button className="w-full mt-6 flex items-center justify-center space-x-2 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors">
                  <Download className="w-4 h-4" />
                  <span>Download All Payslips</span>
                </button>
              </div>
            </div>
          </div>
        );

      case 'policies':
        return (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Policy & Compliance Center</h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search policies..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors">
                    Search with AI
                  </button>
                </div>

                <h3 className="text-lg font-semibold text-gray-800 mb-4">Company Policies</h3>
                <div className="space-y-3">
                  {policies.map((policy) => (
                    <div key={policy.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{policy.title}</h4>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-sm text-gray-500">{policy.category}</span>
                            <span className="text-sm text-gray-500">Updated: {policy.lastUpdated}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button className="p-2 text-gray-500 hover:text-emerald-600">
                            <Eye className="w-5 h-5" />
                          </button>
                          <button className="p-2 text-gray-500 hover:text-blue-600">
                            <Download className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6">
                  <h4 className="font-medium text-gray-700 mb-3">Compliance Checklist</h4>
                  <div className="space-y-2">
                    {[
                      { task: 'Code of Conduct Acknowledgment', completed: true },
                      { task: 'Data Privacy Training', completed: true },
                      { task: 'Annual Security Training', completed: false },
                      { task: 'Diversity & Inclusion Course', completed: true },
                    ].map((item, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        {item.completed ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <Clock className="w-5 h-5 text-yellow-500" />
                        )}
                        <span className={item.completed ? 'text-gray-600' : 'text-gray-900'}>{item.task}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">AI Policy Assistant</h3>
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-100 mb-6">
                  <div className="flex items-start space-x-3">
                    <Brain className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-800">Ask AI About Policies</p>
                      <p className="text-sm text-blue-600 mt-1">
                        Use natural language to understand complex policies and compliance requirements.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="font-medium text-gray-700 mb-3">Quick Access</h4>
                  <div className="space-y-2">
                    <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      Employee Handbook
                    </button>
                    <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      Leave Policy
                    </button>
                    <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      Remote Work Guidelines
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-700 mb-3">Acknowledgment Status</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Policies Read</span>
                      <span className="font-medium">12/15</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{ width: '80%' }}></div>
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
            {/* Welcome Header */}
            <div className="bg-gradient-to-r from-emerald-500 to-green-500 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="text-2xl font-bold mb-2">Welcome back, {userData?.name || 'Employee'}! 👋</h1>
                  <p className="text-emerald-100">Here's what's happening with your work today.</p>
                </div>
                <div className="mt-4 md:mt-0 flex items-center space-x-4">
                  <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                    <Award className="w-5 h-5" />
                    <span className="font-semibold">Productivity: {stats.productivityScore}%</span>
                  </div>
                  <div className={`px-4 py-2 rounded-lg ${attendanceStatus === 'present' ? 'bg-green-500/80' : attendanceStatus === 'absent' ? 'bg-red-500/80' : 'bg-yellow-500/80'}`}>
                    <span className="font-semibold">{attendanceStatus.toUpperCase()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Completed Tasks</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.completedTasks}</p>
                  </div>
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-emerald-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm text-emerald-600">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  <span>+12% from last week</span>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Leave Balance</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.leaveBalance}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4 text-sm text-blue-600 font-medium">
                  <span>Sick: 7 | Casual: 5</span>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Work-Life Balance</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.workLifeBalance}%</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Scale className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <div className="mt-4 text-sm text-purple-600 font-medium">
                  {stats.workLifeBalance > 75 ? 'Excellent Balance' : 'Good Balance'}
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Pending Approvals</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.pendingApprovals}</p>
                  </div>
                  <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-amber-600" />
                  </div>
                </div>
                <div className="mt-4 text-sm text-amber-600 font-medium">
                  Needs attention
                </div>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Tasks & AI Insights */}
              <div className="lg:col-span-2 space-y-6">
                {/* Tasks Section */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Your Tasks</h2>
                    <button className="text-emerald-600 hover:text-emerald-700 font-medium text-sm">
                      View All →
                    </button>
                  </div>

                  <div className="space-y-4">
                    {tasks.map((task) => (
                      <div key={task.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className={`w-3 h-3 rounded-full ${task.priority === 'high' ? 'bg-red-500' : task.priority === 'medium' ? 'bg-amber-500' : 'bg-blue-500'}`}></div>
                          <div>
                            <h3 className="font-medium text-gray-900">{task.title}</h3>
                            <div className="flex items-center space-x-3 text-sm text-gray-500">
                              <span>Due: {task.due}</span>
                              <span>•</span>
                              <span>{task.project}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          {task.status === 'completed' ? (
                            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                              Completed
                            </span>
                          ) : (
                            <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-emerald-50 hover:text-emerald-700 transition-colors">
                              Mark Complete
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Insights Section */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">AI Insights & Recommendations</h2>
                    <Brain className="w-6 h-6 text-indigo-600" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <div className="flex items-center space-x-3 mb-3">
                        <Thermometer className="w-5 h-5 text-amber-500" />
                        <span className="font-medium text-gray-900">Burnout Risk</span>
                      </div>
                      <p className="text-sm text-gray-600">Low risk detected. Your work patterns show good balance.</p>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <div className="flex items-center space-x-3 mb-3">
                        <TrendingUp className="w-5 h-5 text-emerald-500" />
                        <span className="font-medium text-gray-900">Productivity Tips</span>
                      </div>
                      <p className="text-sm text-gray-600">Schedule deep work sessions in the morning for optimal focus.</p>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <div className="flex items-center space-x-3 mb-3">
                        <Sun className="w-5 h-5 text-blue-500" />
                        <span className="font-medium text-gray-900">Work-Life Score</span>
                      </div>
                      <p className="text-sm text-gray-600">Your current score is 78/100. Consider taking breaks every 90 minutes.</p>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <div className="flex items-center space-x-3 mb-3">
                        <Target className="w-5 h-5 text-purple-500" />
                        <span className="font-medium text-gray-900">Skill Development</span>
                      </div>
                      <p className="text-sm text-gray-600">2 skill gaps identified. Check Training section for recommendations.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Recent Activities & Notifications */}
              <div className="space-y-6">
                {/* Notifications */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
                    <Bell className="w-5 h-5 text-gray-500" />
                  </div>

                  <div className="space-y-4">
                    {notifications.map((notification) => (
                      <div key={notification.id} className={`p-3 rounded-lg ${notification.read ? 'bg-gray-50' : 'bg-blue-50'} border ${notification.read ? 'border-gray-200' : 'border-blue-200'}`}>
                        <div className="flex items-start space-x-3">
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          )}
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{notification.title}</p>
                            <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                            <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-gradient-to-br from-emerald-50 to-white rounded-xl p-6 border border-emerald-100">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>

                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => setActiveSection('ai-chat')} className="flex flex-col items-center justify-center p-4 bg-white rounded-lg border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 transition-colors">
                      <MessageCircle className="w-6 h-6 text-gray-600 mb-2" />
                      <span className="text-sm font-medium text-gray-700">AI Assistant</span>
                    </button>

                    <button onClick={() => setActiveSection('leave')} className="flex flex-col items-center justify-center p-4 bg-white rounded-lg border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 transition-colors">
                      <Calendar className="w-6 h-6 text-gray-600 mb-2" />
                      <span className="text-sm font-medium text-gray-700">Apply Leave</span>
                    </button>

                    <button onClick={() => setActiveSection('training')} className="flex flex-col items-center justify-center p-4 bg-white rounded-lg border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 transition-colors">
                      <GraduationCap className="w-6 h-6 text-gray-600 mb-2" />
                      <span className="text-sm font-medium text-gray-700">Training</span>
                    </button>

                    <button onClick={() => setActiveSection('policies')} className="flex flex-col items-center justify-center p-4 bg-white rounded-lg border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 transition-colors">
                      <ShieldCheck className="w-6 h-6 text-gray-600 mb-2" />
                      <span className="text-sm font-medium text-gray-700">Policies</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        );

      case 'projects':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">My Projects</h2>

            {/* Project Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg shadow-blue-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                    <Briefcase className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm font-medium bg-white bg-opacity-20 px-2 py-1 rounded">Total</span>
                </div>
                <h3 className="text-3xl font-bold text-white mb-1">{myProjects.length}</h3>
                <p className="text-blue-100 text-sm">Assigned Projects</p>
              </div>

              <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl p-6 text-white shadow-lg shadow-emerald-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm font-medium bg-white bg-opacity-20 px-2 py-1 rounded">Completed</span>
                </div>
                <h3 className="text-3xl font-bold text-white mb-1">
                  {myProjects.filter(p => p.status === 'Completed').length}
                </h3>
                <p className="text-emerald-100 text-sm">Successfully Finished</p>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg shadow-purple-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm font-medium bg-white bg-opacity-20 px-2 py-1 rounded">Active</span>
                </div>
                <h3 className="text-3xl font-bold text-white mb-1">
                  {myProjects.filter(p => p.status === 'In Progress' || p.status === 'Pending').length}
                </h3>
                <p className="text-purple-100 text-sm">Ongoing Tasks</p>
              </div>
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {myProjects.length > 0 ? (
                myProjects.map((project) => (
                  <div key={project._id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300 overflow-hidden group">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className={`p-3 rounded-xl ${project.status === 'Completed' ? 'bg-green-50 text-green-600' :
                          project.status === 'In Progress' ? 'bg-blue-50 text-blue-600' :
                            'bg-yellow-50 text-yellow-600'
                          }`}>
                          <Briefcase className="w-6 h-6" />
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${project.status === 'Completed' ? 'bg-green-100 text-green-700' :
                          project.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                          {project.status}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">{project.title}</h3>
                      <p className="text-sm text-blue-600 font-medium mb-3">{project.role}</p>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{project.description}</p>

                      <div className="flex items-center justify-between text-xs text-gray-500 border-t pt-4">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>Due: {new Date(project.deadline).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <User className="w-4 h-4" />
                          <span>By: {project.assignedBy?.name || 'HR'}</span>
                        </div>
                      </div>

                      {project.feedback && (
                        <div className="mt-4 bg-gray-50 p-3 rounded-lg text-xs text-gray-600 border border-gray-100">
                          <span className="font-semibold block mb-1">Status Update:</span>
                          {project.feedback}
                        </div>
                      )}
                    </div>

                    <div className="bg-gray-50 px-6 py-3 border-t border-gray-100">
                      <button
                        onClick={() => setProjectUpdateModal({
                          show: true,
                          project: project,
                          status: project.status,
                          feedback: project.feedback || ''
                        })}
                        className="w-full flex items-center justify-center space-x-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                      >
                        <span>Update Progress</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-gray-200 border-dashed">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <Briefcase className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">No Projects Assigned</h3>
                  <p className="text-gray-500 mt-1">You don't have any active projects at the moment.</p>
                </div>
              )}
            </div>

            {/* Project Update Modal - Enhanced */}
            {projectUpdateModal.show && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl transform transition-all">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Update Status</h3>
                      <p className="text-sm text-gray-500 mt-1">{projectUpdateModal.project?.title}</p>
                    </div>
                    <button onClick={() => setProjectUpdateModal({ ...projectUpdateModal, show: false })} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600">✕</button>
                  </div>
                  <form onSubmit={handleUpdateProjectStatus}>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Current Status</label>
                        <div className="relative">
                          <select
                            className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none font-medium text-gray-700"
                            value={projectUpdateModal.status}
                            onChange={(e) => setProjectUpdateModal({ ...projectUpdateModal, status: e.target.value })}
                          >
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                            <option value="On Hold">On Hold</option>
                          </select>
                          <ChevronRight className="absolute right-4 top-1/2 transform -translate-y-1/2 rotate-90 text-gray-400 pointer-events-none w-4 h-4" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Progress Notes</label>
                        <textarea
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          rows={4}
                          value={projectUpdateModal.feedback}
                          onChange={(e) => setProjectUpdateModal({ ...projectUpdateModal, feedback: e.target.value })}
                          placeholder="Share your progress, blockers, or completion notes..."
                        ></textarea>
                      </div>
                      <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-200 hover:shadow-blue-300 transform hover:-translate-y-0.5">
                        Save Updates
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        );
    }
  };

  // Sidebar navigation items
  const navItems = [
    { id: 'overview', label: 'Dashboard', icon: Home },
    { id: 'projects', label: 'My Projects', icon: CheckSquare },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'attendance', label: 'Attendance', icon: CalendarDays },
    { id: 'leave', label: 'Leave Management', icon: Briefcase },
    { id: 'ai-chat', label: 'AI Assistant', icon: MessageCircle, highlight: true },
    { id: 'performance', label: 'Performance', icon: Target },
    { id: 'training', label: 'Training', icon: GraduationCap },
    { id: 'salary', label: 'Salary & Payslip', icon: DollarSign },
    { id: 'policies', label: 'Policies', icon: ShieldCheck },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <DashboardLayout
      role="employee"
      userName={userData?.name || 'Employee'}
      userEmail={userData?.email || ''}
    >
      <div className="flex">
        {/* Sidebar Navigation */}
        <div className="w-64 flex-shrink-0 bg-white border-r border-gray-200 min-h-screen p-4">
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Employee Portal</h2>
            <p className="text-sm text-gray-500">Self-service HR management</p>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${activeSection === item.id
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'text-gray-700 hover:bg-gray-50'
                    } ${item.highlight ? 'bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200' : ''}`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-5 h-5 ${activeSection === item.id ? 'text-emerald-600' : 'text-gray-500'}`} />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  {item.highlight && (
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  )}
                </button>
              );
            })}

            <div className="pt-4 mt-4 border-t">
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </nav>

          <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
            <div className="flex items-center space-x-3 mb-2">
              <Zap className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-800">Quick Stats</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-blue-700">Productivity</span>
                <span className="text-sm font-medium">{stats.productivityScore}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-blue-700">Work-Life Balance</span>
                <span className="text-sm font-medium">{stats.workLifeBalance}%</span>
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
                <span className="font-medium text-gray-700">Employee Dashboard</span>
                <ChevronRight className="w-4 h-4" />
                <span className="capitalize">{activeSection.replace('-', ' ')}</span>
              </div>

              <div className="flex items-center space-x-4">
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <Bell className="w-5 h-5 text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <HelpCircle className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Render Active Section */}
            {renderSection()}

            {/* Footer Note */}
            <div className="text-center text-sm text-gray-500 pt-4">
              <p>Employee Self-Service Portal • AI-Powered HR Management • Academic Project</p>
              <p className="mt-1">For demonstration purposes only. All data is mock data.</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EmployeeDashboard;