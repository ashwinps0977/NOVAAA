import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, 
  Settings, 
  Bell, 
  Search
} from 'lucide-react';

interface DashboardLayoutProps {
  role: 'employee' | 'hr' | 'admin';
  userName: string;
  userEmail: string;
  children?: React.ReactNode;
  showSidebarToggle?: boolean;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  role, 
  userName, 
  userEmail,
  children
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Only - No Sidebar */}
      <header className="sticky top-0 z-30 flex-shrink-0 flex h-16 bg-white shadow-sm border-b border-gray-200">
        <div className="flex-1 px-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg"></div>
              <span className="text-xl font-bold text-emerald-700">NOVA</span>
            </div>
            
            {/* User Info */}
            <div className="hidden md:block border-l pl-4">
              <p className="text-sm font-medium text-gray-700">{userName}</p>
              <div className="flex items-center space-x-2">
                <p className="text-xs text-gray-500">{userEmail}</p>
                <span className="text-xs font-medium text-emerald-600 capitalize">• {role}</span>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl mx-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="search"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Right side icons */}
          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-gray-500 hover:text-gray-700">
              <Bell size={22} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            
            <button className="p-2 text-gray-500 hover:text-gray-700">
              <Settings size={22} />
            </button>
            
            <button 
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main>
        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;