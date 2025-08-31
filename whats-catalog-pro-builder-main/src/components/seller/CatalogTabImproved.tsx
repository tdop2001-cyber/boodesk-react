import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
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
  ExternalLink,
  Star,
  Percent,
  Gift,
  Ticket
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import ProductFormModal from "./ProductFormModal";
import DeleteProductModal from "./DeleteProductModal";
import ImprovedVariationsTab from "./ImprovedVariationsTab";
import CouponsTab from "./CouponsTab";
import PromotionsTab from "./PromotionsTab";
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

const CatalogTabImproved = () => {
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
        .in('variation_id', variationsData?.map(v => v.id) || [])
        .order('created_at', { ascending: true });

      if (optionsError) throw optionsError;

      const variationsWithOptions = variationsData?.map(variation => ({
        ...variation,
        options: optionsData?.filter(option => option.variation_id === variation.id) || []
      })) || [];

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

  const handleDeleteVariation = async (variationId: string) => {
    try {
      const { error } = await supabase
        .from('variations')
        .delete()
        .eq('id', variationId);

      if (error) throw error;
      toast.success('Variação excluída!');
      fetchVariations();
    } catch (error) {
      console.error('Error deleting variation:', error);
      toast.error('Erro ao excluir variação');
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

  const handleDeleteOption = async (optionId: string) => {
    try {
      const { error } = await supabase
        .from('variation_options')
        .delete()
        .eq('id', optionId);

      if (error) throw error;
      toast.success('Opção excluída!');
      fetchVariations();
    } catch (error) {
      console.error('Error deleting option:', error);
      toast.error('Erro ao excluir opção');
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

  const handleDeleteCategory = (categoryName: string) => {
    setCategories(categories.filter(cat => cat !== categoryName));
    toast.success('Categoria removida!');
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (selectedCategory === "all" || product.category === selectedCategory)
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando produtos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with welcome message */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white p-8 rounded-xl shadow-xl border-4 border-yellow-400 animate-pulse">
        <h2 className="text-3xl font-black mb-3 text-center">🔥 NOVA ESTRUTURA ATIVA! 🔥</h2>
        <p className="text-purple-100 text-center text-lg font-semibold">5 ABAS AGORA: Produtos + Categorias + Cupons + Promoções + Variações Melhoradas</p>
        <div className="mt-4 text-center">
          <span className="bg-yellow-400 text-purple-900 px-4 py-2 rounded-full font-bold text-sm">
            ✨ VEJA AS NOVAS ABAS ACIMA ✨
          </span>
        </div>
      </div>

      <Tabs defaultValue="products" className="w-full">
        <TabsList className="grid grid-cols-5 w-full bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 p-2 rounded-xl shadow-lg border-2 border-purple-300">
          <TabsTrigger value="products" className="flex items-center gap-2 text-purple-700 font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg">
            <Package className="h-4 w-4" />
            Produtos
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2 text-purple-700 font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-teal-600 data-[state=active]:text-white data-[state=active]:shadow-lg">
            <Tags className="h-4 w-4" />
            Categorias
          </TabsTrigger>
          <TabsTrigger value="coupons" className="flex items-center gap-2 text-purple-700 font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-600 data-[state=active]:to-red-600 data-[state=active]:text-white data-[state=active]:shadow-lg">
            <Ticket className="h-4 w-4" />
            Cupons
          </TabsTrigger>
          <TabsTrigger value="promotions" className="flex items-center gap-2 text-purple-700 font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-600 data-[state=active]:to-rose-600 data-[state=active]:text-white data-[state=active]:shadow-lg">
            <Gift className="h-4 w-4" />
            Promoções
          </TabsTrigger>
          <TabsTrigger value="variations" className="flex items-center gap-2 text-purple-700 font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg">
            <Settings className="h-4 w-4" />
            Variações
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
            
            <div className="flex gap-2 flex-wrap">
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
              <Button onClick={() => setIsFormModalOpen(true)} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                Novo Produto
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="group overflow-hidden hover:shadow-lg transition-all duration-300 border-0 shadow-md">
                <div className="aspect-square relative bg-gradient-to-br from-gray-50 to-gray-100">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3 flex gap-2">
                    <Badge variant={product.active ? "default" : "secondary"} className="shadow-sm">
                      {product.active ? "Ativo" : "Inativo"}
                    </Badge>
                    {product.in_stock ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Em Estoque
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                        Esgotado
                      </Badge>
                    )}
                  </div>
                </div>
                <CardContent className="p-4 space-y-3">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg truncate group-hover:text-blue-600 transition-colors">{product.name}</h3>
                    <p className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                      R$ {Number(product.price).toFixed(2)}
                    </p>
                    {product.category && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {product.category}
                      </Badge>
                    )}
                    {product.sales > 0 && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Star className="h-4 w-4 mr-1 text-yellow-500" />
                        {product.sales} vendas
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between pt-2 border-t">
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
                        className="h-8 w-8 p-0"
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setProductToDelete(product);
                          setIsDeleteModalOpen(true);
                        }}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Nenhum produto encontrado</h3>
              <p className="text-gray-500">
                {searchQuery || selectedCategory !== "all" 
                  ? "Tente ajustar seus filtros de busca" 
                  : "Comece criando seu primeiro produto"}
              </p>
            </div>
          )}
        </TabsContent>


        <TabsContent value="categories" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Gerenciar Categorias</h3>
              <p className="text-sm text-gray-600">Organize seus produtos em categorias</p>
            </div>
            <Button 
              onClick={() => setShowCategoryModal(true)}
              className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Categoria
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <Card key={category} className="shadow-md border-0">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                      <Tags className="h-5 w-5 text-blue-600" />
                    </div>
                    <span className="font-medium">{category}</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDeleteCategory(category)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="coupons" className="space-y-6">
          <CouponsTab />
        </TabsContent>

        <TabsContent value="promotions" className="space-y-6">
          <PromotionsTab />
        </TabsContent>

        <TabsContent value="variations" className="space-y-6">
          <ImprovedVariationsTab />
        </TabsContent>
      </Tabs>

      {/* Modals */}
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

      {/* Variation Modal */}
      <Dialog open={showVariationModal} onOpenChange={setShowVariationModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedVariation ? 'Editar Variação' : 'Nova Variação'}
            </DialogTitle>
            <DialogDescription>
              Crie variações como Cor, Tamanho, Material, etc.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="variation-name">Nome da Variação</Label>
              <Input
                id="variation-name"
                value={variationName}
                onChange={(e) => setVariationName(e.target.value)}
                placeholder="Ex: Cor, Tamanho, Material..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowVariationModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveVariation}>
              {selectedVariation ? 'Atualizar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Option Modal */}
      <Dialog open={showOptionModal} onOpenChange={setShowOptionModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedOption ? 'Editar Opção' : 'Nova Opção'}
            </DialogTitle>
            <DialogDescription>
              Adicione uma opção para a variação "{selectedVariation?.name}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="option-name">Nome da Opção</Label>
              <Input
                id="option-name"
                value={optionName}
                onChange={(e) => setOptionName(e.target.value)}
                placeholder="Ex: Azul, P, Algodão..."
              />
            </div>
            <div>
              <Label htmlFor="price-adjustment">Ajuste de Preço (R$)</Label>
              <Input
                id="price-adjustment"
                type="number"
                step="0.01"
                value={optionPriceAdjustment}
                onChange={(e) => setOptionPriceAdjustment(Number(e.target.value))}
                placeholder="0.00"
              />
              <p className="text-xs text-gray-500 mt-1">
                Deixe 0 para não alterar o preço. Use valores negativos para descontos.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowOptionModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveOption}>
              {selectedOption ? 'Atualizar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Category Modal */}
      <Dialog open={showCategoryModal} onOpenChange={setShowCategoryModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Categoria</DialogTitle>
            <DialogDescription>
              Adicione uma nova categoria para organizar seus produtos
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="category-name">Nome da Categoria</Label>
              <Input
                id="category-name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Ex: Perfumes, Bijuterias..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCategoryModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddCategory}>
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CatalogTabImproved;