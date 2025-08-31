
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Package, Search, Calendar, Clock, AlertTriangle } from "lucide-react";
import { useForm } from "react-hook-form";

// Mock products data
const mockProducts = [
  { id: "1", name: "Camiseta Estampada", price: 59.90, active: true },
  { id: "2", name: "Caneca Personalizada", price: 29.90, active: true },
  { id: "3", name: "Kit de Maquiagem", price: 89.90, active: true },
  { id: "4", name: "Tênis Esportivo", price: 149.90, active: false },
  { id: "5", name: "Pulseira Artesanal", price: 25.90, active: true },
  { id: "6", name: "Chaveiro Personalizado", price: 15.90, active: true }
];

// Mock active promotions
const mockActivePromotions = [
  { 
    id: "promo1", 
    productId: "1", 
    productName: "Camiseta Estampada",
    originalPrice: 59.90,
    discountType: "percentage",
    discountValue: 15,
    finalPrice: 50.92,
    expirationDate: "2025-05-15",
    isFlash: true,
    flashDuration: 24,
    createdAt: new Date(new Date().setHours(new Date().getHours() - 5))
  },
  { 
    id: "promo2", 
    productId: "3", 
    productName: "Kit de Maquiagem",
    originalPrice: 89.90,
    discountType: "fixed",
    discountValue: 10,
    finalPrice: 79.90,
    expirationDate: "2025-06-01",
    isFlash: false,
    createdAt: new Date(new Date().setDate(new Date().getDate() - 2))
  },
];

interface ProductPromotionFormProps {}

const ProductPromotionForm = ({}: ProductPromotionFormProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [finalPrice, setFinalPrice] = useState<number>(0);
  const [expirationDate, setExpirationDate] = useState<string>("");
  const [isFlashPromotion, setIsFlashPromotion] = useState<boolean>(false);
  const [flashDuration, setFlashDuration] = useState<number>(24);
  const [activePromotions, setActivePromotions] = useState(mockActivePromotions);
  
  const form = useForm({
    defaultValues: {
      productId: "",
      discountType: "percentage",
      discountValue: 0,
      expirationDate: "",
      isFlash: false,
      flashDuration: 24
    }
  });
  
  // Filter products based on search query
  const filteredProducts = mockProducts.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) && product.active
  );
  
  // Reset form when selected product changes
  useEffect(() => {
    if (selectedProduct) {
      calculateFinalPrice();
    } else {
      setFinalPrice(0);
    }
  }, [selectedProduct, discountType, discountValue]);
  
  // Calculate final price based on discount
  const calculateFinalPrice = () => {
    if (!selectedProduct) return 0;
    
    let newPrice = selectedProduct.price;
    
    if (discountType === "percentage") {
      if (discountValue > 0) {
        newPrice = selectedProduct.price * (1 - discountValue / 100);
      }
    } else if (discountType === "fixed") {
      if (discountValue > 0) {
        newPrice = selectedProduct.price - discountValue;
        if (newPrice < 0) newPrice = 0;
      }
    }
    
    setFinalPrice(newPrice);
    return newPrice;
  };
  
  // Select a product
  const handleSelectProduct = (product: any) => {
    setSelectedProduct(product);
    setSearchQuery("");
    
    // Check if product already has an active promotion
    const existingPromotion = activePromotions.find(promo => promo.productId === product.id);
    if (existingPromotion) {
      toast.warning("Este produto já possui uma promoção ativa");
    }
  };
  
  // Create a new promotion
  const handleCreatePromotion = () => {
    // Validation
    if (!selectedProduct) {
      toast.error("Selecione um produto");
      return;
    }
    
    if (discountValue <= 0) {
      toast.error("O valor do desconto deve ser maior que zero");
      return;
    }
    
    if (discountType === "percentage" && discountValue > 90) {
      toast.error("O desconto máximo permitido é de 90%");
      return;
    }
    
    if (discountType === "fixed" && discountValue >= selectedProduct.price) {
      toast.error("O desconto fixo não pode ser maior ou igual ao preço do produto");
      return;
    }
    
    if (!expirationDate) {
      toast.error("Defina uma data de expiração");
      return;
    }
    
    // Check flash promotion limit (max 3 concurrent)
    if (isFlashPromotion) {
      const currentFlashPromotions = activePromotions.filter(promo => promo.isFlash);
      if (currentFlashPromotions.length >= 3) {
        toast.error("Limite de 3 promoções relâmpago simultâneas atingido");
        return;
      }
    }
    
    // Create promotion object
    const newPromotion = {
      id: `promo${Date.now()}`,
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      originalPrice: selectedProduct.price,
      discountType,
      discountValue,
      finalPrice,
      expirationDate,
      isFlash: isFlashPromotion,
      flashDuration: isFlashPromotion ? flashDuration : undefined,
      createdAt: new Date()
    };
    
    // Add to active promotions
    setActivePromotions(prev => [newPromotion, ...prev]);
    
    // Reset form
    setSelectedProduct(null);
    setDiscountType("percentage");
    setDiscountValue(0);
    setExpirationDate("");
    setIsFlashPromotion(false);
    setFlashDuration(24);
    
    toast.success("Promoção criada com sucesso!");
  };
  
  // End promotion early
  const handleEndPromotion = (promotionId: string) => {
    setActivePromotions(prev => prev.filter(promo => promo.id !== promotionId));
    toast.success("Promoção finalizada com sucesso!");
  };
  
  // Calculate remaining time for flash promotions
  const getRemainingTime = (promotion: any) => {
    if (!promotion.isFlash) return null;
    
    const createdAt = new Date(promotion.createdAt);
    const expiresAt = new Date(createdAt.getTime() + promotion.flashDuration * 60 * 60 * 1000);
    const now = new Date();
    
    const totalDuration = promotion.flashDuration * 60 * 60 * 1000;
    const elapsed = now.getTime() - createdAt.getTime();
    
    if (elapsed >= totalDuration) return 0;
    
    const remainingPercent = 100 - (elapsed / totalDuration * 100);
    return {
      percent: Math.max(0, Math.min(100, remainingPercent)),
      hours: Math.floor((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60)),
      minutes: Math.floor(((expiresAt.getTime() - now.getTime()) % (1000 * 60 * 60)) / (1000 * 60))
    };
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };
  
  return (
    <div className="space-y-6">
      <Card className="p-4 md:p-6">
        <h2 className="text-lg md:text-xl font-semibold mb-4 text-brand-gray">Criar Nova Promoção</h2>
        
        {/* Step 1: Product Selection */}
        <div className="space-y-4 mb-6">
          <h3 className="text-md font-medium text-brand-gray">1. Selecione o Produto</h3>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brand-gray/50 h-4 w-4" />
            <Input
              placeholder="Buscar produto..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            
            {searchQuery && filteredProducts.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                {filteredProducts.map(product => (
                  <div 
                    key={product.id}
                    className="p-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                    onClick={() => handleSelectProduct(product)}
                  >
                    <span>{product.name}</span>
                    <span className="text-brand-gray-600 font-medium">
                      R$ {product.price.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                ))}
              </div>
            )}
            
            {searchQuery && filteredProducts.length === 0 && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg p-4 text-center">
                <p className="text-brand-gray/70">Nenhum produto encontrado</p>
              </div>
            )}
          </div>
          
          {selectedProduct && (
            <div className="flex items-center justify-between p-3 bg-brand-light-gray/20 rounded-md">
              <div className="flex items-center gap-2">
                <div className="bg-brand-light-gray/50 h-10 w-10 rounded-md flex items-center justify-center">
                  <Package className="h-5 w-5 text-brand-gray/60" />
                </div>
                <div>
                  <p className="font-medium text-brand-gray">{selectedProduct.name}</p>
                  <p className="text-sm text-brand-gray/70">Preço original: R$ {selectedProduct.price.toFixed(2).replace('.', ',')}</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedProduct(null)}
                className="text-xs"
              >
                Alterar
              </Button>
            </div>
          )}
        </div>
        
        {/* Step 2: Discount Options */}
        {selectedProduct && (
          <div className="space-y-4 mb-6">
            <h3 className="text-md font-medium text-brand-gray">2. Configurar Desconto</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo de Desconto</Label>
                <Select
                  value={discountType}
                  onValueChange={(value: "percentage" | "fixed") => setDiscountType(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de desconto" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Porcentagem (%)</SelectItem>
                    <SelectItem value="fixed">Valor Fixo (R$)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Valor do Desconto</Label>
                <div className="relative">
                  <Input
                    type="number"
                    min="0"
                    max={discountType === "percentage" ? "90" : selectedProduct.price.toString()}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                    className="pl-8"
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brand-gray/70">
                    {discountType === "percentage" ? "%" : "R$"}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Price preview */}
            {discountValue > 0 && (
              <div className="flex justify-between items-center p-3 bg-brand-light-gray/20 rounded-md">
                <div>
                  <p className="text-sm text-brand-gray/70">Preço original</p>
                  <p className="text-brand-gray line-through">
                    R$ {selectedProduct.price.toFixed(2).replace('.', ',')}
                  </p>
                </div>
                <div className="h-8 border-l border-brand-light-gray mx-4"></div>
                <div>
                  <p className="text-sm text-brand-gray/70">Desconto</p>
                  <p className="text-brand-green">
                    {discountType === "percentage" 
                      ? `-${discountValue}%` 
                      : `-R$ ${discountValue.toFixed(2).replace('.', ',')}`}
                  </p>
                </div>
                <div className="h-8 border-l border-brand-light-gray mx-4"></div>
                <div>
                  <p className="text-sm text-brand-gray/70">Preço final</p>
                  <p className="text-lg font-semibold text-[#B70404]">
                    R$ {finalPrice.toFixed(2).replace('.', ',')}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Step 3: Promotion Options */}
        {selectedProduct && discountValue > 0 && (
          <div className="space-y-4 mb-6">
            <h3 className="text-md font-medium text-brand-gray">3. Configurar Duração</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data de Expiração</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brand-gray/50 h-4 w-4" />
                  <Input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={expirationDate}
                    onChange={(e) => setExpirationDate(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="is-flash" className="cursor-pointer">Promoção Relâmpago</Label>
                  <Switch 
                    id="is-flash"
                    checked={isFlashPromotion}
                    onCheckedChange={setIsFlashPromotion}
                  />
                </div>
                
                {isFlashPromotion && (
                  <Select
                    value={flashDuration.toString()}
                    onValueChange={(value) => setFlashDuration(parseInt(value))}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Duração" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="24">24 horas</SelectItem>
                      <SelectItem value="48">48 horas</SelectItem>
                      <SelectItem value="72">72 horas</SelectItem>
                    </SelectContent>
                  </Select>
                )}
                
                {isFlashPromotion && activePromotions.filter(p => p.isFlash).length >= 2 && (
                  <div className="flex items-center gap-1 text-xs text-amber-600">
                    <AlertTriangle size={14} />
                    <span>Limite: 3 promoções relâmpago simultâneas</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Promotion Submit Button */}
        {selectedProduct && (
          <div className="pt-4 border-t border-brand-light-gray flex justify-end">
            <Button 
              onClick={handleCreatePromotion}
              className="bg-[#2E8B57] hover:bg-[#2E8B57]/90 text-white"
              disabled={!selectedProduct || discountValue <= 0 || !expirationDate}
            >
              Criar Promoção
            </Button>
          </div>
        )}
      </Card>
      
      {/* Active Promotions List */}
      {activePromotions.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg md:text-xl font-semibold text-brand-gray">
            Promoções Ativas ({activePromotions.length})
          </h2>
          
          <div className="space-y-3">
            {activePromotions.map(promotion => {
              const remainingTime = promotion.isFlash ? getRemainingTime(promotion) : null;
              
              return (
                <Card key={promotion.id} className={`p-4 transition-all ${promotion.isFlash ? 'border-2 border-brand-green' : ''}`}>
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium">{promotion.productName}</h3>
                        {promotion.isFlash && (
                          <Badge 
                            variant="promotion" 
                            className={`${remainingTime && remainingTime.percent < 30 ? 'animate-pulse' : ''}`}
                          >
                            Relâmpago
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center text-sm mb-2">
                        <span className="text-brand-gray line-through mr-2">
                          R$ {promotion.originalPrice.toFixed(2).replace('.', ',')}
                        </span>
                        <span className="text-[#B70404] font-semibold">
                          R$ {promotion.finalPrice.toFixed(2).replace('.', ',')}
                        </span>
                        <span className="ml-2 text-brand-green">
                          {promotion.discountType === "percentage" 
                            ? `(-${promotion.discountValue}%)` 
                            : `(-R$ ${promotion.discountValue.toFixed(2).replace('.', ',')})`}
                        </span>
                      </div>
                      
                      <div className="text-xs text-brand-gray/70 flex items-center gap-2">
                        <Calendar size={12} />
                        <span>Expira em: {formatDate(promotion.expirationDate)}</span>
                      </div>
                      
                      {promotion.isFlash && remainingTime && (
                        <div className="mt-2">
                          <div className="flex items-center gap-2 text-xs text-brand-gray/70 mb-1">
                            <Clock size={12} className="animate-pulse" />
                            <span>Tempo restante: {remainingTime.hours}h {remainingTime.minutes}m</span>
                          </div>
                          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-brand-green rounded-full" 
                              style={{ width: `${remainingTime.percent}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center md:items-start">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEndPromotion(promotion.id)}
                        className="text-xs border-[#B70404] text-[#B70404] hover:bg-[#B70404]/10"
                      >
                        Finalizar Antecipadamente
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductPromotionForm;
