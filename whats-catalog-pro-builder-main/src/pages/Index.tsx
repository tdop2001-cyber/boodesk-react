
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import PricingSection from "@/components/PricingSection";
import CtaSection from "@/components/CtaSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <PricingSection />
        
        {/* Link to Como Funciona page */}
        <section className="py-16 md:py-24 bg-gradient-to-b from-white to-brand-light-gray/20 text-center">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-brand-gray mb-6">
              Quer saber como o WhatsCatalog Pro funciona?
            </h2>
            <p className="text-xl text-brand-gray/80 mb-8 max-w-3xl mx-auto">
              Conheça em detalhes como nossa plataforma pode transformar seu WhatsApp em uma poderosa ferramenta de vendas
            </p>
            <Link to="/como-funciona">
              <Button className="bg-brand-green hover:bg-brand-green/90 px-8 py-6 h-auto text-lg font-medium">
                Ver Como Funciona
              </Button>
            </Link>
          </div>
        </section>
        
        {/* New section to link to plans page */}
        <section className="py-16 md:py-24 bg-brand-light-gray text-center">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-brand-gray mb-6">
              Escolha o Plano Ideal
            </h2>
            <p className="text-xl text-brand-gray/80 mb-8 max-w-3xl mx-auto">
              Encontre o plano perfeito para o seu negócio e comece a vender pelo WhatsApp
            </p>
            <Link to="/plans">
              <Button className="bg-brand-red hover:bg-[#950303] px-8 py-6 h-auto text-lg font-medium">
                Ver Planos
              </Button>
            </Link>
          </div>
        </section>

        <CtaSection />
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
