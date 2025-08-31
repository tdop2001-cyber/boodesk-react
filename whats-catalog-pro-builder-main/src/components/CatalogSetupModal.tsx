import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CatalogSetupModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

const CatalogSetupModal = ({ isOpen, onComplete }: CatalogSetupModalProps) => {
  const [catalogName, setCatalogName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove accents
      .replace(/[^a-z0-9\s-]/g, "") // Remove special chars
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-") // Replace multiple hyphens with single
      .trim();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!catalogName.trim()) {
      toast.error("Nome do catálogo é obrigatório");
      return;
    }

    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não encontrado");

      const slug = generateSlug(catalogName);
      
      const { error } = await supabase
        .from("profiles")
        .update({
          catalog_name: catalogName.trim(),
          catalog_slug: slug,
        })
        .eq("user_id", user.id);

      if (error) throw error;

      toast.success("Catálogo configurado com sucesso!");
      onComplete();
    } catch (error: any) {
      console.error("Error setting up catalog:", error);
      if (error.code === "23505") {
        toast.error("Este nome de catálogo já está em uso. Tente outro.");
      } else {
        toast.error("Erro ao configurar catálogo. Tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Configure seu Catálogo</DialogTitle>
          <DialogDescription>
            Escolha um nome para seu catálogo online. Este será usado no link do seu catálogo.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="catalogName">Nome do Catálogo</Label>
            <Input
              id="catalogName"
              value={catalogName}
              onChange={(e) => setCatalogName(e.target.value)}
              placeholder="Ex: Loja da Maria, Boutique Fashion..."
              required
              disabled={isLoading}
            />
            {catalogName && (
              <p className="text-sm text-muted-foreground">
                Link: /catalogo/{generateSlug(catalogName)}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Configurando..." : "Criar Catálogo"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CatalogSetupModal;