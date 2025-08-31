import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-sm py-4 fixed w-full top-0 z-50">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <img 
            src="/lovable-uploads/c8660c76-6479-46c8-b3c6-cb56302fcaef.png" 
            alt="Astrabytes Logo" 
            className="h-8 w-8" 
          />
          <span className="font-semibold text-xl hidden md:inline-block">
            Astra<span className="text-brand-green">bytes</span>
          </span>
          <span className="font-semibold text-xl md:hidden">
            AB
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <Link 
            to="/"
            className={`font-medium ${
              location.pathname === "/" 
                ? "text-brand-red" 
                : "text-brand-gray hover:text-brand-red transition-colors"
            }`}
          >
            Início
          </Link>
          <Link 
            to="/features"
            className={`font-medium ${
              location.pathname === "/features" 
                ? "text-brand-red" 
                : "text-brand-gray hover:text-brand-red transition-colors"
            }`}
          >
            Funcionalidades
          </Link>
          <Link 
            to="/plans"
            className={`font-medium ${
              location.pathname === "/plans" 
                ? "text-brand-red" 
                : "text-brand-gray hover:text-brand-red transition-colors"
            }`}
          >
            Planos
          </Link>
          
          {user ? (
            <div className="flex items-center space-x-4">
              <Link to="/dashboard">
                <Button variant="default" className="bg-brand-red hover:bg-[#950303]">
                  Dashboard
                </Button>
              </Link>
              <Button 
                variant="outline" 
                onClick={signOut}
                className="border-brand-green text-brand-green hover:bg-brand-green hover:text-white"
              >
                Sair
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link to="/auth">
                <Button variant="outline" className="border-brand-green text-brand-green hover:bg-brand-green hover:text-white">
                  Entrar
                </Button>
              </Link>
              <Link to="/auth">
                <Button variant="default" className="bg-brand-red hover:bg-[#950303]">
                  Começar Grátis
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <button
            onClick={toggleMenu}
            className="text-brand-gray focus:outline-none"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white w-full py-4 px-4 shadow-md">
          <div className="flex flex-col space-y-4">
            <Link
              to="/"
              className={`font-medium p-2 rounded-md ${
                location.pathname === "/"
                  ? "bg-brand-red/10 text-brand-red"
                  : "text-brand-gray hover:bg-brand-red/10 hover:text-brand-red"
              }`}
              onClick={closeMenu}
            >
              Início
            </Link>
            <Link
              to="/features"
              className={`font-medium p-2 rounded-md ${
                location.pathname === "/features"
                  ? "bg-brand-red/10 text-brand-red"
                  : "text-brand-gray hover:bg-brand-red/10 hover:text-brand-red"
              }`}
              onClick={closeMenu}
            >
              Funcionalidades
            </Link>
            <Link
              to="/plans"
              className={`font-medium p-2 rounded-md ${
                location.pathname === "/plans"
                  ? "bg-brand-red/10 text-brand-red"
                  : "text-brand-gray hover:bg-brand-red/10 hover:text-brand-red"
              }`}
              onClick={closeMenu}
            >
              Planos
            </Link>
            
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="w-full"
                  onClick={closeMenu}
                >
                  <Button variant="default" className="w-full bg-brand-red hover:bg-[#950303]">
                    Dashboard
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  onClick={() => { signOut(); closeMenu(); }}
                  className="w-full border-brand-green text-brand-green hover:bg-brand-green hover:text-white"
                >
                  Sair
                </Button>
              </>
            ) : (
              <>
                <Link
                  to="/auth"
                  className="w-full"
                  onClick={closeMenu}
                >
                  <Button variant="outline" className="w-full border-brand-green text-brand-green hover:bg-brand-green hover:text-white">
                    Entrar
                  </Button>
                </Link>
                <Link
                  to="/auth"
                  className="w-full"
                  onClick={closeMenu}
                >
                  <Button variant="default" className="w-full bg-brand-red hover:bg-[#950303]">
                    Começar Grátis
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
