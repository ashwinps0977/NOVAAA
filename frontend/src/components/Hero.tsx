import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative h-screen w-full flex items-center overflow-hidden bg-gradient-to-br from-white via-green-50/60 to-green-100/40 pt-20">
      {/* Premium Mesh Gradient Background Blobs */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-15%] left-[-10%] w-[55%] h-[55%] rounded-full bg-green-300/50 blur-[140px]" />
        <div className="absolute top-[10%] right-[-10%] w-[50%] h-[60%] rounded-full bg-green-200/60 blur-[120px]" />
        <div className="absolute bottom-[-15%] left-[5%] w-[65%] h-[45%] rounded-full bg-green-300/40 blur-[160px]" />
        <div className="absolute top-[30%] left-[25%] w-[40%] h-[40%] rounded-full bg-green-50/80 blur-[100px]" />
        <div className="absolute top-[-5%] right-[20%] w-[30%] h-[30%] rounded-full bg-green-100/70 blur-[80px]" />
      </div>

      {/* Background 3D Spline Asset - Full Interactivity Across Entire Section */}
      <div className="absolute inset-0 z-[1] pointer-events-auto overflow-hidden">
        <spline-viewer
          url="https://prod.spline.design/S5hjYVl4OCTe6Tl9/scene.splinecode"
          className="h-full w-[180%] absolute top-0 -left-[35%] lg:-left-[20%]"
        ></spline-viewer>
      </div>

      {/* Content Overlay - pointer-events-none on container to allow background interaction */}
      <div className="container mx-auto px-6 sm:px-8 lg:px-12 relative z-10 pointer-events-none">
        <div className="max-w-2xl flex flex-col items-start gap-0 animate-shrink-out opacity-0">
          {/* Refined Badge */}
          <div className="pointer-events-auto mb-4">
            <span className="inline-flex items-center px-5 py-2 text-sm font-semibold rounded-full text-green-700 bg-green-50/50 border border-green-100 shadow-sm backdrop-blur-sm font-inter">
              <div className="w-2 h-2 rounded-full mr-3 bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
              AI-Powered Workforce Platform
            </span>
          </div>

          <div className="space-y-1 mb-6 w-full">
            <h1 className="text-7xl md:text-8xl lg:text-[6.5rem] font-black leading-[1.25] tracking-tight font-outfit pointer-events-auto cursor-default hover:scale-105 transition-transform duration-500 bg-clip-text text-transparent bg-gradient-to-r from-green-800 via-green-600 to-green-500 pb-4">
              NOVA HR
            </h1>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight font-outfit pointer-events-auto cursor-default hover:scale-105 transition-transform duration-500 bg-clip-text text-transparent bg-gradient-to-r from-green-700 to-green-500 whitespace-nowrap">
              One Platform, Every Perspective
            </h2>
          </div>

          <div className="space-y-4 mb-8 w-full">
            <p className="text-xl text-gray-600 font-semibold tracking-tight font-inter">
              Unified AI Assistant for Your Entire Organization
            </p>
            <p className="text-base text-gray-500 leading-relaxed font-medium font-inter">
              Bridging the gap between individual needs, team management, and organizational strategy through intelligent automation.
            </p>
          </div>

          {/* CTA Button */}
          <div className="pointer-events-auto">
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-3.5 text-lg font-bold rounded-xl transition-all duration-500 transform hover:scale-[1.03] active:scale-95 shadow-lg hover:shadow-green-500/30 flex items-center justify-center group bg-gradient-to-r from-[#16a34a] to-[#22c55e] hover:bg-gradient-to-l text-white cursor-pointer font-inter border-b-4 border-green-700 hover:border-green-800">
              Get Started
              <span className="ml-3 group-hover:translate-x-2 transition-transform duration-300">→</span>
            </button>
          </div>

          {/* Subtle Stats indicators */}
          <div className="flex flex-wrap gap-12 mt-10 pt-2 w-full pointer-events-none">
            <div className="group">
              <div className="text-2xl font-black text-gray-900/60">85%</div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Automation</div>
            </div>
            <div className="group">
              <div className="text-2xl font-black text-gray-900/60">24/7</div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">AI Support</div>
            </div>
            <div className="group">
              <div className="text-2xl font-black text-gray-900/60">100+</div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Global Clients</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;