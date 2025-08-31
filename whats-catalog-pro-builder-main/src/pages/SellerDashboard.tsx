
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, ShoppingBag, Tag, BarChart } from "lucide-react";
import SellerSidebar from "@/components/seller/SellerSidebar";
import CatalogTabImproved from "@/components/seller/CatalogTabImproved";
import OrdersTab from "@/components/seller/OrdersTab";
import PromotionsTab from "@/components/seller/PromotionsTab";
import DashboardTab from "@/components/seller/DashboardTab";

const SellerDashboard = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Toggle menu for mobile view
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="min-h-screen bg-brand-light-gray/20 flex flex-col">
      {/* Sidebar */}
      <SellerSidebar isMenuOpen={isMenuOpen} toggleMenu={toggleMenu} />
      
      {/* Main Content */}
      <div className="flex-1 md:ml-64 pt-16 pb-8 px-4 md:px-6">
        <div className="max-w-5xl mx-auto w-full">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-brand-gray">Painel do Vendedor</h1>
              <p className="text-sm md:text-base text-brand-gray/70">Gerencie seu catálogo e vendas</p>
            </div>
            <div className="flex items-center space-x-2 mt-4 md:mt-0">
              <Button 
                variant="outline"
                onClick={() => window.open('/catalogo/' + 'demo-catalog', '_blank')}
              >
                <Package className="h-4 w-4 mr-2" />
                Ver Catálogo
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.open('/relatorios', '_blank')}
              >
                <BarChart className="h-4 w-4 mr-2" />
                Relatórios
              </Button>
            </div>
          </div>
          
          <Tabs defaultValue="catalog" className="w-full">
            <TabsList className="grid grid-cols-2 md:grid-cols-4 gap-1 md:gap-2 bg-muted mb-4 md:mb-6 overflow-x-auto">
              <TabsTrigger value="catalog" className="text-xs md:text-sm data-[state=active]:bg-white data-[state=active]:text-brand-red">
                <Package className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                <span className="whitespace-nowrap">Produtos</span>
              </TabsTrigger>
              <TabsTrigger value="orders" className="text-xs md:text-sm data-[state=active]:bg-white data-[state=active]:text-brand-red">
                <ShoppingBag className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                <span className="whitespace-nowrap">Pedidos</span>
              </TabsTrigger>
              <TabsTrigger value="promotions" className="text-xs md:text-sm data-[state=active]:bg-white data-[state=active]:text-brand-red">
                <Tag className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                <span className="whitespace-nowrap">Promoções</span>
              </TabsTrigger>
              <TabsTrigger value="dashboard" className="text-xs md:text-sm data-[state=active]:bg-white data-[state=active]:text-brand-red">
                <BarChart className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                <span className="whitespace-nowrap">Dashboard</span>
              </TabsTrigger>
            </TabsList>
            
            {/* Tab 1: Produtos */}
            <TabsContent value="catalog">
              <CatalogTabImproved />
            </TabsContent>
            
            {/* Tab 2: Pedidos */}
            <TabsContent value="orders">
              <OrdersTab />
            </TabsContent>
            
            {/* Tab 3: Promoções */}
            <TabsContent value="promotions">
              <PromotionsTab />
            </TabsContent>
            
            {/* Tab 4: Dashboard */}
            <TabsContent value="dashboard">
              <DashboardTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
