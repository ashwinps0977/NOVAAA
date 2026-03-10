import React, { useState, useEffect } from 'react';
import {
    UserPlus, Search, ChevronRight,
    LayoutGrid, List,
    RefreshCw, X,
    Briefcase, Mail, Phone, Calendar, DollarSign, Target,
    Zap
} from 'lucide-react';
import {
    Radar, RadarChart, PolarGrid,
    PolarAngleAxis, ResponsiveContainer
} from 'recharts';

const API_BASE_URL = 'http://localhost:5000/api';

const ROLES = ['Accountant', 'Data Analyst', 'Engineer', 'Head', 'Marketing Analyst', 'Project Manager', 'Senior Manager'];

interface Employee {
    _id: string;
    name: string;
    email: string;
    position: string;
    status: 'active' | 'inactive' | 'on-leave';
    joiningDate: string;
    phone?: string;
    salary?: string;
    project?: string;
    attendanceStatus?: string;
    lastActive?: string;
    employeeId?: string;
    activeProjects?: any[];
}

const EmployeeManagement: React.FC = () => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'table' | 'grouped'>('table');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [filters, setFilters] = useState({
        role: ''
    });

    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showAssignProjectModal, setShowAssignProjectModal] = useState(false);
    const [showAssignTaskModal, setShowAssignTaskModal] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [selectedEmployeeForProject, setSelectedEmployeeForProject] = useState<Employee | null>(null);
    const [selectedEmployeeForTask, setSelectedEmployeeForTask] = useState<Employee | null>(null);
    const [employeeSkills, setEmployeeSkills] = useState<any[]>([]);
    const [isSkillsLoading, setIsSkillsLoading] = useState(false);

    // Form states
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'employee',
        position: '',
        phone: '',
        salary: '',
        joiningDate: new Date().toISOString().split('T')[0],
        project: ''
    });

    const [projectData, setProjectData] = useState({
        title: '',
        description: '',
        role: '',
        deadline: ''
    });

    const [taskData, setTaskData] = useState({
        title: '',
        project: 'General',
        priority: 'medium',
        due: new Date().toISOString().split('T')[0]
    });

    const fetchEmployees = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const queryParams = new URLSearchParams({
                sortBy,
                ...(filters.role && { role: filters.role })
            });

            const response = await fetch(`${API_BASE_URL}/hr/employees?${queryParams}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setEmployees(data.employees || []);
            }
        } catch (error) {
            console.error('Error fetching employees:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, [sortBy, filters]);

    useEffect(() => {
        const fetchEmployeeSkills = async () => {
            if (!selectedEmployee || !showViewModal) return;
            setIsSkillsLoading(true);
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${API_BASE_URL}/skills/employee/${selectedEmployee._id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    // Transform to Recharts format
                    const formatted = (data.skills || []).map((s: any) => ({
                        subject: s.name,
                        A: s.currentLevel,
                        fullMark: 5
                    }));
                    setEmployeeSkills(formatted);
                }
            } catch (err) {
                console.error('Error fetching skills:', err);
            } finally {
                setIsSkillsLoading(false);
            }
        };
        fetchEmployeeSkills();
    }, [selectedEmployee, showViewModal]);

    const handleAddEmployee = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/hr/employees`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                setShowAddModal(false);
                fetchEmployees();
                setFormData({
                    name: '', email: '', password: '', role: 'employee',
                    position: '', phone: '', salary: '',
                    joiningDate: new Date().toISOString().split('T')[0], project: ''
                });
            }
        } catch (error) {
            console.error('Error adding employee:', error);
        }
    };

    const handleUpdateEmployee = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedEmployee) return;
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/hr/employees/${selectedEmployee._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(selectedEmployee)
            });

            if (response.ok) {
                setShowEditModal(false);
                fetchEmployees();
            }
        } catch (error) {
            console.error('Error updating employee:', error);
        }
    };

    const handleAssignProject = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedEmployeeForProject) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/projects`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...projectData,
                    assignedToEmployeeId: selectedEmployeeForProject._id || selectedEmployeeForProject.employeeId
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
                fetchEmployees();
            } else {
                const errorData = await response.json();
                alert(`Failed to assign project: ${errorData.message}`);
            }
        } catch (error) {
            console.error('Error assigning project:', error);
            alert('Failed to assign project. Please try again.');
        }
    };

    const handleAssignTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedEmployeeForTask) return;

        try {
            const token = localStorage.getItem('token');
            const empId = selectedEmployeeForTask._id || selectedEmployeeForTask.employeeId;
            const response = await fetch(`${API_BASE_URL}/tasks`, {
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
                setTaskData({
                    title: '',
                    project: 'General',
                    priority: 'medium',
                    due: new Date().toISOString().split('T')[0]
                });
                setSelectedEmployeeForTask(null);
            } else {
                alert('Failed to assign task');
            }
        } catch (error) {
            console.error('Task assignment error:', error);
            alert('Failed to assign task. Please try again.');
        }
    };

    const clearFilters = () => {
        setFilters({ role: '' });
        setSortBy('name');
    };



    const groupedEmployees = () => {
        const groups: Record<string, Employee[]> = {};
        employees.forEach(emp => {
            if (!groups[emp.position]) groups[emp.position] = [];
            groups[emp.position].push(emp);
        });
        return groups;
    };

    const filteredEmployees = employees.filter(emp =>
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header & Stats */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Employee Directory</h2>
                    <p className="text-gray-500 font-medium">Manage organization structure and talent directory</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-200 transition-all active:scale-95"
                    >
                        <UserPlus size={18} />
                        <span>Add Employee</span>
                    </button>
                </div>
            </div>

            {/* Toolbar: Search, Filters, View Toggle */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                <div className="flex flex-col xl:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full xl:max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name, email..."
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 font-medium text-gray-700"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                        <div className="flex items-center bg-gray-100 p-1 rounded-xl">
                            <button
                                onClick={() => setViewMode('table')}
                                className={`p-1.5 rounded-lg transition-all ${viewMode === 'table' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
                            >
                                <List size={20} />
                            </button>
                            <button
                                onClick={() => setViewMode('grouped')}
                                className={`p-1.5 rounded-lg transition-all ${viewMode === 'grouped' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
                            >
                                <LayoutGrid size={20} />
                            </button>
                        </div>

                        <select
                            className="bg-gray-50 border-none rounded-xl px-4 py-2 text-sm font-bold text-gray-600 focus:ring-2 focus:ring-blue-500"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <option value="name">Sort by: Name (A-Z)</option>
                            <option value="role">Sort by: Role</option>
                            <option value="joinedDate">Sort by: Recently Joined</option>
                        </select>

                        <div className="h-8 w-[1px] bg-gray-200 mx-1 hidden xl:block"></div>

                        <button
                            onClick={clearFilters}
                            className="text-xs font-black text-blue-600 uppercase hover:underline"
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>

                <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-50">
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Role</label>
                        <select
                            className="bg-gray-50 border-none rounded-lg px-3 py-1.5 text-xs font-bold text-gray-700 w-40"
                            value={filters.role}
                            onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                        >
                            <option value="">All Roles</option>
                            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed">
                    <RefreshCw className="w-10 h-10 text-blue-500 animate-spin mb-4" />
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">Syncing with database...</p>
                </div>
            ) : viewMode === 'table' ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Employee</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Employee Details</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Role</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredEmployees.map(emp => (
                                <tr
                                    key={emp._id}
                                    className="hover:bg-blue-50/30 transition-colors cursor-pointer group"
                                    onClick={() => { setSelectedEmployee(emp); setShowViewModal(true); }}
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-sm group-hover:scale-110 transition-transform">
                                                {emp.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{emp.name}</p>
                                                <p className="text-xs text-gray-500">{emp.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-xs font-bold text-gray-700">ID: {emp.employeeId || emp._id.slice(-6).toUpperCase()}</p>
                                        <p className="text-[10px] text-gray-500">Joined: {new Date(emp.joiningDate).toLocaleDateString()}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-bold text-gray-700">{emp.position}</p>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-gray-300 group-hover:text-blue-500 transition-colors">
                                            <ChevronRight size={20} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredEmployees.length === 0 && (
                        <div className="p-10 text-center">
                            <p className="text-gray-400 font-bold italic">No employees matching your criteria</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-6">
                    {Object.entries(groupedEmployees()).map(([role, emps]) => (
                        <div key={role} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                            <h3 className="text-sm font-black text-blue-500 uppercase tracking-widest flex items-center gap-2">
                                <Briefcase size={18} />
                                {role} ({emps.length})
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {emps.map(emp => (
                                    <div
                                        key={emp._id}
                                        onClick={() => { setSelectedEmployee(emp); setShowViewModal(true); }}
                                        className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-white hover:shadow-md transition-all cursor-pointer group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold group-hover:scale-110 transition-transform">
                                                {emp.name.charAt(0)}
                                            </div>
                                            <div className="overflow-hidden">
                                                <p className="font-bold text-gray-900 truncate">{emp.name}</p>
                                                <p className="text-[10px] text-gray-500 truncate">{emp.email}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* View Employee Modal */}
            {showViewModal && selectedEmployee && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60] animate-in fade-in zoom-in duration-300">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden relative">
                        <button
                            onClick={() => setShowViewModal(false)}
                            className="absolute top-6 right-6 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors z-10"
                        >
                            <X size={20} />
                        </button>

                        {/* Profile Header */}
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-white">
                            <div className="flex items-end gap-6">
                                <div className="w-32 h-32 rounded-3xl bg-white/20 backdrop-blur-md border-4 border-white/30 flex items-center justify-center text-5xl font-black shadow-2xl">
                                    {selectedEmployee.name.charAt(0)}
                                </div>
                                <div className="pb-2">
                                    <h3 className="text-3xl font-black tracking-tight">{selectedEmployee.name}</h3>
                                    <p className="text-blue-100 font-bold uppercase tracking-widest text-sm flex items-center gap-2 mt-1">
                                        <Target size={16} />
                                        {selectedEmployee.position}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <section>
                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2 mb-4">Contact Intel</h4>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 text-sm">
                                            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                                                <Mail size={16} />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-400 font-bold">Email Address</p>
                                                <p className="font-bold text-gray-800">{selectedEmployee.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm">
                                            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                                <Phone size={16} />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-400 font-bold">Phone Connection</p>
                                                <p className="font-bold text-gray-800">{selectedEmployee.phone || 'Not provided'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <section>
                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2 mb-4">Pulse Status</h4>
                                    <div className="grid grid-cols-1 gap-3">
                                        <div className="bg-gray-50 p-3 rounded-2xl">
                                            <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Office Status</p>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${selectedEmployee.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                {selectedEmployee.status}
                                            </span>
                                        </div>
                                    </div>
                                </section>
                            </div>

                            <div className="space-y-6">
                                <section>
                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2 mb-4">Employment Profile</h4>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 text-sm">
                                            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                                <Calendar size={16} />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-400 font-bold">Joining Date</p>
                                                <p className="font-bold text-gray-800">{selectedEmployee.joiningDate}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm">
                                            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                                                <DollarSign size={16} />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-400 font-bold">Base Comp</p>
                                                <p className="font-bold text-gray-800">{selectedEmployee.salary || 'Commercial Secret'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm">
                                            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                                                <Zap size={16} />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-400 font-bold">Total Projects</p>
                                                <p className="font-bold text-gray-800">{selectedEmployee.activeProjects?.length || 0}</p>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <section>
                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2 mb-4">Skill Proficiency</h4>
                                    <div className="bg-gray-50 p-4 rounded-2xl h-[200px]">
                                        {isSkillsLoading ? (
                                            <div className="h-full flex items-center justify-center">
                                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                                            </div>
                                        ) : employeeSkills.length > 0 ? (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={employeeSkills}>
                                                    <PolarGrid stroke="#e5e7eb" />
                                                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fontWeight: 700, fill: '#6b7280' }} />
                                                    <Radar
                                                        name="Skills"
                                                        dataKey="A"
                                                        stroke="#3b82f6"
                                                        fill="#3b82f6"
                                                        fillOpacity={0.6}
                                                    />
                                                </RadarChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div className="h-full flex items-center justify-center text-gray-400 text-xs font-bold italic">
                                                No skill data available
                                            </div>
                                        )}
                                    </div>
                                </section>
                            </div>
                        </div>

                        <div className="p-8 bg-gray-50 border-t flex items-center justify-between">
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setSelectedEmployeeForProject(selectedEmployee);
                                        setShowAssignProjectModal(true);
                                        setShowViewModal(false);
                                    }}
                                    className="px-6 py-2.5 bg-indigo-50 text-indigo-700 font-bold rounded-xl hover:bg-indigo-100 transition-all flex items-center border border-indigo-100 shadow-sm"
                                >
                                    <Briefcase className="w-4 h-4 mr-2" />
                                    Assign Project
                                </button>
                                <button
                                    onClick={() => {
                                        setSelectedEmployeeForTask(selectedEmployee);
                                        setShowAssignTaskModal(true);
                                        setShowViewModal(false);
                                    }}
                                    className="px-6 py-2.5 bg-amber-50 text-amber-700 font-bold rounded-xl hover:bg-amber-100 transition-all flex items-center border border-amber-100 shadow-sm"
                                >
                                    <Zap className="w-4 h-4 mr-2" />
                                    Assign Task
                                </button>
                            </div>
                            <button
                                onClick={() => setShowViewModal(false)}
                                className="px-6 py-2 bg-gray-800 text-white rounded-xl font-bold text-sm hover:bg-gray-900 transition-all active:scale-95"
                            >
                                Close Profile
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Employee Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[70]">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-8 relative animate-in slide-in-from-bottom duration-300">
                        <button onClick={() => setShowAddModal(false)} className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full"><X size={20} /></button>
                        <h3 className="text-2xl font-black text-gray-900 mb-6">Onboard New Talent</h3>

                        <form onSubmit={handleAddEmployee} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-black text-gray-400 uppercase ml-1">Full Name</label>
                                    <input
                                        type="text" required
                                        className="w-full px-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 font-medium"
                                        placeholder="Enter full name"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-black text-gray-400 uppercase ml-1">Work Email</label>
                                    <input
                                        type="email" required
                                        className="w-full px-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 font-medium"
                                        placeholder="name@company.com"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-black text-gray-400 uppercase ml-1">Password</label>
                                <input
                                    type="password" required
                                    className="w-full px-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 font-medium"
                                    placeholder="Temporary security key"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-black text-gray-400 uppercase ml-1">Role</label>
                                    <select
                                        required
                                        className="w-full px-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 font-bold text-gray-600"
                                        value={formData.position}
                                        onChange={e => setFormData({ ...formData, position: e.target.value })}
                                    >
                                        <option value="">Select Role</option>
                                        {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-black text-gray-400 uppercase ml-1">Salary</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 font-medium"
                                        placeholder="Annual package"
                                        value={formData.salary}
                                        onChange={e => setFormData({ ...formData, salary: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-black text-gray-400 uppercase ml-1">Joining Date</label>
                                    <input
                                        type="date"
                                        className="w-full px-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 font-medium"
                                        value={formData.joiningDate}
                                        onChange={e => setFormData({ ...formData, joiningDate: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-6">
                                <button
                                    type="submit"
                                    className="flex-1 bg-blue-600 text-white py-3 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
                                >
                                    Confirm Onboarding
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-2xl font-black uppercase tracking-widest hover:bg-gray-200 transition-all active:scale-95"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Employee Modal */}
            {showEditModal && selectedEmployee && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[70]">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-8 relative animate-in slide-in-from-bottom duration-300">
                        <button onClick={() => setShowEditModal(false)} className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full"><X size={20} /></button>
                        <h3 className="text-2xl font-black text-gray-900 mb-6">Modify Talent Profile</h3>

                        <form onSubmit={handleUpdateEmployee} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-black text-gray-400 uppercase ml-1">Full Name</label>
                                <input
                                    type="text" required
                                    className="w-full px-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 font-medium"
                                    value={selectedEmployee.name}
                                    onChange={e => setSelectedEmployee({ ...selectedEmployee, name: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-black text-gray-400 uppercase ml-1">Role</label>
                                    <select
                                        required
                                        className="w-full px-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 font-bold text-gray-600"
                                        value={selectedEmployee.position}
                                        onChange={e => setSelectedEmployee({ ...selectedEmployee, position: e.target.value })}
                                    >
                                        {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-black text-gray-400 uppercase ml-1">Phone</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 font-medium"
                                        value={selectedEmployee.phone || ''}
                                        onChange={e => setSelectedEmployee({ ...selectedEmployee, phone: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-black text-gray-400 uppercase ml-1">Salary</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 font-medium"
                                        value={selectedEmployee.salary || ''}
                                        onChange={e => setSelectedEmployee({ ...selectedEmployee, salary: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-black text-gray-400 uppercase ml-1">Project</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 font-medium"
                                    value={selectedEmployee.project || ''}
                                    onChange={e => setSelectedEmployee({ ...selectedEmployee, project: e.target.value })}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-black text-gray-400 uppercase ml-1">Status</label>
                                <select
                                    className="w-full px-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 font-bold text-gray-600"
                                    value={selectedEmployee.status}
                                    onChange={e => setSelectedEmployee({ ...selectedEmployee, status: e.target.value as any })}
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="on-leave">On Leave</option>
                                </select>
                            </div>

                            <div className="flex gap-4 pt-6">
                                <button
                                    type="submit"
                                    className="flex-1 bg-blue-600 text-white py-3 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
                                >
                                    Save Profile Changes
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-2xl font-black uppercase tracking-widest hover:bg-gray-200 transition-all active:scale-95"
                                >
                                    Discard Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Assign Project Modal */}
            {showAssignProjectModal && selectedEmployeeForProject && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[70] animate-in fade-in zoom-in duration-300">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
                        <div className="bg-indigo-600 p-6 text-white text-center">
                            <Briefcase className="w-12 h-12 mx-auto mb-2 opacity-80" />
                            <h3 className="text-xl font-black">Assign Project</h3>
                            <p className="text-indigo-100 text-sm mt-1">Assigning new responsibility to {selectedEmployeeForProject.name}</p>
                        </div>
                        <form onSubmit={handleAssignProject} className="p-6 space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Project Title</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none font-medium placeholder:text-gray-400"
                                    placeholder="e.g. AI Module Integration"
                                    value={projectData.title}
                                    onChange={(e) => setProjectData({ ...projectData, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Role in Project</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none font-medium placeholder:text-gray-400"
                                    placeholder="e.g. Lead Designer"
                                    value={projectData.role}
                                    onChange={(e) => setProjectData({ ...projectData, role: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Deadline Date</label>
                                <input
                                    type="date"
                                    required
                                    className="w-full px-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium"
                                    value={projectData.deadline}
                                    onChange={(e) => setProjectData({ ...projectData, deadline: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Description</label>
                                <textarea
                                    required
                                    rows={3}
                                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none font-medium placeholder:text-gray-400 resize-none"
                                    placeholder="Project scope and initial objectives..."
                                    value={projectData.description}
                                    onChange={(e) => setProjectData({ ...projectData, description: e.target.value })}
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="submit"
                                    className="flex-1 bg-indigo-600 text-white font-black py-3 rounded-2xl hover:bg-indigo-700 transition-all shadow-lg active:scale-95"
                                >
                                    Confirm Assignment
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowAssignProjectModal(false)}
                                    className="flex-1 bg-gray-100 text-gray-600 font-bold py-3 rounded-2xl hover:bg-gray-200 transition-all active:scale-95"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Assign Task Modal */}
            {showAssignTaskModal && selectedEmployeeForTask && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[70] animate-in fade-in zoom-in duration-300">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
                        <div className="bg-amber-500 p-6 text-white text-center">
                            <Zap className="w-12 h-12 mx-auto mb-2 opacity-80" />
                            <h3 className="text-xl font-black">Assign Daily Task</h3>
                            <p className="text-amber-50 text-sm mt-1">Direct task for {selectedEmployeeForTask.name}</p>
                        </div>
                        <form onSubmit={handleAssignTask} className="p-6 space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Task Title</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-amber-500 transition-all outline-none font-medium placeholder:text-gray-400"
                                    placeholder="e.g. Review Frontend Pull Requests"
                                    value={taskData.title}
                                    onChange={(e) => setTaskData({ ...taskData, title: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Priority</label>
                                    <select
                                        className="w-full px-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-amber-500 font-bold text-gray-600"
                                        value={taskData.priority}
                                        onChange={(e) => setTaskData({ ...taskData, priority: e.target.value })}
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Due Date</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full px-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-amber-500 font-medium"
                                        value={taskData.due}
                                        onChange={(e) => setTaskData({ ...taskData, due: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Associated Project</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-amber-500 transition-all outline-none font-medium placeholder:text-gray-400"
                                    placeholder="e.g. Q1 Roadmap (Optional)"
                                    value={taskData.project}
                                    onChange={(e) => setTaskData({ ...taskData, project: e.target.value })}
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="submit"
                                    className="flex-1 bg-amber-600 text-white font-black py-3 rounded-2xl hover:bg-amber-700 transition-all shadow-lg active:scale-95"
                                >
                                    Assign Task
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowAssignTaskModal(false)}
                                    className="flex-1 bg-gray-100 text-gray-600 font-bold py-3 rounded-2xl hover:bg-gray-200 transition-all active:scale-95"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmployeeManagement;
