
import { ChevronDown, Filter, Package, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/types/seller";

interface ProductGridProps {
  searchQuery: string;
  selectedCategory: string | null;
  filteredProducts: Product[];
  onProductClick: (product: Product) => void;
  resetFilters: () => void;
}

const ProductGrid = ({ 
  searchQuery, 
  selectedCategory, 
  filteredProducts, 
  onProductClick,
  resetFilters
}: ProductGridProps) => {
  
  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <h2 className="text-2xl md:text-3xl font-bold text-brand-gray">
          {searchQuery 
            ? `Resultados para "${searchQuery}"` 
            : selectedCategory || "Todos os Produtos"}
        </h2>
        
        <div className="flex items-center text-brand-gray text-sm">
          <span className="mr-2 text-brand-gray/60">{filteredProducts.length} produtos encontrados</span>
        </div>
      </div>
      
      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div 
              key={product.id} 
              className="bg-white rounded-2xl overflow-hidden shadow-md border border-brand-light-gray/50 hover:shadow-xl hover:border-brand-red/20 hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
              onClick={() => onProductClick(product)}
            >
              {/* Product Image with Zoom Effect */}
              <div className="relative aspect-square bg-gradient-to-br from-brand-light-gray/20 to-brand-light-gray/5 overflow-hidden">
                {product.image ? (
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-gray/10 to-brand-gray/5">
                    <div className="text-center">
                      <Package className="h-12 w-12 text-brand-gray/30 mx-auto mb-2" />
                      <span className="text-brand-gray/40 text-sm">Sem imagem</span>
                    </div>
                  </div>
                )}
                
                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col space-y-1">
                  {product.sales && product.sales >= 10 && (
                    <Badge className="bg-yellow-500 text-yellow-900 px-2 py-1 flex items-center shadow-md">
                      <Star className="h-3 w-3 mr-1 fill-current" />
                      Mais Vendido
                    </Badge>
                  )}
                </div>
                
                {!product.in_stock && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center backdrop-blur-sm">
                    <Badge className="bg-red-100 text-red-800 px-4 py-2 text-sm font-semibold shadow-lg">
                      Esgotado
                    </Badge>
                  </div>
                )}
              </div>
              
              <div className="p-5">
                <h3 className="font-bold text-lg text-brand-gray mb-2 line-clamp-1 group-hover:text-brand-red transition-colors">
                  {product.name}
                </h3>
                <p className="text-sm text-brand-gray/70 mb-4 line-clamp-2 leading-relaxed">
                  {product.description}
                </p>
                
                <div className="flex justify-between items-center pt-2 border-t border-brand-light-gray/30">
                  <p className="font-bold text-xl text-brand-red">
                    R$ {product.price.toFixed(2)}
                  </p>
                  <Button 
                    size="sm" 
                    className="bg-gradient-to-r from-brand-green to-brand-green/90 hover:from-brand-green/90 hover:to-brand-green text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all transform hover:scale-105"
                    onClick={(e) => {
                      e.stopPropagation();
                      onProductClick(product);
                    }}
                  >
                    Ver Detalhes
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-brand-light-gray/50">
          <div className="bg-gradient-to-br from-brand-gray/10 to-brand-gray/5 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
            <Package className="h-12 w-12 text-brand-gray/40" />
          </div>
          <h3 className="text-2xl font-bold text-brand-gray mb-3">Nenhum produto encontrado</h3>
          <p className="text-brand-gray/60 mb-8 text-lg leading-relaxed max-w-md mx-auto">
            {searchQuery 
              ? `Não encontramos produtos para "${searchQuery}". Tente outros termos ou categorias.`
              : "Nenhum produto disponível nesta categoria no momento."
            }
          </p>
          
          <Button 
            className="bg-gradient-to-r from-brand-red to-brand-red/90 hover:from-brand-red/90 hover:to-brand-red text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            onClick={resetFilters}
          >
            Ver Todos os Produtos
          </Button>
        </div>
      )}
    </>
  );
};

export default ProductGrid;
