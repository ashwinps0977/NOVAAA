import { Link } from "react-router-dom";

const Logo = () => {
    return (
        <Link to="/" className="flex items-center space-x-2 group/logo relative px-3 py-2">
            <h1 className="text-3xl font-bold relative z-10 transition-all duration-300 group-hover/logo:scale-110">
                <span className="transition-colors duration-500 text-gray-900 group-hover/logo:text-green-600">
                    NO
                </span>
                <span className="transition-colors duration-500 text-green-600 group-hover/logo:text-gray-900">
                    VA
                </span>
            </h1>
            <span className="text-xs px-2 py-1 rounded-full font-semibold transition-all duration-500 relative z-10 group-hover/logo:scale-110 bg-green-100 text-green-700">
                AI
            </span>
        </Link>
    );
};

export default Logo;
