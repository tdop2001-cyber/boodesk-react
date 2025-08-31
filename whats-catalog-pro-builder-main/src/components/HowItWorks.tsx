
import { ShoppingBag, Store, Send, User, ArrowRight } from "lucide-react";

const howItWorks = [
  {
    icon: <ShoppingBag className="h-8 w-8 text-white" />,
    title: "1. Cadastre seus produtos",
    description: "Adicione fotos, descrições e preços ao seu catálogo digital."
  },
  {
    icon: <Store className="h-8 w-8 text-white" />,
    title: "2. Personalize sua loja",
    description: "Adicione informações sobre seu negócio e customize seu catálogo."
  },
  {
    icon: <Send className="h-8 w-8 text-white" />,
    title: "3. Compartilhe seu link",
    description: "Divulgue seu catálogo nas redes sociais e para seus contatos."
  },
  {
    icon: <User className="h-8 w-8 text-white" />,
    title: "4. Receba pedidos",
    description: "Os clientes montam o carrinho e enviam o pedido para seu WhatsApp."
  }
];

const HowItWorks = () => {
  return (
    <div className="py-16 md:py-24 bg-brand-light-gray/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-brand-gray mb-4">
            Como funciona o <span className="text-brand-red">WhatsCatalog Pro</span>
          </h2>
          <p className="text-lg text-brand-gray/80">
            Em apenas 4 passos simples, você terá seu catálogo online e começará a receber pedidos pelo WhatsApp.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {howItWorks.map((step, index) => (
            <div key={index} className="relative">
              <div className="bg-gradient-to-r from-brand-red to-brand-green rounded-xl p-6 text-white">
                <div className="bg-white/20 rounded-full w-16 h-16 flex items-center justify-center mb-5">
                  {step.icon}
                </div>
                <h3 className="text-xl font-medium mb-3">{step.title}</h3>
                <p className="text-white/90">{step.description}</p>
              </div>
              
              {index < howItWorks.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                  <ArrowRight className="h-8 w-8 text-brand-gray/30" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
