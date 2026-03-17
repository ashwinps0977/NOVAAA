import { useState, useEffect, useRef } from 'react';
import {
  CheckCircle,
  Clock,
  TrendingUp,
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
  Brain,
  AlertCircle,
  CheckSquare,
  FileCheck,
  ShieldCheck,
  Send,
  Star
} from 'lucide-react';
import { API_BASE_URL } from '../config';
import { useRealTimeSync } from '../hooks/useRealTimeSync';

import DashboardLayout from '../components/dashboard/DashboardLayout';
import SalarySection from '../components/dashboard/SalarySection';
import TrainingSection from '../components/dashboard/TrainingSection';
import SettingsSection from '../components/dashboard/SettingsSection';
import PoliciesSection from '../components/dashboard/PoliciesSection';
import MyWorkGrowthSection from '../components/dashboard/MyWorkGrowthSection';
import EmployeeWorkBoard from '../components/dashboard/employee/EmployeeWorkBoard';

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
  // tasks removed
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
  const [pendingLeaveContext, setPendingLeaveContext] = useState(false);

  // Projects State
  const [myProjects, setMyProjects] = useState<any[]>([]);
  const [myTasks, setMyTasks] = useState<any[]>([]);
  const [projectUpdateModal, setProjectUpdateModal] = useState<{ show: boolean; project: any; status: string; feedback: string; attachments: File[] }>({
    show: false,
    project: null,
    status: '',
    feedback: '',
    attachments: []
  });

  // Live Timer State
  const [elapsedTime, setElapsedTime] = useState('00:00:00');

  // Calendar navigation state — stays within 2026
  const _realNow = new Date();
  const [calViewYear] = useState(2026);
  const [calViewMonth, setCalViewMonth] = useState(_realNow.getFullYear() === 2026 ? _realNow.getMonth() : 0);

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

    if (pendingLeaveContext) {
      setPendingLeaveContext(false);
      const currentForm = { ...leaveForm, reason: userMsg };
      setLeaveForm(currentForm);

      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/leave/apply`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(currentForm)
        });

        if (response.ok) {
          setMessages(prev => [...prev, { sender: 'bot', text: 'Leave application submitted successfully!' }]);
          setLeaveForm({ type: 'General Leave', startDate: '', endDate: '', reason: '' });
          fetchLeaves();
        } else {
          const data = await response.json();
          setMessages(prev => [...prev, { sender: 'bot', text: `Failed to submit leave application: ${data.message || 'Unknown error'}` }]);
        }
      } catch (error) {
        console.error('Apply leave error from AI:', error);
        setMessages(prev => [...prev, { sender: 'bot', text: 'Error submitting leave application.' }]);
      } finally {
        setIsTyping(false);
      }
      return;
    }

    try {
      const token = localStorage.getItem('token');
      // Use standard fetch to backend
      const response = await fetch(`${API_BASE_URL}/ai/chat`, {
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
              ...data.data,
              type: data.data.type || 'Casual'
            }));
            if (data.data.isAutoProcessing) {
              setPendingLeaveContext(true);
            } else {
              setShowApplyModal(true);
            }
          } else {
            setShowApplyModal(true);
          }
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

      const response = await fetch(`${API_BASE_URL}/auth/me`, {
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


  const fetchGoals = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/goals/my-goals`, {
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
      const response = await fetch(`${API_BASE_URL}/notifications`, {
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
      const response = await fetch(`${API_BASE_URL}/attendance/my-history`, {
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
      const response = await fetch(`${API_BASE_URL}/attendance/download-report`, {
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
      const response = await fetch(`${API_BASE_URL}/leave/my-leaves`, {
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
      const response = await fetch(`${API_BASE_URL}/projects/my-projects`, {
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
      const formData = new FormData();
      formData.append('status', projectUpdateModal.status);
      formData.append('feedback', projectUpdateModal.feedback);

      projectUpdateModal.attachments.forEach(file => {
        formData.append('attachments', file);
      });

      const response = await fetch(`${API_BASE_URL}/projects/${projectUpdateModal.project._id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
          // Content-Type is set automatically for FormData
        },
        body: formData
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

  // Real-time Database Synchronization
  useRealTimeSync(['projects', 'tasks'], () => {
    fetchMyProjects();
    fetchMyTasks();
  });
  useRealTimeSync(['notifications'], fetchNotifications);
  useRealTimeSync(['goals'], fetchGoals);
  useRealTimeSync(['leaves'], fetchLeaves);

  useEffect(() => {
    let intervalId: any;

    if (activeSection === 'leave') {
      fetchLeaves();
    }
    if (activeSection === 'projects') {
      fetchMyProjects();
    }
    if (activeSection === 'overview') {
      fetchMyProjects();
      fetchMyTasks();
      fetchGoals();
      fetchLeaves();
      fetchNotifications();

      // Poll for new notifications every 15 seconds
      intervalId = setInterval(() => {
        fetchNotifications();
      }, 15000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [activeSection]);

  // Update stats when data changes
  useEffect(() => {
    // Calculate completed tasks from myTasks
    // (and optionally myProjects if "Tasks" refers to "Project Tasks")
    // For now, let's assume it means assigned tasks.
    if (myTasks.length > 0) {
      const completed = myTasks.filter(t => t.status === 'Completed').length;
      setStats(prev => ({ ...prev, completedTasks: completed }));
    }
  }, [myTasks]);


  const fetchMyTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/tasks/my-tasks`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        // Check structure: { success: true, tasks: [...] } or just array
        if (data.success !== false) {
          setMyTasks(data.tasks || data.data || []);
        }
      }
    } catch (error) {
      console.error('Fetch my tasks error:', error);
    }
  };

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
      const response = await fetch(`${API_BASE_URL}/leave/apply`, {
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
      const response = await fetch(`${API_BASE_URL}/leave/${id}/cancel`, {
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
      await fetch(`${API_BASE_URL}/attendance/checkout`, {
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
      case 'mywork':
        return <EmployeeWorkBoard currentUser={userData} />;
      case 'workgrowth':
        return <MyWorkGrowthSection />;

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

      case 'attendance': {
        const todayRecord = attendanceData?.today;
        const isPresent = !!todayRecord;
        const isCheckedOut = !!todayRecord?.checkOut;

        // Helper: get local date string YYYY-MM-DD without UTC conversion
        const toLocalDateStr = (d: Date) => {
          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          return `${y}-${m}-${day}`;
        };

        // Generate calendar using the viewed month/year (navigable within 2026)
        const now = new Date();
        const year = calViewYear;           // always 2026
        const month = calViewMonth;         // 0-11
        const todayStr = toLocalDateStr(now);

        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDayOfMonth = new Date(year, month, 1).getDay();

        const emptySlots = Array.from({ length: firstDayOfMonth }, () => null);

        // Demo records keyed per-month so each month has its own persistent data
        const DEMO_KEY_MONTH = `nova_demo_attendance_${year}_${String(month + 1).padStart(2, '0')}`;
        const getOrCreateMonthDemoRecords = () => {
          const stored = localStorage.getItem(DEMO_KEY_MONTH);
          if (stored) return JSON.parse(stored);

          // For past/current months: weekdays = present, days 10 & 14 = leave (if weekday)
          // For future months: everything stays empty (will be 'future')
          const records: Record<string, string> = {};
          const leaveCandidates = [10, 14];
          for (let dy = 1; dy <= daysInMonth; dy++) {
            const d = new Date(year, month, dy);
            const ds = toLocalDateStr(d);
            const dow = d.getDay();
            if (dow === 0 || dow === 6) continue; // skip weekends
            if (leaveCandidates.includes(dy)) {
              records[ds] = 'leave';
            } else {
              records[ds] = 'present';
            }
          }
          localStorage.setItem(DEMO_KEY_MONTH, JSON.stringify(records));
          return records;
        };

        const demoRecords = getOrCreateMonthDemoRecords();

        const calendarDays = Array.from({ length: daysInMonth }, (_, i) => {
          const d = new Date(year, month, i + 1);
          const dateStr = toLocalDateStr(d);
          const isTodayDate = dateStr === todayStr;
          const isFuture = d > now && !isTodayDate;
          const dayOfWeek = d.getDay();
          const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

          // Check real attendance API record
          const apiRecord = attendanceData?.history?.find((r: any) => r.date === dateStr);

          let status: string;
          if (isFuture) {
            status = 'future';
          } else if (isTodayDate && isPresent) {
            status = 'present';
          } else if (isTodayDate && !isPresent) {
            status = 'absent';
          } else if (isWeekend) {
            // Weekend — show as absent/future (no special holiday color) but no dot
            status = 'weekend';
          } else if (apiRecord) {
            status = apiRecord.status;
          } else {
            // Fall back to demo data for past weekdays
            status = demoRecords[dateStr] || 'absent';
          }

          return { date: d, status, record: apiRecord };
        });

        const allCalendarCells = [...emptySlots, ...calendarDays];

        const handleCheckIn = async () => {
          try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/attendance/checkin`, {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
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

        const handleCheckOut = async () => {
          try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/attendance/checkout`, {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
              // Force logout after checkout
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

        const presentCount = calendarDays.filter(d => d.status === 'present').length;
        const absentCount = calendarDays.filter(d => d.status === 'absent').length;
        const leaveCount = calendarDays.filter(d => d.status === 'leave').length;
        const totalWorkDays = Math.max(presentCount + absentCount + leaveCount, 1);

        // Leave balance — fixed totals: Sick=5, Casual=5, Total=15
        const SICK_TOTAL = 5;
        const CASUAL_TOTAL = 5;
        const TOTAL_LEAVE = 15;
        const sickUsed = Math.max(0, SICK_TOTAL - Math.max(0, leaveData.balances?.Sick ?? SICK_TOTAL));
        const casualUsed = Math.max(0, CASUAL_TOTAL - Math.max(0, leaveData.balances?.Casual ?? CASUAL_TOTAL));
        const sickLeft = Math.max(0, leaveData.balances?.Sick ?? SICK_TOTAL);
        const casualLeft = Math.max(0, leaveData.balances?.Casual ?? CASUAL_TOTAL);
        const totalUsed = sickUsed + casualUsed;
        const totalLeft = Math.max(0, TOTAL_LEAVE - totalUsed);
        const sickPct = Math.min((sickUsed / SICK_TOTAL) * 100, 100);
        const casualPct = Math.min((casualUsed / CASUAL_TOTAL) * 100, 100);
        const totalPct = Math.min((totalUsed / TOTAL_LEAVE) * 100, 100);
        const ringR = 20; const ringCirc = 2 * Math.PI * ringR;

        return (
          <>
            <style>{`
              @keyframes breathe {
                0%, 100% { box-shadow: 0 0 0 0 rgba(0,207,127,0.5); transform: scale(1); }
                50% { box-shadow: 0 0 0 8px rgba(0,207,127,0); transform: scale(1.04); }
              }
              @keyframes pulse-glow {
                0%, 100% { box-shadow: 0 0 8px 2px rgba(0,207,127,0.35); }
                50% { box-shadow: 0 0 18px 6px rgba(0,207,127,0.15); }
              }
              @keyframes fluid-in { from { width: 0%; } }
              @keyframes fadeSlideUp {
                from { opacity: 0; transform: translateY(10px); }
                to   { opacity: 1; transform: translateY(0); }
              }
              @keyframes today-ring {
                0%, 100% { box-shadow: 0 0 0 2px rgba(0,207,127,0.7), 0 0 14px 4px rgba(0,207,127,0.25); }
                50%       { box-shadow: 0 0 0 4px rgba(0,207,127,0.4), 0 0 22px 8px rgba(0,207,127,0.1); }
              }
              .breathe-badge { animation: breathe 2.5s ease-in-out infinite; }
              .present-glow  { animation: pulse-glow 3s ease-in-out infinite; }
              .today-cell    { animation: today-ring 2.5s ease-in-out infinite; }
              .fluid-bar     { animation: fluid-in 1.2s cubic-bezier(.4,0,.2,1) both; }
              .cal-card-anim { animation: fadeSlideUp 0.45s cubic-bezier(.4,0,.2,1) both; }
              .glass-card {
                background: rgba(255,255,255,0.6);
                backdrop-filter: blur(16px);
                -webkit-backdrop-filter: blur(16px);
                border: 1px solid rgba(255,255,255,0.5);
                border-radius: 20px;
                box-shadow: 0 8px 32px rgba(0,0,0,0.07);
              }
              .cal-cell { position: relative; }
              .cal-tooltip {
                display: none; position: absolute;
                bottom: calc(100% + 8px); left: 50%; transform: translateX(-50%);
                background: #1e1e2e; color: #e2e8f0; font-size: 11px;
                padding: 5px 10px; border-radius: 8px; white-space: nowrap;
                z-index: 60; pointer-events: none;
                box-shadow: 0 4px 16px rgba(0,0,0,0.25);
              }
              .cal-tooltip::after {
                content: ''; position: absolute; top: 100%; left: 50%;
                transform: translateX(-50%); border: 5px solid transparent;
                border-top-color: #1e1e2e;
              }
              .cal-cell:hover .cal-tooltip { display: block; }
              .cal-day-cell {
                transition: transform 0.15s ease, box-shadow 0.15s ease;
              }
              .cal-day-cell:hover {
                transform: translateY(-3px) scale(1.07);
                box-shadow: 0 6px 20px rgba(0,0,0,0.12);
                z-index: 20;
              }
            `}</style>

            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Attendance & Leave Management</h2>

              {attendanceLoading || leaveLoading ? (
                <div className="text-center py-10 text-gray-500">Loading data...</div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* ── LEFT COLUMN ── */}
                  <div className="lg:col-span-2 space-y-6">

                    {/* Today's Attendance Hero Card */}
                    <div className="relative overflow-hidden rounded-2xl p-6 text-white shadow-xl"
                      style={{ background: 'linear-gradient(135deg, #059669 0%, #0d9488 50%, #0891b2 100%)' }}>
                      {/* Decorative blobs */}
                      <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #fff 0%, transparent 70%)' }} />
                      <div className="absolute -bottom-10 -left-6 w-32 h-32 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #00cf7f 0%, transparent 70%)' }} />

                      <div className="relative flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-bold mb-1">Today's Attendance</h3>
                          <p className="text-white/70 text-sm mb-5">
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                          </p>

                          <div className="flex items-center gap-4 flex-wrap">
                            {/* Breathing badge */}
                            <div className={`px-5 py-2 rounded-xl font-bold tracking-widest text-sm ${isPresent && !isCheckedOut
                              ? 'bg-[#00cf7f] text-white breathe-badge'
                              : 'bg-white/20 backdrop-blur-md border border-white/30 text-white'
                              }`}>
                              {isPresent && !isCheckedOut ? '● PRESENT' : isCheckedOut ? '✓ CHECKED OUT' : 'NOT CHECKED IN'}
                            </div>

                            <div className="text-sm space-y-1">
                              {todayRecord?.checkIn && (
                                <div className="flex items-center gap-1 text-white/90">
                                  <Clock className="w-3.5 h-3.5" />
                                  <span>In: {new Date(todayRecord.checkIn).toLocaleTimeString()}</span>
                                </div>
                              )}
                              {todayRecord?.checkIn && !todayRecord?.checkOut && (
                                <div className="flex items-center gap-1 font-bold text-[#00cf7f]">
                                  <TrendingUp className="w-3.5 h-3.5 animate-pulse" />
                                  <span>Elapsed: {elapsedTime}</span>
                                </div>
                              )}
                              {todayRecord?.checkOut && (
                                <div className="flex items-center gap-1 text-white/90">
                                  <Clock className="w-3.5 h-3.5" />
                                  <span>Out: {new Date(todayRecord.checkOut).toLocaleTimeString()}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Action Button */}
                        <div className="flex-shrink-0">
                          {!isPresent || isCheckedOut ? (
                            <button onClick={handleCheckIn}
                              className="px-6 py-3 bg-white text-emerald-700 font-bold rounded-xl hover:bg-emerald-50 transition-all shadow-lg flex items-center gap-2 hover:scale-105 active:scale-95">
                              <CheckCircle className="w-5 h-5" />
                              {isCheckedOut ? 'Check In Again' : 'Check In'}
                            </button>
                          ) : (
                            <button onClick={handleCheckOut}
                              className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-all shadow-lg flex items-center gap-2 hover:scale-105 active:scale-95 border border-red-400/50">
                              <LogOut className="w-5 h-5" />
                              Check Out
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Leave Balance Cards with Progress Rings */}
                    <div className="grid grid-cols-3 gap-4">
                      {/* Sick Leave */}
                      <div className="glass-card p-4 flex items-center gap-4">
                        <svg width="52" height="52" viewBox="0 0 52 52">
                          <circle cx="26" cy="26" r={ringR} fill="none" stroke="#d1fae5" strokeWidth="5" />
                          <circle cx="26" cy="26" r={ringR} fill="none" stroke="#10b981" strokeWidth="5"
                            strokeDasharray={ringCirc}
                            strokeDashoffset={ringCirc - (sickPct / 100) * ringCirc}
                            strokeLinecap="round"
                            transform="rotate(-90 26 26)" />
                          <text x="26" y="30" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#065f46">{sickLeft}</text>
                        </svg>
                        <div>
                          <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wide">Sick</p>
                          <p className="text-lg font-bold text-emerald-800">{sickLeft} left</p>
                          <p className="text-xs text-gray-400">{sickUsed}/{SICK_TOTAL} used</p>
                        </div>
                      </div>

                      {/* Casual Leave */}
                      <div className="glass-card p-4 flex items-center gap-4">
                        <svg width="52" height="52" viewBox="0 0 52 52">
                          <circle cx="26" cy="26" r={ringR} fill="none" stroke="#dbeafe" strokeWidth="5" />
                          <circle cx="26" cy="26" r={ringR} fill="none" stroke="#3b82f6" strokeWidth="5"
                            strokeDasharray={ringCirc}
                            strokeDashoffset={ringCirc - (casualPct / 100) * ringCirc}
                            strokeLinecap="round"
                            transform="rotate(-90 26 26)" />
                          <text x="26" y="30" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#1e40af">{casualLeft}</text>
                        </svg>
                        <div>
                          <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide">Casual</p>
                          <p className="text-lg font-bold text-blue-800">{casualLeft} left</p>
                          <p className="text-xs text-gray-400">{casualUsed}/{CASUAL_TOTAL} used</p>
                        </div>
                      </div>

                      {/* Total Leave Balance */}
                      <div className="glass-card p-4 flex items-center gap-4">
                        <svg width="52" height="52" viewBox="0 0 52 52">
                          <circle cx="26" cy="26" r={ringR} fill="none" stroke="#ede9fe" strokeWidth="5" />
                          <circle cx="26" cy="26" r={ringR} fill="none" stroke="#8b5cf6" strokeWidth="5"
                            strokeDasharray={ringCirc}
                            strokeDashoffset={ringCirc - (totalPct / 100) * ringCirc}
                            strokeLinecap="round"
                            transform="rotate(-90 26 26)" />
                          <text x="26" y="30" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#5b21b6">{totalLeft}</text>
                        </svg>
                        <div>
                          <p className="text-xs text-purple-600 font-semibold uppercase tracking-wide">Total</p>
                          <p className="text-lg font-bold text-purple-800">{totalLeft} left</p>
                          <p className="text-xs text-gray-400">{totalUsed}/{TOTAL_LEAVE} used</p>
                        </div>
                      </div>
                    </div>

                    {/* ── MODERN ATTENDANCE CALENDAR ── */}
                    <div className="cal-card-anim overflow-hidden rounded-2xl shadow-xl" style={{ background: '#fff', border: '1px solid #e2e8f0' }}>

                      {/* ── Header bar ── */}
                      <div className="relative px-5 py-4 overflow-hidden"
                        style={{ background: 'linear-gradient(135deg,#0f172a 0%,#1e293b 60%,#0f4c3a 100%)' }}>
                        {/* decorative circles */}
                        <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full" style={{ background: 'radial-gradient(circle,rgba(0,207,127,0.18) 0%,transparent 70%)' }} />
                        <div className="absolute bottom-0 left-20 w-20 h-20 rounded-full" style={{ background: 'radial-gradient(circle,rgba(99,102,241,0.15) 0%,transparent 70%)' }} />

                        {/* Top row: icon + title + nav */}
                        <div className="relative flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(0,207,127,0.15)', border: '1px solid rgba(0,207,127,0.3)' }}>
                              <CalendarDays className="w-4 h-4" style={{ color: '#00cf7f' }} />
                            </div>
                            <p className="text-white font-bold text-sm tracking-wide">Attendance Calendar</p>
                          </div>

                          {/* Month navigator — 2026 only */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setCalViewMonth(prev => Math.max(0, prev - 1))}
                              disabled={calViewMonth === 0}
                              className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-sm transition-all"
                              style={{ background: calViewMonth === 0 ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.12)', color: calViewMonth === 0 ? '#475569' : '#fff', border: '1px solid rgba(255,255,255,0.1)', cursor: calViewMonth === 0 ? 'not-allowed' : 'pointer' }}>
                              ‹
                            </button>
                            <span className="text-white font-semibold text-sm min-w-[110px] text-center">
                              {new Date(calViewYear, calViewMonth, 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
                            </span>
                            <button
                              onClick={() => setCalViewMonth(prev => Math.min(11, prev + 1))}
                              disabled={calViewMonth === 11}
                              className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-sm transition-all"
                              style={{ background: calViewMonth === 11 ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.12)', color: calViewMonth === 11 ? '#475569' : '#fff', border: '1px solid rgba(255,255,255,0.1)', cursor: calViewMonth === 11 ? 'not-allowed' : 'pointer' }}>
                              ›
                            </button>
                          </div>
                        </div>

                        {/* Legend chips row */}
                        <div className="relative flex items-center gap-2">
                          {[
                            { label: 'Present', color: '#00cf7f', bg: 'rgba(0,207,127,0.15)', border: 'rgba(0,207,127,0.35)' },
                            { label: 'Absent', color: '#f87171', bg: 'rgba(248,113,113,0.15)', border: 'rgba(248,113,113,0.35)' },
                            { label: 'Leave', color: '#a78bfa', bg: 'rgba(167,139,250,0.15)', border: 'rgba(167,139,250,0.35)' },
                            { label: 'Weekend', color: '#94a3b8', bg: 'rgba(148,163,184,0.12)', border: 'rgba(148,163,184,0.25)' },
                          ].map(({ label, color, bg, border }) => (
                            <span key={label} className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold"
                              style={{ background: bg, border: `1px solid ${border}`, color }}>
                              <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: color }} />
                              {label}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* ── Day header row ── */}
                      <div className="grid grid-cols-7 px-4 pt-4 pb-1" style={{ gap: '6px' }}>
                        {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((d, i) => (
                          <div key={i} className="text-center text-[10px] font-bold tracking-widest py-1.5 rounded-lg"
                            style={{ color: (i === 0 || i === 6) ? '#94a3b8' : '#64748b', background: (i === 0 || i === 6) ? '#f8fafc' : 'transparent' }}>
                            {d}
                          </div>
                        ))}
                      </div>

                      {/* ── Calendar grid ── */}
                      <div className="grid grid-cols-7 px-4 pb-4" style={{ gap: '6px' }}>
                        {allCalendarCells.map((cell, index) => {
                          if (!cell) return <div key={`e-${index}`} style={{ height: '52px' }} />;

                          const day = cell;
                          const isToday = toLocalDateStr(day.date) === todayStr;

                          let tooltipText = 'Upcoming';
                          if (day.status === 'leave') tooltipText = day.record?.leaveType ? `Leave: ${day.record.leaveType}` : 'On Leave';
                          else if (day.status === 'present') tooltipText = day.record?.workingHours ? `Present • ${day.record.workingHours}h` : 'Present';
                          else if (day.status === 'absent') tooltipText = 'Absent';
                          else if (day.status === 'weekend') tooltipText = 'Weekend';

                          // Derive visual theme per status
                          type CellTheme = { bg: string; border: string; numColor: string; dot: string | null; dotGlow: string };
                          let theme: CellTheme;
                          if (isToday) {
                            theme = { bg: 'linear-gradient(145deg,#ecfdf5,#d1fae5)', border: '2px solid #00cf7f', numColor: '#047857', dot: '#00cf7f', dotGlow: '0 0 6px rgba(0,207,127,0.8)' };
                          } else if (day.status === 'present') {
                            theme = { bg: 'linear-gradient(145deg,#f0fdf4,#dcfce7)', border: '1.5px solid #86efac', numColor: '#15803d', dot: '#22c55e', dotGlow: '0 0 4px rgba(34,197,94,0.6)' };
                          } else if (day.status === 'absent') {
                            theme = { bg: 'linear-gradient(145deg,#fff5f5,#fee2e2)', border: '1.5px solid #fca5a5', numColor: '#dc2626', dot: '#f87171', dotGlow: '' };
                          } else if (day.status === 'leave') {
                            theme = { bg: 'linear-gradient(145deg,#faf5ff,#ede9fe)', border: '1.5px solid #c4b5fd', numColor: '#7c3aed', dot: '#a78bfa', dotGlow: '0 0 4px rgba(167,139,250,0.6)' };
                          } else if (day.status === 'weekend') {
                            theme = { bg: '#f8fafc', border: '1px solid #e2e8f0', numColor: '#cbd5e1', dot: null, dotGlow: '' };
                          } else {
                            theme = { bg: '#fafafa', border: '1px solid #f1f5f9', numColor: '#94a3b8', dot: null, dotGlow: '' };
                          }

                          const baseClass = `cal-cell cal-day-cell rounded-xl flex flex-col items-center justify-center cursor-default${isToday ? ' today-cell' : day.status === 'present' ? ' present-glow' : ''}`;

                          return (
                            <div key={index} className={baseClass}
                              style={{ height: '52px', background: theme.bg, border: theme.border }}>
                              <span className="text-[13px] font-bold leading-none" style={{ color: theme.numColor }}>
                                {day.date.getDate()}
                              </span>
                              {theme.dot && (
                                <div className="w-1.5 h-1.5 rounded-full mt-1"
                                  style={{ background: theme.dot, boxShadow: theme.dotGlow }} />
                              )}
                              <div className="cal-tooltip">{tooltipText}</div>
                            </div>
                          );
                        })}
                      </div>

                      {/* ── Stats strip ── */}
                      <div className="grid grid-cols-3 divide-x divide-gray-100" style={{ borderTop: '1px solid #f1f5f9' }}>
                        {[
                          { label: 'Present', value: presentCount, color: '#16a34a', bg: '#f0fdf4' },
                          { label: 'Absent', value: absentCount, color: '#dc2626', bg: '#fff5f5' },
                          { label: 'On Leave', value: leaveCount, color: '#7c3aed', bg: '#faf5ff' },
                        ].map(({ label, value, color, bg }) => (
                          <div key={label} className="flex flex-col items-center py-3" style={{ background: bg }}>
                            <span className="text-xl font-extrabold" style={{ color }}>{value}</span>
                            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mt-0.5">{label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* ── RIGHT COLUMN ── */}
                  <div className="space-y-5">

                    {/* Monthly Summary with Gradient Fluid Bars */}
                    <div className="glass-card p-5">
                      <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                        Monthly Summary
                      </h3>
                      <div className="space-y-4">
                        {[
                          { label: 'Total Days', value: totalWorkDays, pct: 100, gradient: 'linear-gradient(90deg,#374151,#6b7280)', color: '#374151' },
                          { label: 'Present', value: presentCount, pct: (presentCount / totalWorkDays) * 100, gradient: 'linear-gradient(90deg,#00cf7f,#0d9488)', color: '#059669' },
                          { label: 'Absent', value: absentCount, pct: (absentCount / totalWorkDays) * 100, gradient: 'linear-gradient(90deg,#f87171,#ef4444)', color: '#dc2626' },
                          { label: 'Leaves', value: leaveCount, pct: (leaveCount / totalWorkDays) * 100, gradient: 'linear-gradient(90deg,#a78bfa,#7c3aed)', color: '#7c3aed' },
                        ].map(({ label, value, pct, gradient, color }) => (
                          <div key={label}>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs font-semibold text-gray-500">{label}</span>
                              <span className="text-sm font-bold" style={{ color }}>{value}</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full overflow-hidden" style={{ height: '8px' }}>
                              <div className="h-full rounded-full fluid-bar" style={{ width: `${Math.min(pct, 100)}%`, background: gradient }} />
                            </div>
                          </div>
                        ))}
                      </div>

                      <button onClick={handleDownloadReport}
                        className="w-full mt-5 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-sm transition-all hover:scale-[1.02] active:scale-95"
                        style={{ background: 'linear-gradient(90deg,#00cf7f,#0d9488)', color: '#fff', boxShadow: '0 4px 14px rgba(0,207,127,0.3)' }}>
                        <Download className="w-4 h-4" />
                        Download Report
                      </button>
                    </div>

                    {/* ── Leave Requests ── */}
                    <div className="overflow-hidden rounded-2xl shadow-lg" style={{ background: '#fff', border: '1px solid #e2e8f0' }}>
                      {/* Header */}
                      <div className="relative px-5 py-4 overflow-hidden"
                        style={{ background: 'linear-gradient(135deg,#1e1b4b 0%,#312e81 60%,#1d4ed8 100%)' }}>
                        <div className="absolute -top-5 -right-5 w-24 h-24 rounded-full" style={{ background: 'radial-gradient(circle,rgba(99,102,241,0.3) 0%,transparent 70%)' }} />
                        <div className="relative flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}>
                              <CalendarDays className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="text-white font-bold text-sm">Leave Requests</p>
                              <p className="text-white/50 text-[10px]">{leaveData.leaves?.length || 0} total requests</p>
                            </div>
                          </div>
                          <button onClick={() => setShowApplyModal(true)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold text-xs transition-all hover:scale-105 active:scale-95"
                            style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: '#fff', backdropFilter: 'blur(8px)' }}>
                            <span className="text-base leading-none">+</span>
                            New Request
                          </button>
                        </div>
                      </div>

                      {/* List */}
                      <div className="max-h-[300px] overflow-y-auto divide-y divide-gray-50">
                        {leaveData.leaves?.length > 0 ? leaveData.leaves.map((leave: any) => {
                          const isApproved = leave.status === 'Approved';
                          const isPending = leave.status === 'Pending';
                          const typeColor = leave.type === 'Sick' ? { dot: '#10b981', bg: '#f0fdf4', text: '#065f46' }
                            : leave.type === 'Casual' ? { dot: '#3b82f6', bg: '#eff6ff', text: '#1e40af' }
                              : { dot: '#8b5cf6', bg: '#faf5ff', text: '#5b21b6' };
                          return (
                            <div key={leave._id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                              {/* Type badge */}
                              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: typeColor.bg }}>
                                <span className="text-xs font-extrabold" style={{ color: typeColor.dot }}>{leave.type.slice(0, 2).toUpperCase()}</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-800">{leave.type} Leave</p>
                                <p className="text-[11px] text-gray-400">
                                  {new Date(leave.startDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })} → {new Date(leave.endDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </p>
                              </div>
                              <div className="flex flex-col items-end gap-1">
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide ${isApproved ? 'bg-emerald-100 text-emerald-700'
                                  : isPending ? 'bg-amber-100 text-amber-700'
                                    : 'bg-red-100 text-red-600'
                                  }`}>{leave.status}</span>
                                {isPending && (
                                  <button onClick={() => handleCancelLeave(leave._id)}
                                    className="text-[10px] text-red-400 hover:text-red-600 transition-colors">
                                    Cancel
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        }) : (
                          <div className="py-10 flex flex-col items-center gap-2">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: '#f1f5f9' }}>
                              <CalendarDays className="w-6 h-6 text-gray-300" />
                            </div>
                            <p className="text-sm text-gray-400 font-medium">No leave requests yet</p>
                            <button onClick={() => setShowApplyModal(true)}
                              className="text-xs text-indigo-500 hover:text-indigo-700 font-semibold">
                              Apply for your first leave →
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Upcoming Holidays */}
                    <div className="glass-card p-5">
                      <h3 className="text-base font-bold text-gray-800 mb-3">Upcoming Holidays</h3>
                      <div className="space-y-2">
                        {[['New Year\'s Day', 'Jan 1'], ['Spring Festival', 'Feb 10'], ['Labor Day', 'May 1']].map(([name, date]) => (
                          <div key={name} className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">{name}</span>
                            <span className="text-xs font-semibold bg-white/70 border border-white/50 px-2 py-0.5 rounded-lg text-gray-700">{date}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Apply Leave Modal ── */}
              {showApplyModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}>
                  <div className="w-full max-w-md overflow-hidden rounded-2xl shadow-2xl" style={{ background: '#fff' }}>

                    {/* Modal header */}
                    <div className="relative px-6 py-5 overflow-hidden"
                      style={{ background: 'linear-gradient(135deg,#1e1b4b 0%,#312e81 55%,#4f46e5 100%)' }}>
                      <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full" style={{ background: 'radial-gradient(circle,rgba(99,102,241,0.35) 0%,transparent 70%)' }} />
                      <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}>
                            <CalendarDays className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="text-white font-bold text-base">Apply for Leave</p>
                            <p className="text-white/50 text-xs">Submit your leave request</p>
                          </div>
                        </div>
                        <button onClick={() => setShowApplyModal(false)}
                          className="w-8 h-8 flex items-center justify-center rounded-xl transition-all hover:bg-white/10"
                          style={{ color: 'rgba(255,255,255,0.6)', fontSize: '18px' }}>✕
                        </button>
                      </div>
                    </div>

                    {/* Modal body */}
                    <form onSubmit={(e) => { handleApplyLeave(e); setShowApplyModal(false); }} className="p-6 space-y-5">

                      {/* Leave type pills */}
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Leave Type</label>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { val: 'Sick', label: 'Sick Leave', emoji: '🤒', left: `${Math.max(0, leaveData.balances?.Sick ?? 5)} days left` },
                            { val: 'Casual', label: 'Casual Leave', emoji: '🏖️', left: `${Math.max(0, leaveData.balances?.Casual ?? 5)} days left` },
                            { val: 'Earned', label: 'Earned Leave', emoji: '⭐', left: 'Accrued' },
                            { val: 'Unpaid', label: 'Unpaid Leave', emoji: '📋', left: 'Unpaid' },
                          ].map(({ val, label, emoji, left }) => (
                            <button type="button" key={val}
                              onClick={() => setLeaveForm({ ...leaveForm, type: val })}
                              className="flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left transition-all"
                              style={{
                                background: leaveForm.type === val ? 'linear-gradient(135deg,#eef2ff,#e0e7ff)' : '#f8fafc',
                                border: leaveForm.type === val ? '2px solid #6366f1' : '1.5px solid #e2e8f0',
                                boxShadow: leaveForm.type === val ? '0 0 0 3px rgba(99,102,241,0.12)' : 'none',
                              }}>
                              <span className="text-lg">{emoji}</span>
                              <div>
                                <p className="text-xs font-bold" style={{ color: leaveForm.type === val ? '#4f46e5' : '#374151' }}>{label}</p>
                                <p className="text-[10px]" style={{ color: leaveForm.type === val ? '#6366f1' : '#94a3b8' }}>{left}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Date range */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">From</label>
                          <input type="date"
                            className="w-full px-3 py-2.5 rounded-xl text-sm font-medium outline-none transition-all"
                            style={{ border: '1.5px solid #e2e8f0', background: '#f8fafc', color: '#1e293b' }}
                            value={leaveForm.startDate}
                            onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                            required min={new Date().toISOString().split('T')[0]} />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">To</label>
                          <input type="date"
                            className="w-full px-3 py-2.5 rounded-xl text-sm font-medium outline-none transition-all"
                            style={{ border: '1.5px solid #e2e8f0', background: '#f8fafc', color: '#1e293b' }}
                            value={leaveForm.endDate}
                            onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                            required min={new Date().toISOString().split('T')[0]} />
                        </div>
                      </div>

                      {/* Reason */}
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Reason</label>
                        <textarea
                          className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none transition-all"
                          style={{ border: '1.5px solid #e2e8f0', background: '#f8fafc', color: '#1e293b', minHeight: '80px' }}
                          value={leaveForm.reason}
                          onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                          required placeholder="Briefly describe your reason..." />
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3 pt-1">
                        <button type="button" onClick={() => setShowApplyModal(false)}
                          className="flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all hover:bg-gray-100"
                          style={{ background: '#f1f5f9', color: '#64748b', border: '1.5px solid #e2e8f0' }}>
                          Cancel
                        </button>
                        <button type="submit"
                          className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white transition-all hover:scale-[1.02] active:scale-95"
                          style={{ background: 'linear-gradient(135deg,#4f46e5,#6366f1)', boxShadow: '0 4px 14px rgba(99,102,241,0.4)' }}>
                          Submit Request
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </>
        );
      }

      case 'salary':
        return <SalarySection userData={userData} />;
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
                      {msg.text.includes('Leave application submitted successfully') && (
                        <button
                          onClick={() => setActiveSection('attendance')}
                          className="mt-3 text-xs bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-200 hover:bg-emerald-100 font-semibold transition-colors flex items-center gap-1"
                        >
                          View Leaves
                        </button>
                      )}
                      {msg.text.includes('Your Assigned Projects') && (
                        <button
                          onClick={() => setActiveSection('projects')}
                          className="mt-3 text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg border border-blue-200 hover:bg-blue-100 font-semibold transition-colors flex items-center gap-1"
                        >
                          View Projects Board
                        </button>
                      )}
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
                  <CheckCircle className="w-4 h-4 mr-1" />
                  <span>All time</span>
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
                {/* My Projects Widget */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">My Projects</h2>
                      <p className="text-xs text-gray-400 mt-0.5">Recently assigned by HR</p>
                    </div>
                    <button
                      onClick={() => setActiveSection('workgrowth')}
                      className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-semibold text-sm transition-colors"
                    >
                      View All <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {myProjects.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 gap-2 text-gray-400">
                        <Briefcase className="w-9 h-9" strokeWidth={1.5} />
                        <p className="text-sm font-semibold">No projects assigned yet</p>
                        <p className="text-xs">Your HR will assign projects here soon.</p>
                      </div>
                    ) : (
                      myProjects.slice(0, 3).map((project) => {
                        const statusMap: Record<string, string> = {
                          Completed: 'bg-emerald-100 text-emerald-700',
                          'In Progress': 'bg-blue-100 text-blue-700',
                          Pending: 'bg-amber-100 text-amber-700',
                          'On Hold': 'bg-orange-100 text-orange-700',
                          Delayed: 'bg-rose-100 text-rose-700',
                        };
                        const pillColor = statusMap[project.status] ?? 'bg-gray-100 text-gray-500';
                        return (
                          <div key={project._id} className="p-4 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all group">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white font-black text-base flex items-center justify-center shrink-0 shadow-lg shadow-indigo-200">
                                  {project.title?.charAt(0) || 'P'}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="font-bold text-gray-900 text-sm">{project.title}</p>
                                  <p className="text-xs text-indigo-500 font-bold uppercase tracking-wider mt-0.5">{project.role || 'Contributor'}</p>
                                  <p className="text-xs text-gray-500 mt-2 line-clamp-2 italic leading-relaxed">
                                    {project.description || 'No description provided.'}
                                  </p>

                                  {/* Progress bar */}
                                  <div className="mt-4">
                                    <div className="flex justify-between items-center mb-1">
                                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Completion</span>
                                      <span className="text-[10px] font-black text-emerald-600 italic">
                                        {project.progressPercentage || 0}%
                                      </span>
                                    </div>
                                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                      <div
                                        className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
                                        style={{ width: `${project.progressPercentage || 0}%` }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-2 shrink-0">
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${pillColor}`}>
                                  {project.status}
                                </span>
                                {project.deadline && (
                                  <span className="text-[10px] text-gray-400 font-bold">
                                    DUE {new Date(project.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                    {myProjects.length > 3 && (
                      <button
                        onClick={() => setActiveSection('workgrowth')}
                        className="w-full text-center text-xs text-indigo-500 font-bold hover:text-indigo-700 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors">
                        +{myProjects.length - 3} more projects → View all in Work & Growth
                      </button>
                    )}
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
                <p className="text-purple-100 text-sm">Active Projects</p>
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
                          feedback: project.feedback || '',
                          attachments: []
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
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Attachments (Files, Code, Photos)</label>
                        <input
                          type="file"
                          multiple
                          className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                          onChange={(e) => {
                            if (e.target.files) {
                              setProjectUpdateModal({ ...projectUpdateModal, attachments: Array.from(e.target.files) });
                            }
                          }}
                        />
                        {projectUpdateModal.attachments.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {projectUpdateModal.attachments.map((file, idx) => (
                              <p key={idx} className="text-xs text-gray-500 truncate">📎 {file.name}</p>
                            ))}
                          </div>
                        )}
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
    { id: 'mywork', label: 'My Work Board', icon: Zap, highlight: true },
    { id: 'projects', label: 'My Projects', icon: CheckSquare },
    { id: 'workgrowth', label: 'Work & Growth', icon: TrendingUp },
    { id: 'attendance', label: 'Attendance & Leave', icon: CalendarDays },
    { id: 'ai-chat', label: 'AI Assistant', icon: MessageCircle, highlight: true },
    { id: 'training', label: 'Training', icon: GraduationCap },
    { id: 'salary', label: 'Salary & Payslip', icon: DollarSign },
    { id: 'policies', label: 'Policies', icon: ShieldCheck },
    { id: 'profile', label: 'Profile', icon: User },
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
        <div className="w-64 flex-shrink-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 min-h-screen p-4 transition-colors duration-300">
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Employee Portal</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Self-service HR management</p>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              const isAttendanceActive = isActive && item.id === 'attendance';
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${isActive
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                    : 'text-gray-700 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    } ${item.highlight ? 'bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/10 dark:to-green-900/10 border border-emerald-200 dark:border-emerald-800' : ''}`}
                  style={isAttendanceActive ? {
                    boxShadow: '0 0 0 1.5px #00cf7f, 0 0 12px 2px rgba(0,207,127,0.25)',
                    background: 'linear-gradient(135deg, rgba(0,207,127,0.08), rgba(13,148,136,0.06))'
                  } : {}}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'}`}
                      style={isAttendanceActive ? { filter: 'drop-shadow(0 0 4px rgba(0,207,127,0.8))' } : {}} />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  {/* Neon indicator for attendance tab */}
                  {isAttendanceActive && (
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full" style={{
                        background: '#00cf7f',
                        boxShadow: '0 0 6px 2px rgba(0,207,127,0.7)',
                        animation: 'breathe 2.5s ease-in-out infinite'
                      }} />
                    </div>
                  )}
                  {item.highlight && !isAttendanceActive && (
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  )}
                </button>
              );
            })}

            <div className="pt-4 mt-4 border-t dark:border-gray-700">
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 p-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
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
              <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <span
                  className="font-medium text-gray-700 dark:text-gray-300 cursor-pointer hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                  onClick={() => setActiveSection('overview')}
                >
                  Employee Dashboard
                </span>
                <ChevronRight className="w-4 h-4" />
                <span className="capitalize text-gray-900 dark:text-white font-semibold">{activeSection.replace('-', ' ')}</span>
              </div>

              <div className="flex items-center space-x-4">
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                  <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                  <HelpCircle className="w-5 h-5 text-gray-600 dark:text-gray-400" />
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