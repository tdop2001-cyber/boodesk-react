
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, CheckCircle, MessageCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Link } from "react-router-dom";

const Plans = () => {
  const pricingPlans = [
    {
      name: "Básico",
      price: "29,90",
      description: "Ideal para pequenos negócios",
      features: [
        "Até 50 produtos",
        "Link personalizado",
        "Suporte por e-mail",
        "Pedidos via WhatsApp",
      ],
      buttonText: "Começar",
      buttonVariant: "basic",
      popular: false,
    },
    {
      name: "Pro",
      price: "99,90",
      description: "Para vendedores que buscam crescimento",
      features: [
        "Produtos ilimitados",
        "Cupons de desconto",
        "Dashboard avançado",
        "Suporte prioritário",
        "Domínio personalizado",
      ],
      buttonText: "Assinar",
      buttonVariant: "pro",
      popular: true,
    },
    {
      name: "Personalizado",
      price: null,
      description: "Precisa de mais? Fale conosco",
      features: [
        "Produtos ilimitados",
        "Múltiplos usuários",
        "Integrações customizadas",
        "Atendimento dedicado",
      ],
      buttonText: "Conversar",
      buttonVariant: "custom",
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="py-16 md:py-24 container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-brand-gray mb-4">
            Escolha o plano ideal para o seu negócio
          </h1>
          <p className="text-lg text-brand-gray/80">
            Comece a vender pelo WhatsApp hoje mesmo com um dos nossos planos flexíveis
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <Card 
              key={index} 
              className={cn(
                "relative",
                plan.popular ? "border-brand-green shadow-lg" : "border-brand-light-gray"
              )}
            >
              {plan.popular && (
                <div className="absolute -top-3 inset-x-0 flex justify-center">
                  <Badge className="bg-brand-green text-white px-4 py-1">
                    Popular
                  </Badge>
                </div>
              )}
              <CardHeader className={cn(
                "text-center", 
                plan.popular ? "pt-8" : "pt-6"
              )}>
                <CardTitle className="text-2xl font-bold text-brand-gray">{plan.name}</CardTitle>
                <CardDescription className="text-brand-gray/80">{plan.description}</CardDescription>
                {plan.price ? (
                  <div className="mt-4 flex items-center justify-center">
                    <span className="text-3xl font-bold text-brand-red">R$ {plan.price}</span>
                    <span className="text-brand-gray/70 ml-1">/mês</span>
                  </div>
                ) : (
                  <div className="mt-4 flex items-center justify-center">
                    <MessageCircle className="h-6 w-6 text-brand-green mr-2" />
                    <span className="text-xl font-medium text-brand-green">Contato</span>
                  </div>
                )}
              </CardHeader>
              <CardContent className="text-center">
                <ul className="space-y-3 mt-4">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-brand-green mt-0.5 mr-3 shrink-0" />
                      <span className="text-left text-brand-gray">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Link to="/register" className="w-full">
                  <Button 
                    className="w-full" 
                    variant={plan.buttonVariant as "basic" | "pro" | "custom"}
                  >
                    {plan.buttonText}
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Plans;

// Helper function from @/lib/utils
function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}
