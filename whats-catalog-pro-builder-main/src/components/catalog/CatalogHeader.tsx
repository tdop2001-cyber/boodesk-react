
import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, Search, ShoppingBag } from "lucide-react";
import { Input } from "@/components/ui/input";

interface CatalogHeaderProps {
  storeName?: string;
  logoUrl?: string;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  cartCount: number;
  openMenu: () => void;
  openCart: () => void;
}

const CatalogHeader = ({ 
  storeName,
  logoUrl,
  searchQuery, 
  setSearchQuery, 
  cartCount, 
  openMenu, 
  openCart 
}: CatalogHeaderProps) => {
  return (
    <header className="bg-white shadow-lg border-b border-brand-light-gray/30 py-4 sticky top-0 z-30 backdrop-blur-sm bg-white/95">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              className="md:hidden text-brand-gray hover:text-brand-red p-2 hover:bg-brand-red/5 rounded-lg transition-all"
              onClick={openMenu}
            >
              <Menu className="h-5 w-5" />
            </button>
            
            <Link to="/" className="flex items-center space-x-3 group">
              {logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt="Logo da empresa" 
                  className="h-12 w-12 object-contain rounded-xl shadow-sm border border-brand-light-gray/50 group-hover:shadow-md transition-shadow"
                />
              ) : (
                <div className="h-12 w-12 bg-gradient-to-br from-brand-red to-brand-red/80 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                  <ShoppingBag className="h-6 w-6 text-white" />
                </div>
              )}
              <div className="hidden sm:block">
                <span className="font-bold text-lg text-brand-gray block leading-tight group-hover:text-brand-red transition-colors">
                  {storeName || "Loja Modelo"}
                </span>
                <span className="text-sm text-brand-gray/60 block leading-tight">Catálogo Digital</span>
              </div>
            </Link>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="relative hidden md:block max-w-xs w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brand-gray/50 h-4 w-4" />
              <Input
                placeholder="Buscar produtos..."
                className="pl-9 py-2 h-10 border-brand-light-gray/50 focus:border-brand-red/50 rounded-xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <button
              className="relative p-3 hover:bg-brand-green/10 rounded-xl transition-all group"
              onClick={openCart}
            >
              <ShoppingBag className="h-6 w-6 text-brand-green group-hover:scale-110 transition-transform" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-red text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium shadow-md animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
        
        {/* Mobile Search */}
        <div className="mt-4 md:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brand-gray/50 h-4 w-4" />
            <Input
              placeholder="Buscar produtos..."
              className="pl-9 py-3 h-12 border-brand-light-gray/50 focus:border-brand-red/50 rounded-xl text-base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default CatalogHeader;
