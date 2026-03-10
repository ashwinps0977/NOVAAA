import Navbar from "../components/Navbar";

const Contact = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="container mx-auto px-6 py-24 max-w-4xl text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">
          Get in Touch
        </h1>

        <p className="text-gray-600 text-lg mb-10">
          NOVA is an academic project developed to explore the use of
          NOVA AI in Human Resource Management systems.
        </p>

        <p className="text-gray-600 mb-6">
          This page exists to represent how organizations can provide a
          communication channel within an enterprise HR platform.
          In a real-world deployment, this section can be extended to
          include feedback forms, help desks, or AI-assisted support.
        </p>

        <p className="text-gray-600 mb-6">
          For academic discussions, project reviews, or technical queries,
          this system demonstrates how modern HR platforms enable structured
          and accessible communication.
        </p>

        <div className="mt-12">
          <p className="text-sm text-gray-500">
            Developed as a Final Year B.Tech Project
          </p>
          <p className="text-sm text-gray-500">
            NOVA AI-Powered HR Assistant – NOVA
          </p>
        </div>
      </div>
    </div>
  );
};

export default Contact;
