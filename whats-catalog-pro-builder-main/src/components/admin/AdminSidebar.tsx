
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  BarChart, Users, TicketCheck, Settings, 
  Home, Menu, X, LogOut 
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminSidebarProps {
  isMenuOpen: boolean;
  toggleMenu: () => void;
}

const AdminSidebar = ({ isMenuOpen, toggleMenu }: AdminSidebarProps) => {
  const location = useLocation();
  
  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white z-40 border-b flex justify-between items-center px-4 h-16">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            className="mr-2 p-1.5" 
            onClick={toggleMenu}
          >
            <Menu className="h-5 w-5 text-brand-gray" />
          </Button>
          <div className="flex items-center space-x-2">
            <img 
              src="/lovable-uploads/c8660c76-6479-46c8-b3c6-cb56302fcaef.png" 
              alt="Astrabytes Logo" 
              className="h-6 w-6" 
            />
            <span className="font-semibold text-lg">
              Astra<span className="text-brand-green">bytes</span> <span className="text-brand-red font-normal">Admin</span>
            </span>
          </div>
        </div>
      </div>
      
      {/* Sidebar Overlay */}
      {isMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/20 z-40"
          onClick={toggleMenu}
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white border-r shadow-sm transform transition-transform duration-200 ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b">
          <div className="flex items-center space-x-2">
            <img 
              src="/lovable-uploads/c8660c76-6479-46c8-b3c6-cb56302fcaef.png" 
              alt="Astrabytes Logo" 
              className="h-6 w-6" 
            />
            <span className="font-semibold text-lg">
              Astra<span className="text-brand-green">bytes</span> <span className="text-brand-red font-normal">Admin</span>
            </span>
          </div>
          <button 
            className="md:hidden p-1 text-brand-gray"
            onClick={toggleMenu}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Sidebar Links */}
        <div className="py-4 flex flex-col h-[calc(100%-4rem)]">
          <div className="flex-1 overflow-y-auto">
            <div className="px-3 mb-2 text-xs font-medium text-brand-gray/70 uppercase">
              Principal
            </div>
            <nav className="space-y-1 px-2">
              <Link 
                to="/admin-dashboard" 
                className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium ${
                  location.pathname === "/admin-dashboard" && !location.hash
                    ? "bg-brand-red/10 text-brand-red"
                    : "text-brand-gray hover:bg-gray-100"
                }`}
              >
                <BarChart className="h-4 w-4" />
                <span>Visão Geral</span>
              </Link>
              <Link 
                to="/admin-dashboard#management" 
                className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium ${
                  location.hash === "#management"
                    ? "bg-brand-red/10 text-brand-red"
                    : "text-brand-gray hover:bg-gray-100"
                }`}
              >
                <Users className="h-4 w-4" />
                <span>Gerenciamento</span>
              </Link>
              <Link 
                to="/admin-dashboard#support" 
                className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium ${
                  location.hash === "#support"
                    ? "bg-brand-red/10 text-brand-red"
                    : "text-brand-gray hover:bg-gray-100"
                }`}
              >
                <TicketCheck className="h-4 w-4" />
                <span>Suporte</span>
              </Link>
            </nav>
            
            <div className="px-3 mt-6 mb-2 text-xs font-medium text-brand-gray/70 uppercase">
              Sistema
            </div>
            <nav className="space-y-1 px-2">
              <Link 
                to="/admin-settings" 
                className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium ${
                  location.pathname === "/admin-settings"
                    ? "bg-brand-red/10 text-brand-red"
                    : "text-brand-gray hover:bg-gray-100"
                }`}
              >
                <Settings className="h-4 w-4" />
                <span>Configurações</span>
              </Link>
              <Link 
                to="/" 
                className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium text-brand-gray hover:bg-gray-100"
              >
                <Home className="h-4 w-4" />
                <span>Voltar ao Site</span>
              </Link>
            </nav>
          </div>
          
          {/* Sidebar Footer */}
          <div className="p-4 border-t">
            <Button 
              variant="outline" 
              className="w-full justify-start text-brand-gray"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
