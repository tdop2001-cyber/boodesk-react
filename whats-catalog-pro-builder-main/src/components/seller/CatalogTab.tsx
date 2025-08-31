import { useState, useEffect } from "react";
import { Search, Plus, Copy, QrCode, Edit, Trash2, Package, Eye, EyeOff, ExternalLink, Filter, BarChart3, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import ProductFormModal from "./ProductFormModal";
import DeleteProductModal from "./DeleteProductModal";

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  variations: any[];
  category?: string;
  in_stock: boolean;
  active: boolean;
  sales: number;
  coupon_id?: string;
  created_at: string;
  updated_at: string;
}

interface Coupon {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  active: boolean;
}

// Categorias de produtos disponíveis
const productCategories = [
  "Roupas",
  "Calças", 
  "Sapatos",
  "Toucas",
  "Acessórios",
  "Eletrônicos",
  "Casa",
  "Esportes",
  "Bebidas",
  "Comida",
  "Outros"
];

const CatalogTab = () => {
  const { profile, user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const catalogUrl = profile?.catalog_slug 
    ? `${window.location.origin}/catalogo/${profile.catalog_slug}`
    : "";

  useEffect(() => {
    fetchProducts();
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .eq("active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCoupons((data || []).map(coupon => ({
        ...coupon,
        discount_type: coupon.discount_type as "percentage" | "fixed"
      })));
    } catch (error) {
      console.error("Error fetching coupons:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Convert the data to match our Product interface
      const convertedProducts = (data || []).map(product => ({
        ...product,
        variations: Array.isArray(product.variations) ? product.variations : []
      }));
      
      setProducts(convertedProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Erro ao carregar produtos");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (catalogUrl) {
      navigator.clipboard.writeText(catalogUrl);
      toast.success("Link do catálogo copiado!");
    } else {
      toast.error("Configure seu catálogo primeiro");
    }
  };

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setIsFormModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsFormModalOpen(true);
  };

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("products")
        .update({ active: !currentStatus })
        .eq("id", id);

      if (error) throw error;

      setProducts(products.map(p => 
        p.id === id ? { ...p, active: !currentStatus } : p
      ));

      toast.success(
        !currentStatus ? "Produto ativado!" : "Produto desativado!"
      );
    } catch (error) {
      console.error("Error toggling product status:", error);
      toast.error("Erro ao atualizar status do produto");
    }
  };

  const handleSaveProduct = async (productData: any) => {
    if (!user?.id) {
      toast.error("Usuário não autenticado");
      return;
    }

    try {
      const dbProduct = {
        name: productData.name,
        description: productData.description || null,
        price: Number(productData.price),
        category: productData.category,
        image: productData.image || null,
        active: productData.active,
        in_stock: productData.in_stock,
        user_id: user.id,
        coupon_id: productData.coupon_id || null
      };

      let productId;

      if (selectedProduct) {
        // Update existing product
        const { error } = await supabase
          .from("products")
          .update(dbProduct)
          .eq("id", selectedProduct.id);

        if (error) throw error;
        productId = selectedProduct.id;
        
        // Delete existing product variations
        await supabase
          .from("product_variations")
          .delete()
          .eq("product_id", productId);
          
      } else {
        // Create new product
        const { data, error } = await supabase
          .from("products")
          .insert([dbProduct])
          .select()
          .single();

        if (error) throw error;
        productId = data.id;
      }

      // Save product variations if any selected
      if (productData.selectedVariations && productData.selectedVariations.length > 0) {
        const variationData = productData.selectedVariations.map((item: any) => ({
          product_id: productId,
          variation_id: item.variation.id,
          option_id: item.option.id
        }));

        const { error: variationsError } = await supabase
          .from("product_variations")
          .insert(variationData);

        if (variationsError) throw variationsError;
      }

      toast.success(selectedProduct ? "Produto atualizado com sucesso!" : "Produto criado com sucesso!");
      
      fetchProducts();
      setIsFormModalOpen(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("Erro ao salvar produto. Tente novamente.");
    }
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;

    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", productToDelete.id);

      if (error) throw error;

      setProducts(products.filter(p => p.id !== productToDelete.id));
      toast.success("Produto excluído com sucesso!");
      setIsDeleteModalOpen(false);
      setProductToDelete(null);
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Erro ao excluir produto");
    }
  };

  const getCouponById = (couponId: string) => {
    return coupons.find(c => c.id === couponId);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return <div className="flex justify-center p-8">Carregando...</div>;
  }

  return (
    <>
      {/* Catalog Link Section */}
      <Card className="mb-4 md:mb-6 border-2 border-brand-light-gray">
        <CardHeader className="pb-2">
          <CardTitle className="text-base md:text-lg">Link do Seu Catálogo</CardTitle>
          <CardDescription className="text-xs md:text-sm">Compartilhe seu catálogo com seus clientes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col space-y-2 w-full">
              <Label htmlFor="catalog-link" className="text-sm">URL do seu catálogo</Label>
              <div className="flex items-center">
                <Input 
                  id="catalog-link" 
                  value={catalogUrl || "Configure seu catálogo primeiro"}
                  readOnly
                  className="text-xs md:text-sm h-9 font-mono"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row w-full gap-2">
              <Button 
                onClick={handleCopyLink} 
                className="bg-brand-red hover:bg-brand-red/90 text-white w-full sm:w-auto"
                disabled={!catalogUrl}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copiar Link
              </Button>
              <Button variant="outline" className="w-full sm:w-auto" disabled={!catalogUrl}>
                <QrCode className="h-4 w-4 mr-2" />
                QR Code
              </Button>
              {catalogUrl && (
                <Button asChild variant="outline" className="w-full sm:w-auto">
                  <a href={catalogUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Ver Catálogo
                  </a>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Products Grid */}
      <div className="bg-white rounded-lg shadow-sm p-3 md:p-4 mb-4 md:mb-6">
        <div className="flex flex-col gap-3 md:flex-row md:gap-4 md:justify-between md:items-center mb-4">
          <div className="relative w-full md:flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brand-gray/50 h-4 w-4" />
            <Input
              placeholder="Procurar produtos..."
              className="pl-9 text-sm h-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-[180px] h-9">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas categorias</SelectItem>
                {productCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            
            <Button 
              className="bg-[#2E8B57] hover:bg-[#2E8B57]/90 w-full sm:w-auto"
              onClick={handleAddProduct}
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Produto
            </Button>
          </div>
        </div>
      </div>
      
      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredProducts.map((product) => {
          const coupon = product.coupon_id ? getCouponById(product.coupon_id) : null;
          
          return (
            <Card 
              key={product.id} 
              className={`overflow-hidden hover:shadow-md transition-all hover:scale-[1.02] ${!product.active ? 'opacity-60' : ''}`}
            >
              <div className="h-48 bg-brand-light-gray/30 relative">
                {product.image ? (
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="h-12 w-12 text-brand-gray/30" />
                  </div>
                )}
                
                {/* Status badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {!product.active && (
                    <Badge variant="destructive" className="border border-dashed border-red-300">Desativado</Badge>
                  )}
                  {!product.in_stock && (
                    <Badge variant="secondary">Sem estoque</Badge>
                  )}
                  {coupon && (
                    <Badge className="bg-green-500 text-white flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      {coupon.code}
                    </Badge>
                  )}
                </div>
                
                {/* Action buttons */}
                <div className="absolute top-2 right-2 flex flex-col gap-1">
                  <Button 
                    size="icon" 
                    variant="outline" 
                    className="h-7 w-7 bg-white hover:bg-[#2E8B57] hover:text-white text-[#2E8B57] border-[#2E8B57]"
                    onClick={() => handleEditProduct(product)}
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="outline" 
                    className="h-7 w-7 bg-white hover:bg-[#B70404] hover:text-white text-[#B70404] border-[#B70404]"
                    onClick={() => handleDeleteClick(product)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              
              <CardContent className="p-3 md:p-4">
                <h3 className="font-semibold text-base md:text-lg text-brand-gray truncate">
                  {product.name}
                </h3>
                <p className="text-xs md:text-sm text-brand-gray/70 line-clamp-2 mb-3 h-8">
                  {product.description}
                </p>
                
                {/* Price display */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-base md:text-lg font-semibold text-[#B70404]">
                    R$ {product.price.toFixed(2).replace('.', ',')}
                  </span>
                  {product.sales > 0 && (
                    <span className="text-xs text-brand-gray/60">
                      {product.sales} vendas
                    </span>
                  )}
                </div>
                
                {/* Product variations */}
                {product.variations.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {product.variations.map((variation, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {variation.name || variation.value}
                      </Badge>
                    ))}
                  </div>
                )}
                
                {/* Toggle active status */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Switch 
                      checked={product.active}
                      onCheckedChange={() => handleToggleActive(product.id, product.active)}
                      className="data-[state=unchecked]:bg-[#B70404]"
                    />
                    <span className="text-xs text-brand-gray/70">
                      {product.active ? (
                        <span className="flex items-center gap-1">
                          <Eye className="h-3.5 w-3.5" /> Visível
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <EyeOff className="h-3.5 w-3.5" /> Oculto
                        </span>
                      )}
                    </span>
                  </div>
                  
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-xs"
                    onClick={() => handleEditProduct(product)}
                  >
                    Detalhes
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {/* Empty state */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <Package className="h-12 w-12 mx-auto text-brand-gray/40 mb-3" />
          <h3 className="text-lg font-medium text-brand-gray">Nenhum produto encontrado</h3>
          <p className="text-sm text-brand-gray/70 mt-1 mb-4">
            {searchQuery 
              ? "Tente ajustar sua busca ou criar um novo produto" 
              : "Comece adicionando seu primeiro produto ao catálogo"}
          </p>
          <Button 
            onClick={handleAddProduct}
            className="bg-[#2E8B57] hover:bg-[#2E8B57]/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Produto
          </Button>
        </div>
      )}
      
      {/* Product Form Modal */}
      <ProductFormModal 
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSave={handleSaveProduct}
        product={selectedProduct}
        coupons={coupons}
      />
      
      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <DeleteProductModal 
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          productName={productToDelete.name}
        />
      )}
    </>
  );
};

export default CatalogTab;
