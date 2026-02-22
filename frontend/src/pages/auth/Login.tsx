import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, Zap, Clock, Building } from "lucide-react";
import { authAPI } from "../../services/api";
import Logo from "../../components/Logo";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await authAPI.login({
        email: formData.email,
        password: formData.password
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
      setError(err.message || 'Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: string) => {
    setLoading(true);
    setError("");

    try {
      // Simulate real OAuth popup delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      const socialData = {
        email: `${provider.toLowerCase()}user@example.com`,
        name: `${provider} User`,
        provider: provider,
        id: `social_${Date.now()}`
      };

      const response = await authAPI.socialLogin(socialData);

      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));

      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || `Failed to sign in with ${provider}`);
    } finally {
      setLoading(false);
    }
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
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
              AI-Powered Workforce Platform
            </h1>
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <span className="text-lg font-medium text-emerald-600">Agentic AI</span>
              <span className="text-gray-400">•</span>
              <span className="text-lg text-gray-700">One Platform, Every Perspective</span>
            </div>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Bridging the gap between individual needs, team management, and
              organizational strategy through intelligent automation.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-12">
            {/* Left Stats Section - Clean White Cards */}
            <div className="lg:w-1/2">
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                <div className="grid grid-cols-3 gap-6 mb-8">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3">
                      <div className="text-2xl font-bold text-emerald-600">85%</div>
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-1">Process Automation</h3>
                    <p className="text-sm text-gray-500">Automate repetitive tasks</p>
                  </div>

                  <div className="text-center">
                    <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3">
                      <div className="text-2xl font-bold text-emerald-600">24/7</div>
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-1">AI Support</h3>
                    <p className="text-sm text-gray-500">Round-the-clock assistance</p>
                  </div>

                  <div className="text-center">
                    <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3">
                      <div className="text-2xl font-bold text-emerald-600">100+</div>
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-1">Companies</h3>
                    <p className="text-sm text-gray-500">Trusted by industry leaders</p>
                  </div>
                </div>

                <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-100">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <div className="text-2xl font-bold text-emerald-600">AI</div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Unified AI Assistant</h3>
                      <p className="text-gray-600">
                        One Platform, Every Perspective. Manage your entire organization through intelligent automation.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Stats Icons Row */}
                <div className="flex items-center justify-center space-x-8 mt-8 pt-8 border-t border-gray-100">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <Zap className="w-4 h-4 text-emerald-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">Fast</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-4 h-4 text-emerald-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">24/7</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <Building className="w-4 h-4 text-emerald-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">Enterprise</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Login Form Section */}
            <div className="lg:w-1/2">
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
                  <p className="text-gray-600">Sign in to your NOVA account</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                      {error}
                    </div>
                  )}

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
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 placeholder-gray-500 transition-all"
                        placeholder="you@example.com"
                      />
                    </div>
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
                        className="w-full pl-12 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 placeholder-gray-500 transition-all"
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-emerald-600 transition-colors"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500"
                      />
                      <span className="text-sm text-gray-700">Remember me</span>
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Signing in...
                      </span>
                    ) : (
                      "Sign In"
                    )}
                  </button>

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white text-gray-500">Or continue with</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => handleSocialLogin('Google')}
                      disabled={loading}
                      className="flex items-center justify-center space-x-2 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors text-gray-700 disabled:opacity-50"
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
                      disabled={loading}
                      className="flex items-center justify-center space-x-2 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors text-gray-700 disabled:opacity-50"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.003-.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                      </svg>
                      <span className="font-medium">GitHub</span>
                    </button>
                  </div>

                  <p className="text-center text-gray-600 pt-4">
                    Don't have an account?{" "}
                    <Link
                      to="/register"
                      className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                    >
                      Create Account
                    </Link>
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;