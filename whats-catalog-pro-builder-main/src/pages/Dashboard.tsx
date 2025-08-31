
import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  ShoppingBag, 
  Settings, 
  LogOut, 
  User, 
  Package, 
  BarChart, 
  Tag, 
  MessageCircle, 
  CreditCard, 
  ChevronDown,
  Copy,
  Share2,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

const Dashboard = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const stats = [
    { label: "Visitas ao Catálogo", value: "247", icon: <User className="h-5 w-5 text-brand-red" /> },
    { label: "Produtos Ativos", value: "12", icon: <Package className="h-5 w-5 text-brand-red" /> },
    { label: "Pedidos (30 dias)", value: "23", icon: <ShoppingBag className="h-5 w-5 text-brand-red" /> },
    { label: "Vendas (30 dias)", value: "R$ 1.248", icon: <CreditCard className="h-5 w-5 text-brand-red" /> }
  ];
  
  const recentOrders = [
    { id: "1", customer: "Maria Silva", items: 3, total: "R$ 157,80", date: "Hoje, 14:25" },
    { id: "2", customer: "João Santos", items: 1, total: "R$ 49,90", date: "Ontem, 19:10" },
    { id: "3", customer: "Ana Oliveira", items: 5, total: "R$ 217,50", date: "11/04, 09:45" }
  ];
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText("https://lojamodelo.whatscatalog.com");
    toast.success("Link copiado para a área de transferência!");
  };
  
  const handleShareCatalog = () => {
    if (navigator.share) {
      navigator.share({
        title: "Meu Catálogo no WhatsCatalog Pro",
        text: "Confira meu catálogo de produtos!",
        url: "https://lojamodelo.whatscatalog.com",
      });
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="min-h-screen bg-brand-light-gray/20 flex">
      {/* Sidebar */}
      <div className="hidden md:block w-64 bg-white shadow-md">
        <div className="p-4 border-b border-brand-light-gray">
          <Link to="/" className="flex items-center space-x-2">
            <ShoppingBag className="h-6 w-6 text-brand-red" />
            <span className="font-semibold text-lg">
              WhatsCatalog<span className="text-brand-green">Pro</span>
            </span>
          </Link>
        </div>
        
        <div className="py-6 px-4">
          <nav className="space-y-1">
            <Link to="/dashboard" className="flex items-center space-x-3 text-brand-red font-medium p-3 rounded-md bg-brand-red/10">
              <BarChart className="h-5 w-5" />
              <span>Dashboard</span>
            </Link>
            <Link to="/products" className="flex items-center space-x-3 text-brand-gray hover:text-brand-red transition-colors p-3 rounded-md hover:bg-brand-red/5">
              <Package className="h-5 w-5" />
              <span>Produtos</span>
            </Link>
            <Link to="/orders" className="flex items-center space-x-3 text-brand-gray hover:text-brand-red transition-colors p-3 rounded-md hover:bg-brand-red/5">
              <ShoppingBag className="h-5 w-5" />
              <span>Pedidos</span>
            </Link>
            <Link to="/coupons" className="flex items-center space-x-3 text-brand-gray hover:text-brand-red transition-colors p-3 rounded-md hover:bg-brand-red/5">
              <Tag className="h-5 w-5" />
              <span>Cupons</span>
            </Link>
            <Link to="/messages" className="flex items-center space-x-3 text-brand-gray hover:text-brand-red transition-colors p-3 rounded-md hover:bg-brand-red/5">
              <MessageCircle className="h-5 w-5" />
              <span>Mensagens</span>
            </Link>
            <Link to="/settings" className="flex items-center space-x-3 text-brand-gray hover:text-brand-red transition-colors p-3 rounded-md hover:bg-brand-red/5">
              <Settings className="h-5 w-5" />
              <span>Configurações</span>
            </Link>
          </nav>
        </div>
        
        <div className="p-4 border-t border-brand-light-gray mt-auto">
          <Link to="/logout" className="flex items-center space-x-3 text-brand-gray hover:text-brand-red transition-colors p-3 rounded-md hover:bg-brand-red/5">
            <LogOut className="h-5 w-5" />
            <span>Sair</span>
          </Link>
        </div>
      </div>
      
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white shadow-sm z-40">
        <div className="flex items-center justify-between p-4">
          <Link to="/" className="flex items-center space-x-2">
            <ShoppingBag className="h-6 w-6 text-brand-red" />
            <span className="font-semibold text-lg">
              WhatsCatalog<span className="text-brand-green">Pro</span>
            </span>
          </Link>
          
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center space-x-1 text-brand-gray"
          >
            <span>Menu</span>
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
        
        {isMenuOpen && (
          <div className="bg-white shadow-md">
            <nav className="p-4 space-y-3">
              <Link 
                to="/dashboard" 
                className="flex items-center space-x-3 text-brand-red font-medium p-2 rounded-md bg-brand-red/10"
                onClick={() => setIsMenuOpen(false)}
              >
                <BarChart className="h-5 w-5" />
                <span>Dashboard</span>
              </Link>
              <Link 
                to="/products" 
                className="flex items-center space-x-3 text-brand-gray p-2 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                <Package className="h-5 w-5" />
                <span>Produtos</span>
              </Link>
              <Link 
                to="/orders" 
                className="flex items-center space-x-3 text-brand-gray p-2 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                <ShoppingBag className="h-5 w-5" />
                <span>Pedidos</span>
              </Link>
              <Link 
                to="/coupons" 
                className="flex items-center space-x-3 text-brand-gray p-2 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                <Tag className="h-5 w-5" />
                <span>Cupons</span>
              </Link>
              <Link 
                to="/messages" 
                className="flex items-center space-x-3 text-brand-gray p-2 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                <MessageCircle className="h-5 w-5" />
                <span>Mensagens</span>
              </Link>
              <Link 
                to="/settings" 
                className="flex items-center space-x-3 text-brand-gray p-2 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                <Settings className="h-5 w-5" />
                <span>Configurações</span>
              </Link>
              <Link 
                to="/logout" 
                className="flex items-center space-x-3 text-brand-gray p-2 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                <LogOut className="h-5 w-5" />
                <span>Sair</span>
              </Link>
            </nav>
          </div>
        )}
      </div>
      
      {/* Main Content */}
      <div className="flex-1 md:ml-64 pt-20 md:pt-0">
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-brand-gray">Dashboard</h1>
              <p className="text-brand-gray/70">Bem-vindo de volta, Loja Modelo</p>
            </div>
            
            <div className="flex space-x-2 mt-4 md:mt-0">
              <Link to="/preview" target="_blank">
                <Button variant="outline" className="text-brand-green border-brand-green hover:bg-brand-green hover:text-white">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Ver Catálogo
                </Button>
              </Link>
              <Link to="/products">
                <Button className="bg-brand-red hover:bg-brand-red/90">
                  <Package className="h-4 w-4 mr-2" />
                  Gerenciar Produtos
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <Card key={index}>
                <CardContent className="p-6 flex items-center space-x-4">
                  <div className="bg-brand-red/10 rounded-full p-3">
                    {stat.icon}
                  </div>
                  <div>
                    <p className="text-sm text-brand-gray/70">{stat.label}</p>
                    <p className="text-2xl font-bold text-brand-gray">{stat.value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Store Link Card */}
            <Card className="lg:col-span-1">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-brand-gray mb-4">Compartilhe seu catálogo</h2>
                
                <div className="bg-brand-light-gray/30 rounded-lg p-4 mb-4">
                  <p className="text-sm text-brand-gray/70 mb-1">Link do seu catálogo:</p>
                  <div className="flex items-center">
                    <input
                      type="text"
                      value="lojamodelo.whatscatalog.com"
                      readOnly
                      className="bg-transparent border-none text-brand-gray font-medium w-full focus:outline-none focus:ring-0"
                    />
                    <button 
                      onClick={handleCopyLink}
                      className="text-brand-red hover:text-brand-red/80 transition-colors"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    variant="outline"
                    className="w-full border-brand-green text-brand-green hover:bg-brand-green hover:text-white"
                    onClick={handleCopyLink}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar Link
                  </Button>
                  <Button 
                    className="w-full bg-brand-green hover:bg-brand-green/90"
                    onClick={handleShareCatalog}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Compartilhar
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Recent Orders */}
            <Card className="lg:col-span-2">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-brand-gray">Pedidos Recentes</h2>
                  <Link to="/orders" className="text-sm text-brand-green hover:underline">
                    Ver todos
                  </Link>
                </div>
                
                <div className="divide-y divide-brand-light-gray">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="py-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-brand-gray">{order.customer}</p>
                        <p className="text-sm text-brand-gray/70">
                          {order.items} {order.items === 1 ? "item" : "itens"} • {order.date}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium text-brand-green">{order.total}</p>
                        <Link to={`/orders/${order.id}`} className="text-xs text-brand-red hover:underline">
                          Ver detalhes
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
                
                {recentOrders.length === 0 && (
                  <div className="py-8 text-center">
                    <p className="text-brand-gray/70">Nenhum pedido recente</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
