// pages/FeaturesPage.tsx
import { useState } from "react";
import Navbar from "../components/Navbar";


const FeaturesPage = () => {
  const [activeCategory, setActiveCategory] = useState("all");

  const featureGroups = [
    {
      id: "ai-assistant",
      title: "🧠 AI-Powered HR Assistant",
      icon: "🤖",
      features: [
        "Natural language employee query handling",
        "24/7 self-service HR chatbot",
        "Leave, policy, and payroll FAQs",
        "Context-aware responses using NLP",
        "Autonomous task execution (agentic workflows)"
      ],
      color: "from-blue-500 to-purple-500"
    },
    {
      id: "recruitment",
      title: "🧑‍💼 Recruitment & Talent Acquisition",
      icon: "🎯",
      features: [
        "Public job portal",
        "AI resume screening & ranking",
        "Skill-based candidate matching",
        "Interview scheduling automation",
        "Candidate application tracking system (ATS)",
        "Hiring analytics & insights"
      ],
      color: "from-green-500 to-teal-500"
    },
    {
      id: "employee-mgmt",
      title: "🗂 Employee Management",
      icon: "👥",
      features: [
        "Employee profile management",
        "Leave application & approval workflows",
        "Attendance tracking",
        "Role-based access control",
        "Employee document storage"
      ],
      color: "from-orange-500 to-red-500"
    },
    {
      id: "performance",
      title: "📊 Performance & Analytics",
      icon: "📈",
      features: [
        "Goal & KPI tracking",
        "AI-assisted performance evaluation",
        "Manager feedback system",
        "Employee productivity insights",
        "Custom HR analytics dashboard"
      ],
      color: "from-purple-500 to-pink-500"
    },
    {
      id: "workforce-intel",
      title: "📉 Workforce Intelligence",
      icon: "🔮",
      features: [
        "Employee attrition prediction",
        "Engagement level analysis",
        "Workforce trend visualization",
        "Risk alerts for HR managers",
        "Data-driven workforce planning"
      ],
      color: "from-indigo-500 to-blue-500"
    },
    {
      id: "learning",
      title: "🎓 Learning & Development",
      icon: "📚",
      features: [
        "Skill gap analysis",
        "Personalized training recommendations",
        "Employee growth tracking",
        "Certification management",
        "AI-driven upskilling insights"
      ],
      color: "from-yellow-500 to-orange-500"
    },
    {
      id: "compliance",
      title: "🛡 Compliance & Security",
      icon: "🔒",
      features: [
        "Policy management system",
        "AI-based policy compliance checks",
        "Audit-ready reports",
        "Secure authentication & authorization",
        "Activity logging & monitoring"
      ],
      color: "from-red-500 to-pink-500"
    },
    {
      id: "dashboards",
      title: "🧭 Dashboards & Workflows",
      icon: "⚙️",
      features: [
        "Role-based dashboards (HR, Employee, Admin)",
        "Multi-step approval workflows",
        "Autonomous HR task execution",
        "Real-time notifications",
        "Smart task prioritization"
      ],
      color: "from-gray-600 to-gray-800"
    },
    {
      id: "platform",
      title: "🌐 Platform & Scalability",
      icon: "🚀",
      features: [
        "Modern web-based UI",
        "Scalable microservice-ready architecture",
        "API-first backend design",
        "Third-party integration ready",
        "Cloud-deployable system"
      ],
      color: "from-cyan-500 to-blue-500"
    }
  ];

  const categories = [
    { id: "all", label: "All Features" },
    { id: "ai", label: "AI Capabilities" },
    { id: "hr", label: "HR Automation" },
    { id: "analytics", label: "Analytics" },
    { id: "security", label: "Security" }
  ];

  // Filter features based on active category
  const filteredFeatures = activeCategory === "all"
    ? featureGroups
    : featureGroups.filter(feature => {
      if (activeCategory === "ai") return ["ai-assistant", "recruitment", "workforce-intel", "learning"].includes(feature.id);
      if (activeCategory === "hr") return ["employee-mgmt", "recruitment"].includes(feature.id);
      if (activeCategory === "analytics") return ["performance", "workforce-intel"].includes(feature.id);
      if (activeCategory === "security") return ["compliance", "platform"].includes(feature.id);
      return true;
    });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-white pt-32 pb-20">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-50/50 blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-50/50 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center space-x-2 mb-6 px-4 py-1.5 bg-emerald-50 border border-emerald-100/50 text-emerald-700 text-sm font-medium rounded-full shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Explore Our Ecosystem</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 mb-8 tracking-tight">
              Powerful <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">NOVA AI</span> Features
            </h1>

            <p className="text-xl md:text-2xl text-slate-600 mb-10 leading-relaxed font-light">
              Elevate your workforce management with intelligent tools designed for the modern enterprise.
            </p>

            <div className="h-1 w-24 bg-emerald-500 mx-auto rounded-full opacity-20"></div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="sticky top-[72px] z-40 w-full">
        <div className="absolute inset-0 bg-white/60 backdrop-blur-xl border-b border-slate-200/50"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative py-6">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 border ${activeCategory === category.id
                  ? "bg-slate-900 text-white border-slate-900 shadow-md transform scale-105"
                  : "bg-white/50 text-slate-600 border-slate-200 hover:border-emerald-300 hover:text-emerald-700 hover:bg-emerald-50/50"
                  }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredFeatures.map((group, index) => (
            <div
              key={group.id}
              className="group relative bg-white rounded-3xl p-8 transition-all duration-500 border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.08)] transform hover:-translate-y-2"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Icon & Title Header */}
              <div className="mb-8">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${group.color.replace('from-', 'from-').replace('to-', 'to-').replace('500', '50').replace('500', '100')} mb-6 group-hover:scale-110 transition-transform duration-500`}>
                  <span className="text-3xl">{group.icon}</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 group-hover:text-emerald-600 transition-colors duration-300">
                  {group.title.split(' ').slice(1).join(' ')}
                </h3>
              </div>

              {/* Features List */}
              <ul className="space-y-5">
                {group.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start group/item">
                    <div className="flex-shrink-0 mt-1.5 transition-transform duration-300 group-hover/item:translate-x-1">
                      <div className="bg-emerald-50 rounded-full p-1">
                        <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                        </svg>
                      </div>
                    </div>
                    <span className="ml-4 text-slate-600 font-medium text-[15px] leading-relaxed group-hover/item:text-slate-900 transition-colors duration-300">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Bottom Decoration */}
              <div className="mt-10 pt-6 border-t border-slate-50 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400 group-hover:text-emerald-500 transition-colors">
                  {group.id.replace('-', ' ')}
                </span>
                <div className="h-1.5 w-1.5 rounded-full bg-slate-200 group-hover:bg-emerald-400"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Feature Stats */}
        <div className="mt-32 relative overflow-hidden bg-slate-900 rounded-[3rem] p-12 md:p-20 text-white">
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-emerald-500/20 blur-[100px] rounded-full"></div>
          <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-blue-500/20 blur-[100px] rounded-full"></div>

          <div className="relative text-center mb-16">
            <h3 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">The Impact of <span className="text-emerald-400">NOVA</span></h3>
            <p className="text-xl text-slate-400 font-light max-w-2xl mx-auto">Real results from industry-leading organizations using our AI-driven platform.</p>
          </div>

          <div className="relative grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            <div className="space-y-2">
              <div className="text-5xl md:text-6xl font-extrabold text-white tracking-tight">85%</div>
              <div className="text-sm font-bold uppercase tracking-widest text-emerald-500">Automation</div>
            </div>
            <div className="space-y-2">
              <div className="text-5xl md:text-6xl font-extrabold text-white tracking-tight">60%</div>
              <div className="text-sm font-bold uppercase tracking-widest text-emerald-500">Efficiency</div>
            </div>
            <div className="space-y-2">
              <div className="text-5xl md:text-6xl font-extrabold text-white tracking-tight">95%</div>
              <div className="text-sm font-bold uppercase tracking-widest text-emerald-500">Retention</div>
            </div>
            <div className="space-y-2">
              <div className="text-5xl md:text-6xl font-extrabold text-white tracking-tight">50+</div>
              <div className="text-sm font-bold uppercase tracking-widest text-emerald-500">AI Modules</div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-32 pb-20 text-center relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-50 blur-[100px] -z-10 rounded-full"></div>

          <h3 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-8 tracking-tight">
            Ready to <span className="text-emerald-600">Level Up</span> Your HR?
          </h3>
          <p className="text-xl text-slate-500 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
            Join the forward-thinking companies already leveraging NOVA AI to automate and optimize their workforce.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button className="group relative px-10 py-5 bg-slate-900 text-white font-bold text-lg rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <span className="relative z-10">Start Free Trial</span>
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
            <button className="px-10 py-5 border-2 border-slate-200 text-slate-700 hover:border-emerald-600 hover:text-emerald-700 font-bold text-lg rounded-2xl transition-all duration-300 bg-white">
              Schedule a Demo
            </button>
          </div>

          <p className="mt-10 text-slate-400 text-sm font-medium">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </div>

      {/* You can add Footer component here */}
      {/* <Footer /> */}
    </div>
  );
};

export default FeaturesPage;