
import React from "react";
import { Play, ChevronRight } from "lucide-react";

const DemoSection = () => {
  return (
    <section className="py-16 bg-brand-light-gray/30">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-brand-gray text-center mb-6">
          Veja o WhatsCatalog Pro em ação
        </h2>
        <p className="text-lg text-brand-gray/80 text-center mb-12 max-w-3xl mx-auto">
          Um sistema simples e eficiente para transformar seu WhatsApp em uma ferramenta de vendas poderosa.
        </p>
        
        <div className="max-w-3xl mx-auto relative rounded-xl overflow-hidden shadow-xl border border-brand-light-gray">
          {/* Video placeholder - in a real implementation this would be a video player */}
          <div className="aspect-video bg-brand-gray/10 flex items-center justify-center relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <button className="w-16 h-16 bg-brand-red rounded-full flex items-center justify-center shadow-lg hover:bg-brand-red/90 transition-colors">
                <Play className="h-8 w-8 text-white fill-white ml-1" />
              </button>
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent py-4 px-6">
              <div className="flex justify-between items-center">
                <p className="text-white font-medium">Assista e veja como é fácil (45s)</p>
                <div className="flex gap-2">
                  <button className="w-8 h-8 bg-brand-green rounded-full flex items-center justify-center text-white">
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="absolute bottom-10 left-0 right-0 px-6">
              <div className="h-1 bg-white/30 rounded-full overflow-hidden">
                <div className="h-full w-[35%] bg-brand-green rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 text-center text-sm text-brand-gray/60">
          <p>1. Cadastrando um produto (0:00-0:15) • 2. Cliente fazendo pedido (0:16-0:30) • 3. Vendedor recebendo no WhatsApp (0:31-0:45)</p>
        </div>
      </div>
    </section>
  );
};

export default DemoSection;
