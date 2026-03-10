import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import {
  LogOut, Bell, ChevronRight, Home, Users, UserPlus,
  Calendar, Target, Brain, AlertCircle,
  GraduationCap, ShieldCheck, Settings, Zap,
  Briefcase, FileText, CheckCircle, DollarSign,
  Send, Layers, FolderKanban, Sparkles, X
} from 'lucide-react';
import HRPayrollSection from '../components/dashboard/hr/HRPayrollSection';
import HRSettingsSection from '../components/dashboard/hr/HRSettingsSection';
import PoliciesSection from '../components/dashboard/PoliciesSection';
import HRPerformanceSection from '../components/dashboard/hr/HRPerformanceSection';
import HRAnalyticsSection from '../components/dashboard/hr/HRAnalyticsSection';
import OperationsBoard from '../components/dashboard/hr/OperationsBoard';
import EmployeeManagement from '../components/dashboard/hr/EmployeeManagement';
import WorkforceDevelopmentHub from '../components/dashboard/hr/WorkforceDevelopmentHub';
import { useRealTimeSync } from '../hooks/useRealTimeSync';

const API_BASE_URL = 'http://localhost:5000/api';

const HRDashboard = () => {
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [employees, setEmployees] = useState<any[]>([]);
  const [postedJobs, setPostedJobs] = useState<any[]>([]);
  const [jobApplications, setJobApplications] = useState<any[]>([]);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [showPostJobModal, setShowPostJobModal] = useState(false);
  const [showAIAnalysisModal, setShowAIAnalysisModal] = useState(false);
  const [selectedAIAnalysis, setSelectedAIAnalysis] = useState<any>(null);
  const [showScheduleInterviewModal, setShowScheduleInterviewModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  // AI Chat State
  const [messages, setMessages] = useState<{ sender: 'user' | 'bot', text: string }[]>([
    { sender: 'bot', text: 'Hello! I am your AI HR Assistant. I can provide organizational insights, check headcount, on-leave employees, or explain policies.' }
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

  const [newJob, setNewJob] = useState({
    title: '',
    department: '',
    location: '',
    type: 'full-time',
    experience: 'mid',
    description: '',
    requirements: '',
    salary: '',
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  const [interviewData, setInterviewData] = useState({
    date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '10:00',
    duration: '60',
    interviewer: '',
    mode: 'virtual',
    meetingLink: '',
    notes: ''
  });

  const [rejectionReason, setRejectionReason] = useState('');

  // Project Assignment State
  const [showAssignTaskModal, setShowAssignTaskModal] = useState(false);
  const [taskData, setTaskData] = useState({
    title: '',
    project: 'General',
    priority: 'medium',
    due: new Date().toISOString().split('T')[0]
  });



  // Manual Attendance State
  const [attendanceForm, setAttendanceForm] = useState({
    userId: '',
    date: new Date().toISOString().split('T')[0],
    status: 'present'
  });

  const handleMarkAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!attendanceForm.userId) {
      alert('Please select an employee');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/attendance/hr-mark`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(attendanceForm)
      });

      if (response.ok) {
        alert('Attendance marked successfully');
        setAttendanceForm({ ...attendanceForm, userId: '' });
      } else {
        const error = await response.json();
        alert(`Failed: ${error.message}`);
      }
    } catch (error) {
      console.error('HR mark attendance error:', error);
      alert('Error marking attendance');
    }
  };

  const handleSendMessage = async (e: React.FormEvent | React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMsg = inputMessage;
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const token = localStorage.getItem('token');
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

  const aiChatSuggestions = [
    "What is the total employee headcount?",
    "Who is on leave today?",
    "What is the total annual payroll cost?",
    "Show recruitment status overview",
    "Explain the remote work policy"
  ];

  const navigate = useNavigate();

  const [dashboardStats, setDashboardStats] = useState({
    totalEmployees: 0,
    activeProjects: 0,
    totalDepartments: 0,
    completedProjects: 0
  });

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (activeSection === 'employees') {
      fetchEmployees();
    }
    if (activeSection === 'dashboard') {
      fetchProjects();
      fetchDashboardStats();
    }
    if (activeSection === 'recruitment') {
      loadPostedJobs();
      loadApplications();
    }
    if (activeSection === 'attendance') {
      fetchLeaves();
    }
  }, [activeSection]);

  async function fetchDashboardStats() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/hr-analytics/dashboard-stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setDashboardStats(data.stats);
        }
      }
    } catch (error) {
      console.error('Fetch dashboard stats error:', error);
    }
  }

  const fetchLeaves = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/leave/all`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setLeaves(data.leaves);
      }
    } catch (error) {
      console.error('Fetch leaves error:', error);
    }
  };

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/projects`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setProjects(data.projects || []);
        }
      }
    } catch (error) {
      console.error('Fetch projects error:', error);
    }
  };


  const handleUpdateLeaveStatus = async (id: string, status: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/leave/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (response.ok) {
        fetchLeaves(); // Refresh
      } else {
        alert('Failed to update leave status');
      }
    } catch (error) {
      console.error('Update leave status error:', error);
    }
  };

  const checkAuth = () => {
    setIsLoading(true);

    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (!token || !userStr) {
      navigate('/login');
      return;
    }

    try {
      const user = JSON.parse(userStr);

      const tokenExpiration = localStorage.getItem('tokenExpiration');
      if (tokenExpiration) {
        const expirationTime = parseInt(tokenExpiration);
        if (Date.now() > expirationTime) {
          logout();
          return;
        }
      }

      if (user.role !== 'hr') {
        navigate('/unauthorized');
        return;
      }

      setUserData(user);
      setIsLoading(false);
    } catch (error) {
      console.error('Error parsing user data:', error);
      logout();
    }
  };

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/hr/employees`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const formattedEmployees = (data.employees || []).map((emp: any) => ({
          ...emp,
          joiningDate: new Date(emp.joiningDate).toLocaleDateString(),
          lastLogin: emp.lastLogin ? new Date(emp.lastLogin).toLocaleString() : 'Never'
        }));
        setEmployees(formattedEmployees);
      } else {
        console.error('Failed to fetch employees');
        setEmployees([]);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      setEmployees([]);
    }
  };

  const loadPostedJobs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/jobs`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPostedJobs(data.jobs || []);
      } else {
        console.error('Failed to fetch jobs');
        setPostedJobs([]);
      }
    } catch (error) {
      console.error('Error loading jobs:', error);
      setPostedJobs([]);
    }
  };


  const loadApplications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/applications`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Map backend response to frontend expected structure
        const mappedApps = (data.applications || []).map((app: any) => ({
          ...app,
          candidateName: app.candidate?.name || app.fullName || 'Unknown',
          jobTitle: app.job?.title || 'Unknown Position',
          appliedDate: new Date(app.createdAt).toLocaleDateString()
        }));
        setJobApplications(mappedApps);
      } else {
        console.error('Failed to fetch applications');
        setJobApplications([]);
      }
    } catch (error) {
      console.error('Error loading applications:', error);
      setJobApplications([]);
    }
  };

  // Real-time Database Synchronization

  useRealTimeSync(['jobs', 'jobapplications'], () => {
    loadPostedJobs();
    loadApplications();
  });
  useRealTimeSync(['leaves'], fetchLeaves);




  const handleOpenScheduleInterview = (application: any) => {
    setSelectedApplication(application);

    // Generate a unique meeting link
    const meetingId = `${Math.random().toString(36).substring(2, 5)}-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 5)}`;
    const meetingUrl = `https://meet.google.com/${meetingId}`;

    // AI-Driven pre-filling
    let autoNotes = "Interview objectives: ";
    if (application.strengths && application.strengths.length > 0) {
      autoNotes += `\n- Explore strengths: ${application.strengths.slice(0, 2).join(', ')}`;
    }
    if (application.gaps && application.gaps.length > 0) {
      autoNotes += `\n- Probe gaps: ${application.gaps.slice(0, 2).join(', ')}`;
    }
    if (application.analysisSummary) {
      autoNotes += `\n\nContext: ${application.analysisSummary}`;
    }

    setInterviewData({
      date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: '10:00',
      duration: '60',
      interviewer: 'HR Panel',
      mode: 'virtual',
      meetingLink: meetingUrl,
      notes: autoNotes.trim()
    });

    setShowScheduleInterviewModal(true);
  };

  async function handlePostJob(e: React.FormEvent) {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...newJob,
          jobType: newJob.type,
          experienceLevel: newJob.experience,
          applicationDeadline: newJob.deadline,
        })
      });

      if (response.ok) {
        const data = await response.json();
        alert('Job posted successfully!');
        setShowPostJobModal(false);
        setNewJob({
          title: '',
          department: '',
          location: '',
          type: 'full-time',
          experience: 'mid',
          description: '',
          requirements: '',
          salary: '',
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        });
        loadPostedJobs();
        return data.job;
      } else {
        const errorData = await response.json();

        // Handle 401 Unauthorized specifically
        if (response.status === 401) {
          alert(`Session Error: ${errorData.message}. Please login again.`);
          logout();
          navigate('/login');
          return null;
        }

        alert(`Failed to post job: ${errorData.message}`);
        return null;
      }
    } catch (error) {
      console.error('Error posting job:', error);
      alert('Failed to post job. Please try again.');
      return null;
    }
  }

  async function handleScheduleInterview(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedApplication) return;

    try {
      const token = localStorage.getItem('token');
      const appId = selectedApplication.id || selectedApplication._id;
      const response = await fetch(`${API_BASE_URL}/applications/${appId}/schedule-interview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(interviewData)
      });

      if (response.ok) {
        const data = await response.json();
        alert('Interview scheduled successfully!');
        setShowScheduleInterviewModal(false);
        setSelectedApplication(null);
        setInterviewData({
          date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          time: '10:00',
          duration: '60',
          interviewer: '',
          mode: 'virtual',
          meetingLink: '',
          notes: ''
        });
        loadApplications();
        return data;
      } else {
        const errorData = await response.json();
        alert(`Failed to schedule interview: ${errorData.message}`);
        return null;
      }
    } catch (error) {
      console.error('Error scheduling interview:', error);
      alert('Failed to schedule interview. Please try again.');
      return null;
    }
  }



  async function handleRejectApplication(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedApplication) return;

    try {
      const token = localStorage.getItem('token');
      const appId = selectedApplication.id || selectedApplication._id;
      const response = await fetch(`${API_BASE_URL}/applications/${appId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason: rejectionReason })
      });

      if (response.ok) {
        const data = await response.json();
        alert('Application rejected successfully!');
        setShowRejectModal(false);
        setSelectedApplication(null);
        setRejectionReason('');
        loadApplications();
        return data;
      } else {
        const errorData = await response.json();
        alert(`Failed to reject application: ${errorData.message}`);
        return null;
      }
    } catch (error) {
      console.error('Error rejecting application:', error);
      alert('Failed to reject application. Please try again.');
      return null;
    }
  }

  async function handleShortlistApplication(application: any) {
    try {
      const token = localStorage.getItem('token');
      const appId = application.id || application._id;
      const response = await fetch(`http://localhost:5000/api/applications/${appId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: 'shortlisted',
          notes: 'Candidate shortlisted via AI Ranking.'
        })
      });

      if (response.ok) {
        alert('Candidate shortlisted!');
        loadApplications();
      } else {
        const errorData = await response.json();
        alert(`Failed to shortlist: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error shortlisting application:', error);
      alert('Failed to shortlist. Please try again.');
    }
  }




  async function logout() {
    try {
      const token = localStorage.getItem('token');
      // Call backend to mark attendance checkout
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage regardless of server response
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('tokenExpiration');
      localStorage.removeItem('refreshToken');
      navigate('/login');
    }
  }

  function handleLogout() {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  }

  const renderSection = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      );
    }

    switch (activeSection) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="text-2xl font-bold mb-2">Welcome back, {userData?.name || 'HR Manager'}! 👋</h1>
                  <p className="text-blue-100">Here's your organization-wide HR overview</p>
                </div>
                <div className="mt-4 md:mt-0">
                  <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                    <Bell className="w-5 h-5" />
                    <span className="font-semibold">Total Employees: {employees.length}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Employees</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{dashboardStats?.totalEmployees ?? 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Active Projects</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{dashboardStats?.activeProjects ?? 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Target className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Departments</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{dashboardStats?.totalDepartments ?? 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <GraduationCap className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button
                  onClick={() => setActiveSection('employees')}
                  className="flex flex-col items-center justify-center p-4 bg-blue-50 rounded-lg border border-blue-200 hover:border-blue-300 hover:bg-blue-100 transition-colors"
                >
                  <Users className="w-8 h-8 text-blue-600 mb-2" />
                  <span className="text-sm font-medium text-gray-700">Manage Employees</span>
                </button>

                <button
                  onClick={() => setActiveSection('employees')}
                  className="flex-1 flex flex-col items-center justify-center p-4 bg-green-50 rounded-lg border border-green-200 hover:border-green-300 hover:bg-green-100 transition-colors"
                >
                  <UserPlus className="w-8 h-8 text-green-600 mb-2" />
                  <span className="text-sm font-medium text-gray-700">Add Employee</span>
                </button>

                <button
                  onClick={() => setActiveSection('attendance')}
                  className="flex-1 flex flex-col items-center justify-center p-4 bg-purple-50 rounded-lg border border-purple-200 hover:border-purple-300 hover:bg-purple-100 transition-colors"
                >
                  <Calendar className="w-8 h-8 text-purple-600 mb-2" />
                  <span className="text-sm font-medium text-gray-700">Leave Management</span>
                </button>



                <button
                  onClick={() => setActiveSection('payroll')}
                  className="flex flex-col items-center justify-center p-4 bg-teal-50 rounded-lg border border-teal-200 hover:border-teal-300 hover:bg-teal-100 transition-colors"
                >
                  <DollarSign className="w-8 h-8 text-teal-600 mb-2" />
                  <span className="text-sm font-medium text-gray-700">Payroll & Salary</span>
                </button>
              </div>
            </div>

            {/* Active Projects Overview */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Active Projects & Responsibilities</h2>
                <button
                  onClick={() => setActiveSection('workforce')}
                  className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Manage in Workforce Hub →
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(Array.isArray(projects) ? projects : []).filter((p: any) => p && p.status !== 'Completed').length > 0 ? (
                  (Array.isArray(projects) ? projects : []).filter((p: any) => p && p.status !== 'Completed').slice(0, 6).map((project: any) => (
                    <div key={project._id || Math.random()} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-md transition-all group">
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                          {(project.title || project.projectName || 'P').charAt(0)}
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${project.status === 'In Progress' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                          {project.status || 'Active'}
                        </span>
                      </div>
                      <h4 className="font-bold text-gray-900 mb-1">{project.title || project.projectName || 'Untitled Project'}</h4>
                      <p className="text-xs text-indigo-500 font-bold uppercase tracking-tighter mb-2">{project.role || 'No Role'}</p>
                      <p className="text-xs text-gray-600 line-clamp-2 italic mb-4">{project.description || 'No description provided.'}</p>
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-[10px]">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500 overflow-hidden">
                            {project.assignedTo?.name?.charAt(0) || project.assignedToName?.charAt(0) || 'E'}
                          </div>
                          <span className="font-medium text-gray-500">{project.assignedTo?.name || project.assignedToName || 'Unassigned'}</span>
                        </div>
                        <span className="font-bold text-gray-400 uppercase">
                          {project.deadline ? `DUE ${new Date(project.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : 'NO DEADLINE'}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-12 text-center text-gray-400 font-bold uppercase tracking-widest bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                    No active projects found
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'employees':
        return <EmployeeManagement />;



      case 'payroll':
        return <HRPayrollSection />;

      case 'ai-assistant':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-[600px] grid grid-cols-1 lg:grid-cols-3">
            <div className="lg:col-span-2 flex flex-col border-r border-gray-100">
              <div className="p-4 border-b flex items-center justify-between bg-blue-50 rounded-tl-xl">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Brain className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">NOVA HR Agent</h3>
                    <p className="text-xs text-blue-600">Organizational Support • Trained on HR Data</p>
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
                    placeholder="Ask me for organizational insights..."
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
              </div>
            </div>

            <div className="p-6 overflow-y-auto">
              <h3 className="font-semibold text-gray-800 mb-4">Quick Insights</h3>
              <div className="space-y-3">
                {aiChatSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => setInputMessage(suggestion)}
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
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm text-gray-600">Company Headcount</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm text-gray-600">Leave Overviews</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm text-gray-600">Payroll Analysis</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm text-gray-600">Policy Queries</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );


      case 'recruitment':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Recruitment</h2>
                <p className="text-gray-600 mt-1">Manage job postings and applications</p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowPostJobModal(true)}
                  className="flex items-center space-x-2 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Briefcase className="w-4 h-4" />
                  <span>Post New Job</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Active Jobs</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{postedJobs.filter(job => job.status === 'active').length}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Applications</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{jobApplications.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Interviews</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{jobApplications.filter(app => app.status === 'interview-scheduled').length}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Hired</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{jobApplications.filter(app => app.status === 'hired').length}</p>
                  </div>
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-emerald-600" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <Brain className="w-6 h-6 text-purple-600" />
                  <h3 className="text-xl font-bold text-gray-900">AI-Ranked Candidates</h3>
                </div>
                <div className="flex items-center space-x-2 bg-purple-50 px-3 py-1 rounded-full border border-purple-100">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-bold text-purple-700">Powered by NOVA AI Intelligence</span>
                </div>
              </div>

              <div className="space-y-8">
                {postedJobs.map((job: any) => {
                  const jobApps = jobApplications
                    .filter((app: any) => (app.jobId || app.job?._id || app.job?.id) === (job._id || job.id))
                    .sort((a: any, b: any) => (b.matchPercentage || 0) - (a.matchPercentage || 0));

                  if (jobApps.length === 0) return null;

                  return (
                    <div key={job.id} className="space-y-4">
                      <div className="flex items-center justify-between border-b pb-2">
                        <h4 className="font-black text-gray-700 flex items-center">
                          <Briefcase className="w-4 h-4 mr-2 text-gray-400" />
                          {job.title}
                          <span className="ml-3 px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-500 font-medium">
                            {jobApps.length} Candidates
                          </span>
                        </h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {jobApps.map((application, index) => (
                          <div key={application.id || application._id} className={`p-4 border rounded-xl transition-all hover:shadow-md relative overflow-hidden flex flex-col justify-between ${index === 0 && application.matchPercentage >= 80 ? 'border-amber-200 bg-gradient-to-br from-white to-amber-50' : 'border-gray-200 bg-white'}`}>
                            <div>
                              {index === 0 && application.matchPercentage >= 80 && (
                                <div className="absolute top-0 right-0 bg-amber-400 text-white px-2 py-1 text-[10px] font-black uppercase tracking-tighter rounded-bl-lg">
                                  Top Match
                                </div>
                              )}

                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <h5 className="font-bold text-gray-900">{application.candidateName}</h5>
                                  <p className="text-xs text-gray-500">{application.experience} yrs exp • {application.appliedDate}</p>
                                </div>
                                <div className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl border-2 ${application.matchPercentage >= 70 ? 'bg-green-50 border-green-200 text-green-700' :
                                  application.matchPercentage >= 40 ? 'bg-yellow-50 border-yellow-200 text-yellow-700' : 'bg-red-50 border-red-200 text-red-700'
                                  }`}>
                                  <span className="text-xs font-black leading-none">{application.matchPercentage}%</span>
                                  <span className="text-[8px] font-bold uppercase mt-0.5 tracking-tighter">Match</span>
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-1 mb-4 h-6 overflow-hidden">
                                {application.parsedSkills?.slice(0, 3).map((skill: string, i: number) => (
                                  <span key={i} className="px-2 py-0.5 bg-gray-100 text-[10px] rounded text-gray-600 font-medium">
                                    {skill}
                                  </span>
                                ))}
                                {application.parsedSkills?.length > 3 && (
                                  <span className="text-[10px] text-gray-400 self-center">+{application.parsedSkills.length - 3}</span>
                                )}
                              </div>
                              <div className="mt-3">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${application.status === 'shortlisted' ? 'bg-yellow-100 text-yellow-700' :
                                  application.status === 'interview-scheduled' ? 'bg-blue-100 text-blue-700' :
                                    application.status === 'hired' ? 'bg-green-100 text-green-700' :
                                      application.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                        'bg-gray-100 text-gray-700'
                                  }`}>
                                  {application.status === 'interview-scheduled' ? 'Interview' : application.status}
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-col space-y-2 mt-4">
                              <button
                                onClick={() => {
                                  setSelectedAIAnalysis(application);
                                  setShowAIAnalysisModal(true);
                                }}
                                className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm hover:bg-purple-200 flex items-center justify-center"
                              >
                                <Brain className="w-3 h-3 mr-1" />
                                View Analysis
                              </button>
                              {application.status === 'pending' || application.status === 'under_review' ? (
                                <button
                                  onClick={() => handleShortlistApplication(application)}
                                  className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-sm hover:bg-yellow-200"
                                >
                                  Shortlist
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleOpenScheduleInterview(application)}
                                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200"
                                  disabled={application.status === 'rejected' || application.status === 'hired'}
                                >
                                  Schedule Interview
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  setSelectedApplication(application);
                                  setShowRejectModal(true);
                                }}
                                className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200"
                                disabled={application.status === 'rejected' || application.status === 'hired'}
                              >
                                Reject
                              </button>
                              <a
                                href={`http://localhost:5000${application.resumeUrl}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 text-center"
                              >
                                View Resume
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );

      case 'attendance':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Leave Management</h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">Pending Leave Requests</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-gray-600 text-sm">
                    <tr>
                      <th className="py-3 px-4 font-semibold">Employee</th>
                      <th className="py-3 px-4 font-semibold">Type</th>
                      <th className="py-3 px-4 font-semibold">Dates</th>
                      <th className="py-3 px-4 font-semibold">Reason</th>
                      <th className="py-3 px-4 font-semibold">Status</th>
                      <th className="py-3 px-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {leaves.length > 0 ? (
                      leaves.map((leave: any) => (
                        <tr key={leave._id} className="hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <div className="font-medium text-gray-900">{leave.user?.name || 'Unknown'}</div>
                            <div className="text-xs text-gray-500">{leave.user?.email}</div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="font-medium text-gray-700">{leave.type}</span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="text-sm text-gray-900">{leave.startDate} to {leave.endDate}</div>
                            <div className="text-xs text-gray-500">({leave.days} days)</div>
                          </td>
                          <td className="py-4 px-4">
                            <p className="text-sm text-gray-600 max-w-xs">{leave.reason}</p>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${leave.status === 'Approved' ? 'bg-green-100 text-green-700' :
                              leave.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                                'bg-yellow-100 text-yellow-700'
                              }`}>
                              {leave.status}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right">
                            {leave.status === 'Pending' && (
                              <div className="flex items-center justify-end space-x-2">
                                <button
                                  onClick={() => handleUpdateLeaveStatus(leave._id, 'Approved')}
                                  className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200 transition-colors"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleUpdateLeaveStatus(leave._id, 'Rejected')}
                                  className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200 transition-colors"
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-gray-500">
                          No leave requests found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">Manual Attendance Tool</h3>
                <p className="text-sm text-gray-500">Correct or manually log attendance for an employee</p>
              </div>
              <div className="p-6">
                <form onSubmit={handleMarkAttendance} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
                    <select
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      value={attendanceForm.userId}
                      onChange={(e) => setAttendanceForm({ ...attendanceForm, userId: e.target.value })}
                    >
                      <option value="">Select Employee</option>
                      {employees.map((emp: any) => (
                        <option key={emp._id || emp.id} value={emp._id || emp.id}>{emp.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input
                      type="date"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      value={attendanceForm.date}
                      onChange={(e) => setAttendanceForm({ ...attendanceForm, date: e.target.value })}
                      max={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      value={attendanceForm.status}
                      onChange={(e) => setAttendanceForm({ ...attendanceForm, status: e.target.value })}
                    >
                      <option value="present">Present</option>
                      <option value="absent">Absent</option>
                      <option value="holiday">Holiday</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-emerald-600 text-white font-bold py-2 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
                  >
                    Mark Attendance
                  </button>
                </form>
              </div>
            </div>
          </div>
        );

      case 'performance':
        return <HRPerformanceSection onNavigate={setActiveSection} />;

      case 'attrition':
        return <HRAnalyticsSection />;

      case 'operations':
        return <OperationsBoard currentUser={userData} projects={projects} />;

      case 'workforce':
        return <WorkforceDevelopmentHub />;

      case 'settings':
        return <HRSettingsSection />;

      case 'policies':
        return <PoliciesSection />;

      default:
        return (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">Section Coming Soon</h3>
              <p className="text-gray-500">
                This feature is under development. <br />
                Select a different section from the sidebar.
              </p>
            </div>
          </div>
        );
    }
  };

  // Sidebar navigation items
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'operations', label: 'Operations Board', icon: FolderKanban, highlight: true },
    { id: 'employees', label: 'Employee Management', icon: Users },
    { id: 'recruitment', label: 'Recruitment', icon: UserPlus },
    { id: 'attendance', label: 'Leave & Attendance', icon: Calendar },
    { id: 'performance', label: 'Performance', icon: Target },
    { id: 'attrition', label: 'Attrition Analytics', icon: AlertCircle },
    { id: 'ai-assistant', label: 'AI Assistant', icon: Brain },
    { id: 'workforce', label: 'Workforce Hub', icon: Layers },
    { id: 'policies', label: 'Policies', icon: ShieldCheck },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <DashboardLayout
      role="hr"
      userName={userData?.name || 'HR Manager'}
      userEmail={userData?.email || ''}
    >
      <div className="flex">
        {/* Sidebar Navigation */}
        <div className="w-64 flex-shrink-0 bg-white border-r border-gray-200 min-h-screen p-4">
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-2">HR Management Portal</h2>
            <p className="text-sm text-gray-500">Employee Management System</p>
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
                    } ${item.highlight ? 'bg-gradient-to-r from-blue-50 to-indigo-50' : ''}`}
                >
                  <div className="flex items-center space-x-3 text-left">
                    <Icon className={`w-5 h-5 flex-shrink-0 ${activeSection === item.id ? 'text-blue-600' : 'text-gray-500'}`} />
                    <span className="font-medium whitespace-nowrap">{item.label}</span>
                  </div>
                  {item.highlight && activeSection !== item.id && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
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
              <span className="font-medium text-blue-800">System Status</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-blue-700">Employees</span>
                <span className="text-sm font-medium">{employees.length} registered</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-blue-700">Active Today</span>
                <span className="text-sm font-medium">{employees.length}</span>
              </div>
              <div className="text-xs text-blue-600 mt-2">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span>All systems operational</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span
                  className="font-medium text-gray-700 cursor-pointer hover:text-blue-600 transition-colors"
                  onClick={() => setActiveSection('dashboard')}
                >
                  HR Dashboard
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
                  <span className="font-medium">Logged in as: </span>
                  <span className="text-gray-600">{userData?.email || 'Unknown'}</span>
                </div>
              </div>
            </div>

            {/* Render Active Section */}
            {(() => {
              try {
                console.log('🔍 [DIAGNOSTIC] HRDashboard: Attempting to render section:', activeSection);
                return renderSection();
              } catch (e) {
                console.error('❌ [DIAGNOSTIC] HRDashboard: Error in renderSection:', e);
                return (
                  <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
                    <h3 className="font-bold">Error Rendering Section</h3>
                    <p className="text-sm">Something went wrong while displaying this part of the dashboard.</p>
                  </div>
                );
              }
            })()}
          </div>
        </div>
      </div>

      {/* Recruitment Modals */}
      {showPostJobModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden relative">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight flex items-center gap-2">
                <Briefcase className="text-blue-600" size={24} />
                Post New Job Opportunity
              </h3>
              <button onClick={() => setShowPostJobModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handlePostJob} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-400">Job Title</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 font-bold text-gray-700"
                    value={newJob.title}
                    onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-400">Department</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 font-bold text-gray-700"
                    value={newJob.department}
                    onChange={(e) => setNewJob({ ...newJob, department: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-400">Location</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 font-bold text-gray-700"
                    value={newJob.location}
                    onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-400">Job Type</label>
                  <select
                    className="w-full px-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 font-bold text-gray-700"
                    value={newJob.type}
                    onChange={(e) => setNewJob({ ...newJob, type: e.target.value })}
                  >
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="remote">Remote</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-400">Salary Range</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 font-bold text-gray-700"
                    placeholder="e.g. $80k - $120k"
                    value={newJob.salary}
                    onChange={(e) => setNewJob({ ...newJob, salary: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400">Job Description</label>
                <textarea
                  rows={3}
                  required
                  className="w-full px-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 font-bold text-gray-700 resize-none"
                  value={newJob.description}
                  onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                />
              </div>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-blue-200 transition-all active:scale-95">
                Post Job Opening
              </button>
            </form>
          </div>
        </div>
      )}

      {showAIAnalysisModal && selectedAIAnalysis && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-in fade-in zoom-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden relative">
            <div className="bg-gradient-to-br from-purple-600 to-indigo-700 p-8 text-white relative">
              <button onClick={() => setShowAIAnalysisModal(false)} className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full">
                <X size={20} />
              </button>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl font-black">
                  {selectedAIAnalysis.candidateName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-2xl font-black tracking-tight">{selectedAIAnalysis.candidateName}</h3>
                  <p className="text-purple-100 font-bold uppercase tracking-widest text-xs">AI Candidate Ranking Analysis</p>
                </div>
              </div>
            </div>
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100">
                  <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-1">Match Percentage</p>
                  <p className="text-3xl font-black text-purple-700">{selectedAIAnalysis.matchPercentage}%</p>
                </div>
                <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Experience Score</p>
                  <p className="text-3xl font-black text-indigo-700">{selectedAIAnalysis.experience} Yrs</p>
                </div>
              </div>
              <div>
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">AI Insights & Strengths</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedAIAnalysis.parsedSkills?.map((skill: string, i: number) => (
                    <span key={i} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold border border-gray-200">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Analysis Summary</h4>
                <p className="text-sm text-gray-600 leading-relaxed font-medium">
                  {selectedAIAnalysis.analysisSummary || "The AI has analyzed this candidate's resume against the job requirements. Based on the skill extraction and experience mapping, this candidate shows a strong technical alignment."}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {showRejectModal && selectedApplication && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[100]">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative">
            <button onClick={() => setShowRejectModal(false)} className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full">
              <X size={20} />
            </button>
            <h3 className="text-2xl font-black text-gray-900 mb-2">Reject Application</h3>
            <p className="text-gray-500 font-bold text-sm mb-6">Are you sure you want to reject <span className="text-red-600">{selectedApplication.candidateName}</span>? This action is irreversible.</p>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400">Rejection Reason (Internal Only)</label>
                <textarea
                  className="w-full px-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-red-500 font-bold text-gray-700 resize-none"
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Insufficient technical experience..."
                />
              </div>
              <button
                onClick={handleRejectApplication}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-red-200 transition-all active:scale-95"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {showScheduleInterviewModal && selectedApplication && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center bg-blue-50">
              <h3 className="text-xl font-black text-blue-900 uppercase tracking-tight flex items-center gap-2">
                <Calendar className="text-blue-600" size={24} />
                Schedule Interview
              </h3>
              <button onClick={() => setShowScheduleInterviewModal(false)} className="p-2 hover:bg-blue-100 rounded-full transition-colors text-blue-900">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleScheduleInterview} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-400">Interview Date</label>
                  <input
                    type="date"
                    required
                    className="w-full px-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 font-bold text-gray-700"
                    value={interviewData.date}
                    onChange={(e) => setInterviewData({ ...interviewData, date: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-400">Time</label>
                  <input
                    type="time"
                    required
                    className="w-full px-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 font-bold text-gray-700"
                    value={interviewData.time}
                    onChange={(e) => setInterviewData({ ...interviewData, time: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400">Interviewer</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Engineering Lead, HR Manager"
                  className="w-full px-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 font-bold text-gray-700"
                  value={interviewData.interviewer}
                  onChange={(e) => setInterviewData({ ...interviewData, interviewer: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400">Meeting Link</label>
                <input
                  type="url"
                  required
                  className="w-full px-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 font-bold text-gray-700"
                  value={interviewData.meetingLink}
                  onChange={(e) => setInterviewData({ ...interviewData, meetingLink: e.target.value })}
                />
              </div>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-blue-200 transition-all active:scale-95">
                Send Interview Invite
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Legacy Modals (keeping state for now but they should be removed if EmployeeManagement handles them) */}
      {showAssignTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Assign Task</h3>
              <button onClick={() => setShowAssignTaskModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              console.log('Task assignment should be handled in EmployeeManagement');
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    value={taskData.title}
                    onChange={(e) => setTaskData({ ...taskData, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <input
                    type="text"
                    placeholder="e.g. Today, Tomorrow, or YYYY-MM-DD"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    value={taskData.due}
                    onChange={(e) => setTaskData({ ...taskData, due: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    value={taskData.priority}
                    onChange={(e) => setTaskData({ ...taskData, priority: e.target.value })}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <button type="submit" className="w-full bg-amber-500 text-white py-2 px-4 rounded-lg hover:bg-amber-600 transition-colors">
                  Assign Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout >
  );
};

export default HRDashboard;
