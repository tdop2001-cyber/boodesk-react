
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const pricingPlans = [
  {
    name: "Básico",
    price: "0",
    description: "Para pequenos negócios começando nas vendas online",
    features: [
      "Até 20 produtos",
      "Link personalizado",
      "Pedidos via WhatsApp",
      "Suporte por email"
    ],
    limitations: [
      "Sem cupons de desconto",
      "Sem domínio personalizado"
    ],
    cta: "Começar Grátis",
    ctaLink: "/register",
    highlighted: false
  },
  {
    name: "Pro",
    price: "49,90",
    description: "Para vendedores que desejam recursos avançados",
    features: [
      "Produtos ilimitados",
      "Cupons de desconto",
      "Domínio personalizado",
      "Múltiplas variações de produtos",
      "Análise de vendas",
      "Suporte prioritário"
    ],
    limitations: [],
    cta: "Assinar Agora",
    ctaLink: "/register",
    highlighted: true
  }
];

const PricingSection = () => {
  return (
    <div className="py-16 md:py-24 bg-white" id="pricing">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-brand-gray mb-4">
            Planos simples e transparentes
          </h2>
          <p className="text-lg text-brand-gray/80">
            Escolha o plano ideal para o seu negócio e comece a vender pelo WhatsApp hoje mesmo.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <div 
              key={index} 
              className={`rounded-xl overflow-hidden border ${
                plan.highlighted 
                  ? "border-brand-green shadow-lg" 
                  : "border-brand-light-gray"
              }`}
            >
              {plan.highlighted && (
                <div className="bg-brand-green text-white text-center py-2 font-medium">
                  Mais Popular
                </div>
              )}
              
              <div className="p-8">
                <h3 className="text-2xl font-bold text-brand-gray mb-2">{plan.name}</h3>
                <div className="flex items-baseline mb-4">
                  <span className="text-4xl font-bold text-brand-red">R$ {plan.price}</span>
                  {plan.price !== "0" && <span className="text-brand-gray/70 ml-1">/mês</span>}
                </div>
                <p className="text-brand-gray/80 mb-6">{plan.description}</p>
                
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center">
                      <span className="bg-brand-green/10 rounded-full p-1 mr-3">
                        <Check className="h-4 w-4 text-brand-green" />
                      </span>
                      <span className="text-brand-gray">{feature}</span>
                    </li>
                  ))}
                  
                  {plan.limitations.map((limitation, i) => (
                    <li key={i} className="flex items-center text-brand-gray/60">
                      <span className="bg-brand-red/10 rounded-full p-1 mr-3">
                        <Check className="h-4 w-4 text-brand-red/50" />
                      </span>
                      <span>{limitation}</span>
                    </li>
                  ))}
                </ul>
                
                <Link to={plan.ctaLink}>
                  <Button 
                    className={`w-full ${
                      plan.highlighted 
                        ? "bg-brand-green hover:bg-brand-green/90" 
                        : "bg-brand-red hover:bg-brand-red/90"
                    } text-white`}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PricingSection;
