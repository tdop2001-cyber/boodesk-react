
import React from "react";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings } from "lucide-react";
import SellerSidebar from "@/components/seller/SellerSidebar";
import SettingsForm from "@/components/seller/SettingsForm";

const SellerSettings = () => {
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
              <h1 className="text-xl md:text-2xl font-bold text-brand-gray">Personalize seu catálogo</h1>
              <p className="text-sm md:text-base text-brand-gray/70">Dê sua identidade à loja virtual</p>
            </div>
          </div>
          
          <Tabs defaultValue="settings" className="w-full">
            <TabsList className="grid grid-cols-1 gap-1 md:gap-2 bg-muted mb-4 md:mb-6 overflow-x-auto">
              <TabsTrigger value="settings" className="text-xs md:text-sm data-[state=active]:bg-white data-[state=active]:text-brand-red">
                <Settings className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                <span className="whitespace-nowrap">Configurações</span>
              </TabsTrigger>
            </TabsList>
            
            {/* Settings Content */}
            <TabsContent value="settings">
              <SettingsForm />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default SellerSettings;
