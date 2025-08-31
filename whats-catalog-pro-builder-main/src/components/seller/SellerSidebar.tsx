
import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Menu } from "lucide-react";

// Add the Settings icon import
import { Package, ShoppingBag, Tag, BarChart, Settings } from "lucide-react";

interface SellerSidebarProps {
  isMenuOpen: boolean;
  toggleMenu: () => void;
}

const SellerSidebar: React.FC<SellerSidebarProps> = ({ isMenuOpen, toggleMenu }) => {
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768); // Adjust the breakpoint as needed
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Sidebar content
  const sidebarContent = (
    <div className="flex flex-col gap-1">
      <NavLink
        to="/seller-dashboard"
        className={({ isActive }) =>
          `flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
            isActive
              ? "bg-brand-red text-white"
              : "text-brand-gray hover:bg-brand-light-gray/60"
          }`
        }
      >
        <BarChart className="h-5 w-5" />
        <span>Dashboard</span>
      </NavLink>
      <NavLink
        to="/seller-catalog"
        className={({ isActive }) =>
          `flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
            isActive
              ? "bg-brand-red text-white"
              : "text-brand-gray hover:bg-brand-light-gray/60"
          }`
        }
      >
        <Package className="h-5 w-5" />
        <span>Meu Catálogo</span>
      </NavLink>
      <NavLink
        to="/seller-orders"
        className={({ isActive }) =>
          `flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
            isActive
              ? "bg-brand-red text-white"
              : "text-brand-gray hover:bg-brand-light-gray/60"
          }`
        }
      >
        <ShoppingBag className="h-5 w-5" />
        <span>Pedidos</span>
      </NavLink>
      <NavLink
        to="/seller-promotions"
        className={({ isActive }) =>
          `flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
            isActive
              ? "bg-brand-red text-white"
              : "text-brand-gray hover:bg-brand-light-gray/60"
          }`
        }
      >
        <Tag className="h-5 w-5" />
        <span>Promoções</span>
      </NavLink>
      <NavLink
        to="/seller-settings"
        className={({ isActive }) =>
          `flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
            isActive
              ? "bg-brand-red text-white"
              : "text-brand-gray hover:bg-brand-light-gray/60"
          }`
        }
      >
        <Settings className="h-5 w-5" />
        <span>Configurações</span>
      </NavLink>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={isMenuOpen} onOpenChange={toggleMenu}>
        <DrawerTrigger asChild>
          <button className="absolute top-4 left-4 md:hidden p-2 bg-white rounded-md shadow-md z-10" onClick={toggleMenu}>
            <Menu className="h-6 w-6 text-brand-gray" />
          </button>
        </DrawerTrigger>
        <DrawerContent className="pt-6">
          {sidebarContent}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <aside className="fixed left-0 top-0 z-20 h-full w-64 bg-white border-r border-brand-light-gray/30 py-8 px-3 hidden md:flex flex-col">
      <div className="pb-6 mb-6 border-b border-brand-light-gray/30">
        <h3 className="font-bold text-lg text-brand-gray">Whatscatalog</h3>
        <p className="text-sm text-brand-gray/70">Painel do Vendedor</p>
      </div>
      {sidebarContent}
    </aside>
  );
};

export default SellerSidebar;
