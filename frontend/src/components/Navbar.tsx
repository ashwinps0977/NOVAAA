import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path ? "text-green-600 border-green-600" : "text-gray-700 border-transparent";
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Link to="/" className="flex items-center space-x-2">
              <h1 className="text-3xl font-bold text-gray-900">NO<span className="text-green-600">VA</span></h1>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">AI</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <ul className="hidden md:flex gap-8 text-gray-700 font-medium">
            <li>
              <Link 
                to="/"
                className={`hover:text-green-600 transition-colors duration-300 py-2 px-1 border-b-2 hover:border-green-600 ${isActive("/")}`}
              >
                Home
              </Link>
            </li>
            <li>
              <Link 
                to="/features"
                className={`hover:text-green-600 transition-colors duration-300 py-2 px-1 border-b-2 hover:border-green-600 ${isActive("/features")}`}
              >
                Features
              </Link>
            </li>
            <li>
              <Link 
                to="/jobs"
                className={`hover:text-green-600 transition-colors duration-300 py-2 px-1 border-b-2 hover:border-green-600 ${isActive("/jobs")}`}
              >
                Jobs
              </Link>
            </li>
            <li>
              <Link 
                to="/about"
                className={`hover:text-green-600 transition-colors duration-300 py-2 px-1 border-b-2 hover:border-green-600 ${isActive("/about")}`}
              >
                About
              </Link>
            </li>
            <li>
              <Link 
                to="/contact"
                className={`hover:text-green-600 transition-colors duration-300 py-2 px-1 border-b-2 hover:border-green-600 ${isActive("/contact")}`}
              >
                Contact
              </Link>
            </li>
          </ul>

          {/* Auth Buttons */}
          <div className="flex items-center gap-4">
            <Link 
              to="/login"
              className="hidden md:block px-6 py-2 text-gray-700 hover:text-green-600 font-medium transition-colors duration-300"
            >
              Login
            </Link>
            <Link 
              to="/register"
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-full transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
            >
              Create Account
            </Link>
            
            {/* Mobile menu button (optional) */}
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