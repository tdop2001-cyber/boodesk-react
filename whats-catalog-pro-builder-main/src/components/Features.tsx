
import { Smartphone, Image, Tag, Gift, Coins, Link as LinkIcon, ShoppingCart, UserCircle } from "lucide-react";

const features = [
  {
    icon: <Image className="h-8 w-8 text-brand-red" />,
    title: "Catálogo Completo",
    description: "Cadastre produtos com fotos, descrições, variações e preços de forma organizada."
  },
  {
    icon: <Smartphone className="h-8 w-8 text-brand-red" />,
    title: "100% Mobile",
    description: "Design responsivo para uma experiência perfeita em qualquer dispositivo."
  },
  {
    icon: <LinkIcon className="h-8 w-8 text-brand-red" />,
    title: "Link Personalizado",
    description: "Tenha seu endereço próprio como sualoja.whatscatalog.com."
  },
  {
    icon: <Tag className="h-8 w-8 text-brand-red" />,
    title: "Códigos de Desconto",
    description: "Crie cupons promocionais para alavancar suas vendas."
  },
  {
    icon: <ShoppingCart className="h-8 w-8 text-brand-red" />,
    title: "Carrinho Integrado",
    description: "Seus clientes selecionam produtos e enviam o pedido direto para seu WhatsApp."
  },
  {
    icon: <Gift className="h-8 w-8 text-brand-red" />,
    title: "Promoções Especiais",
    description: "Destaque ofertas e novidades para atrair mais clientes."
  },
  {
    icon: <Coins className="h-8 w-8 text-brand-red" />,
    title: "Sem Comissões",
    description: "Não cobramos percentual sobre suas vendas, apenas um plano fixo mensal."
  },
  {
    icon: <UserCircle className="h-8 w-8 text-brand-red" />,
    title: "Perfil da Loja",
    description: "Personalize com informações, logo e cores da sua marca."
  }
];

const Features = () => {
  return (
    <div className="py-16 md:py-24 bg-white" id="features">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-brand-gray mb-4">
            Tudo que você precisa para vender pelo <span className="text-brand-green">WhatsApp</span>
          </h2>
          <p className="text-lg text-brand-gray/80">
            Recursos pensados para facilitar sua vida e aumentar suas vendas,
            sem complicações ou conhecimentos técnicos.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-brand-light-gray hover:shadow-md transition-shadow">
              <div className="bg-brand-red/10 rounded-full w-16 h-16 flex items-center justify-center mb-5">
                {feature.icon}
              </div>
              <h3 className="text-xl font-medium text-brand-gray mb-3">{feature.title}</h3>
              <p className="text-brand-gray/80">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Features;
