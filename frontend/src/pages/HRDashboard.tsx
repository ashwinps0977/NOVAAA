import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import {
  LogOut, Bell, ChevronRight, Home, Users, UserPlus,
  Calendar, Target, AlertCircle, Brain, BarChart3,
  GraduationCap, ShieldCheck, Settings, Zap, Plus,
  Briefcase, FileText, CheckCircle, DollarSign,
  Send
} from 'lucide-react';
import HRPayrollSection from '../components/dashboard/hr/HRPayrollSection';
import HRSettingsSection from '../components/dashboard/hr/HRSettingsSection';
import HRTrainingSection from '../components/dashboard/hr/HRTrainingSection';
import PoliciesSection from '../components/dashboard/PoliciesSection';
import HRAnalyticsSection from '../components/dashboard/hr/HRAnalyticsSection';

const HRDashboard = () => {
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [postedJobs, setPostedJobs] = useState<any[]>([]);
  const [jobApplications, setJobApplications] = useState<any[]>([]);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [showPostJobModal, setShowPostJobModal] = useState(false);
  const [showScheduleInterviewModal, setShowScheduleInterviewModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);

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

  // Employee Management State
  const [showEditEmployeeModal, setShowEditEmployeeModal] = useState(false);
  const [showViewEmployeeModal, setShowViewEmployeeModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

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

  const [newEmployee, setNewEmployee] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee',
    department: '',
    position: '',
    phone: '',
    salary: '',
    joiningDate: new Date().toISOString().split('T')[0],
    project: ''
  });

  // Project Assignment State
  const [showAssignProjectModal, setShowAssignProjectModal] = useState(false);
  const [selectedEmployeeForProject, setSelectedEmployeeForProject] = useState<any>(null);
  const [projectData, setProjectData] = useState({
    title: '',
    description: '',
    role: '',
    deadline: ''
  });

  // Task Assignment State
  const [showAssignTaskModal, setShowAssignTaskModal] = useState(false);
  const [selectedEmployeeForTask, setSelectedEmployeeForTask] = useState<any>(null);
  const [taskData, setTaskData] = useState({
    title: '',
    project: 'General',
    priority: 'medium',
    due: 'Today'
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
      const response = await fetch('http://localhost:5000/api/attendance/hr-mark', {
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

  useEffect(() => {
    checkAuth();
    let intervalId: any;

    if (activeSection === 'employees') {
      fetchEmployees();
      // Poll every 30 seconds for real-time attendance updates
      intervalId = setInterval(fetchEmployees, 30000);
    }
    if (activeSection === 'recruitment') {
      loadPostedJobs();
      loadApplications();
    }
    if (activeSection === 'attendance') {
      fetchLeaves();
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [activeSection]);

  const fetchLeaves = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/leave/all', {
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

  const handleUpdateLeaveStatus = async (id: string, status: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/leave/${id}/status`, {
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
      const response = await fetch('http://localhost:5000/api/hr/employees', {
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
      const response = await fetch('http://localhost:5000/api/jobs', {
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
      const response = await fetch('http://localhost:5000/api/applications', {
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

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/hr/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newEmployee)
      });

      if (response.ok) {

        alert('Employee added successfully!');
        setShowAddEmployee(false);
        setNewEmployee({
          name: '',
          email: '',
          password: '',
          role: 'employee',
          department: '',
          position: '',
          phone: '',
          salary: '',
          joiningDate: new Date().toISOString().split('T')[0],
          project: ''
        });
        fetchEmployees();
      } else {
        const errorData = await response.json();
        alert(`Failed to add employee: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error adding employee:', error);
      alert('Failed to add employee. Please try again.');
    }
  };

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/jobs', {
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
          // Remove old keys to avoid confusion, though backend ignores extra fields usually
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
        alert(`Failed to post job: ${errorData.message}`);
        return null;
      }
    } catch (error) {
      console.error('Error posting job:', error);
      alert('Failed to post job. Please try again.');
      return null;
    }
  };

  const handleScheduleInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApplication) return;

    try {
      const token = localStorage.getItem('token');
      const appId = selectedApplication.id || selectedApplication._id;
      const response = await fetch(`http://localhost:5000/api/applications/${appId}/schedule-interview`, {
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
  };

  const handleAssignProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployeeForProject) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...projectData,
          assignedToEmployeeId: selectedEmployeeForProject._id || selectedEmployeeForProject.id
        })
      });

      if (response.ok) {
        alert('Project assigned successfully!');
        setShowAssignProjectModal(false);
        setProjectData({
          title: '',
          description: '',
          role: '',
          deadline: ''
        });
        setSelectedEmployeeForProject(null);
        fetchEmployees(); // Refresh list to show new project status if needed
      } else {
        const errorData = await response.json();
        alert(`Failed to assign project: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error assigning project:', error);
      alert('Failed to assign project. Please try again.');
    }
  };

  const handleRejectApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApplication) return;

    try {
      const token = localStorage.getItem('token');
      const appId = selectedApplication.id || selectedApplication._id;
      const response = await fetch(`http://localhost:5000/api/applications/${appId}/reject`, {
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
  };

  const handleUpdateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;

    try {
      const token = localStorage.getItem('token');
      const empId = selectedEmployee._id || selectedEmployee.id;
      const response = await fetch(`http://localhost:5000/api/hr/employees/${empId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(selectedEmployee)
      });

      if (response.ok) {
        alert('Employee updated successfully');
        setShowEditEmployeeModal(false);
        fetchEmployees();
      } else {
        const error = await response.json();
        alert(`Failed to update employee: ${error.message}`);
      }
    } catch (error) {
      console.error('Update error:', error);
      alert('Failed to update employee');
    }
  };

  const handleAssignTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployeeForTask) return;

    try {
      const token = localStorage.getItem('token');
      const empId = selectedEmployeeForTask._id || selectedEmployeeForTask.id;
      const response = await fetch('http://localhost:5000/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...taskData,
          assignedToEmployeeId: empId
        })
      });

      if (response.ok) {
        alert('Task assigned successfully');
        setShowAssignTaskModal(false);
        setTaskData({ title: '', project: 'General', priority: 'medium', due: 'Today' });
      } else {
        alert('Failed to assign task');
      }
    } catch (error) {
      console.error('Task assignment error:', error);
    }
  };
  const logout = async () => {
    try {
      const token = localStorage.getItem('token');
      // Call backend to mark attendance checkout
      await fetch('http://localhost:5000/api/auth/logout', {
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
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

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
                    <p className="text-3xl font-bold text-gray-900 mt-2">{employees.length}</p>
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
                    <p className="text-3xl font-bold text-gray-900 mt-2">8</p>
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
                    <p className="text-3xl font-bold text-gray-900 mt-2">5</p>
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
                  onClick={() => setShowAddEmployee(true)}
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
                  onClick={() => setActiveSection('analytics')}
                  className="flex flex-col items-center justify-center p-4 bg-purple-50 rounded-lg border border-purple-200 hover:border-purple-300 hover:bg-purple-100 transition-colors"
                >
                  <BarChart3 className="w-8 h-8 text-purple-600 mb-2" />
                  <span className="text-sm font-medium text-gray-700">Analytics</span>
                </button>

                <button
                  onClick={() => setActiveSection('attendance')}
                  className="flex flex-col items-center justify-center p-4 bg-amber-50 rounded-lg border border-amber-200 hover:border-amber-300 hover:bg-amber-100 transition-colors"
                >
                  <Calendar className="w-8 h-8 text-amber-600 mb-2" />
                  <span className="text-sm font-medium text-gray-700">Attendance</span>
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
          </div>
        );

      case 'employees':
        return (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Employee Management</h2>
                <p className="text-gray-600 mt-1">Manage employee directory and details</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search employees..."
                    className="pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <button
                  onClick={() => setShowAddEmployee(true)}
                  className="flex items-center space-x-2 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Employee</span>
                </button>
              </div>
            </div>

            <div className="flex flex-col space-y-4">
              {employees
                .filter(emp =>
                  emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  (emp.email && emp.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
                  (emp.department && emp.department.toLowerCase().includes(searchTerm.toLowerCase()))
                )
                .map((employee) => {
                  const isActive = employee.attendanceStatus === 'Present';
                  return (
                    <div
                      key={employee.id || employee._id}
                      onClick={() => {
                        setSelectedEmployee(employee);
                        setShowViewEmployeeModal(true);
                      }}
                      className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-sm group-hover:scale-110 transition-transform">
                          {employee.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors text-lg">{employee.name}</h3>
                          <p className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-0.5 rounded-full inline-block mt-1">
                            ID: {(employee.employeeId || employee._id || '').slice(-6).toUpperCase()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1 ${isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                          }`}>
                          <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                          <span>{isActive ? 'Active' : 'Inactive'}</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500 transition-colors" />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        );



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
            {/* Header */}
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

            {/* Stats */}
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Posted Jobs */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Posted Jobs</h3>
                  <span className="text-sm text-gray-500">{postedJobs.length} total</span>
                </div>
                <div className="space-y-4">
                  {postedJobs.map((job) => (
                    <div key={job.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{job.title}</h4>
                          <div className="flex items-center space-x-3 mt-2 text-sm text-gray-500">
                            <span>{job.department}</span>
                            <span>•</span>
                            <span>{job.location}</span>
                            <span>•</span>
                            <span>{job.type}</span>
                          </div>
                          <div className="flex items-center space-x-4 mt-3">
                            <span className="text-sm text-gray-700">Salary: {job.salary}</span>
                            <span className="text-sm text-gray-700">Deadline: {job.deadline}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium inline-block">
                            {job.applications || 0} applications
                          </div>
                          <div className={`mt-2 px-3 py-1 rounded-full text-sm font-medium ${job.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                            }`}>
                            {job.status}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Job Applications */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Recent Applications</h3>
                  <span className="text-sm text-gray-500">{jobApplications.length} total</span>
                </div>
                <div className="space-y-4">
                  {jobApplications.map((application) => (
                    <div key={application.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{application.candidateName}</h4>
                          <p className="text-sm text-gray-600 mt-1">Applied for: {application.jobTitle}</p>
                          <div className="flex items-center space-x-3 mt-2 text-sm text-gray-500">
                            <span>{application.experience} years experience</span>
                            <span>•</span>
                            <span>Applied: {application.appliedDate}</span>
                            {application.matchPercentage !== undefined && (
                              <>
                                <span>•</span>
                                <span className={`flex items-center font-semibold ${application.matchPercentage >= 70 ? 'text-green-600' :
                                  application.matchPercentage >= 40 ? 'text-yellow-600' : 'text-red-600'
                                  }`}>
                                  <Brain className="w-3 h-3 mr-1" />
                                  AI Score: {application.matchPercentage}%
                                </span>
                              </>
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
                        <div className="flex flex-col space-y-2">
                          <button
                            onClick={() => {
                              setSelectedApplication(application);
                              setShowScheduleInterviewModal(true);
                            }}
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200"
                            disabled={application.status === 'rejected' || application.status === 'hired'}
                          >
                            Schedule Interview
                          </button>
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
                    </div>
                  ))}
                </div>
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
                      {employees.map(emp => (
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

      case 'analytics':
      case 'attrition':
        return <HRAnalyticsSection />;

      case 'training':
        return <HRTrainingSection />;

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
    { id: 'employees', label: 'Employee Management', icon: Users, highlight: true },
    { id: 'recruitment', label: 'Recruitment', icon: UserPlus },
    { id: 'attendance', label: 'Leave & Attendance', icon: Calendar },
    { id: 'performance', label: 'Performance', icon: Target },
    { id: 'attrition', label: 'Attrition Analytics', icon: AlertCircle },
    { id: 'ai-assistant', label: 'AI Assistant', icon: Brain },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'training', label: 'Training', icon: GraduationCap },
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
                <span className="font-medium text-gray-700">HR Dashboard</span>
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
            {renderSection()}
          </div>
        </div>
      </div>

      {/* Add Employee Modal */}
      {showAddEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Add New Employee</h3>
              <button
                onClick={() => setShowAddEmployee(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddEmployee}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    value={newEmployee.name}
                    onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    value={newEmployee.email}
                    onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    value={newEmployee.password}
                    onChange={(e) => setNewEmployee({ ...newEmployee, password: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      value={newEmployee.department}
                      onChange={(e) => setNewEmployee({ ...newEmployee, department: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      value={newEmployee.position}
                      onChange={(e) => setNewEmployee({ ...newEmployee, position: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    value={newEmployee.phone}
                    onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Salary</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    value={newEmployee.salary}
                    onChange={(e) => setNewEmployee({ ...newEmployee, salary: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    value={newEmployee.project}
                    onChange={(e) => setNewEmployee({ ...newEmployee, project: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Joining Date</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    value={newEmployee.joiningDate}
                    onChange={(e) => setNewEmployee({ ...newEmployee, joiningDate: e.target.value })}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Add Employee
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddEmployee(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Post Job Modal */}
      {showPostJobModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Post New Job</h3>
              <button
                onClick={() => setShowPostJobModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePostJob}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    value={newJob.title}
                    onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                    placeholder="e.g., Senior Frontend Developer"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                    <select
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      value={newJob.department}
                      onChange={(e) => setNewJob({ ...newJob, department: e.target.value })}
                    >
                      <option value="">Select Department</option>
                      <option value="Engineering">Engineering</option>
                      <option value="Design">Design</option>
                      <option value="Product">Product</option>
                      <option value="Sales">Sales</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Human Resources">Human Resources</option>
                      <option value="Finance">Finance</option>
                      <option value="Operations">Operations</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      value={newJob.location}
                      onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                      placeholder="e.g., San Francisco, CA"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Job Type</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      value={newJob.type}
                      onChange={(e) => setNewJob({ ...newJob, type: e.target.value })}
                    >
                      <option value="full-time">Full-time</option>
                      <option value="part-time">Part-time</option>
                      <option value="contract">Contract</option>
                      <option value="internship">Internship</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Experience Level</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      value={newJob.experience}
                      onChange={(e) => setNewJob({ ...newJob, experience: e.target.value })}
                    >
                      <option value="entry">Entry-level</option>
                      <option value="mid">Mid-level</option>
                      <option value="senior">Senior</option>
                      <option value="lead">Lead</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Salary Range</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    value={newJob.salary}
                    onChange={(e) => setNewJob({ ...newJob, salary: e.target.value })}
                    placeholder="e.g., $120,000 - $150,000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Application Deadline</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    value={newJob.deadline}
                    onChange={(e) => setNewJob({ ...newJob, deadline: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Description *</label>
                  <textarea
                    required
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    value={newJob.description}
                    onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                    placeholder="Describe the role, responsibilities, and what you're looking for..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Requirements *</label>
                  <textarea
                    required
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    value={newJob.requirements}
                    onChange={(e) => setNewJob({ ...newJob, requirements: e.target.value })}
                    placeholder="List the required skills, qualifications, and experience..."
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Post Job
                </button>
                <button
                  type="button"
                  onClick={() => setShowPostJobModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Interview Modal */}
      {showScheduleInterviewModal && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Schedule Interview</h3>
              <button
                onClick={() => {
                  setShowScheduleInterviewModal(false);
                  setSelectedApplication(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-gray-900">{selectedApplication.candidateName}</p>
              <p className="text-sm text-gray-600">Applied for: {selectedApplication.jobTitle}</p>
            </div>

            <form onSubmit={handleScheduleInterview}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                    <input
                      type="date"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      value={interviewData.date}
                      onChange={(e) => setInterviewData({ ...interviewData, date: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Time *</label>
                    <input
                      type="time"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      value={interviewData.time}
                      onChange={(e) => setInterviewData({ ...interviewData, time: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    value={interviewData.duration}
                    onChange={(e) => setInterviewData({ ...interviewData, duration: e.target.value })}
                    placeholder="60"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Interviewer Name *</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    value={interviewData.interviewer}
                    onChange={(e) => setInterviewData({ ...interviewData, interviewer: e.target.value })}
                    placeholder="e.g., Sarah Johnson"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Interview Mode</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    value={interviewData.mode}
                    onChange={(e) => setInterviewData({ ...interviewData, mode: e.target.value })}
                  >
                    <option value="virtual">Virtual/Online</option>
                    <option value="in-person">In-person</option>
                    <option value="phone">Phone</option>
                  </select>
                </div>

                {interviewData.mode === 'virtual' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Link</label>
                    <input
                      type="url"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      value={interviewData.meetingLink}
                      onChange={(e) => setInterviewData({ ...interviewData, meetingLink: e.target.value })}
                      placeholder="https://meet.google.com/abc-defg-hij"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    value={interviewData.notes}
                    onChange={(e) => setInterviewData({ ...interviewData, notes: e.target.value })}
                    placeholder="Any special instructions or topics to cover..."
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Schedule Interview
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowScheduleInterviewModal(false);
                    setSelectedApplication(null);
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Application Modal */}
      {showRejectModal && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Reject Application</h3>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedApplication(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="mb-4 p-3 bg-red-50 rounded-lg">
              <p className="text-sm font-medium text-gray-900">{selectedApplication.candidateName}</p>
              <p className="text-sm text-gray-600">Applied for: {selectedApplication.jobTitle}</p>
            </div>

            <form onSubmit={handleRejectApplication}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rejection Reason *</label>
                  <textarea
                    required
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Please provide a reason for rejecting this application..."
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
                >
                  Reject Application
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowRejectModal(false);
                    setSelectedApplication(null);
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Project Modal */}
      {showAssignProjectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Assign Project</h3>
              <button onClick={() => setShowAssignProjectModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800 font-medium">Assigning to: {selectedEmployeeForProject?.name}</p>
              <p className="text-xs text-blue-600">{selectedEmployeeForProject?.position}</p>
            </div>
            <form onSubmit={handleAssignProject}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project Title</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={projectData.title}
                    onChange={(e) => setProjectData({ ...projectData, title: e.target.value })}
                    required
                    placeholder="e.g. AI Module Development"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role in Project</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={projectData.role}
                    onChange={(e) => setProjectData({ ...projectData, role: e.target.value })}
                    required
                    placeholder="e.g. Lead Developer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    value={projectData.description}
                    onChange={(e) => setProjectData({ ...projectData, description: e.target.value })}
                    required
                    placeholder="Project details..."
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={projectData.deadline}
                    onChange={(e) => setProjectData({ ...projectData, deadline: e.target.value })}
                    required
                  />
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                  Confirm Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {showEditEmployeeModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Edit Employee</h3>
            <form onSubmit={handleUpdateEmployee} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border rounded-lg"
                  value={selectedEmployee.name}
                  onChange={(e) => setSelectedEmployee({ ...selectedEmployee, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Department</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border rounded-lg"
                    value={selectedEmployee.department}
                    onChange={(e) => setSelectedEmployee({ ...selectedEmployee, department: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Position</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border rounded-lg"
                    value={selectedEmployee.position}
                    onChange={(e) => setSelectedEmployee({ ...selectedEmployee, position: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border rounded-lg"
                  value={selectedEmployee.phone || ''}
                  onChange={(e) => setSelectedEmployee({ ...selectedEmployee, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Salary</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border rounded-lg"
                  value={selectedEmployee.salary || ''}
                  onChange={(e) => setSelectedEmployee({ ...selectedEmployee, salary: e.target.value })}
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditEmployeeModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Employee Detail Modal */}
      {showViewEmployeeModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 relative">
            <button
              onClick={() => setShowViewEmployeeModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>

            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-2xl font-bold">
                {selectedEmployee.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{selectedEmployee.name}</h3>
                <p className="text-gray-500">{selectedEmployee.position} • {selectedEmployee.department}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 border-b pb-2">Contact Information</h4>
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-gray-900">{selectedEmployee.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="text-gray-900">{selectedEmployee.phone || 'N/A'}</p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 border-b pb-2">Employment Details</h4>
                <div>
                  <p className="text-xs text-gray-500">Joining Date</p>
                  <p className="text-gray-900">{selectedEmployee.joiningDate}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Current Salary</p>
                  <p className="text-gray-900">{selectedEmployee.salary || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Current Project</p>
                  <p className="text-gray-900">{selectedEmployee.project || 'Unassigned'}</p>
                </div>
              </div>

              <div className="col-span-2 space-y-4">
                <h4 className="font-semibold text-gray-900 border-b pb-2">Attendance & Status</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Status</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${selectedEmployee.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {selectedEmployee.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Today's Attendance</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${selectedEmployee.attendanceStatus === 'Present' ? 'bg-green-100 text-green-700' :
                      selectedEmployee.attendanceStatus === 'Checked Out' ? 'bg-gray-100 text-gray-700' : 'bg-red-100 text-red-700'}`}>
                      {selectedEmployee.attendanceStatus || 'Absent'}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Last Active</p>
                    <p className="text-gray-900">{selectedEmployee.lastActive || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-between items-center border-t pt-6">
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowViewEmployeeModal(false); // Close view modal
                    setShowEditEmployeeModal(true); // Open edit modal
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium flex items-center"
                >
                  Edit Profile
                </button>
                <button
                  onClick={() => {
                    setSelectedEmployeeForProject(selectedEmployee);
                    setShowAssignProjectModal(true);
                    // Keep view modal open or close? Usually keep open or close depending on preference. 
                    // Let's close it to focus on the new task.
                    setShowViewEmployeeModal(false);
                  }}
                  className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 text-sm font-medium flex items-center"
                >
                  Assign Project
                </button>
                <button
                  onClick={() => {
                    setSelectedEmployeeForTask(selectedEmployee);
                    setShowAssignTaskModal(true);
                    setShowViewEmployeeModal(false);
                  }}
                  className="px-4 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 text-sm font-medium flex items-center"
                >
                  Assign Task
                </button>
              </div>
              <button
                onClick={() => setShowViewEmployeeModal(false)}
                className="px-4 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {showAssignTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Assign Task</h3>
              <button onClick={() => setShowAssignTaskModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleAssignTask}>
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
    </DashboardLayout>
  );
};

export default HRDashboard;