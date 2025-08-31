import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, X, Scissors, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { removeBackground, loadImage } from "@/utils/backgroundRemoval";
import { VariationWithOptions, ProductVariationData } from "@/types/variations";

interface ProductFormData {
  id?: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  selectedVariations: ProductVariationData[];
  active: boolean;
  in_stock: boolean;
  coupon_id?: string;
}

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

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: ProductFormData) => void;
  product?: any;
  coupons?: Array<{
    id: string;
    code: string;
    discount_type: string;
    discount_value: number;
    active: boolean;
  }>;
}

const ProductFormModal = ({ isOpen, onClose, onSave, product, coupons = [] }: ProductFormModalProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [removingBackground, setRemovingBackground] = useState(false);
  const [availableVariations, setAvailableVariations] = useState<VariationWithOptions[]>([]);
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    price: 0,
    category: "",
    image: "",
    selectedVariations: [],
    active: true,
    in_stock: true,
    coupon_id: undefined,
  });

  // Fetch available variations when modal opens
  useEffect(() => {
    if (isOpen && user) {
      fetchAvailableVariations();
    }
  }, [isOpen, user]);

  // Reset form when modal opens/closes or product changes
  useEffect(() => {
    if (isOpen && product) {
      setFormData({
        id: product.id,
        name: product.name || "",
        description: product.description || "",
        price: Number(product.price) || 0,
        category: product.category || "",
        image: product.image || "",
        selectedVariations: [],
        active: product.active !== undefined ? product.active : true,
        in_stock: product.in_stock !== undefined ? product.in_stock : true,
        coupon_id: product.coupon_id || undefined,
      });
      // Load existing product variations if editing
      if (product.id) {
        loadProductVariations(product.id);
      }
    } else if (isOpen) {
      setFormData({
        name: "",
        description: "",
        price: 0,
        category: "",
        image: "",
        selectedVariations: [],
        active: true,
        in_stock: true,
        coupon_id: undefined,
      });
    }
  }, [isOpen, product]);

  const fetchAvailableVariations = async () => {
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

      setAvailableVariations(variationsWithOptions);
    } catch (error) {
      console.error('Error fetching variations:', error);
    }
  };

  const loadProductVariations = async (productId: string) => {
    try {
      const { data, error } = await supabase
        .from('product_variations')
        .select(`
          *,
          variation:variations(*),
          option:variation_options(*)
        `)
        .eq('product_id', productId);

      if (error) throw error;

      const selectedVariations = data.map(item => ({
        variation: item.variation,
        option: item.option
      }));

      setFormData(prev => ({ ...prev, selectedVariations }));
    } catch (error) {
      console.error('Error loading product variations:', error);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, shouldRemoveBackground = false) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) {
      toast.error("Selecione uma imagem válida");
      return;
    }

    setLoading(true);
    setRemovingBackground(shouldRemoveBackground);
    
    try {
      let fileToUpload = file;
      
      if (shouldRemoveBackground) {
        toast.info("Removendo fundo da imagem...");
        const imageElement = await loadImage(file);
        const processedBlob = await removeBackground(imageElement);
        fileToUpload = new File([processedBlob], `processed-${file.name}`, { type: 'image/png' });
      }

      const fileName = `${user.id}/${Date.now()}-${fileToUpload.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
      
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(fileName, fileToUpload);

      if (error) throw error;

      const imageUrl = `https://legazpqcrnmvtqoqmrvn.supabase.co/storage/v1/object/public/product-images/${data.path}`;
      setFormData(prev => ({ ...prev, image: imageUrl }));
      toast.success(shouldRemoveBackground ? "Imagem com fundo removido carregada!" : "Imagem carregada com sucesso!");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Erro ao fazer upload da imagem");
    } finally {
      setLoading(false);
      setRemovingBackground(false);
    }
  };

  const handleVariationOptionToggle = (variation: any, option: any, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        selectedVariations: [...prev.selectedVariations, { variation, option }]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        selectedVariations: prev.selectedVariations.filter(
          item => !(item.variation.id === variation.id && item.option.id === option.id)
        )
      }));
    }
  };

  const isVariationOptionSelected = (variationId: string, optionId: string) => {
    return formData.selectedVariations.some(
      item => item.variation.id === variationId && item.option.id === optionId
    );
  };

  const handleSave = () => {
    // Validação básica
    if (!formData.name.trim()) {
      toast.error("Nome do produto é obrigatório");
      return;
    }

    if (!formData.price || formData.price <= 0) {
      toast.error("Preço deve ser maior que zero");
      return;
    }

    if (!formData.category) {
      toast.error("Categoria é obrigatória");
      return;
    }

    const finalData = {
      ...formData,
      name: formData.name.trim(),
      description: formData.description.trim(),
      category: formData.category.trim(),
    };

    onSave(finalData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? "Editar Produto" : "Novo Produto"}</DialogTitle>
          <DialogDescription>
            {product 
              ? "Edite as informações do produto" 
              : "Preencha as informações do novo produto"}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Informações Básicas */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Produto *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Camiseta Básica"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="price">Preço (R$) *</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                placeholder="0,00"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Categoria *</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {productCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="coupon">Cupom de Desconto</Label>
              <Select 
                value={formData.coupon_id || ""} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, coupon_id: value || undefined }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cupom (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  {coupons.filter(coupon => coupon.active).map((coupon) => (
                    <SelectItem key={coupon.id} value={coupon.id}>
                      {coupon.code} - {coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `R$ ${coupon.discount_value.toFixed(2)}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descrição detalhada do produto..."
              rows={3}
            />
          </div>

          {/* Imagem */}
          <div className="space-y-2">
            <Label>Imagem do Produto</Label>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Input
                  type="file"
                  id="image-upload"
                  className="hidden"
                  onChange={(e) => handleImageUpload(e, false)}
                  accept="image/*"
                  disabled={loading}
                />
                <Input
                  type="file"
                  id="image-upload-bg-remove"
                  className="hidden"
                  onChange={(e) => handleImageUpload(e, true)}
                  accept="image/*"
                  disabled={loading}
                />
                <Button variant="outline" asChild disabled={loading}>
                  <label htmlFor="image-upload" className="flex items-center space-x-2 cursor-pointer">
                    <Camera className="h-4 w-4" />
                    <span>{loading ? "Carregando..." : "Adicionar Imagem"}</span>
                  </label>
                </Button>
                <Button 
                  variant="outline" 
                  asChild 
                  disabled={loading || removingBackground}
                  className="bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200"
                >
                  <label htmlFor="image-upload-bg-remove" className="flex items-center space-x-2 cursor-pointer">
                    <Scissors className="h-4 w-4" />
                    <span>{removingBackground ? "Removendo fundo..." : "Sem Fundo"}</span>
                  </label>
                </Button>
              </div>

              {formData.image && (
                <Card className="w-48">
                  <div className="relative">
                    <img
                      src={formData.image}
                      alt="Produto"
                      className="w-full h-32 object-cover rounded-md"
                    />
                    <Button
                      size="icon"
                      variant="destructive"
                      className="absolute top-2 right-2 h-6 w-6"
                      onClick={() => setFormData(prev => ({ ...prev, image: "" }))}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          </div>

          {/* Variações */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Variações do Produto</Label>
              {availableVariations.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Nenhuma variação cadastrada. Vá para a aba "Variações" para criar.
                </p>
              )}
            </div>
            
            {availableVariations.length > 0 ? (
              <div className="space-y-4">
                {availableVariations.map((variation) => (
                  <Card key={variation.id}>
                    <CardContent className="p-4">
                      <h4 className="font-medium mb-3">{variation.name}</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {variation.options.map((option) => (
                          <div key={option.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`${variation.id}-${option.id}`}
                              checked={isVariationOptionSelected(variation.id, option.id)}
                              onCheckedChange={(checked) => 
                                handleVariationOptionToggle(variation, option, checked as boolean)
                              }
                            />
                            <Label 
                              htmlFor={`${variation.id}-${option.id}`}
                              className="text-sm flex-1"
                            >
                              {option.name}
                              {option.price_adjustment !== 0 && (
                                <span className="text-muted-foreground ml-1">
                                  ({option.price_adjustment > 0 ? '+' : ''}R$ {option.price_adjustment.toFixed(2)})
                                </span>
                              )}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-4 text-center text-muted-foreground">
                  <p>Nenhuma variação disponível.</p>
                  <p className="text-sm">Cadastre variações na aba "Variações" primeiro.</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Status do Produto */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <Label htmlFor="active">Produto Ativo</Label>
                <p className="text-sm text-muted-foreground">
                  Produtos ativos ficam visíveis no catálogo
                </p>
              </div>
              <Switch
                id="active"
                checked={formData.active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, active: checked }))}
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <Label htmlFor="in_stock">Em Estoque</Label>
                <p className="text-sm text-muted-foreground">
                  Marque se o produto está disponível em estoque
                </p>
              </div>
              <Switch
                id="in_stock"
                checked={formData.in_stock}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, in_stock: checked }))}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} className="bg-[#2E8B57] hover:bg-[#2E8B57]/90" disabled={loading}>
            {product ? "Atualizar" : "Salvar"} Produto
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProductFormModal;