import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Eye, 
  EyeOff, 
  Package,
  Settings,
  Tags,
  Palette,
  Copy,
  ExternalLink
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import ProductFormModal from "./ProductFormModal";
import DeleteProductModal from "./DeleteProductModal";
import { VariationWithOptions, ProductVariationData } from "@/types/variations";

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  category?: string;
  in_stock: boolean;
  active: boolean;
  sales: number;
  coupon_id?: string;
  created_at: string;
  updated_at: string;
}

const CatalogTabEnhanced = () => {
  const { user, profile } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<any>(null);

  // Variation management states
  const [variations, setVariations] = useState<VariationWithOptions[]>([]);
  const [showVariationModal, setShowVariationModal] = useState(false);
  const [selectedVariation, setSelectedVariation] = useState<any>(null);
  const [variationName, setVariationName] = useState("");
  const [optionName, setOptionName] = useState("");
  const [optionPriceAdjustment, setOptionPriceAdjustment] = useState(0);
  const [showOptionModal, setShowOptionModal] = useState(false);
  const [selectedOption, setSelectedOption] = useState<any>(null);

  // Category management states
  const [categories, setCategories] = useState<string[]>([
    "Roupas", "Calças", "Sapatos", "Toucas", "Acessórios", 
    "Eletrônicos", "Casa", "Esportes", "Bebidas", "Comida", "Outros"
  ]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const catalogUrl = profile?.catalog_slug 
    ? `${window.location.origin}/catalogo/${profile.catalog_slug}`
    : "";

  useEffect(() => {
    if (user) {
      fetchProducts();
      fetchCoupons();
      fetchVariations();
    }
  }, [user]);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Erro ao carregar produtos");
    } finally {
      setLoading(false);
    }
  };

  const fetchCoupons = async () => {
    try {
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .eq("user_id", user!.id)
        .eq("active", true);

      if (error) throw error;
      setCoupons(data || []);
    } catch (error) {
      console.error("Error fetching coupons:", error);
    }
  };

  const fetchVariations = async () => {
    try {
      const { data: variationsData, error: variationsError } = await supabase
        .from('variations')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (variationsError) throw variationsError;

      const { data: optionsData, error: optionsError } = await supabase
        .from('variation_options')
        .select('*')
        .in('variation_id', variationsData.map(v => v.id))
        .order('created_at', { ascending: true });

      if (optionsError) throw optionsError;

      const variationsWithOptions = variationsData.map(variation => ({
        ...variation,
        options: optionsData.filter(option => option.variation_id === variation.id)
      }));

      setVariations(variationsWithOptions);
    } catch (error) {
      console.error('Error fetching variations:', error);
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
        const { error } = await supabase
          .from("products")
          .update(dbProduct)
          .eq("id", selectedProduct.id);

        if (error) throw error;
        productId = selectedProduct.id;
        
        await supabase
          .from("product_variations")
          .delete()
          .eq("product_id", productId);
          
      } else {
        const { data, error } = await supabase
          .from("products")
          .insert([dbProduct])
          .select()
          .single();

        if (error) throw error;
        productId = data.id;
      }

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

      toast.success(selectedProduct ? "Produto atualizado!" : "Produto criado!");
      
      fetchProducts();
      setIsFormModalOpen(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("Erro ao salvar produto");
    }
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

      toast.success(!currentStatus ? "Produto ativado!" : "Produto desativado!");
    } catch (error) {
      console.error("Error toggling product status:", error);
      toast.error("Erro ao atualizar status do produto");
    }
  };

  const handleDeleteProduct = async () => {
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

  // Variation functions
  const handleSaveVariation = async () => {
    if (!variationName.trim()) {
      toast.error('Nome da variação é obrigatório');
      return;
    }

    try {
      if (selectedVariation) {
        const { error } = await supabase
          .from('variations')
          .update({ name: variationName.trim() })
          .eq('id', selectedVariation.id);

        if (error) throw error;
        toast.success('Variação atualizada!');
      } else {
        const { error } = await supabase
          .from('variations')
          .insert({
            user_id: user!.id,
            name: variationName.trim()
          });

        if (error) throw error;
        toast.success('Variação criada!');
      }

      setShowVariationModal(false);
      setVariationName("");
      setSelectedVariation(null);
      fetchVariations();
    } catch (error) {
      console.error('Error saving variation:', error);
      toast.error('Erro ao salvar variação');
    }
  };

  const handleSaveOption = async () => {
    if (!optionName.trim()) {
      toast.error('Nome da opção é obrigatório');
      return;
    }

    if (!selectedVariation) {
      toast.error('Selecione uma variação');
      return;
    }

    try {
      if (selectedOption) {
        const { error } = await supabase
          .from('variation_options')
          .update({
            name: optionName.trim(),
            price_adjustment: optionPriceAdjustment
          })
          .eq('id', selectedOption.id);

        if (error) throw error;
        toast.success('Opção atualizada!');
      } else {
        const { error } = await supabase
          .from('variation_options')
          .insert({
            variation_id: selectedVariation.id,
            name: optionName.trim(),
            price_adjustment: optionPriceAdjustment
          });

        if (error) throw error;
        toast.success('Opção criada!');
      }

      setShowOptionModal(false);
      setOptionName("");
      setOptionPriceAdjustment(0);
      setSelectedOption(null);
      fetchVariations();
    } catch (error) {
      console.error('Error saving option:', error);
      toast.error('Erro ao salvar opção');
    }
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      toast.error('Nome da categoria é obrigatório');
      return;
    }

    if (categories.includes(newCategoryName.trim())) {
      toast.error('Categoria já existe');
      return;
    }

    setCategories([...categories, newCategoryName.trim()]);
    setNewCategoryName("");
    setShowCategoryModal(false);
    toast.success('Categoria adicionada!');
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (selectedCategory === "all" || product.category === selectedCategory)
  );

  if (loading) {
    return <div className="flex justify-center p-8">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="products" className="w-full">
        <TabsList className="grid grid-cols-3 w-fit">
          <TabsTrigger value="products">
            <Package className="h-4 w-4 mr-2" />
            Produtos
          </TabsTrigger>
          <TabsTrigger value="variations">
            <Settings className="h-4 w-4 mr-2" />
            Variações
          </TabsTrigger>
          <TabsTrigger value="categories">
            <Tags className="h-4 w-4 mr-2" />
            Categorias
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar produtos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filtrar por categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2">
              {catalogUrl && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(catalogUrl);
                      toast.success("Link copiado!");
                    }}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar Link
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => window.open(catalogUrl, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Ver Catálogo
                  </Button>
                </>
              )}
              <Button onClick={() => setIsFormModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Produto
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden">
                <div className="aspect-square relative bg-gray-100">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 flex gap-1">
                    <Badge variant={product.active ? "secondary" : "outline"}>
                      {product.active ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg truncate">{product.name}</h3>
                    <p className="text-2xl font-bold text-green-600">
                      R$ {product.price.toFixed(2)}
                    </p>
                    {product.category && (
                      <Badge variant="outline">{product.category}</Badge>
                    )}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={product.active}
                          onCheckedChange={() => handleToggleActive(product.id, product.active)}
                        />
                        <span className="text-xs text-gray-600">
                          {product.active ? "Ativo" : "Inativo"}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedProduct(product);
                            setIsFormModalOpen(true);
                          }}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setProductToDelete(product);
                            setIsDeleteModalOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Package className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600 mb-4">Nenhum produto encontrado</p>
                <Button onClick={() => setIsFormModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Produto
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="variations" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Variações e Opções</h3>
            <Button onClick={() => {
              setSelectedVariation(null);
              setVariationName("");
              setShowVariationModal(true);
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Variação
            </Button>
          </div>

          <div className="grid gap-4">
            {variations.map((variation) => (
              <Card key={variation.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <CardTitle className="text-base">{variation.name}</CardTitle>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedVariation(variation);
                        setSelectedOption(null);
                        setOptionName("");
                        setOptionPriceAdjustment(0);
                        setShowOptionModal(true);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Opção
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {variation.options.length > 0 ? (
                    <div className="grid gap-2">
                      {variation.options.map((option) => (
                        <div
                          key={option.id}
                          className="flex items-center justify-between p-2 border rounded"
                        >
                          <div>
                            <span className="font-medium">{option.name}</span>
                            {option.price_adjustment !== 0 && (
                              <span className="text-sm text-gray-600 ml-2">
                                {option.price_adjustment > 0 ? '+' : ''}R$ {option.price_adjustment.toFixed(2)}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">Nenhuma opção cadastrada</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {variations.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Settings className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600 mb-4">Nenhuma variação cadastrada</p>
                <Button onClick={() => {
                  setSelectedVariation(null);
                  setVariationName("");
                  setShowVariationModal(true);
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeira Variação
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Categorias de Produtos</h3>
            <Button onClick={() => setShowCategoryModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Categoria
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((category) => (
              <Card key={category}>
                <CardContent className="p-4 text-center">
                  <Tags className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="font-medium">{category}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Modais */}
      <ProductFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setSelectedProduct(null);
        }}
        onSave={handleSaveProduct}
        product={selectedProduct}
        coupons={coupons}
      />

      <DeleteProductModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setProductToDelete(null);
        }}
        onConfirm={handleDeleteProduct}
        productName={productToDelete?.name || ""}
      />

      {/* Modal para Variação */}
      <Dialog open={showVariationModal} onOpenChange={setShowVariationModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Variação</DialogTitle>
            <DialogDescription>
              Ex: Cor, Tamanho, Material
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="variation-name">Nome da Variação</Label>
              <Input
                id="variation-name"
                value={variationName}
                onChange={(e) => setVariationName(e.target.value)}
                placeholder="Ex: Cor, Tamanho, Material"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowVariationModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveVariation}>Criar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para Opção */}
      <Dialog open={showOptionModal} onOpenChange={setShowOptionModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Opção</DialogTitle>
            <DialogDescription>
              Ex: Azul, Grande, Algodão
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="option-name">Nome da Opção</Label>
              <Input
                id="option-name"
                value={optionName}
                onChange={(e) => setOptionName(e.target.value)}
                placeholder="Ex: Azul, Grande, Algodão"
              />
            </div>
            
            <div>
              <Label htmlFor="price-adjustment">Ajuste de Preço (R$)</Label>
              <Input
                id="price-adjustment"
                type="number"
                step="0.01"
                value={optionPriceAdjustment}
                onChange={(e) => setOptionPriceAdjustment(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
              <p className="text-sm text-gray-500 mt-1">
                Valor adicional ou desconto (use valores negativos para desconto)
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowOptionModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveOption}>Criar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para Categoria */}
      <Dialog open={showCategoryModal} onOpenChange={setShowCategoryModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Categoria</DialogTitle>
            <DialogDescription>
              Adicione uma nova categoria de produtos
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="category-name">Nome da Categoria</Label>
              <Input
                id="category-name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Ex: Livros, Perfumes, Artesanato"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCategoryModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddCategory}>Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CatalogTabEnhanced;