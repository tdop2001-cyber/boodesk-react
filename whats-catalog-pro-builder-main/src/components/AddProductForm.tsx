import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Upload, X } from "lucide-react";
import { ProductVariation } from "@/types/seller";

interface ProductFormData {
  id?: string;
  name: string;
  description: string;
  price: number;
  image: string;
  in_stock: boolean;
  variations: ProductVariation[];
}

interface AddProductFormProps {
  initialData?: ProductFormData;
  onSubmit: (data: ProductFormData) => void;
  onCancel: () => void;
}

const AddProductForm = ({ initialData, onSubmit, onCancel }: AddProductFormProps) => {
  const [formData, setFormData] = useState<ProductFormData>(
    initialData || {
      name: "",
      description: "",
      price: 0,
      image: "",
      in_stock: true,
      variations: []
    }
  );
  
  const [tempImage, setTempImage] = useState<string | null>(formData.image || null);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "price" ? parseFloat(value) || 0 : value
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        setTempImage(imageUrl);
        setFormData({
          ...formData,
          image: imageUrl
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageRemove = () => {
    setTempImage(null);
    setFormData({
      ...formData,
      image: ""
    });
  };

  const handleAddVariation = () => {
    const newVariation = {
      id: Date.now().toString(),
      name: "",
      price: formData.price
    };
    setFormData({
      ...formData,
      variations: [...formData.variations, newVariation]
    });
  };

  const handleRemoveVariation = (id: string) => {
    setFormData({
      ...formData,
      variations: formData.variations.filter(v => v.id !== id)
    });
  };

  const handleVariationChange = (id: string, field: string, value: string | number) => {
    setFormData({
      ...formData,
      variations: formData.variations.map(v => 
        v.id === id ? { ...v, [field]: field === "price" ? parseFloat(value as string) || 0 : value } : v
      )
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Nome do Produto *</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Ex: Camiseta Estampada"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Descreva as características do produto..."
            rows={3}
          />
        </div>
        
        <div>
          <Label htmlFor="price">Preço (R$) *</Label>
          <Input
            id="price"
            name="price"
            type="number"
            step="0.01"
            min="0"
            value={formData.price}
            onChange={handleChange}
            placeholder="0.00"
            required
          />
        </div>
        
        <div className="space-y-3">
          <Label>Imagem do Produto</Label>
          {tempImage ? (
            <div className="relative w-full h-40 bg-brand-light-gray rounded-md overflow-hidden">
              <img 
                src={tempImage} 
                alt="Preview" 
                className="w-full h-full object-cover" 
              />
              <button
                type="button"
                onClick={handleImageRemove}
                className="absolute top-2 right-2 bg-brand-red text-white p-1 rounded-full"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-brand-light-gray rounded-md p-6 text-center">
              <Upload className="h-8 w-8 mx-auto text-brand-gray/50 mb-2" />
              <p className="text-sm text-brand-gray/70 mb-2">
                Arraste uma imagem ou clique para fazer upload
              </p>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={() => document.getElementById("product-image")?.click()}
              >
                Selecionar Imagem
              </Button>
              <input
                id="product-image"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch 
            id="in_stock" 
            checked={formData.in_stock}
            onCheckedChange={(checked) => setFormData({...formData, in_stock: checked})}
          />
          <Label htmlFor="in_stock">Produto disponível em estoque</Label>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label>Variações do Produto</Label>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleAddVariation}
              className="text-xs border-brand-green text-brand-green hover:bg-brand-green hover:text-white"
            >
              <Plus className="h-3 w-3 mr-1" />
              Adicionar Variação
            </Button>
          </div>
          
          {formData.variations.length > 0 ? (
            <div className="space-y-3">
              {formData.variations.map((variation, index) => (
                <div 
                  key={variation.id} 
                  className="flex items-center space-x-3 p-3 bg-brand-light-gray/20 rounded-md"
                >
                  <div className="flex-1">
                    <Input
                      value={variation.name}
                      onChange={(e) => handleVariationChange(variation.id, "name", e.target.value)}
                      placeholder="Nome (ex: Tamanho M)"
                      className="mb-2"
                    />
                  </div>
                  <div className="w-32">
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={variation.price}
                      onChange={(e) => handleVariationChange(variation.id, "price", e.target.value)}
                      placeholder="Preço"
                    />
                  </div>
                  <Button
                    type="button"
                    size="icon"
                    variant="destructive"
                    className="h-8 w-8"
                    onClick={() => handleRemoveVariation(variation.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-brand-gray/60 italic">
              Adicione variações se seu produto tiver opções como tamanhos, cores, etc.
            </p>
          )}
        </div>
      </div>
      
      <div className="flex justify-end space-x-3 pt-4 border-t border-brand-light-gray">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" className="bg-brand-green hover:bg-brand-green/90">
          {initialData ? "Atualizar Produto" : "Adicionar Produto"}
        </Button>
      </div>
    </form>
  );
};

export default AddProductForm;
