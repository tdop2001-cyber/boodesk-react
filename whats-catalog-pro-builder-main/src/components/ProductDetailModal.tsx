
import React, { useState, useEffect } from "react";
import { 
  X, 
  ChevronLeft, 
  ChevronRight,
  Package,
  ShoppingBag
} from "lucide-react";
import { Product } from "@/types/seller";
import { ProductVariationData } from "@/types/variations";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ProductReviews } from "@/components/reviews/ProductReviews";

interface ProductDetailModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, variation?: any, quantity?: number) => void;
}

const ProductDetailModal = ({ 
  product, 
  isOpen, 
  onClose,
  onAddToCart
}: ProductDetailModalProps) => {
  const [selectedVariation, setSelectedVariation] = useState<ProductVariationData | null>(null);
  const [productVariations, setProductVariations] = useState<ProductVariationData[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  
  const images = product.image ? [product.image] : [];

  useEffect(() => {
    if (isOpen && product.id) {
      fetchProductVariations();
    }
  }, [isOpen, product.id]);

  const fetchProductVariations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('product_variations')
        .select(`
          *,
          variation:variations(*),
          option:variation_options(*)
        `)
        .eq('product_id', product.id);

      if (error) throw error;

      const variations = data.map(item => ({
        variation: item.variation,
        option: item.option
      }));

      setProductVariations(variations);
      if (variations.length > 0) {
        setSelectedVariation(variations[0]);
      }
    } catch (error) {
      console.error('Error fetching product variations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentPrice = () => {
    if (selectedVariation && selectedVariation.option.price_adjustment) {
      return product.price + selectedVariation.option.price_adjustment;
    }
    return product.price;
  };
  
  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };
  
  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };
  
  const handleAddToCart = () => {
    onAddToCart(product, selectedVariation || undefined, quantity);
    onClose();
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      ></div>
      
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 z-10 text-brand-gray hover:text-brand-gray/70 transition-colors"
        >
          <X className="h-6 w-6" />
        </button>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Images */}
          <div className="relative aspect-square bg-brand-light-gray/30">
            {images.length > 0 ? (
              <>
                <img 
                  src={images[currentImageIndex]} 
                  alt={product.name} 
                  className="w-full h-full object-cover"
                />
                {images.length > 1 && (
                  <>
                    <button 
                      onClick={handlePrevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1 hover:bg-white transition-colors"
                    >
                      <ChevronLeft className="h-5 w-5 text-brand-gray" />
                    </button>
                    <button 
                      onClick={handleNextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1 hover:bg-white transition-colors"
                    >
                      <ChevronRight className="h-5 w-5 text-brand-gray" />
                    </button>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1">
                      {images.map((_, index) => (
                        <button 
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-2 h-2 rounded-full ${
                            index === currentImageIndex ? "bg-brand-red" : "bg-brand-light-gray"
                          }`}
                        ></button>
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="h-12 w-12 text-brand-gray/30" />
              </div>
            )}
            
            {!product.in_stock && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <Badge variant="outOfStock" className="px-3 py-1 text-sm">
                  Esgotado
                </Badge>
              </div>
            )}
          </div>
          
          {/* Product Info */}
          <div className="p-6 flex flex-col">
            <h2 className="text-xl font-bold text-brand-gray mb-2">{product.name}</h2>
            
            <div className="mb-4">
              <div className="flex items-baseline space-x-2">
                <span className="text-xl font-bold text-brand-red">
                  R$ {getCurrentPrice().toFixed(2)}
                </span>
              </div>
            </div>
            
            <p className="text-brand-gray/80 mb-6">{product.description}</p>
            
            {loading ? (
              <div className="text-center py-4">Carregando variações...</div>
            ) : productVariations.length > 0 ? (
              <div className="space-y-4">
                <label className="text-sm text-brand-gray/70 block mb-2">Opções:</label>
                <div className="grid grid-cols-2 gap-2">
                  {productVariations.map((variation, index) => (
                    <button
                      key={`${variation.variation.id}-${variation.option.id}`}
                      className={`border rounded-md py-2 px-3 text-sm transition-colors ${
                        selectedVariation && 
                        selectedVariation.variation.id === variation.variation.id && 
                        selectedVariation.option.id === variation.option.id
                          ? "border-brand-green bg-brand-green/10 text-brand-green"
                          : "border-brand-light-gray text-brand-gray hover:border-brand-green/50"
                      }`}
                      onClick={() => setSelectedVariation(variation)}
                    >
                      <div className="text-left">
                        <div className="font-medium">{variation.variation.name}: {variation.option.name}</div>
                        {variation.option.price_adjustment !== 0 && (
                          <div className="text-xs opacity-75">
                            {variation.option.price_adjustment > 0 ? '+' : ''}R$ {variation.option.price_adjustment.toFixed(2)}
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
            
            <div className="flex items-center space-x-4 mb-6">
              <label className="text-sm text-brand-gray/70">Quantidade:</label>
              <div className="flex items-center border border-brand-light-gray rounded-md">
                <button 
                  className="px-3 py-1 text-brand-gray"
                  onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                >
                  -
                </button>
                <span className="px-4 py-1 border-x border-brand-light-gray">{quantity}</span>
                <button 
                  className="px-3 py-1 text-brand-gray"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  +
                </button>
              </div>
            </div>
            
            <Button
              onClick={handleAddToCart}
              disabled={!product.in_stock}
              className="bg-brand-red hover:bg-brand-red/90 text-white w-full mt-auto"
            >
              <ShoppingBag className="h-5 w-5 mr-2" />
              Adicionar ao Pedido
            </Button>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default ProductDetailModal;
