const features = [
  { 
    title: "Smart Hiring", 
    desc: "AI-powered resume screening & ranking",
    icon: "🎯",
    color: "from-blue-500 to-blue-600"
  },
  { 
    title: "HR Chatbot", 
    desc: "24/7 employee self-service support",
    icon: "🤖",
    color: "from-green-500 to-green-600"
  },
  { 
    title: "Predictive Analytics", 
    desc: "Real-time HR insights & predictions",
    icon: "📊",
    color: "from-purple-500 to-purple-600"
  },
  {
    title: "Automated Workflows",
    desc: "Intelligent multi-step process automation",
    icon: "⚡",
    color: "from-orange-500 to-orange-600"
  },
  {
    title: "Compliance Guardian",
    desc: "Policy monitoring & regulation checks",
    icon: "🛡️",
    color: "from-red-500 to-red-600"
  },
  {
    title: "Role-Based Dashboards",
    desc: "Personalized views for every user role",
    icon: "👥",
    color: "from-pink-500 to-pink-600"
  }
];

const Features = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Everything You Need in One Platform
          </h2>
          <p className="text-xl text-gray-600">
            From employee self-service to executive dashboards, we've got every HR function covered
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
            >
              <div className="flex items-start space-x-4">
                <div className="text-3xl">{feature.icon}</div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.desc}
                  </p>
                  <div className="mt-4">
                    <span className="inline-flex items-center text-sm font-medium text-green-600 group-hover:text-green-700">
                      Learn more
                      <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                      </svg>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Banner */}
        <div className="mt-20 bg-gradient-to-r from-green-600 to-blue-600 rounded-3xl p-8 text-white">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">70%</div>
              <div className="text-lg opacity-90">Reduction in Manual HR Tasks</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">60%</div>
              <div className="text-lg opacity-90">Faster Recruitment Cycles</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">95%</div>
              <div className="text-lg opacity-90">Employee Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;