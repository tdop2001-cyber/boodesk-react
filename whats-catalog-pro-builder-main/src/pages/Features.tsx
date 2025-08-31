import React from "react";
import Navbar from "@/components/Navbar";
import Features from "@/components/Features";
import Footer from "@/components/Footer";

const FeaturesPage = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main>
        <Features />
      </main>
      
      <Footer />
    </div>
  );
};

export default FeaturesPage;