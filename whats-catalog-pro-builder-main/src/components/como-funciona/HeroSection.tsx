
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative pt-24 pb-16 overflow-hidden">
      <div className="absolute inset-0 bg-brand-green/10 z-0"></div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-brand-gray mb-6">
              Venda 24/7 pelo WhatsApp sem complicação
            </h1>
            <p className="text-xl text-brand-gray/80 mb-8">
              WhatsCatalog Pro - Seu catálogo digital sempre aberto
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/register">
                <Button className="w-full sm:w-auto bg-brand-red hover:bg-brand-red/90 text-white px-8 py-3 h-auto">
                  Experimente Grátis
                </Button>
              </Link>
              <Link to="/plans">
                <Button variant="outline" className="w-full sm:w-auto border-brand-green text-brand-green hover:bg-brand-green hover:text-white px-8 py-3 h-auto">
                  Ver Planos
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="flex justify-center">
            <div className="relative w-[280px] md:w-[320px]">
              {/* Phone mockup */}
              <div className="relative z-10 rounded-[40px] border-[14px] border-black bg-white overflow-hidden shadow-xl h-[580px]">
                <div className="absolute top-0 w-full h-6 bg-black"></div>
                <div className="h-full overflow-hidden">
                  {/* Phone content - animated scroll effect */}
                  <div className="animate-slide">
                    {/* Catalog screen */}
                    <div className="h-[550px] flex flex-col">
                      <div className="bg-brand-red text-white p-3 text-center font-medium">
                        Catálogo de Produtos
                      </div>
                      <div className="p-4 flex-1">
                        <div className="grid grid-cols-2 gap-3">
                          {[1, 2, 3, 4, 5, 6].map((item) => (
                            <div key={item} className="bg-white rounded-lg overflow-hidden border border-brand-light-gray">
                              <div className="h-20 bg-brand-gray/10 flex items-center justify-center">
                                <ArrowRight className="h-6 w-6 text-brand-gray/30" />
                              </div>
                              <div className="p-2">
                                <p className="text-xs font-medium">Produto {item}</p>
                                <p className="text-xs text-brand-green">R$ 99,90</p>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="fixed bottom-12 right-0 left-0 mx-4">
                          <div className="bg-white shadow-lg rounded-lg p-3 border border-brand-light-gray">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium">Carrinho (3)</span>
                              <span className="text-sm font-bold text-brand-red">R$ 289,70</span>
                            </div>
                            <button className="w-full bg-brand-green text-white text-sm py-2 rounded-md flex items-center justify-center">
                              Finalizar Pedido
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* WhatsApp screen */}
                    <div className="h-[550px] flex flex-col">
                      <div className="bg-[#128C7E] text-white p-3">
                        <div className="flex items-center gap-2">
                          <ArrowRight className="h-5 w-5" />
                          <span className="font-medium">WhatsCatalog Pro</span>
                        </div>
                      </div>
                      <div className="p-4 bg-[#E5DDD5] flex-1">
                        <div className="bg-white rounded-lg p-3 shadow-sm max-w-[85%] ml-auto mb-3">
                          <p className="text-xs">Olá! Gostaria de fazer um pedido</p>
                        </div>
                        <div className="bg-[#DCF8C6] rounded-lg p-3 shadow-sm max-w-[85%] mr-auto">
                          <p className="text-xs font-bold">📦 PEDIDO - Loja Demo</p>
                          <p className="text-xs">Cliente: Maria Silva</p>
                          <p className="text-xs">WhatsApp: (11) 98765-4321</p>
                          <p className="text-xs">Itens:</p>
                          <p className="text-xs">- 1x Camiseta Preta (P) → R$ 59,90</p>
                          <p className="text-xs">- 2x Calça Jeans (M) → R$ 199,80</p>
                          <p className="text-xs font-bold">Total: R$ 259,70</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -left-4 -top-4 w-full h-full rounded-[48px] border-2 border-brand-red -z-10"></div>
              <div className="absolute -right-4 -bottom-4 w-full h-full rounded-[48px] border-2 border-brand-green -z-10"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
