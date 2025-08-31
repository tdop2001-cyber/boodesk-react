
import { ShoppingBag, Send, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Hero = () => {
  return (
    <div className="pt-24 pb-16 md:pt-32 md:pb-24 bg-gradient-to-b from-white to-brand-light-gray/20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-brand-gray mb-6">
              Crie seu <span className="text-brand-red">catálogo digital</span> e venda pelo <span className="text-brand-green">WhatsApp</span>
            </h1>
            <p className="text-lg text-brand-gray/80 mb-8">
              Simplifique suas vendas online com o WhatsCatalog Pro. 
              Seus produtos organizados, seus clientes satisfeitos, tudo em um só lugar.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/register">
                <Button className="w-full sm:w-auto bg-brand-red hover:bg-[#950303] text-white px-8 py-3 h-auto">
                  Começar Grátis
                </Button>
              </Link>
              <Link to="/features">
                <Button variant="outline" className="w-full sm:w-auto border-brand-green text-brand-green hover:bg-brand-green hover:text-white px-8 py-3 h-auto">
                  Conhecer Recursos
                </Button>
              </Link>
            </div>
            
            <div className="mt-12 grid grid-cols-3 gap-4">
              <div className="flex flex-col items-center text-center">
                <div className="bg-brand-red/10 p-3 rounded-full mb-3">
                  <ShoppingBag className="h-6 w-6 text-brand-red" />
                </div>
                <p className="text-sm font-medium">Catálogo Responsivo</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="bg-brand-green/10 p-3 rounded-full mb-3">
                  <Send className="h-6 w-6 text-brand-green" />
                </div>
                <p className="text-sm font-medium">Pedidos via WhatsApp</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="bg-brand-gray/10 p-3 rounded-full mb-3">
                  <BookOpen className="h-6 w-6 text-brand-gray" />
                </div>
                <p className="text-sm font-medium">Fácil de Gerenciar</p>
              </div>
            </div>
          </div>
          
          <div className="order-1 md:order-2 flex justify-center">
            <div className="relative">
              <div className="absolute -left-6 -top-6 w-full h-full rounded-2xl border-2 border-brand-red"></div>
              <div className="absolute -right-6 -bottom-6 w-full h-full rounded-2xl border-2 border-brand-green"></div>
              <div className="relative z-10 bg-white shadow-xl rounded-2xl overflow-hidden border border-brand-light-gray">
                <div className="bg-brand-red text-white p-4 text-center font-medium">
                  Catálogo de Produtos
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((item) => (
                      <div key={item} className="bg-white rounded-lg overflow-hidden border border-brand-light-gray">
                        <div className="h-24 bg-brand-gray/10 flex items-center justify-center">
                          <ShoppingBag className="h-8 w-8 text-brand-gray/30" />
                        </div>
                        <div className="p-2">
                          <p className="text-xs font-medium">Produto {item}</p>
                          <p className="text-xs text-brand-green">R$ 99,90</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="w-full mt-4 bg-brand-green text-white text-sm py-2 rounded-md flex items-center justify-center">
                    <Send className="h-4 w-4 mr-2" />
                    Comprar via WhatsApp
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
