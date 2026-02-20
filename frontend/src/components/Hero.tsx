import { useNavigate } from 'react-router-dom';

interface HeroProps {
  isImageHovered: boolean;
  setIsImageHovered: (value: boolean) => void;
}

const Hero = ({ isImageHovered, setIsImageHovered }: HeroProps) => {
  const navigate = useNavigate();

  return (
    <section className="relative h-[calc(100vh-80px)] flex items-center justify-center overflow-hidden bg-gradient-to-br from-white to-green-50">
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-green-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Left Content - Text */}
          <div className={`text-left max-w-2xl mx-auto lg:mx-0 transition-all duration-700 ${isImageHovered ? 'scale-105' : 'scale-100'}`}>
            {/* Badge/Tag */}
            <div className="inline-block mb-6">
              <span className={`inline-flex items-center px-4 py-2 text-sm font-semibold rounded-full transition-all duration-500 ${isImageHovered
                ? 'text-pink-100 bg-gradient-to-r from-pink-600 to-purple-600 shadow-lg shadow-pink-500/50'
                : 'text-green-700 bg-green-100'
                }`}>
                <div className={`w-2 h-2 rounded-full mr-2 animate-pulse transition-all duration-500 ${isImageHovered
                  ? 'bg-pink-300 shadow-lg shadow-pink-400'
                  : 'bg-green-500'
                  }`}></div>
                AI-Powered Workforce Platform
              </span>
            </div>

            {/* Main Heading with Micro-Interaction */}
            <div className="mb-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight relative group/heading cursor-default inline-block px-4 py-2 rounded-lg transition-all duration-400 ease-in-out hover:scale-105">
                Agentic AI
                <span className="absolute bottom-1 left-1/2 w-0 h-[2px] bg-black transition-all duration-400 ease-in-out group-hover/heading:w-[calc(100%-2rem)] group-hover/heading:left-4"></span>
              </h1>
            </div>

            {/* Sub-heading with Micro-Interaction */}
            <div className="mb-6">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-gray-800 leading-snug relative group/subheading cursor-default inline-block px-4 py-2 rounded-lg transition-all duration-400 ease-in-out hover:scale-105">
                One Platform, Every Perspective
                <span className="absolute bottom-1 left-1/2 w-0 h-[2px] bg-black transition-all duration-400 ease-in-out group-hover/subheading:w-[calc(100%-2rem)] group-hover/subheading:left-4"></span>
              </h2>
            </div>

            <p className="text-lg md:text-xl text-gray-600 font-medium mb-4">
              Unified AI Assistant for Your Entire Organization
            </p>

            {/* Description */}
            <p className="text-lg text-gray-500 leading-relaxed mt-6 mb-10 max-w-xl">
              Bridging the gap between individual needs, team management, and organizational strategy through intelligent automation.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-10">
              <button
                onClick={() => navigate('/login')}
                className={`px-8 py-4 font-semibold rounded-full transition-all duration-500 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center group ${isImageHovered
                  ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-pink-500/50 hover:shadow-pink-600/60'
                  : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}>
                Get Started
                <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </div>

            {/* Stats/Trust indicators */}
            <div className="flex flex-wrap gap-6 mt-12 pt-8 border-t border-gray-100">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">85%</div>
                <div className="text-sm text-gray-600">Process Automation</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">24/7</div>
                <div className="text-sm text-gray-600">AI Support</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">100+</div>
                <div className="text-sm text-gray-600">Companies</div>
              </div>
            </div>
          </div>

          {/* Right Content - Image */}
          <div className="relative">
            {/* Main Image Container */}
            <div
              className={`relative rounded-3xl overflow-hidden shadow-2xl border-2 border-white transform transition-all duration-700 ease-out cursor-pointer ${isImageHovered ? 'scale-110' : 'scale-100'
                }`}
              onMouseEnter={() => setIsImageHovered(true)}
              onMouseLeave={() => setIsImageHovered(false)}
            >
              <img
                src="/src/assets/nova_img.jpg"
                alt="AI HR Assistant Dashboard Interface"
                className="w-full h-auto object-cover"
                loading="lazy"
              />

              {/* Glass overlay effect */}
              <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent pointer-events-none"></div>

              {/* Glow effect on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-cyan-500/20 transition-opacity duration-700 ${isImageHovered ? 'opacity-100' : 'opacity-0'
                }`}></div>
            </div>

            {/* Floating Elements for Depth */}
            <div className="absolute -bottom-6 -left-6 w-56 h-56 bg-gradient-to-br from-blue-100 to-green-100 rounded-2xl -z-10 opacity-70"></div>
            <div className="absolute -top-6 -right-6 w-40 h-40 bg-gradient-to-tr from-purple-100 to-pink-100 rounded-full -z-10 opacity-70"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;