
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const ClosingSection = () => {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-white to-brand-green/5">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-brand-gray mb-4">
          Pronto para vender mais?
        </h2>
        <p className="text-lg text-brand-gray/80 mb-8 max-w-2xl mx-auto">
          7 dias grátis, sem necessidade de cartão
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/register">
            <Button className="w-full sm:w-auto bg-brand-red hover:bg-brand-red/90 text-white px-8 py-3 h-auto text-lg">
              Criar Minha Loja
            </Button>
          </Link>
          <Link to="/contact">
            <Button variant="outline" className="w-full sm:w-auto border-brand-green text-brand-green hover:bg-brand-green hover:text-white px-8 py-3 h-auto">
              Falar com Consultor
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ClosingSection;
