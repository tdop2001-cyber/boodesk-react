
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
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
  ExternalLink,
  Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import CatalogSetupModal from "@/components/CatalogSetupModal";

import { ReviewsTab } from "@/components/reviews/ReviewsTab";
import OrdersTab from "@/components/dashboard/OrdersTab";
import CouponsTab from "@/components/dashboard/CouponsTab";
import SettingsTab from "@/components/dashboard/SettingsTab";
import CatalogTabEnhanced from "@/components/seller/CatalogTabEnhanced";

const DashboardMain = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("today");
  const [stats, setStats] = useState({
    catalog_visits: 0,
    active_products: 0,
    monthly_orders: 0,
    monthly_sales: 0
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { signOut, needsCatalogSetup, profile, refreshProfile, user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchStats();
      fetchRecentOrders();
    }
  }, [user, selectedPeriod]);

  const fetchStats = async () => {
    try {
      // Calculate date range based on selected period
      let startDate = new Date();
      let endDate = new Date();
      
      switch (selectedPeriod) {
        case "today":
          startDate.setHours(0, 0, 0, 0);
          endDate.setHours(23, 59, 59, 999);
          break;
        case "week":
          startDate.setDate(startDate.getDate() - 7);
          break;
        case "month":
          startDate.setDate(startDate.getDate() - 30);
          break;
        case "3months":
          startDate.setDate(startDate.getDate() - 90);
          break;
        case "year":
          startDate.setDate(startDate.getDate() - 365);
          break;
        default:
          startDate.setDate(startDate.getDate() - 30);
      }

      // Get analytics for the period
      const { data: analyticsData, error: analyticsError } = await supabase
        .from('analytics')
        .select('*')
        .eq('user_id', user?.id)
        .eq('event_type', 'catalog_visit')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (analyticsError) throw analyticsError;

      // Get active products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user?.id)
        .eq('active', true);

      if (productsError) throw productsError;

      // Get orders for the period
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user?.id)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (ordersError) throw ordersError;

      // Calculate sales total
      const totalSales = ordersData?.reduce((sum, order) => sum + parseFloat(order.total_amount?.toString() || "0"), 0) || 0;

      setStats({
        catalog_visits: analyticsData?.length || 0,
        active_products: productsData?.length || 0,
        monthly_orders: ordersData?.length || 0,
        monthly_sales: totalSales
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchRecentOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      setRecentOrders(data || []);
    } catch (error) {
      console.error('Error fetching recent orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case "today": return "Hoje";
      case "week": return "Última Semana";
      case "month": return "Último Mês";
      case "3months": return "Últimos 3 Meses";
      case "year": return "Último Ano";
      default: return "Último Mês";
    }
  };

  const statsData = [
    { label: "Visitas ao Catálogo", value: stats.catalog_visits.toString(), icon: <User className="h-5 w-5 text-primary" /> },
    { label: "Produtos Ativos", value: stats.active_products.toString(), icon: <Package className="h-5 w-5 text-primary" /> },
    { label: `Pedidos (${getPeriodLabel(selectedPeriod)})`, value: stats.monthly_orders.toString(), icon: <ShoppingBag className="h-5 w-5 text-primary" /> },
    { label: `Vendas (${getPeriodLabel(selectedPeriod)})`, value: `R$ ${stats.monthly_sales.toFixed(2)}`, icon: <CreditCard className="h-5 w-5 text-primary" /> }
  ];
  
  const catalogUrl = profile?.catalog_slug 
    ? `${window.location.origin}/catalogo/${profile.catalog_slug}`
    : "Configurar catálogo primeiro";

  const handleCopyLink = () => {
    if (profile?.catalog_slug) {
      navigator.clipboard.writeText(catalogUrl);
      toast.success("Link copiado para a área de transferência!");
    } else {
      toast.error("Configure seu catálogo primeiro");
    }
  };
  
  const handleShareCatalog = () => {
    if (!profile?.catalog_slug) {
      toast.error("Configure seu catálogo primeiro");
      return;
    }
    
    if (navigator.share) {
      navigator.share({
        title: `${profile.catalog_name || 'Meu Catálogo'} - WhatsCatalog Pro`,
        text: "Confira meu catálogo de produtos!",
        url: catalogUrl,
      });
    } else {
      handleCopyLink();
    }
  };

  const handleCatalogSetupComplete = () => {
    refreshProfile();
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div className="hidden md:block w-64 bg-card shadow-md">
        <div className="p-4 border-b">
          <Link to="/" className="flex items-center space-x-2">
            <ShoppingBag className="h-6 w-6 text-primary" />
            <span className="font-semibold text-lg">
              WhatsCatalog<span className="text-secondary">Pro</span>
            </span>
          </Link>
        </div>
        
        <div className="py-6 px-4">
          <nav className="space-y-1">
            <Button variant="ghost" className="w-full justify-start" onClick={signOut}>
              <LogOut className="h-5 w-5 mr-3" />
              Sair
            </Button>
          </nav>
        </div>
      </div>
      
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-card shadow-sm z-40">
        <div className="flex items-center justify-between p-4">
          <Link to="/" className="flex items-center space-x-2">
            <ShoppingBag className="h-6 w-6 text-primary" />
            <span className="font-semibold text-lg">
              WhatsCatalog<span className="text-secondary">Pro</span>
            </span>
          </Link>
          
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center space-x-1 text-muted-foreground"
          >
            <span>Menu</span>
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
        
        {isMenuOpen && (
          <div className="bg-card shadow-md">
            <nav className="p-4 space-y-3">
              <Button variant="ghost" className="w-full justify-start" onClick={() => { signOut(); setIsMenuOpen(false); }}>
                <LogOut className="h-5 w-5 mr-3" />
                Sair
              </Button>
            </nav>
          </div>
        )}
      </div>
      
      {/* Main Content */}
      <div className="flex-1 pt-20 md:pt-0">
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground">Bem-vindo de volta!</p>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
              <Link to="/preview" target="_blank">
                <Button variant="outline">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Ver Catálogo
                </Button>
              </Link>
              <Link to="/products">
                <Button>
                  <Package className="h-4 w-4 mr-2" />
                  Gerenciar Produtos
                </Button>
              </Link>
              <Button variant="outline" onClick={() => window.open('/reports', '_blank')}>
                <BarChart className="h-4 w-4 mr-2" />
                Relatório Completo
              </Button>
            </div>
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview" className="flex items-center space-x-2">
                <BarChart className="h-4 w-4" />
                <span className="hidden sm:inline">Visão Geral</span>
              </TabsTrigger>
              <TabsTrigger value="orders" className="flex items-center space-x-2">
                <ShoppingBag className="h-4 w-4" />
                <span className="hidden sm:inline">Pedidos</span>
              </TabsTrigger>
              <TabsTrigger value="coupons" className="flex items-center space-x-2">
                <Tag className="h-4 w-4" />
                <span className="hidden sm:inline">Cupons</span>
              </TabsTrigger>
              <TabsTrigger value="products" className="flex items-center space-x-2">
                <Package className="h-4 w-4" />
                <span className="hidden sm:inline">Produtos</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center space-x-2">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Configurações</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="mt-6">
              {loading ? (
                <div className="flex justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <>
                  {/* Period Selector */}
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold">Estatísticas</h2>
                    <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                      <SelectTrigger className="w-[200px]">
                        <Calendar className="h-4 w-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="today">Hoje</SelectItem>
                        <SelectItem value="week">Última Semana</SelectItem>
                        <SelectItem value="month">Último Mês</SelectItem>
                        <SelectItem value="3months">Últimos 3 Meses</SelectItem>
                        <SelectItem value="year">Último Ano</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {statsData.map((stat, index) => (
                      <Card key={index}>
                        <CardContent className="p-6 flex items-center space-x-4">
                          <div className="bg-primary/10 rounded-full p-3">
                            {stat.icon}
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">{stat.label}</p>
                            <p className="text-2xl font-bold">{stat.value}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Store Link Card */}
                <Card className="lg:col-span-1">
                  <CardContent className="p-6">
                    <h2 className="text-xl font-bold mb-4">Compartilhe seu catálogo</h2>
                    
                    <div className="bg-muted/50 rounded-lg p-4 mb-4">
                      <p className="text-sm text-muted-foreground mb-1">Link do seu catálogo:</p>
                      <div className="flex items-center">
                        <input
                          type="text"
                          value={profile?.catalog_slug ? catalogUrl.replace(window.location.origin, '') : "Configure seu catálogo"}
                          readOnly
                          className="bg-transparent border-none font-medium w-full focus:outline-none focus:ring-0"
                        />
                        <button 
                          onClick={handleCopyLink}
                          className="text-primary hover:text-primary/80 transition-colors"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <Button 
                        variant="outline"
                        className="w-full"
                        onClick={handleCopyLink}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copiar Link
                      </Button>
                      <Button 
                        className="w-full"
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
                      <h2 className="text-xl font-bold">Pedidos Recentes</h2>
                      <Button variant="link" size="sm" onClick={() => (document.querySelector('[value="orders"]') as HTMLElement)?.click()}>
                        Ver todos
                      </Button>
                    </div>
                    
                    <div className="divide-y">
                      {recentOrders.map((order) => (
                        <div key={order.id} className="py-4 flex items-center justify-between">
                          <div>
                            <p className="font-medium">{order.customer_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {Array.isArray(order.items) ? order.items.length : 0} {Array.isArray(order.items) && order.items.length === 1 ? "item" : "itens"} • {new Date(order.created_at).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                          <div>
                            <p className="font-medium text-secondary">R$ {parseFloat(order.total_amount || 0).toFixed(2)}</p>
                            <div className="text-xs">
                              <span className={`px-2 py-1 rounded text-xs ${
                                order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {order.status === 'pending' ? 'Pendente' :
                                 order.status === 'completed' ? 'Concluído' :
                                 order.status === 'cancelled' ? 'Cancelado' : order.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {recentOrders.length === 0 && (
                      <div className="py-8 text-center">
                        <p className="text-muted-foreground">Nenhum pedido recente</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              </>
              )}
            </TabsContent>
            
            <TabsContent value="orders" className="mt-6">
              <OrdersTab />
            </TabsContent>
            
            <TabsContent value="coupons" className="mt-6">
              <CouponsTab />
            </TabsContent>
            
            <TabsContent value="products" className="mt-6">
              <CatalogTabEnhanced />
            </TabsContent>
            
            <TabsContent value="reviews" className="mt-6">
              <ReviewsTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Catalog Setup Modal */}
      <CatalogSetupModal 
        isOpen={needsCatalogSetup}
        onComplete={handleCatalogSetupComplete}
      />
    </div>
  );
};

export default DashboardMain;
