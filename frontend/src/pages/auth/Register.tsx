import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User, Check, AlertCircle, Briefcase, Users, Shield } from "lucide-react";
import { authAPI } from '../../services/api';
import Logo from '../../components/Logo';

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "employee", // Default role
  });

  const [formErrors, setFormErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const navigate = useNavigate();

  const validateName = (name: string) => {
    if (!name.trim()) return "Name is required";
    if (!/^[A-Za-z\s]+$/.test(name)) return "Name can only contain letters and spaces";
    if (name.length < 2) return "Name must be at least 2 characters";
    if (name.length > 50) return "Name must be less than 50 characters";
    return "";
  };

  const validateEmail = (email: string) => {
    if (!email.trim()) return "Email is required";
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return "";
  };

  const validatePassword = (password: string) => {
    if (!password) return "Password is required";
    if (password.length < 6) return "Password must be at least 6 characters";
    return "";
  };

  const validateConfirmPassword = (confirmPassword: string, password: string) => {
    if (!confirmPassword) return "Please confirm your password";
    if (confirmPassword !== password) return "Passwords do not match";
    return "";
  };

  const validateRole = (role: string) => {
    if (!role) return "Please select a role";
    const validRoles = ["employee", "hr", "admin"];
    if (!validRoles.includes(role)) return "Please select a valid role";
    return "";
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === "name") {
      const lettersOnly = value.replace(/[^A-Za-z\s]/g, '');
      setFormData({
        ...formData,
        [name]: lettersOnly,
      });

      setFormErrors({
        ...formErrors,
        name: validateName(lettersOnly),
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });

      let error = "";
      if (name === "email") {
        error = validateEmail(value);
      } else if (name === "password") {
        error = validatePassword(value);
        if (formData.confirmPassword) {
          setFormErrors({
            ...formErrors,
            confirmPassword: validateConfirmPassword(formData.confirmPassword, value),
          });
        }
      } else if (name === "confirmPassword") {
        error = validateConfirmPassword(value, formData.password);
      } else if (name === "role") {
        error = validateRole(value);
      }

      setFormErrors({
        ...formErrors,
        [name]: error,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nameError = validateName(formData.name);
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);
    const confirmPasswordError = validateConfirmPassword(formData.confirmPassword, formData.password);
    const roleError = validateRole(formData.role);

    setFormErrors({
      name: nameError,
      email: emailError,
      password: passwordError,
      confirmPassword: confirmPasswordError,
      role: roleError,
    });

    const hasErrors = nameError || emailError || passwordError || confirmPasswordError || roleError;

    if (hasErrors) {
      setError("Please fix the errors in the form");
      return;
    }

    if (!termsAccepted) {
      setError("You must accept the terms and conditions");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await authAPI.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role
      });

      // Save token and user data
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));

      // Redirect based on role using React Router
      if (response.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (response.user.role === 'hr') {
        navigate('/hr/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    const endpoint = provider.toLowerCase() === 'google' ? 'google' : 'github';
    const backendOAuthUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/auth/${endpoint}`;

    // Redirect the entire window to the backend OAuth endpoint
    window.location.href = backendOAuthUrl;
  };

  const passwordRequirements = [
    { id: 1, text: "At least 6 characters", met: formData.password.length >= 6 },
    { id: 2, text: "Contains uppercase letter", met: /[A-Z]/.test(formData.password) },
    { id: 3, text: "Contains lowercase letter", met: /[a-z]/.test(formData.password) },
    { id: 4, text: "Contains number", met: /[0-9]/.test(formData.password) },
  ];

  const roleDescriptions = {
    employee: "Regular team member with access to assigned tasks and tools",
    hr: "Human Resources with employee management and reporting access",
    admin: "Full system access including user management and settings"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white text-gray-800">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Logo />
            <div className="hidden md:flex space-x-8">
              <Link to="/" className="text-gray-600 hover:text-emerald-600 transition-colors">Home</Link>
              <Link to="/features" className="text-gray-600 hover:text-emerald-600 transition-colors">Features</Link>
              <Link to="/jobs" className="text-gray-600 hover:text-emerald-600 transition-colors">Jobs</Link>
              <Link to="/about" className="text-gray-600 hover:text-emerald-600 transition-colors">About</Link>
              <Link to="/contact" className="text-gray-600 hover:text-emerald-600 transition-colors">Contact</Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium transition-all shadow-sm hover:shadow"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-md mx-auto">
          {/* Hero Section */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2 text-gray-900">Join NOVA Today</h1>
            <p className="text-gray-600">Create your account and unlock AI-powered workforce management</p>
          </div>

          {/* Register Form Section */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm text-center flex items-center justify-center space-x-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className={`w-full pl-12 pr-4 py-3 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 transition-all ${formErrors.name
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-200 focus:border-emerald-500 focus:ring-emerald-500'
                      } text-gray-900 placeholder-gray-500`}
                    placeholder="John Doe"
                    maxLength={50}
                  />
                </div>
                {formErrors.name && (
                  <div className="mt-1 text-red-500 text-sm flex items-center space-x-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{formErrors.name}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className={`w-full pl-12 pr-4 py-3 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 transition-all ${formErrors.email
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-200 focus:border-emerald-500 focus:ring-emerald-500'
                      } text-gray-900 placeholder-gray-500`}
                    placeholder="apspalackal@gmail.com"
                  />
                </div>
                {formErrors.email && (
                  <div className="mt-1 text-red-500 text-sm flex items-center space-x-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{formErrors.email}</span>
                  </div>
                )}
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Select Your Role
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Employee Role */}
                  <label className={`
                    relative border rounded-lg p-4 cursor-pointer transition-all
                    ${formData.role === 'employee'
                      ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500 ring-opacity-20'
                      : 'border-gray-200 hover:border-emerald-300 hover:bg-emerald-50'
                    }
                  `}>
                    <input
                      type="radio"
                      name="role"
                      value="employee"
                      checked={formData.role === "employee"}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className="flex flex-col items-center text-center">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center mb-2">
                        <Briefcase className="w-5 h-5 text-emerald-600" />
                      </div>
                      <span className="font-medium text-gray-800">Employee</span>
                      <span className="text-xs text-gray-500 mt-1">Team Member</span>
                    </div>
                  </label>

                  {/* HR Role */}
                  <label className={`
                    relative border rounded-lg p-4 cursor-pointer transition-all
                    ${formData.role === 'hr'
                      ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500 ring-opacity-20'
                      : 'border-gray-200 hover:border-emerald-300 hover:bg-emerald-50'
                    }
                  `}>
                    <input
                      type="radio"
                      name="role"
                      value="hr"
                      checked={formData.role === "hr"}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className="flex flex-col items-center text-center">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                        <Users className="w-5 h-5 text-blue-600" />
                      </div>
                      <span className="font-medium text-gray-800">HR</span>
                      <span className="text-xs text-gray-500 mt-1">Human Resources</span>
                    </div>
                  </label>

                  {/* Admin Role */}
                  <label className={`
                    relative border rounded-lg p-4 cursor-pointer transition-all
                    ${formData.role === 'admin'
                      ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500 ring-opacity-20'
                      : 'border-gray-200 hover:border-emerald-300 hover:bg-emerald-50'
                    }
                  `}>
                    <input
                      type="radio"
                      name="role"
                      value="admin"
                      checked={formData.role === "admin"}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className="flex flex-col items-center text-center">
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mb-2">
                        <Shield className="w-5 h-5 text-purple-600" />
                      </div>
                      <span className="font-medium text-gray-800">Admin</span>
                      <span className="text-xs text-gray-500 mt-1">Administrator</span>
                    </div>
                  </label>
                </div>

                {/* Role Description */}
                <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium capitalize">{formData.role}:</span> {roleDescriptions[formData.role as keyof typeof roleDescriptions]}
                  </p>
                </div>

                {formErrors.role && (
                  <div className="mt-1 text-red-500 text-sm flex items-center space-x-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{formErrors.role}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className={`w-full pl-12 pr-12 py-3 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 transition-all ${formErrors.password
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-200 focus:border-emerald-500 focus:ring-emerald-500'
                      } text-gray-900 placeholder-gray-500`}
                    placeholder="Create a strong password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-emerald-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                {/* Password Requirements */}
                <div className="mt-3 space-y-2">
                  {passwordRequirements.map((req) => (
                    <div key={req.id} className="flex items-center space-x-2">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${req.met ? 'bg-emerald-500' : 'bg-gray-200'}`}>
                        {req.met && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className={`text-xs ${req.met ? 'text-emerald-600' : 'text-gray-500'}`}>
                        {req.text}
                      </span>
                    </div>
                  ))}
                </div>

                {formErrors.password && (
                  <div className="mt-1 text-red-500 text-sm flex items-center space-x-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{formErrors.password}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className={`w-full pl-12 pr-12 py-3 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 transition-all ${formErrors.confirmPassword
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-200 focus:border-emerald-500 focus:ring-emerald-500'
                      } text-gray-900 placeholder-gray-500`}
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-emerald-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                {/* Password Match Indicator */}
                {formData.confirmPassword && (
                  <div className="mt-2">
                    <div className={`flex items-center space-x-2 text-sm ${formData.password === formData.confirmPassword ? 'text-emerald-600' : 'text-red-500'}`}>
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${formData.password === formData.confirmPassword ? 'bg-emerald-500' : 'bg-red-500'}`}>
                        {formData.password === formData.confirmPassword && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span>
                        {formData.password === formData.confirmPassword ? 'Passwords match' : 'Passwords do not match'}
                      </span>
                    </div>
                  </div>
                )}

                {formErrors.confirmPassword && (
                  <div className="mt-1 text-red-500 text-sm flex items-center space-x-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{formErrors.confirmPassword}</span>
                  </div>
                )}
              </div>

              <div className="pt-4">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500 mt-1"
                  />
                  <div className="text-sm text-gray-700">
                    I agree to the{" "}
                    <Link to="/terms" className="text-emerald-600 hover:text-emerald-700 font-medium">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link to="/privacy" className="text-emerald-600 hover:text-emerald-700 font-medium">
                      Privacy Policy
                    </Link>
                    . I understand that NOVA uses AI to enhance workforce management and automation.
                    {formData.role === "admin" && (
                      <span className="block mt-1 text-amber-600 font-medium">
                        Note: Admin accounts require additional verification.
                      </span>
                    )}
                  </div>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading || !termsAccepted}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-emerald-500"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Account...
                  </span>
                ) : (
                  `Create ${formData.role.charAt(0).toUpperCase() + formData.role.slice(1)} Account`
                )}
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">Or sign up with</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handleSocialLogin('Google')}
                  className="flex items-center justify-center space-x-2 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors text-gray-700"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  <span className="font-medium">Google</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSocialLogin('GitHub')}
                  className="flex items-center justify-center space-x-2 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors text-gray-700"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  <span className="font-medium">GitHub</span>
                </button>
              </div>


              <p className="text-center text-gray-600 pt-4">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                >
                  Sign In
                </Link>
              </p>
            </form>
          </div>

          {/* Benefits Section */}
          <div className="mt-8 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4">Role-Based Access</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <Briefcase className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">Employee</h4>
                  <p className="text-sm text-gray-600">Access assigned tasks, submit work, track progress</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">HR</h4>
                  <p className="text-sm text-gray-600">Manage employees, view reports, handle onboarding</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">Admin</h4>
                  <p className="text-sm text-gray-600">Full system access, user management, configuration</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;