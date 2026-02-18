import { useState } from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";

const Home = () => {
  const [isImageHovered, setIsImageHovered] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <Navbar isImageHovered={isImageHovered} />
      <Hero isImageHovered={isImageHovered} setIsImageHovered={setIsImageHovered} />
      {/* Features section removed - now it's a separate page */}
    </div>
  );
};

export default Home;