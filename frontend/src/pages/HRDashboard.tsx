import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { 
  LogOut, Bell, ChevronRight, Home, Users, UserPlus, 
  Calendar, Target, AlertCircle, Brain, BarChart3, 
  GraduationCap, ShieldCheck, Settings, Zap, Plus,
  Briefcase, FileText,  CheckCircle
} from 'lucide-react';

const HRDashboard = () => {
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [postedJobs, setPostedJobs] = useState<any[]>([]);
  const [jobApplications, setJobApplications] = useState<any[]>([]);
  const [showPostJobModal, setShowPostJobModal] = useState(false);
  const [showScheduleInterviewModal, setShowScheduleInterviewModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  
  const [newJob, setNewJob] = useState({
    title: '',
    department: '',
    location: '',
    type: 'Full-time',
    experience: 'Mid-level',
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
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    if (activeSection === 'employees') {
      fetchEmployees();
    }
    if (activeSection === 'recruitment') {
      loadPostedJobs();
      loadApplications();
    }
  }, [activeSection]);

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
        setEmployees(data.employees || []);
      } else {
        console.error('Failed to fetch employees');
        // For demo, add mock data
        setEmployees([
          {
            id: '1',
            name: 'John Smith',
            email: 'john.smith@company.com',
            role: 'employee',
            department: 'Engineering',
            position: 'Senior Developer',
            phone: '+1 234 567 8901',
            salary: '$85,000',
            joiningDate: '2023-01-15',
            project: 'E-commerce Platform',
            lastLogin: '2024-01-06',
            status: 'active'
          },
          {
            id: '2',
            name: 'Sarah Johnson',
            email: 'sarah.j@company.com',
            role: 'employee',
            department: 'Design',
            position: 'UX Designer',
            phone: '+1 234 567 8902',
            salary: '$75,000',
            joiningDate: '2023-03-20',
            project: 'Mobile App Redesign',
            lastLogin: '2024-01-05',
            status: 'active'
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      // Mock data for demo
      setEmployees([
        {
          id: '1',
          name: 'John Smith',
          email: 'john.smith@company.com',
          role: 'employee',
          department: 'Engineering',
          position: 'Senior Developer',
          phone: '+1 234 567 8901',
          salary: '$85,000',
          joiningDate: '2023-01-15',
          project: 'E-commerce Platform',
          lastLogin: '2024-01-06',
          status: 'active'
        },
        {
          id: '2',
          name: 'Sarah Johnson',
          email: 'sarah.j@company.com',
          role: 'employee',
          department: 'Design',
          position: 'UX Designer',
          phone: '+1 234 567 8902',
          salary: '$75,000',
          joiningDate: '2023-03-20',
          project: 'Mobile App Redesign',
          lastLogin: '2024-01-05',
          status: 'active'
        }
      ]);
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
        // Mock data for demo
        setPostedJobs([
          {
            id: '1',
            title: 'Senior Frontend Developer',
            department: 'Engineering',
            location: 'San Francisco, CA',
            type: 'Full-time',
            experience: 'Senior',
            description: 'We are looking for an experienced Frontend Developer...',
            requirements: '5+ years of experience with React, TypeScript...',
            salary: '$120,000 - $150,000',
            deadline: '2024-02-15',
            postedDate: '2024-01-01',
            status: 'active',
            applications: 24
          },
          {
            id: '2',
            title: 'UX/UI Designer',
            department: 'Design',
            location: 'Remote',
            type: 'Full-time',
            experience: 'Mid-level',
            description: 'Join our design team to create beautiful user experiences...',
            requirements: '3+ years of UI/UX design experience...',
            salary: '$85,000 - $110,000',
            deadline: '2024-02-10',
            postedDate: '2024-01-05',
            status: 'active',
            applications: 18
          }
        ]);
      }
    } catch (error) {
      console.error('Error loading jobs:', error);
      // Mock data for demo
      setPostedJobs([
        {
          id: '1',
          title: 'Senior Frontend Developer',
          department: 'Engineering',
          location: 'San Francisco, CA',
          type: 'Full-time',
          experience: 'Senior',
          description: 'We are looking for an experienced Frontend Developer...',
          requirements: '5+ years of experience with React, TypeScript...',
          salary: '$120,000 - $150,000',
          deadline: '2024-02-15',
          postedDate: '2024-01-01',
          status: 'active',
          applications: 24
        },
        {
          id: '2',
          title: 'UX/UI Designer',
          department: 'Design',
          location: 'Remote',
          type: 'Full-time',
          experience: 'Mid-level',
          description: 'Join our design team to create beautiful user experiences...',
          requirements: '3+ years of UI/UX design experience...',
          salary: '$85,000 - $110,000',
          deadline: '2024-02-10',
          postedDate: '2024-01-05',
          status: 'active',
          applications: 18
        }
      ]);
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
        setJobApplications(data.applications || []);
      } else {
        // Mock data for demo
        setJobApplications([
          {
            id: '1',
            jobId: '1',
            jobTitle: 'Senior Frontend Developer',
            candidateName: 'Alex Johnson',
            candidateEmail: 'alex.j@example.com',
            candidatePhone: '+1 234 567 8903',
            experience: '6 years',
            skills: 'React, TypeScript, Node.js, AWS',
            resumeUrl: '/resumes/alex-johnson.pdf',
            coverLetter: 'I am excited to apply for the Senior Frontend Developer position...',
            appliedDate: '2024-01-03',
            status: 'review',
            interviewDate: null,
            interviewer: null
          },
          {
            id: '2',
            jobId: '2',
            jobTitle: 'UX/UI Designer',
            candidateName: 'Maria Garcia',
            candidateEmail: 'maria.g@example.com',
            candidatePhone: '+1 234 567 8904',
            experience: '4 years',
            skills: 'Figma, Adobe Creative Suite, User Research',
            resumeUrl: '/resumes/maria-garcia.pdf',
            coverLetter: 'I am passionate about creating intuitive user experiences...',
            appliedDate: '2024-01-04',
            status: 'interview',
            interviewDate: '2024-01-15',
            interviewer: 'Sarah Johnson'
          },
          {
            id: '3',
            jobId: '1',
            jobTitle: 'Senior Frontend Developer',
            candidateName: 'David Chen',
            candidateEmail: 'david.c@example.com',
            candidatePhone: '+1 234 567 8905',
            experience: '8 years',
            skills: 'React, Vue.js, GraphQL, Docker',
            resumeUrl: '/resumes/david-chen.pdf',
            coverLetter: 'With 8 years of experience in frontend development...',
            appliedDate: '2024-01-05',
            status: 'hired',
            interviewDate: '2024-01-08',
            interviewer: 'John Smith'
          }
        ]);
      }
    } catch (error) {
      console.error('Error loading applications:', error);
      // Mock data for demo
      setJobApplications([
        {
          id: '1',
          jobId: '1',
          jobTitle: 'Senior Frontend Developer',
          candidateName: 'Alex Johnson',
          candidateEmail: 'alex.j@example.com',
          candidatePhone: '+1 234 567 8903',
          experience: '6 years',
          skills: 'React, TypeScript, Node.js, AWS',
          resumeUrl: '/resumes/alex-johnson.pdf',
          coverLetter: 'I am excited to apply for the Senior Frontend Developer position...',
          appliedDate: '2024-01-03',
          status: 'review',
          interviewDate: null,
          interviewer: null
        },
        {
          id: '2',
          jobId: '2',
          jobTitle: 'UX/UI Designer',
          candidateName: 'Maria Garcia',
          candidateEmail: 'maria.g@example.com',
          candidatePhone: '+1 234 567 8904',
          experience: '4 years',
          skills: 'Figma, Adobe Creative Suite, User Research',
          resumeUrl: '/resumes/maria-garcia.pdf',
          coverLetter: 'I am passionate about creating intuitive user experiences...',
          appliedDate: '2024-01-04',
          status: 'interview',
          interviewDate: '2024-01-15',
          interviewer: 'Sarah Johnson'
        }
      ]);
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
        body: JSON.stringify(newJob)
      });

      if (response.ok) {
        const data = await response.json();
        alert('Job posted successfully!');
        setShowPostJobModal(false);
        setNewJob({
          title: '',
          department: '',
          location: '',
          type: 'Full-time',
          experience: 'Mid-level',
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
      const response = await fetch(`http://localhost:5000/api/applications/${selectedApplication.id}/schedule-interview`, {
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

  const handleRejectApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApplication) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/applications/${selectedApplication.id}/reject`, {
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

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('tokenExpiration');
    localStorage.removeItem('refreshToken');
    navigate('/login');
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
                  className="flex flex-col items-center justify-center p-4 bg-green-50 rounded-lg border border-green-200 hover:border-green-300 hover:bg-green-100 transition-colors"
                >
                  <UserPlus className="w-8 h-8 text-green-600 mb-2" />
                  <span className="text-sm font-medium text-gray-700">Add Employee</span>
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
                    onChange={(e) => console.log('Search:', e.target.value)}
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

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Employee</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Department & Position</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Project</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Contact</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Salary</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Status</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {employees.map((employee) => (
                    <tr key={employee.id} className="hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{employee.name}</p>
                          <p className="text-sm text-gray-500">{employee.email}</p>
                          <p className="text-xs text-gray-400">Joined: {employee.joiningDate}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{employee.department}</p>
                          <p className="text-sm text-gray-500">{employee.position}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="bg-blue-50 px-3 py-1 rounded-lg inline-block">
                          <span className="text-sm text-blue-700">{employee.project}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm text-gray-900">{employee.phone}</p>
                        <p className="text-xs text-gray-500">Last login: {employee.lastLogin}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="font-medium text-gray-900">{employee.salary}</p>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${employee.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {employee.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200">
                            View
                          </button>
                          <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200">
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
                    <p className="text-3xl font-bold text-gray-900 mt-2">{jobApplications.filter(app => app.status === 'interview').length}</p>
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
                          <div className={`mt-2 px-3 py-1 rounded-full text-sm font-medium ${
                            job.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
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
                            <span>{application.experience} experience</span>
                            <span>•</span>
                            <span>Applied: {application.appliedDate}</span>
                          </div>
                          <div className="mt-3">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              application.status === 'review' ? 'bg-yellow-100 text-yellow-700' :
                              application.status === 'interview' ? 'bg-blue-100 text-blue-700' :
                              application.status === 'hired' ? 'bg-green-100 text-green-700' :
                              application.status === 'rejected' ? 'bg-red-100 text-red-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {application.status}
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
                            href={application.resumeUrl}
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
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                    activeSection === item.id 
                      ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                      : 'text-gray-700 hover:bg-gray-50'
                  } ${item.highlight ? 'bg-gradient-to-r from-blue-50 to-indigo-50' : ''}`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-5 h-5 ${activeSection === item.id ? 'text-blue-600' : 'text-gray-500'}`} />
                    <span className="font-medium">{item.label}</span>
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
                    onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    value={newEmployee.email}
                    onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    value={newEmployee.password}
                    onChange={(e) => setNewEmployee({...newEmployee, password: e.target.value})}
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
                      onChange={(e) => setNewEmployee({...newEmployee, department: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      value={newEmployee.position}
                      onChange={(e) => setNewEmployee({...newEmployee, position: e.target.value})}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    value={newEmployee.phone}
                    onChange={(e) => setNewEmployee({...newEmployee, phone: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Salary</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    value={newEmployee.salary}
                    onChange={(e) => setNewEmployee({...newEmployee, salary: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    value={newEmployee.project}
                    onChange={(e) => setNewEmployee({...newEmployee, project: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Joining Date</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    value={newEmployee.joiningDate}
                    onChange={(e) => setNewEmployee({...newEmployee, joiningDate: e.target.value})}
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
                    onChange={(e) => setNewJob({...newJob, title: e.target.value})}
                    placeholder="e.g., Senior Frontend Developer"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      value={newJob.department}
                      onChange={(e) => setNewJob({...newJob, department: e.target.value})}
                      placeholder="e.g., Engineering"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      value={newJob.location}
                      onChange={(e) => setNewJob({...newJob, location: e.target.value})}
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
                      onChange={(e) => setNewJob({...newJob, type: e.target.value})}
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Internship">Internship</option>
                      <option value="Remote">Remote</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Experience Level</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      value={newJob.experience}
                      onChange={(e) => setNewJob({...newJob, experience: e.target.value})}
                    >
                      <option value="Entry-level">Entry-level</option>
                      <option value="Mid-level">Mid-level</option>
                      <option value="Senior">Senior</option>
                      <option value="Lead">Lead</option>
                      <option value="Executive">Executive</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Salary Range</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    value={newJob.salary}
                    onChange={(e) => setNewJob({...newJob, salary: e.target.value})}
                    placeholder="e.g., $120,000 - $150,000"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Application Deadline</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    value={newJob.deadline}
                    onChange={(e) => setNewJob({...newJob, deadline: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Description *</label>
                  <textarea
                    required
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    value={newJob.description}
                    onChange={(e) => setNewJob({...newJob, description: e.target.value})}
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
                    onChange={(e) => setNewJob({...newJob, requirements: e.target.value})}
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
                      onChange={(e) => setInterviewData({...interviewData, date: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Time *</label>
                    <input
                      type="time"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      value={interviewData.time}
                      onChange={(e) => setInterviewData({...interviewData, time: e.target.value})}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    value={interviewData.duration}
                    onChange={(e) => setInterviewData({...interviewData, duration: e.target.value})}
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
                    onChange={(e) => setInterviewData({...interviewData, interviewer: e.target.value})}
                    placeholder="e.g., Sarah Johnson"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Interview Mode</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    value={interviewData.mode}
                    onChange={(e) => setInterviewData({...interviewData, mode: e.target.value})}
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
                      onChange={(e) => setInterviewData({...interviewData, meetingLink: e.target.value})}
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
                    onChange={(e) => setInterviewData({...interviewData, notes: e.target.value})}
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
    </DashboardLayout>
  );
};

export default HRDashboard;