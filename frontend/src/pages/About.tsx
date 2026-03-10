import Navbar from "../components/Navbar";

const About = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="container mx-auto px-6 py-20 max-w-4xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">
          About NOVA
        </h1>

        <p className="text-gray-600 text-lg mb-6">
          NOVA is a NOVA AI-powered Human Resource Management system developed
          as a final year project to automate and improve core HR operations.
        </p>

        <p className="text-gray-600 mb-6">
          The system reduces manual workload in areas such as recruitment,
          employee query handling, leave and attendance management, performance
          monitoring, and compliance tracking.
        </p>

        <p className="text-gray-600 mb-6">
          NOVA uses Artificial Intelligence, Natural Language Processing (NLP),
          and predictive analytics to provide intelligent insights and assist HR
          teams and management in making data-driven decisions.
        </p>

        <p className="text-gray-600 mb-6">
          The platform includes role-based dashboards for Employees, HR, and
          Admin/CEO, ensuring secure access and relevant functionality for each
          user role.
        </p>

        <p className="text-gray-600">
          By combining automation with intelligent analytics, NOVA aims to make
          HR processes more efficient, accurate, and scalable for modern
          organizations.
        </p>
      </div>
    </div>
  );
};

export default About;
