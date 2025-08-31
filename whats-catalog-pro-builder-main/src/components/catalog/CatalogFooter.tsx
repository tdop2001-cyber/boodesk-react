
import { Link } from "react-router-dom";
import { MessageSquare, Send, ShoppingBag } from "lucide-react";

const CatalogFooter = () => {
  return (
    <>
      <footer className="bg-white shadow-md mt-12 py-8 border-t border-brand-light-gray">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <div className="flex items-center space-x-2 mb-2">
                <ShoppingBag className="h-5 w-5 text-brand-red" />
                <span className="font-semibold">Loja Modelo</span>
              </div>
              <p className="text-sm text-brand-gray/70">
                Catálogo digital integrado ao WhatsApp
              </p>
            </div>
            
            <div className="text-center md:text-right">
              <p className="text-sm text-brand-gray/70 mb-2">
                Entre em contato pelo WhatsApp:
              </p>
              <a
                href="https://wa.me/5511999999999"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center bg-[#2E8B57] text-white px-4 py-2 rounded-md hover:bg-[#2E8B57]/90 transition-colors"
              >
                <Send className="h-4 w-4 mr-2" />
                Enviar Mensagem
              </a>
            </div>
          </div>
          
          <div className="text-center text-xs text-brand-gray/60 mt-8">
            <p>Desenvolvido com ❤️ por WhatsCatalog Pro</p>
            <p className="mt-1">© {new Date().getFullYear()} Todos os direitos reservados</p>
          </div>
        </div>
      </footer>
      
      {/* Floating WhatsApp Button */}
      <div className="fixed bottom-20 right-4 z-30">
        <a
          href="https://wa.me/5511999999999"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#2E8B57] text-white rounded-full p-4 shadow-lg flex items-center justify-center hover:bg-[#2E8B57]/90 transition-colors"
        >
          <MessageSquare className="h-6 w-6" />
        </a>
      </div>
    </>
  );
};

export default CatalogFooter;
