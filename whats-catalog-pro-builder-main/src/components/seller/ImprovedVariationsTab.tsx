import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Plus, Trash2, Edit2, Settings, Info, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Variation, VariationOption, VariationWithOptions } from "@/types/variations";

const ImprovedVariationsTab = () => {
  const { user } = useAuth();
  const [variations, setVariations] = useState<VariationWithOptions[]>([]);
  const [loading, setLoading] = useState(true);
  const [showVariationModal, setShowVariationModal] = useState(false);
  const [selectedVariation, setSelectedVariation] = useState<Variation | null>(null);
  const [variationName, setVariationName] = useState("");
  const [optionName, setOptionName] = useState("");
  const [optionPriceAdjustment, setOptionPriceAdjustment] = useState<number>(0);
  const [showOptionModal, setShowOptionModal] = useState(false);
  const [selectedOption, setSelectedOption] = useState<VariationOption | null>(null);

  useEffect(() => {
    if (user) {
      fetchVariations();
    }
  }, [user]);

  const fetchVariations = async () => {
    try {
      const { data: variationsData, error: variationsError } = await supabase
        .from('variations')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (variationsError) throw variationsError;

      if (variationsData && variationsData.length > 0) {
        const { data: optionsData, error: optionsError } = await supabase
          .from('variation_options')
          .select('*')
          .in('variation_id', variationsData.map(v => v.id))
          .order('created_at', { ascending: true });

        if (optionsError) throw optionsError;

        const variationsWithOptions = variationsData.map(variation => ({
          ...variation,
          options: optionsData?.filter(option => option.variation_id === variation.id) || []
        }));

        setVariations(variationsWithOptions);
      } else {
        setVariations([]);
      }
    } catch (error) {
      console.error('Error fetching variations:', error);
      toast.error('Erro ao carregar variações');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveVariation = async () => {
    if (!variationName.trim()) {
      toast.error('Nome da variação é obrigatório');
      return;
    }

    // Check for duplicate names
    const existingVariation = variations.find(v => 
      v.name.toLowerCase() === variationName.trim().toLowerCase() && 
      v.id !== selectedVariation?.id
    );

    if (existingVariation) {
      toast.error('Já existe uma variação com este nome');
      return;
    }

    try {
      if (selectedVariation) {
        const { error } = await supabase
          .from('variations')
          .update({ name: variationName.trim() })
          .eq('id', selectedVariation.id);

        if (error) throw error;
        toast.success('Variação atualizada com sucesso!');
      } else {
        const { error } = await supabase
          .from('variations')
          .insert({
            user_id: user!.id,
            name: variationName.trim()
          });

        if (error) throw error;
        toast.success('Variação criada com sucesso!');
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
    const variation = variations.find(v => v.id === variationId);
    if (!variation) return;

    const confirmMessage = variation.options.length > 0 
      ? `Tem certeza que deseja excluir a variação "${variation.name}"? Esta ação também removerá ${variation.options.length} opções associadas e é irreversível.`
      : `Tem certeza que deseja excluir a variação "${variation.name}"?`;

    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('variations')
        .delete()
        .eq('id', variationId);

      if (error) throw error;
      toast.success('Variação excluída com sucesso!');
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

    // Check for duplicate option names within the same variation
    const variation = variations.find(v => v.id === selectedVariation.id);
    const existingOption = variation?.options.find(o => 
      o.name.toLowerCase() === optionName.trim().toLowerCase() && 
      o.id !== selectedOption?.id
    );

    if (existingOption) {
      toast.error('Já existe uma opção com este nome nesta variação');
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
        toast.success('Opção atualizada com sucesso!');
      } else {
        const { error } = await supabase
          .from('variation_options')
          .insert({
            variation_id: selectedVariation.id,
            name: optionName.trim(),
            price_adjustment: optionPriceAdjustment
          });

        if (error) throw error;
        toast.success('Opção criada com sucesso!');
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

  const handleDeleteOption = async (optionId: string, optionName: string) => {
    if (!confirm(`Tem certeza que deseja excluir a opção "${optionName}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('variation_options')
        .delete()
        .eq('id', optionId);

      if (error) throw error;
      toast.success('Opção excluída com sucesso!');
      fetchVariations();
    } catch (error) {
      console.error('Error deleting option:', error);
      toast.error('Erro ao excluir opção');
    }
  };

  const openVariationModal = (variation?: Variation) => {
    setSelectedVariation(variation || null);
    setVariationName(variation?.name || "");
    setShowVariationModal(true);
  };

  const openOptionModal = (variation: Variation, option?: VariationOption) => {
    setSelectedVariation(variation);
    setSelectedOption(option || null);
    setOptionName(option?.name || "");
    setOptionPriceAdjustment(option?.price_adjustment || 0);
    setShowOptionModal(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando variações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              <Settings className="h-6 w-6 text-blue-600" />
              Sistema de Variações
            </h2>
            <p className="text-gray-600 max-w-2xl">
              Configure variações para seus produtos como cor, tamanho, material, etc. 
              Cada variação pode ter múltiplas opções com ajustes de preço individuais.
            </p>
          </div>
          <Button 
            onClick={() => openVariationModal()} 
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Variação
          </Button>
        </div>
      </div>

      {/* Instructions Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Como usar as variações</AlertTitle>
        <AlertDescription>
          1. Crie variações como "Cor", "Tamanho", "Material"<br />
          2. Adicione opções para cada variação (ex: "Azul", "Vermelho" para cor)<br />
          3. Configure ajustes de preço se necessário<br />
          4. Use essas variações ao criar ou editar produtos
        </AlertDescription>
      </Alert>

      {/* Variations Grid */}
      <div className="grid gap-6">
        {variations.map((variation) => (
          <Card key={variation.id} className="overflow-hidden">
            <CardHeader className="bg-gray-50 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    {variation.name}
                    <Badge variant="secondary" className="ml-2">
                      {variation.options.length} opções
                    </Badge>
                  </CardTitle>
                  <p className="text-sm text-gray-500 mt-1">
                    Criada em {new Date(variation.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openOptionModal(variation)}
                    className="text-green-600 border-green-300 hover:bg-green-50"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Opção
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openVariationModal(variation)}
                    className="text-blue-600 border-blue-300 hover:bg-blue-50"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteVariation(variation.id)}
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-6">
              {variation.options.length > 0 ? (
                <div className="grid gap-3">
                  {variation.options.map((option, index) => (
                    <div key={option.id}>
                      <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <span className="font-medium text-gray-900">{option.name}</span>
                            {option.price_adjustment !== 0 && (
                              <Badge 
                                variant={option.price_adjustment > 0 ? "default" : "secondary"}
                                className={`text-xs ${
                                  option.price_adjustment > 0 
                                    ? "bg-green-100 text-green-800" 
                                    : "bg-orange-100 text-orange-800"
                                }`}
                              >
                                {option.price_adjustment > 0 ? '+' : ''}
                                R$ {option.price_adjustment.toFixed(2)}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            Criada em {new Date(option.created_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openOptionModal(variation, option)}
                            className="text-blue-600 border-blue-300 hover:bg-blue-50"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteOption(option.id, option.name)}
                            className="text-red-600 border-red-300 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      {index < variation.options.length - 1 && <Separator className="my-2" />}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                  <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-500 mb-4">Nenhuma opção cadastrada para esta variação</p>
                  <Button 
                    onClick={() => openOptionModal(variation)}
                    variant="outline"
                    className="text-green-600 border-green-300 hover:bg-green-50"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Primeira Opção
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {variations.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Settings className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma variação cadastrada</h3>
            <p className="text-gray-500 mb-6 text-center max-w-md">
              Comece criando sua primeira variação. Variações permitem oferecer diferentes opções 
              para seus produtos como cor, tamanho, material, etc.
            </p>
            <Button 
              onClick={() => openVariationModal()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeira Variação
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Modal para Variação */}
      <Dialog open={showVariationModal} onOpenChange={setShowVariationModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {selectedVariation ? "Editar Variação" : "Nova Variação"}
            </DialogTitle>
            <DialogDescription>
              Variações são características dos produtos como cor, tamanho, material, etc.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="variation-name" className="text-sm font-medium">
                Nome da Variação <span className="text-red-500">*</span>
              </Label>
              <Input
                id="variation-name"
                value={variationName}
                onChange={(e) => setVariationName(e.target.value)}
                placeholder="Ex: Cor, Tamanho, Material"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Escolha um nome descritivo para a característica do produto
              </p>
            </div>
          </div>

          <DialogFooter className="sm:justify-end">
            <Button variant="outline" onClick={() => setShowVariationModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveVariation} className="bg-blue-600 hover:bg-blue-700">
              {selectedVariation ? "Atualizar" : "Criar Variação"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para Opção */}
      <Dialog open={showOptionModal} onOpenChange={setShowOptionModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {selectedOption ? "Editar Opção" : "Nova Opção"}
            </DialogTitle>
            <DialogDescription>
              {selectedVariation && `Opção para a variação "${selectedVariation.name}"`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="option-name" className="text-sm font-medium">
                Nome da Opção <span className="text-red-500">*</span>
              </Label>
              <Input
                id="option-name"
                value={optionName}
                onChange={(e) => setOptionName(e.target.value)}
                placeholder="Ex: Azul, Grande, Algodão"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="price-adjustment" className="text-sm font-medium">
                Ajuste de Preço (R$)
              </Label>
              <Input
                id="price-adjustment"
                type="number"
                step="0.01"
                value={optionPriceAdjustment}
                onChange={(e) => setOptionPriceAdjustment(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Valor adicional ou desconto para esta opção. Use valores negativos para desconto.
              </p>
            </div>
          </div>

          <DialogFooter className="sm:justify-end">
            <Button variant="outline" onClick={() => setShowOptionModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveOption} className="bg-green-600 hover:bg-green-700">
              {selectedOption ? "Atualizar" : "Criar Opção"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ImprovedVariationsTab;