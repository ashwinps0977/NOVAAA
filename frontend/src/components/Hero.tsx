const Hero = () => {
  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-white to-green-50">
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-green-100 rounded-full -translate-y-32 translate-x-32 opacity-50"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-100 rounded-full translate-y-32 -translate-x-32 opacity-50"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* Left Content - Text */}
          <div className="text-left max-w-2xl mx-auto lg:mx-0">
            {/* Badge/Tag */}
            <div className="inline-block mb-6">
              <span className="inline-flex items-center px-4 py-2 bg-green-100 text-green-700 text-sm font-semibold rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                AI-Powered Workforce Platform
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Agentic AI
            </h1>
            
            {/* Sub-heading */}
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-gray-800 mt-4 mb-6 leading-snug">
              One Platform, Every Perspective
            </h2>
            
            <p className="text-lg md:text-xl text-gray-600 font-medium mb-4">
              Unified AI Assistant for Your Entire Organization
            </p>

            {/* Description */}
            <p className="text-gray-500 text-lg leading-relaxed mt-6 mb-10 max-w-xl">
              Bridging the gap between individual needs, team management, and organizational strategy through intelligent automation.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-10">
              <button className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center group">
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
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-8 border-white transform hover:scale-[1.02] transition-transform duration-500">
              <img
                src="/src/assets/nova_img.jpg"
                alt="AI HR Assistant Dashboard Interface"
                className="w-full h-auto object-cover"
                loading="lazy"
              />
              
              {/* Glass overlay effect */}
              <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent pointer-events-none"></div>
              
              {/* Live badge */}
              
            </div>

            {/* Floating Elements for Depth */}
            <div className="absolute -bottom-6 -left-6 w-56 h-56 bg-gradient-to-br from-blue-100 to-green-100 rounded-2xl -z-10 opacity-70"></div>
            <div className="absolute -top-6 -right-6 w-40 h-40 bg-gradient-to-tr from-purple-100 to-pink-100 rounded-full -z-10 opacity-70"></div>
            
            {/* User avatars (optional) */}
           
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;