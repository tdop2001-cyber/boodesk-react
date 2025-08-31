
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Users, TicketCheck } from "lucide-react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import OverviewTab from "@/components/admin/OverviewTab";
import ManagementTab from "@/components/admin/ManagementTab";
import SupportTab from "@/components/admin/SupportTab";

const AdminDashboard = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Toggle menu for mobile view
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="min-h-screen bg-brand-light-gray/20 flex flex-col">
      {/* Sidebar */}
      <AdminSidebar isMenuOpen={isMenuOpen} toggleMenu={toggleMenu} />
      
      {/* Main Content */}
      <div className="flex-1 md:ml-64 pt-16 pb-8 px-4 md:px-6">
        <div className="max-w-5xl mx-auto w-full">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-brand-gray">Painel Administrativo</h1>
              <p className="text-sm md:text-base text-brand-gray/70">Gestão e monitoramento do SaaS</p>
            </div>
          </div>
          
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid grid-cols-3 gap-1 md:gap-2 bg-muted mb-4 md:mb-6 overflow-x-auto">
              <TabsTrigger value="overview" className="text-xs md:text-sm data-[state=active]:bg-white data-[state=active]:text-brand-red">
                <BarChart className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                <span className="whitespace-nowrap">Visão Geral</span>
              </TabsTrigger>
              <TabsTrigger value="management" className="text-xs md:text-sm data-[state=active]:bg-white data-[state=active]:text-brand-red">
                <Users className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                <span className="whitespace-nowrap">Gerenciamento</span>
              </TabsTrigger>
              <TabsTrigger value="support" className="text-xs md:text-sm data-[state=active]:bg-white data-[state=active]:text-brand-red">
                <TicketCheck className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                <span className="whitespace-nowrap">Suporte</span>
              </TabsTrigger>
            </TabsList>
            
            {/* Tab 1: Visão Geral */}
            <TabsContent value="overview">
              <OverviewTab />
            </TabsContent>
            
            {/* Tab 2: Gerenciamento */}
            <TabsContent value="management">
              <ManagementTab />
            </TabsContent>
            
            {/* Tab 3: Suporte */}
            <TabsContent value="support">
              <SupportTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
