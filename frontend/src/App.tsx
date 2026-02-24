import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import FeaturesPage from "./pages/FeaturesPage";
import Jobs from "./pages/Jobs";
import About from "./pages/About";
import Contact from "./pages/Contacts";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import HRDashboard from "./pages/HRDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import DashboardRedirect from "./pages/DashboardRedirect";

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: string[] }) => {
  const userStr = localStorage.getItem('user');
  console.log('🔍 [DIAGNOSTIC] ProtectedRoute: userStr from localStorage:', userStr);
  const token = localStorage.getItem('token');

  if (!token || !userStr) {
    return <Navigate to="/login" />;
  }

  let user;
  try {
    user = JSON.parse(userStr);
  } catch (e) {
    console.error('Failed to parse user from localStorage', e);
    return <Navigate to="/login" />;
  }

  if (!user || !user.role || !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    const role = user?.role;
    if (role === 'admin') {
      return <Navigate to="/admin/dashboard" />;
    } else if (role === 'hr') {
      return <Navigate to="/hr/dashboard" />;
    } else if (role === 'employee') {
      return <Navigate to="/dashboard" />;
    } else {
      return <Navigate to="/login" />;
    }
  }

  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Dashboard Redirect Route */}
        <Route path="/dashboard-redirect" element={<DashboardRedirect />} />

        {/* Protected Dashboard Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute allowedRoles={['employee']}>
            <EmployeeDashboard />
          </ProtectedRoute>
        } />

        <Route path="/employee/*" element={
          <ProtectedRoute allowedRoles={['employee']}>
            <EmployeeDashboard />
          </ProtectedRoute>
        } />

        <Route path="/hr/dashboard" element={
          <ProtectedRoute allowedRoles={['hr']}>
            <HRDashboard />
          </ProtectedRoute>
        } />

        <Route path="/hr/*" element={
          <ProtectedRoute allowedRoles={['hr']}>
            <HRDashboard />
          </ProtectedRoute>
        } />

        <Route path="/admin/dashboard" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />

        <Route path="/admin/*" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />

        {/* Default Route - Redirect based on auth status */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;