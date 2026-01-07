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
      <div className="relative bg-gradient-to-br from-green-50 to-blue-50 py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <span className="inline-block mb-4 px-4 py-2 bg-green-100 text-green-700 text-sm font-semibold rounded-full">
              Explore Our Features
            </span>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Discover <span className="text-green-600">NOVA</span> AI
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Everything you need to transform HR operations into intelligent, automated workflows
            </p>
            <p className="text-lg text-gray-500 max-w-3xl mx-auto">
              From AI-powered recruitment to predictive analytics, our platform delivers comprehensive solutions for every aspect of human resource management.
            </p>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="sticky top-20 z-40 bg-white/90 backdrop-blur-sm border-b border-gray-200 py-4">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-2 md:gap-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                  activeCategory === category.id
                    ? "bg-green-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredFeatures.map((group, index) => (
            <div 
              key={group.id}
              className="group bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 transform hover:-translate-y-1"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Header with Gradient */}
              <div className={`bg-gradient-to-r ${group.color} p-6`}>
                <div className="flex items-center space-x-4">
                  <div className="text-4xl">{group.icon}</div>
                  <h3 className="text-xl font-bold text-white">{group.title}</h3>
                </div>
              </div>

              {/* Features List */}
              <div className="p-6">
                <ul className="space-y-4">
                  {group.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <div className="flex-shrink-0 mt-1">
                        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                      </div>
                      <span className="ml-3 text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Stats/Info (Optional) */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>🚀 Ready to Use</span>
                    <span>⚡ Fully Automated</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Feature Stats */}
        <div className="mt-20 bg-gradient-to-r from-green-600 to-blue-600 rounded-3xl p-8 text-white">
          <div className="text-center mb-10">
            <h3 className="text-3xl font-bold mb-4">Why Companies Choose NOVA</h3>
            <p className="text-lg opacity-90">See the impact our features deliver</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold mb-2">85%</div>
              <div className="text-lg opacity-90">HR Process Automation</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">60%</div>
              <div className="text-lg opacity-90">Faster Recruitment</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">95%</div>
              <div className="text-lg opacity-90">Employee Satisfaction</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">50+</div>
              <div className="text-lg opacity-90">Features Available</div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <h3 className="text-3xl font-bold text-gray-900 mb-6">
            Ready to Transform Your HR Operations?
          </h3>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join hundreds of companies already using NOVA AI to streamline their HR processes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-bold text-lg rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
              Start Free Trial
            </button>
            <button className="px-8 py-4 border-2 border-green-600 text-green-600 hover:bg-green-50 font-bold text-lg rounded-full transition-all duration-300">
              Schedule a Demo
            </button>
          </div>
        </div>
      </div>

      {/* You can add Footer component here */}
      {/* <Footer /> */}
    </div>
  );
};

export default FeaturesPage;