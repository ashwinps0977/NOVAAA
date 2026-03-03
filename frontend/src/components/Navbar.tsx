import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    if (location.pathname === path) {
      return "text-green-600 border-green-600";
    }
    return "border-transparent text-gray-700 hover:text-green-600";
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-2xl bg-transparent border-b border-white/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Link to="/" className="flex items-center space-x-2 group/logo relative px-3 py-2">

              <h1 className="text-3xl font-bold relative z-10 transition-all duration-300 group-hover/logo:scale-110">
                <span className="transition-colors duration-500 text-gray-900 group-hover/logo:text-green-600">NO</span>
                <span className="transition-colors duration-500 text-green-600 group-hover/logo:text-gray-900">VA</span>
              </h1>
              <span className="text-xs px-2 py-1 rounded-full font-semibold transition-all duration-500 relative z-10 group-hover/logo:scale-110 bg-green-100 text-green-700">AI</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <ul className="hidden md:flex gap-8 font-medium text-gray-700">
            <li>
              <Link
                to="/"
                className={`transition-colors duration-300 py-2 px-1 border-b-2 ${isActive("/")}`}
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/features"
                className={`transition-colors duration-300 py-2 px-1 border-b-2 ${isActive("/features")}`}
              >
                Features
              </Link>
            </li>
            <li>
              <Link
                to="/jobs"
                className={`transition-colors duration-300 py-2 px-1 border-b-2 ${isActive("/jobs")}`}
              >
                Jobs
              </Link>
            </li>
            <li>
              <Link
                to="/about"
                className={`transition-colors duration-300 py-2 px-1 border-b-2 ${isActive("/about")}`}
              >
                About
              </Link>
            </li>
            <li>
              <Link
                to="/contact"
                className={`transition-colors duration-300 py-2 px-1 border-b-2 ${isActive("/contact")}`}
              >
                Contact
              </Link>
            </li>
          </ul>

          {/* Auth Buttons */}
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="hidden md:block px-6 py-2 font-medium text-gray-700 hover:text-green-600 transition-colors"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-6 py-2 font-medium rounded-full transition-all duration-500 transform hover:scale-105 shadow-md hover:shadow-lg bg-green-600 hover:bg-green-700 text-white"
            >
              Create Account
            </Link>

            {/* Mobile menu button */}
            <button className="md:hidden text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;