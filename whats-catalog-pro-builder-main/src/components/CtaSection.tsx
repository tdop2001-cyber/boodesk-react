
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const CtaSection = () => {
  return (
    <div className="py-16 md:py-24 bg-gradient-to-r from-brand-red to-brand-green text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Pronto para transformar suas vendas pelo WhatsApp?
        </h2>
        <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
          Junte-se a milhares de vendedores que já estão aproveitando o poder dos catálogos digitais integrados ao WhatsApp.
        </p>
        <Link to="/register">
          <Button className="bg-white text-brand-red hover:bg-white/90 px-8 py-6 h-auto text-lg font-medium">
            Criar Meu Catálogo Agora
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default CtaSection;
