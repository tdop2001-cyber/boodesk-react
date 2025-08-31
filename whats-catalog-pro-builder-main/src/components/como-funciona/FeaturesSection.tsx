
import React from "react";
import { Badge } from "@/components/ui/badge";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { ShoppingBag, Bot, BarChart3 } from "lucide-react";

const FeaturesSection = () => {
  const features = [
    {
      icon: <ShoppingBag className="h-8 w-8 text-brand-red" />,
      title: "Seu catálogo em 5 minutos",
      badge: "Sem taxa de adesão",
      list: [
        "Adicione produtos ilimitados",
        "Fotos em alta qualidade",
        "Variações (tamanho/cor)"
      ]
    },
    {
      icon: <Bot className="h-8 w-8 text-brand-green" />,
      title: "Receba pedidos direto no WhatsApp",
      badge: "Integração nativa",
      list: [
        "Mensagem formatada automaticamente",
        "Dados do cliente organizados",
        "Notificação em tempo real"
      ]
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-brand-gray" />,
      title: "Tudo sob controle",
      badge: "Otimizado para mobile",
      list: [
        "Dashboard de vendas",
        "Controle de estoque básico",
        "Cupons de desconto"
      ]
    }
  ];
  
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-brand-gray text-center mb-12">
          Funcionalidades em Destaque
        </h2>
        
        {/* Desktop view: cards in line */}
        <div className="hidden md:grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-white rounded-xl p-6 shadow-md border border-brand-light-gray transition-all hover:shadow-lg hover:border-brand-green"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 rounded-full bg-brand-light-gray/50">
                  {feature.icon}
                </div>
                <Badge variant="custom" className="bg-brand-green/80 text-white">
                  {feature.badge}
                </Badge>
              </div>
              
              <h3 className="text-xl font-semibold text-brand-gray mb-4">
                {feature.title}
              </h3>
              
              <ul className="space-y-2">
                {feature.list.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-brand-gray/80">
                    <span className="text-brand-green font-bold mt-1">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        {/* Mobile view: accordion */}
        <div className="md:hidden">
          <Accordion type="single" collapsible className="w-full">
            {features.map((feature, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="border border-brand-light-gray rounded-lg mb-4 overflow-hidden"
              >
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <div className="flex items-center gap-3 text-left">
                    <div className="p-2 rounded-full bg-brand-light-gray/50">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-brand-gray">
                        {feature.title}
                      </h3>
                      <Badge variant="custom" className="bg-brand-green/80 text-white mt-1">
                        {feature.badge}
                      </Badge>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <ul className="space-y-2">
                    {feature.list.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-brand-gray/80">
                        <span className="text-brand-green font-bold mt-1">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
