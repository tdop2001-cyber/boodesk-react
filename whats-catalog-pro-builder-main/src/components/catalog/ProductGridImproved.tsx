import { useState } from "react";
import { Package, ShoppingBag, Star, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Product } from "@/types/seller";

interface ProductGridProps {
  searchQuery: string;
  selectedCategory: string | null;
  filteredProducts: Product[];
  onProductClick: (product: Product) => void;
  resetFilters: () => void;
}

const ProductGridImproved = ({ 
  searchQuery, 
  selectedCategory, 
  filteredProducts, 
  onProductClick, 
  resetFilters 
}: ProductGridProps) => {
  const [favorites, setFavorites] = useState<string[]>([]);

  const toggleFavorite = (productId: string) => {
    setFavorites(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  if (filteredProducts.length === 0) {
    return (
      <div className="text-center py-16">
        <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">
          {searchQuery || selectedCategory ? "Nenhum produto encontrado" : "Nenhum produto disponível"}
        </h3>
        <p className="text-gray-500 mb-6">
          {searchQuery || selectedCategory 
            ? "Tente ajustar seus filtros de busca" 
            : "Esta loja ainda não possui produtos cadastrados"}
        </p>
        {(searchQuery || selectedCategory) && (
          <Button 
            onClick={resetFilters}
            variant="outline"
            className="border-brand-green text-brand-green hover:bg-brand-green hover:text-white"
          >
            Limpar Filtros
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredProducts.map((product, index) => (
        <Card 
          key={product.id} 
          className="group cursor-pointer overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white"
          onClick={() => onProductClick(product)}
        >
          <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                loading={index < 8 ? "eager" : "lazy"}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
                <Package className="h-12 w-12 text-gray-400" />
              </div>
            )}
            
            {/* Overlay com gradiente */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Badge de estoque */}
            <div className="absolute top-3 left-3">
            {product.in_stock ? (
                <Badge className="bg-green-500 hover:bg-green-500 text-white shadow-lg">
                  Disponível
                </Badge>
              ) : (
                <Badge variant="destructive" className="shadow-lg">
                  Esgotado
                </Badge>
              )}
            </div>

            {/* Botão de favorito */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(product.id);
              }}
              className="absolute top-3 right-3 p-2 bg-white/80 rounded-full hover:bg-white transition-colors duration-200 shadow-lg"
            >
              <Heart 
                className={`h-4 w-4 ${
                  favorites.includes(product.id) 
                    ? 'text-red-500 fill-current' 
                    : 'text-gray-600'
                }`} 
              />
            </button>

            {/* Categoria */}
            {product.category && (
              <div className="absolute bottom-3 left-3">
                <Badge variant="secondary" className="bg-white/90 text-gray-700 shadow-sm">
                  {product.category}
                </Badge>
              </div>
            )}

            {/* Overlay de ação */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Button 
                size="sm" 
                className="bg-white text-gray-800 hover:bg-gray-100 shadow-lg transform scale-95 group-hover:scale-100 transition-transform duration-200"
                onClick={(e) => {
                  e.stopPropagation();
                  onProductClick(product);
                }}
              >
                <ShoppingBag className="h-4 w-4 mr-2" />
                Ver Detalhes
              </Button>
            </div>
          </div>

          <CardContent className="p-4 space-y-3">
            <div className="space-y-2">
              <h3 className="font-semibold text-lg leading-tight group-hover:text-blue-600 transition-colors duration-200 line-clamp-2">
                {product.name}
              </h3>
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                      R$ {Number(product.price).toFixed(2)}
                    </span>
                  </div>
                </div>
                
                {product.sales > 0 && (
                  <div className="flex items-center text-sm text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                    <Star className="h-3 w-3 mr-1 fill-current" />
                    {product.sales}
                  </div>
                )}
              </div>

              {product.description && (
                <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                  {product.description}
                </p>
              )}
            </div>

            <div className="pt-3 border-t border-gray-100">
              <Button
                size="sm"
              disabled={!product.in_stock}
                className={`w-full ${
                  product.in_stock 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white' 
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                } transition-all duration-200 shadow-sm hover:shadow-md`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (product.in_stock) {
                    onProductClick(product);
                  }
                }}
              >
                <ShoppingBag className="h-4 w-4 mr-2" />
                {product.in_stock ? 'Adicionar ao Pedido' : 'Produto Esgotado'}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ProductGridImproved;