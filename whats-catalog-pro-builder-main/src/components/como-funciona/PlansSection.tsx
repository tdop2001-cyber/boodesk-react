
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const PlansSection = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-brand-gray text-center mb-12">
          Escolha o plano ideal para seu negócio
        </h2>
        
        <div className="max-w-3xl mx-auto overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="px-6 py-4 text-left text-brand-gray font-semibold">Recurso</th>
                <th className="px-6 py-4 text-center text-brand-gray font-semibold">Básico</th>
                <th className="px-6 py-4 text-center text-brand-gray font-semibold">Pro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-light-gray">
              <tr className="even:bg-brand-light-gray/10">
                <td className="px-6 py-4 text-brand-gray/80">Produtos</td>
                <td className="px-6 py-4 text-center text-brand-gray">50</td>
                <td className="px-6 py-4 text-center text-brand-green font-medium">Ilimitado</td>
              </tr>
              <tr className="even:bg-brand-light-gray/10">
                <td className="px-6 py-4 text-brand-gray/80">Link Personalizado</td>
                <td className="px-6 py-4 text-center text-brand-gray">
                  <span className="text-brand-green">✓</span>
                </td>
                <td className="px-6 py-4 text-center text-brand-green font-medium">
                  <span className="text-brand-green">✓</span>
                </td>
              </tr>
              <tr className="even:bg-brand-light-gray/10">
                <td className="px-6 py-4 text-brand-gray/80">Cupons</td>
                <td className="px-6 py-4 text-center text-brand-gray">
                  <span className="text-brand-red">✖</span>
                </td>
                <td className="px-6 py-4 text-center text-brand-green font-medium">
                  <span className="text-brand-green">✓</span>
                </td>
              </tr>
              <tr className="even:bg-brand-light-gray/10">
                <td className="px-6 py-4 text-brand-gray/80">Suporte</td>
                <td className="px-6 py-4 text-center text-brand-gray">E-mail</td>
                <td className="px-6 py-4 text-center text-brand-green font-medium">Prioritário</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        {/* Floating button for mobile */}
        <div className="fixed bottom-6 left-0 right-0 flex justify-center md:static md:mt-12 md:mb-0 z-50">
          <Link to="/plans">
            <Button className="shadow-lg bg-brand-red hover:bg-brand-red/90 text-white">
              Comparar Planos Completo
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PlansSection;
