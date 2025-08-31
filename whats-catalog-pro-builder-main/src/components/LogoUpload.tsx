import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, Image, Scissors } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { removeBackground, loadImage } from "@/utils/backgroundRemoval";

interface LogoUploadProps {
  currentLogoUrl?: string;
  onLogoUpdate: (logoUrl: string) => void;
}

const LogoUpload = ({ currentLogoUrl, onLogoUpdate }: LogoUploadProps) => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [removingBackground, setRemovingBackground] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentLogoUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileInputBgRemoveRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>, shouldRemoveBackground = false) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Por favor, selecione apenas arquivos de imagem");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Arquivo muito grande. Máximo 5MB");
      return;
    }

    setUploading(true);
    setRemovingBackground(shouldRemoveBackground);

    try {
      if (!user) throw new Error("Usuário não autenticado");

      let fileToUpload = file;
      
      if (shouldRemoveBackground) {
        toast.info("Removendo fundo do logo...");
        const imageElement = await loadImage(file);
        const processedBlob = await removeBackground(imageElement);
        fileToUpload = new File([processedBlob], `processed-${file.name}`, { type: 'image/png' });
      }

      // Create file name with user ID
      const fileExt = fileToUpload.name.split('.').pop();
      const fileName = `${user.id}/logo.${fileExt}`;

      // Delete existing logo if it exists
      if (currentLogoUrl) {
        const oldFileName = currentLogoUrl.split('/').pop();
        if (oldFileName) {
          await supabase.storage
            .from('logos')
            .remove([`${user.id}/${oldFileName}`]);
        }
      }

      // Upload new logo
      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(fileName, fileToUpload, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from('logos')
        .getPublicUrl(fileName);

      const logoUrl = data.publicUrl;

      // Update profile with new logo URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ logo_url: logoUrl })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      setPreviewUrl(logoUrl);
      onLogoUpdate(logoUrl);
      toast.success(shouldRemoveBackground ? "Logo com fundo removido enviado!" : "Logo atualizado com sucesso!");

    } catch (error: any) {
      console.error("Error uploading logo:", error);
      toast.error("Erro ao fazer upload do logo");
    } finally {
      setUploading(false);
      setRemovingBackground(false);
    }
  };

  const handleRemoveLogo = async () => {
    if (!user || !currentLogoUrl) return;

    setUploading(true);

    try {
      // Remove from storage
      const fileName = currentLogoUrl.split('/').pop();
      if (fileName) {
        await supabase.storage
          .from('logos')
          .remove([`${user.id}/${fileName}`]);
      }

      // Update profile
      const { error } = await supabase
        .from('profiles')
        .update({ logo_url: null })
        .eq('user_id', user.id);

      if (error) throw error;

      setPreviewUrl(null);
      onLogoUpdate("");
      toast.success("Logo removido com sucesso!");

    } catch (error: any) {
      console.error("Error removing logo:", error);
      toast.error("Erro ao remover logo");
    } finally {
      setUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const triggerFileInputBgRemove = () => {
    fileInputBgRemoveRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <Label>Logo da Empresa</Label>
      
      {/* Preview Area */}
      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
        {previewUrl ? (
          <div className="relative">
            <img
              src={previewUrl}
              alt="Logo da empresa"
              className="max-h-32 mx-auto object-contain"
            />
            <Button
              variant="destructive"
              size="sm"
              className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
              onClick={handleRemoveLogo}
              disabled={uploading}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <div className="py-4">
            <Image className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground mb-2">
              Nenhum logo enviado
            </p>
            <p className="text-xs text-muted-foreground">
              PNG, JPG ou GIF até 5MB
            </p>
          </div>
        )}
      </div>

      {/* Upload Controls */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={triggerFileInput}
          disabled={uploading}
          className="flex-1"
        >
          <Upload className="h-4 w-4 mr-2" />
          {uploading ? "Enviando..." : previewUrl ? "Alterar Logo" : "Enviar Logo"}
        </Button>
        
        <Button
          variant="outline"
          onClick={triggerFileInputBgRemove}
          disabled={uploading || removingBackground}
          className="flex-1 bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200"
        >
          <Scissors className="h-4 w-4 mr-2" />
          {removingBackground ? "Removendo fundo..." : "Sem Fundo"}
        </Button>
        
        {previewUrl && (
          <Button
            variant="destructive"
            onClick={handleRemoveLogo}
            disabled={uploading}
          >
            <X className="h-4 w-4 mr-2" />
            Remover
          </Button>
        )}
      </div>

      {/* Hidden file inputs */}
      <Input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleFileSelect(e, false)}
        className="hidden"
      />
      <Input
        ref={fileInputBgRemoveRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleFileSelect(e, true)}
        className="hidden"
      />
    </div>
  );
};

export default LogoUpload;