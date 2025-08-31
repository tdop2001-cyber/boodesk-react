
import { useState } from "react";
import { Trash2, Edit, Eye, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Product } from "@/types/seller"; // Update to use the centralized Product type

interface ProductCardProps {
  product: Product;
  viewMode?: "admin" | "customer";
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onAddToCart?: (product: Product, variation?: { id: string; name: string; price: number }, quantity?: number) => void;
}

const ProductCard = ({ 
  product, 
  viewMode = "admin", 
  onEdit, 
  onDelete,
  onAddToCart
}: ProductCardProps) => {
  const [selectedVariation, setSelectedVariation] = useState<{ id: string; name: string; price: number } | null>(
    product.variations && product.variations.length > 0 ? product.variations[0] : null
  );
  const [quantity, setQuantity] = useState(1);

  const handleIncreaseQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const handleDecreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(product, selectedVariation || undefined, quantity);
    }
  };

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-brand-light-gray hover:shadow-md transition-all">
      <div className="relative aspect-square bg-gray-100 overflow-hidden">
        {product.image ? (
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-brand-gray/10">
            <span className="text-brand-gray/40">Sem imagem</span>
          </div>
        )}
        
        {viewMode === "admin" && (
          <div className="absolute top-2 right-2 flex space-x-1">
            <Button 
              size="icon" 
              variant="secondary" 
              className="h-8 w-8 bg-white/90 hover:bg-white text-brand-green border-brand-green"
              onClick={() => onEdit && onEdit(product.id)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              size="icon" 
              variant="destructive" 
              className="h-8 w-8 bg-white/90 hover:bg-white text-brand-red border-brand-red"
              onClick={() => onDelete && onDelete(product.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
        
        {!product.in_stock && (
          <div className="absolute top-0 left-0 w-full h-full bg-black/60 flex items-center justify-center">
            <span className="text-white font-medium px-3 py-1 bg-brand-red rounded-md">
              Esgotado
            </span>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="font-medium text-brand-gray mb-1">{product.name}</h3>
        <p className="text-sm text-brand-gray/70 mb-3 line-clamp-2">{product.description}</p>
        
        {viewMode === "customer" && (
          <>
            {product.variations && product.variations.length > 0 ? (
              <div className="mb-3">
                <label className="text-xs text-brand-gray/70 block mb-1">Opções:</label>
                <select
                  className="w-full border border-brand-light-gray rounded-md p-2 text-sm"
                  value={selectedVariation?.id || ""}
                  onChange={(e) => {
                    const selected = product.variations?.find(v => v.id === e.target.value);
                    setSelectedVariation(selected || null);
                  }}
                >
                  {product.variations.map((variation) => (
                    <option key={variation.id} value={variation.id}>
                      {variation.name} - R$ {variation.price.toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <p className="text-brand-green font-medium mb-3">
                R$ {product.price.toFixed(2)}
              </p>
            )}
            
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center border border-brand-light-gray rounded-md">
                <button 
                  className="px-2 py-1 text-brand-gray"
                  onClick={handleDecreaseQuantity}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="px-3 py-1 border-x border-brand-light-gray">{quantity}</span>
                <button 
                  className="px-2 py-1 text-brand-gray"
                  onClick={handleIncreaseQuantity}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <p className="font-medium text-brand-green">
                R$ {((selectedVariation?.price || product.price) * quantity).toFixed(2)}
              </p>
            </div>
            
            <Button 
              className="w-full bg-brand-green hover:bg-brand-green/90 text-white"
              onClick={handleAddToCart}
              disabled={!product.in_stock}
            >
              Adicionar ao Pedido
            </Button>
          </>
        )}
        
        {viewMode === "admin" && (
          <div className="flex justify-between items-center mt-2">
            <p className="text-brand-green font-medium">
              R$ {product.price.toFixed(2)}
            </p>
            <Button 
              size="sm" 
              variant="outline" 
              className="text-xs border-brand-green text-brand-green hover:bg-brand-green hover:text-white"
              onClick={() => onEdit && onEdit(product.id)}
            >
              <Eye className="h-3 w-3 mr-1" />
              Detalhes
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
