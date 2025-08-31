import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Trash2, Edit2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Variation, VariationOption, VariationWithOptions } from "@/types/variations";

const VariationsTab = () => {
  const { user } = useAuth();
  const [variations, setVariations] = useState<VariationWithOptions[]>([]);
  const [loading, setLoading] = useState(true);
  const [showVariationModal, setShowVariationModal] = useState(false);
  const [selectedVariation, setSelectedVariation] = useState<Variation | null>(null);
  const [variationName, setVariationName] = useState("");
  const [optionName, setOptionName] = useState("");
  const [optionPriceAdjustment, setOptionPriceAdjustment] = useState(0);
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
    if (!confirm('Tem certeza que deseja excluir esta variação? Todas as opções serão removidas.')) {
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

  const handleDeleteOption = async (optionId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta opção?')) {
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
    return <div className="flex justify-center p-8">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Variações e Opções</h2>
        <Button onClick={() => openVariationModal()}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Variação
        </Button>
      </div>

      <div className="grid gap-6">
        {variations.map((variation) => (
          <Card key={variation.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-lg">{variation.name}</CardTitle>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openOptionModal(variation)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Opção
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openVariationModal(variation)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteVariation(variation.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {variation.options.length > 0 ? (
                <div className="grid gap-2">
                  {variation.options.map((option) => (
                    <div
                      key={option.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <span className="font-medium">{option.name}</span>
                        {option.price_adjustment !== 0 && (
                          <span className="text-sm text-muted-foreground ml-2">
                            {option.price_adjustment > 0 ? '+' : ''}R$ {option.price_adjustment.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openOptionModal(variation, option)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteOption(option.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Nenhuma opção cadastrada</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {variations.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <p className="text-muted-foreground mb-4">Nenhuma variação cadastrada</p>
            <Button onClick={() => openVariationModal()}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeira Variação
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Modal para Variação */}
      <Dialog open={showVariationModal} onOpenChange={setShowVariationModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedVariation ? "Editar Variação" : "Nova Variação"}
            </DialogTitle>
            <DialogDescription>
              Variações são características dos produtos como cor, tamanho, etc.
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
            <Button onClick={handleSaveVariation}>
              {selectedVariation ? "Atualizar" : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para Opção */}
      <Dialog open={showOptionModal} onOpenChange={setShowOptionModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedOption ? "Editar Opção" : "Nova Opção"}
            </DialogTitle>
            <DialogDescription>
              Opções são os valores específicos de uma variação (Ex: Azul, Grande, etc.)
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
              <p className="text-sm text-muted-foreground mt-1">
                Valor adicional ou desconto para esta opção (use valores negativos para desconto)
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowOptionModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveOption}>
              {selectedOption ? "Atualizar" : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VariationsTab;