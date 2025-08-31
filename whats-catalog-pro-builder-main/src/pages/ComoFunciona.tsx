
import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSection from "@/components/como-funciona/HeroSection";
import FeaturesSection from "@/components/como-funciona/FeaturesSection";
import DemoSection from "@/components/como-funciona/DemoSection";
import PlansSection from "@/components/como-funciona/PlansSection";
import ClosingSection from "@/components/como-funciona/ClosingSection";

const ComoFunciona = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <DemoSection />
        <PlansSection />
        <ClosingSection />
      </main>
      <Footer />
    </div>
  );
};

export default ComoFunciona;
