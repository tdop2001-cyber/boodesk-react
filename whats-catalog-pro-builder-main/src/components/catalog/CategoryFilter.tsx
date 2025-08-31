
import { useState } from "react";
import { X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
  isMenuOpen: boolean;
  closeMenu: () => void;
}

const CategoryFilter = ({ 
  categories, 
  selectedCategory, 
  setSelectedCategory, 
  isMenuOpen,
  closeMenu
}: CategoryFilterProps) => {
  const isMobile = useIsMobile();
  
  // Mobile Categories - Now horizontal scrolling instead of sidebar
  const mobileCategories = (
    <div className="md:hidden px-4 py-4 bg-white border-b border-brand-light-gray/30">
      <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((category) => (
          <button
            key={category}
            className={`px-6 py-3 rounded-full whitespace-nowrap text-sm font-medium transition-all duration-200 ${
              selectedCategory === category || (category === "Todos" && !selectedCategory)
                ? "bg-gradient-to-r from-brand-red to-brand-red/90 text-white shadow-md transform scale-105"
                : "bg-gradient-to-r from-white to-gray-50 text-brand-gray hover:from-brand-red/10 hover:to-brand-red/5 hover:text-brand-red border border-brand-light-gray/50 hover:border-brand-red/20"
            }`}
            onClick={() => setSelectedCategory(category === "Todos" ? null : category)}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );

  // Mobile Menu (kept as fallback)
  const mobileCategoryMenu = isMenuOpen && (
    <div className="fixed inset-0 z-40 md:hidden">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={closeMenu}
      ></div>
      <div className="absolute top-0 left-0 w-80 h-full bg-white shadow-2xl z-50 overflow-y-auto">
        <div className="p-6 border-b border-brand-light-gray flex justify-between items-center bg-gradient-to-r from-brand-red to-brand-red/90">
          <span className="font-semibold text-white text-lg">Categorias</span>
          <button onClick={closeMenu} className="text-white hover:bg-white/20 p-1 rounded">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <nav className="p-6">
          <ul className="space-y-3">
            {categories.map((category) => (
              <li key={category}>
                <button
                  className={`w-full text-left p-4 rounded-xl transition-all duration-200 ${
                    selectedCategory === category || (category === "Todos" && !selectedCategory)
                      ? "bg-gradient-to-r from-brand-red/10 to-brand-red/5 text-brand-red font-semibold border-l-4 border-brand-red"
                      : "text-brand-gray hover:bg-gradient-to-r hover:from-brand-red/5 hover:to-transparent hover:text-brand-red"
                  }`}
                  onClick={() => {
                    setSelectedCategory(category === "Todos" ? null : category);
                    closeMenu();
                  }}
                >
                  {category}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
  
  // Desktop Categories
  const desktopCategories = (
    <div className="hidden md:block bg-white border-b border-brand-light-gray/30 py-6">
      <div className="container mx-auto px-4">
        <div className="flex items-center space-x-4 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category}
              className={`px-6 py-3 rounded-full whitespace-nowrap font-medium transition-all duration-300 ${
                selectedCategory === category || (category === "Todos" && !selectedCategory)
                  ? "bg-gradient-to-r from-brand-red to-brand-red/90 text-white shadow-lg transform scale-105"
                  : "bg-gradient-to-r from-white to-gray-50 text-brand-gray hover:from-brand-red/10 hover:to-brand-red/5 hover:text-brand-red border border-brand-light-gray/50 hover:border-brand-red/20 hover:shadow-md"
              }`}
              onClick={() => setSelectedCategory(category === "Todos" ? null : category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
  
  return (
    <>
      {mobileCategoryMenu}
      {mobileCategories}
      {desktopCategories}
    </>
  );
};

export default CategoryFilter;
