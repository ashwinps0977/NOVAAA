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
  Download,
  HelpCircle,
  Heart,
  Coffee,
  Brain,
  AlertCircle,
  CheckSquare,
  FileCheck,
  ShieldCheck,

  Send,
  Star
} from 'lucide-react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import SalarySection from '../components/dashboard/SalarySection';
import TrainingSection from '../components/dashboard/TrainingSection';
import SettingsSection from '../components/dashboard/SettingsSection';
import PoliciesSection from '../components/dashboard/PoliciesSection';

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

  // Stats State
  const [stats, setStats] = useState({
    completedTasks: 0,
    pendingTasks: 8,
    productivityScore: 87,
    leaveBalance: 5,
    pendingApprovals: 0,
    skillGap: 2
  });

  // Dynamic Data State
  const [tasks, setTasks] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);

  // Attendance State
  const [attendanceData, setAttendanceData] = useState<any>(null);
  const [attendanceLoading, setAttendanceLoading] = useState(false);

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

  // Projects State
  const [myProjects, setMyProjects] = useState<any[]>([]);
  const [projectUpdateModal, setProjectUpdateModal] = useState<{ show: boolean; project: any; status: string; feedback: string }>({
    show: false,
    project: null,
    status: '',
    feedback: ''
  });

  // Live Timer State
  const [elapsedTime, setElapsedTime] = useState('00:00:00');

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



  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:5000/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUserData(data.user);
        // Update local storage to keep it fresh
        localStorage.setItem('user', JSON.stringify(data.user));
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setUserData(user);
    }
    // Always fetch fresh data on mount
    fetchUserProfile();
  }, []);

  // Dynamic Data State


  // Fetch Functions
  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/tasks/my-tasks', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        const allTasks = data.tasks || [];
        setTasks(allTasks);

        // Update Stats
        const completedCount = allTasks.filter((t: any) => t.status === 'completed').length;
        setStats(prev => ({
          ...prev,
          completedTasks: completedCount
        }));
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const fetchGoals = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/goals/my-goals', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setGoals(data.goals || []);
      }
    } catch (error) {
      console.error('Error fetching goals:', error);
    }
  };


  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/tasks/${taskId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        fetchTasks(); // Refresh
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };








  const aiChatSuggestions = [
    "How many sick leaves do I have?",
    "What is the maternity leave policy?",
    "Explain the attendance policy",
    "How to apply for leave?"
  ];



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
      fetchLeaves();
    }
  }, [activeSection]);

  // Live Timer Effect
  useEffect(() => {
    if (!attendanceData?.today?.checkIn || attendanceData?.today?.checkOut) {
      setElapsedTime('00:00:00');
      return;
    }

    const updateTimer = () => {
      const checkInTime = new Date(attendanceData.today.checkIn);
      const now = new Date();
      const diff = now.getTime() - checkInTime.getTime();

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setElapsedTime(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    };

    updateTimer(); // Initial call
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [attendanceData]);



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



  async function fetchLeaves() {
    try {
      setLeaveLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/leave/my-leaves', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setLeaveData(data);

        // Update Pending Approvals Stats
        if (data.leaves && Array.isArray(data.leaves)) {
          const pendingCount = data.leaves.filter((l: any) => l.status === 'Pending').length;
          setStats(prev => ({
            ...prev,
            pendingApprovals: pendingCount,
            leaveBalance: data.balances ? (data.balances.Sick + data.balances.Casual + data.balances.Earned) : prev.leaveBalance // Also update total balance if available
          }));
        }
      }
    } catch (error) {
      console.error('Fetch leaves error:', error);
    } finally {
      setLeaveLoading(false);
    }
  };



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
    let intervalId: any;

    if (activeSection === 'leave') {
      fetchLeaves();
    }
    if (activeSection === 'projects') {
      fetchMyProjects();
    }
    if (activeSection === 'overview') {
      fetchTasks();
      fetchGoals();
      fetchLeaves();
      fetchNotifications();

      // Poll for new tasks and notifications every 15 seconds
      intervalId = setInterval(() => {
        fetchTasks();
        fetchNotifications();
      }, 15000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [activeSection]);

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();

    // Calculate days requested
    const startDate = new Date(leaveForm.startDate);
    const endDate = new Date(leaveForm.endDate);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const daysRequested = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // Check available balance
    const availableBalance = leaveData.balances?.[leaveForm.type] || 0;

    if (daysRequested > availableBalance) {
      alert(`Insufficient ${leaveForm.type} leave balance.\nAvailable: ${availableBalance} days\nRequested: ${daysRequested} days\n\nPlease reduce the duration or choose a different leave type.`);
      return;
    }

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
        setShowApplyModal(false);
        fetchLeaves();
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to submit leave application');
      }
    } catch (error) {
      console.error('Apply leave error:', error);
      alert('Error submitting leave application');
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
      case 'training':
        return <TrainingSection />;
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
                    <span className="font-medium">EMP-{userData?.employeeId ? userData.employeeId.slice(-6).toUpperCase() : userData?.id ? userData.id.slice(-6).toUpperCase() : '000'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">Department</span>
                    <span className="font-medium">{userData?.department || 'Not Assigned'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">Position</span>
                    <span className="font-medium">{userData?.position || 'Not Assigned'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">Joining Date</span>
                    <span className="font-medium">{userData?.joiningDate ? new Date(userData.joiningDate).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-800 mt-6">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-gray-600">{userData?.email || 'employee@company.com'}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-gray-600">{userData?.phone || 'No phone number'}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-gray-600">{userData?.address || 'No address provided'}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Employment Details</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Current Project</span>
                    <span className="text-sm text-blue-600 font-medium">{userData?.project || 'Bench'}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Salary</span>
                    <span className="text-sm text-gray-600">{userData?.salary ? `$${userData.salary}` : 'Confidential'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Status</span>
                    <span className={`px-2 py-0.5 rounded text-xs ${userData?.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100'}`}>
                      {userData?.status?.toUpperCase() || 'ACTIVE'}
                    </span>
                  </div>
                </div>




              </div>
            </div>
          </div>
        );

      case 'attendance':
        const todayRecord = attendanceData?.today;
        const isPresent = !!todayRecord;
        const isCheckedOut = !!todayRecord?.checkOut;

        // Generate calendar days for current month with proper alignment
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();

        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sunday, 1 = Monday...

        // Create array of empty slots for days before the 1st
        const emptySlots = Array.from({ length: firstDayOfMonth }, () => null);

        const calendarDays = Array.from({ length: daysInMonth }, (_, i) => {
          const d = new Date(year, month, i + 1);
          const dateStr = d.toISOString().split('T')[0];
          const record = attendanceData?.history?.find((r: any) => r.date === dateStr);

          let status = 'absent';
          if (record) status = record.status;
          if (d.getDay() === 0 || d.getDay() === 6) status = 'holiday'; // Simple weekend logic
          if (d > new Date()) status = 'future';

          // Dynamic update for today if manually checked in
          if (dateStr === new Date().toISOString().split('T')[0] && isPresent) {
            status = 'present';
          }

          return { date: d, status, record };
        });

        // Combine empty slots and actual days
        const allCalendarCells = [...emptySlots, ...calendarDays];

        const handleCheckIn = async () => {
          try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/attendance/checkin', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            if (response.ok) {
              // alert('Checked in successfully'); // Optional: remove alert for smoother UX
              fetchAttendance();
            } else {
              const data = await response.json();
              alert(data.message || 'Failed to check in');
            }
          } catch (error) {
            console.error('Check in error:', error);
            alert('Error checking in');
          }
        };

        const handleCheckOutLogout = async () => {
          // Call the existing logout function which handles checkout internally if needed
          // But here we specifically want to mark checkout then logout
          try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/attendance/checkout', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });

            if (response.ok) {
              // Redirect to login immediately
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              window.location.href = '/login';
            } else {
              alert('Failed to check out. Please try again.');
            }
          } catch (error) {
            console.error('Check out error:', error);
            alert('Error checking out');
          }
        };

        // Calculate Summary from Calendar Data (Current Month)
        const presentCount = calendarDays.filter(d => d.status === 'present').length;
        const absentCount = calendarDays.filter(d => d.status === 'absent' && d.date < new Date()).length;
        const leaveCount = calendarDays.filter(d => d.status === 'leave').length;
        // Total work days = passed days excluding weekends? Or just present + absent?
        // Let's approximate total work days as days passed in month excluding weekends/holidays if we want accuracy,
        // or just sum of recorded statuses. For now, let's use present + absent.
        const totalWorkDays = presentCount + absentCount;

        return (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Attendance & Leave Management</h2>

            {attendanceLoading || leaveLoading ? (
              <div className="text-center py-10">Loading data...</div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  {/* Today's Status & Action */}
                  <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold mb-2">Today's Attendance</h3>
                        <p className="opacity-90 mb-4">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>

                        <div className="flex items-center space-x-4">
                          <div className={`px-4 py-2 rounded-lg backdrop-blur-md bg-white/20 border border-white/30`}>
                            <span className="font-bold tracking-wide">{isPresent ? 'PRESENT' : 'NOT CHECKED IN'}</span>
                          </div>
                          <div className="text-sm space-y-1">
                            {todayRecord?.checkIn && (
                              <div className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                Check-in: {new Date(todayRecord.checkIn).toLocaleTimeString()}
                              </div>
                            )}
                            {todayRecord?.checkIn && !todayRecord?.checkOut && (
                              <div className="flex items-center font-bold text-lg">
                                <TrendingUp className="w-4 h-4 mr-1 animate-pulse" />
                                Elapsed: {elapsedTime}
                              </div>
                            )}
                            {todayRecord?.checkOut && (
                              <div className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                Check-out: {new Date(todayRecord.checkOut).toLocaleTimeString()}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col space-y-3">
                        {!isPresent && (
                          <button
                            onClick={handleCheckIn}
                            className="px-6 py-3 bg-white text-emerald-700 font-bold rounded-lg hover:bg-emerald-50 transition-all shadow-md flex items-center justify-center transform hover:scale-105"
                          >
                            <CheckCircle className="w-5 h-5 mr-2" />
                            Check In
                          </button>
                        )}

                        {isPresent && !isCheckedOut && (
                          <button
                            onClick={handleCheckOutLogout}
                            className="px-6 py-3 bg-red-500/90 hover:bg-red-600 text-white font-bold rounded-lg transition-all shadow-md flex items-center justify-center backdrop-blur-sm border border-red-400"
                          >
                            <LogOut className="w-5 h-5 mr-2" />
                            Check Out
                          </button>
                        )}

                        {isCheckedOut && (
                          <div className="px-6 py-3 bg-white/20 backdrop-blur-sm rounded-lg text-center font-medium border border-white/30">
                            Checked Out
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Leave Balances Row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-green-50 border border-green-100 rounded-xl p-4 flex items-center justify-between shadow-sm">
                      <div>
                        <p className="text-sm text-green-600 font-medium">Sick Leave</p>
                        <p className="text-2xl font-bold text-green-700">{leaveData.balances?.Sick || 0}</p>
                      </div>
                      <Heart className="w-8 h-8 text-green-400 opacity-80" />
                    </div>
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center justify-between shadow-sm">
                      <div>
                        <p className="text-sm text-blue-600 font-medium">Casual Leave</p>
                        <p className="text-2xl font-bold text-blue-700">{leaveData.balances?.Casual || 0}</p>
                      </div>
                      <Coffee className="w-8 h-8 text-blue-400 opacity-80" />
                    </div>
                    <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 flex items-center justify-between shadow-sm">
                      <div>
                        <p className="text-sm text-purple-600 font-medium">Earned Leave</p>
                        <p className="text-2xl font-bold text-purple-700">{leaveData.balances?.Earned || 0}</p>
                      </div>
                      <Award className="w-8 h-8 text-purple-400 opacity-80" />
                    </div>
                  </div>

                  {/* Calendar View - Redesigned */}
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-bold text-gray-800 flex items-center">
                        <CalendarDays className="w-5 h-5 mr-2 text-emerald-600" />
                        Attendance Calendar
                      </h3>
                      <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">{new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                    </div>

                    <div className="grid grid-cols-7 gap-3 mb-3">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="text-center text-xs font-bold text-gray-400 uppercase tracking-wider">
                          {day}
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-7 gap-3">
                      {allCalendarCells.map((cell, index) => {
                        if (!cell) return <div key={`empty-${index}`} className="aspect-square bg-gray-50/50 rounded-lg"></div>;

                        const day = cell;
                        const dateStr = day.date.toLocaleDateString();
                        const todayStr = new Date().toLocaleDateString();
                        const isToday = dateStr === todayStr;

                        // Refined Styles
                        let cellClass = "bg-white border-gray-100 text-gray-400 hover:border-gray-300"; // default
                        let textClass = "text-gray-500";
                        let statusDot = null;

                        if (day.status === 'present') {
                          cellClass = "bg-emerald-50 border-emerald-200 text-emerald-800 shadow-sm";
                          textClass = "text-emerald-700 font-bold";
                          statusDot = <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mx-auto mt-1"></div>;
                        } else if (day.status === 'absent' && day.date < new Date(new Date().setHours(0, 0, 0, 0))) {
                          cellClass = "bg-red-50 border-red-200 text-red-800";
                          textClass = "text-red-500 font-medium";
                          statusDot = <div className="w-1.5 h-1.5 bg-red-400 rounded-full mx-auto mt-1"></div>;
                        } else if (day.status === 'leave') {
                          cellClass = "bg-amber-50 border-amber-200 text-amber-800";
                          textClass = "text-amber-600 font-medium";
                          statusDot = <div className="w-1.5 h-1.5 bg-amber-400 rounded-full mx-auto mt-1"></div>;
                        } else if (day.status === 'holiday') {
                          cellClass = "bg-indigo-50 border-indigo-200 text-indigo-800";
                          textClass = "text-indigo-500 font-medium";
                        }

                        if (isToday) {
                          cellClass += " ring-2 ring-emerald-400 ring-offset-2 z-10";
                        }

                        return (
                          <div key={index} className={`aspect-square p-1 border rounded-xl flex flex-col items-center justify-center relative transition-all duration-200 ${cellClass}`}>
                            <span className={`text-sm font-medium ${textClass}`}>{day.date.getDate()}</span>
                            <div className="mt-1">
                              {statusDot}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Summary Stats - Calculated from Calendar */}
                  <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2 text-emerald-600" />
                      Monthly Summary
                    </h3>
                    <div className="space-y-5">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 font-medium">Total Work Days</span>
                        <span className="font-bold text-gray-900 text-lg">{attendanceData?.summary?.totalDays || totalWorkDays}</span>
                      </div>
                      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-gray-800 h-full" style={{ width: '100%' }}></div>
                      </div>

                      <div className="flex justify-between items-center mt-2">
                        <span className="text-gray-600 font-medium">Present</span>
                        <span className="font-bold text-emerald-600 text-lg">{presentCount}</span>
                      </div>
                      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full" style={{ width: `${(presentCount / (totalWorkDays || 1)) * 100}%` }}></div>
                      </div>

                      <div className="flex justify-between items-center mt-2">
                        <span className="text-gray-600 font-medium">Absent</span>
                        <span className="font-bold text-red-500 text-lg">{absentCount}</span>
                      </div>
                      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-red-400 h-full" style={{ width: `${(absentCount / (totalWorkDays || 1)) * 100}%` }}></div>
                      </div>

                      <div className="flex justify-between items-center mt-2">
                        <span className="text-gray-600 font-medium">Leaves Taken</span>
                        <span className="font-bold text-amber-500 text-lg">{leaveCount}</span>
                      </div>
                    </div>

                    <button className="w-full mt-8 flex items-center justify-center space-x-2 bg-gray-50 text-gray-700 py-3 px-4 rounded-xl hover:bg-gray-100 transition-colors border border-gray-200 font-semibold" onClick={handleDownloadReport}>
                      <Download className="w-4 h-4" />
                      <span>Download Report</span>
                    </button>
                  </div>

                  {/* Leave Requests */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-800">Leave Requests</h3>
                      <button
                        onClick={() => setShowApplyModal(true)}
                        className="text-sm bg-blue-50 text-blue-600 px-3 py-1.5 rounded-md font-medium hover:bg-blue-100 transition-colors"
                      >
                        + New Request
                      </button>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm max-h-[400px] overflow-y-auto">
                      {leaveData.leaves?.length > 0 ? (
                        <div className="divide-y divide-gray-100">
                          {leaveData.leaves.map((leave: any) => (
                            <div key={leave._id} className="p-4 hover:bg-gray-50 transition-colors">
                              <div className="flex justify-between items-start mb-1">
                                <span className="font-medium text-gray-800 text-sm">{leave.type}</span>
                                <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${leave.status === 'Approved' ? 'bg-green-100 text-green-700' :
                                  leave.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-red-100 text-red-700'
                                  }`}>
                                  {leave.status}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 mb-2">
                                {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                              </p>

                              {leave.status === 'Pending' && (
                                <button
                                  onClick={() => handleCancelLeave(leave._id)}
                                  className="text-xs text-red-600 hover:text-red-800 hover:underline"
                                >
                                  Cancel Request
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-8 text-center text-gray-400 text-sm">
                          No leave history found.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Upcoming Holidays - Compact */}
                  <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Upcoming Holidays</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">New Year's Day</span>
                        <span className="font-medium bg-gray-100 px-2 py-0.5 rounded text-gray-700">Jan 1</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Spring Festival</span>
                        <span className="font-medium bg-gray-100 px-2 py-0.5 rounded text-gray-700">Feb 10</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Labor Day</span>
                        <span className="font-medium bg-gray-100 px-2 py-0.5 rounded text-gray-700">May 1</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Modal remains separate */}
            {
              showApplyModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                  <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl transform transition-all scale-100">
                    <div className="flex items-center justify-between mb-6 border-b pb-3">
                      <h3 className="text-xl font-bold text-gray-900">Apply for Leave</h3>
                      <button onClick={() => setShowApplyModal(false)} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1">
                        <LogOut className="w-5 h-5 rotate-45" /> {/* Close icon */}
                      </button>
                    </div>
                    <form onSubmit={(e) => {
                      handleApplyLeave(e);
                      setShowApplyModal(false);
                    }}>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type</label>
                          <select
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
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
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
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
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
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
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            rows={3}
                            value={leaveForm.reason}
                            onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                            required
                            placeholder="Please explain why you need leave..."
                          ></textarea>
                        </div>
                        <button type="submit" className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md">
                          Submit Application
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )
            }
          </div>
        );

      case 'salary':
        return <SalarySection />;
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
                      {notifications.map((notif) => (
                        <div key={notif.id} className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-1">
                            {notif.type === 'success' ? (
                              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              </div>
                            ) : notif.type === 'warning' ? (
                              <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                                <AlertCircle className="w-4 h-4 text-amber-600" />
                              </div>
                            ) : (
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <Bell className="w-4 h-4 text-blue-600" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">{notif.title}</p>
                            <p className="text-sm text-gray-500">{notif.message}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                          {/* Dot for unread */}
                          {!notif.read && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          )}
                        </div>
                      ))}
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





      case 'policies':
        return <PoliciesSection />;

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
                  <span>Sick: {leaveData.balances?.Sick || 0} | Casual: {leaveData.balances?.Casual || 0}</span>
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
                    <div className="space-y-4">
                      {tasks.map((task) => (
                        <div key={task._id || task.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
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
                              <button
                                onClick={() => handleUpdateTaskStatus(task._id || task.id, 'completed')}
                                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                              >
                                Mark Complete
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                      {tasks.length === 0 && (
                        <div className="text-center py-6 text-gray-500">
                          No tasks assigned yet.
                        </div>
                      )}
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
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <div key={notification._id} className={`p-3 rounded-lg ${notification.read ? 'bg-gray-50' : 'bg-blue-50'} border ${notification.read ? 'border-gray-200' : 'border-blue-200'}`}>
                          <div className="flex items-start space-x-3">
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                            )}
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{notification.title}</p>
                              <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                              <p className="text-xs text-gray-400 mt-1">
                                {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-gray-500 py-4">No notifications yet.</p>
                    )}
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

                    <button onClick={() => setActiveSection('attendance')} className="flex flex-col items-center justify-center p-4 bg-white rounded-lg border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 transition-colors">
                      <Calendar className="w-6 h-6 text-gray-600 mb-2" />
                      <span className="text-sm font-medium text-gray-700">Attendance</span>
                    </button>

                    <button onClick={() => setActiveSection('training')} className="flex flex-col items-center justify-center p-4 bg-white rounded-lg border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 transition-colors">
                      <GraduationCap className="w-6 h-6 text-gray-600 mb-2" />
                      <span className="text-sm font-medium text-gray-700">Training</span>
                    </button>

                    <button onClick={() => setActiveSection('policies')} className="flex flex-col items-center justify-center p-4 bg-white rounded-lg border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 transition-colors">
                      <ShieldCheck className="w-6 h-6 text-gray-600 mb-2" />
                      <span className="text-sm font-medium text-gray-700">Policies</span>
                    </button>

                    <button onClick={() => setActiveSection('salary')} className="flex flex-col items-center justify-center p-4 bg-white rounded-lg border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 transition-colors">
                      <DollarSign className="w-6 h-6 text-gray-600 mb-2" />
                      <span className="text-sm font-medium text-gray-700">Salary</span>
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
      case 'settings':
        return <SettingsSection user={userData} onUpdate={fetchUserProfile} />;
    }
  };

  // Sidebar navigation items
  const navItems = [
    { id: 'overview', label: 'Dashboard', icon: Home },
    { id: 'projects', label: 'My Projects', icon: CheckSquare },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'attendance', label: 'Attendance & Leave', icon: CalendarDays },
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
              <p className="mt-1">Dashboard connected to Live Backend.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Global Apply Leave Modal (Moved from Section) */}
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
    </DashboardLayout>
  );
};

export default EmployeeDashboard;