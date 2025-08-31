
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tag, Ticket, ShoppingBag } from "lucide-react";
import ProductPromotionForm from "./ProductPromotionForm";
import CouponsTab from "./CouponsTab";

const PromotionsTab = () => {
  const [activeTab, setActiveTab] = useState("product");

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
      <Tabs defaultValue="product" onValueChange={setActiveTab} value={activeTab}>
        <TabsList className="grid grid-cols-2 md:grid-cols-3 mb-6">
          <TabsTrigger value="product" className="data-[state=active]:bg-[#2E8B57] data-[state=active]:text-white">
            <Tag className="h-4 w-4 mr-2" />
            <span>Por Produto</span>
          </TabsTrigger>
          <TabsTrigger value="coupon" className="data-[state=active]:bg-[#2E8B57] data-[state=active]:text-white">
            <Ticket className="h-4 w-4 mr-2" />
            <span>Cupons</span>
          </TabsTrigger>
          <TabsTrigger value="bundle" className="data-[state=active]:bg-[#2E8B57] data-[state=active]:text-white">
            <ShoppingBag className="h-4 w-4 mr-2" />
            <span>Pacotes</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="product">
          <ProductPromotionForm />
        </TabsContent>
        
        <TabsContent value="coupon">
          <CouponsTab />
        </TabsContent>
        
        <TabsContent value="bundle">
          <div className="text-center py-8">
            <ShoppingBag className="h-16 w-16 mx-auto text-brand-gray/20 mb-3" />
            <h3 className="text-lg font-medium text-brand-gray">Pacotes Promocionais</h3>
            <p className="text-sm text-brand-gray/70 max-w-md mx-auto mt-2">
              Combine produtos em pacotes com preços especiais. Esta funcionalidade estará disponível em breve.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PromotionsTab;
