import { ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-brand-gray text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <img 
                src="/lovable-uploads/c8660c76-6479-46c8-b3c6-cb56302fcaef.png" 
                alt="Astrabytes Logo" 
                className="h-6 w-6" 
              />
              <span className="font-semibold text-xl">
                Astra<span className="text-brand-green">bytes</span>
              </span>
            </div>
            <p className="text-white/70 mb-4">
              A plataforma completa para criar catálogos digitais e vender pelo WhatsApp.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium text-lg mb-4">Links Úteis</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-white/70 hover:text-white transition-colors">Início</Link></li>
              <li><Link to="/features" className="text-white/70 hover:text-white transition-colors">Funcionalidades</Link></li>
              <li><Link to="/pricing" className="text-white/70 hover:text-white transition-colors">Planos</Link></li>
              <li><Link to="/register" className="text-white/70 hover:text-white transition-colors">Cadastre-se</Link></li>
              <li><Link to="/login" className="text-white/70 hover:text-white transition-colors">Login</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-lg mb-4">Contato</h4>
            <p className="text-white/70 mb-2">contato@whatscatalogpro.com</p>
            <p className="text-white/70">WhatsApp: (11) 99999-9999</p>
          </div>
        </div>
        
        <div className="border-t border-white/20 mt-8 pt-8 text-center text-white/60 text-sm">
          <p>&copy; {new Date().getFullYear()} WhatsCatalog Pro. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
