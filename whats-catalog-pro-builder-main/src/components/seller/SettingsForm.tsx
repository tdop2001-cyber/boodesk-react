import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Check, X, Loader2, Copy, ExternalLink, QrCode, Upload, Trash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface ValidationState {
  valid: boolean;
  message: string;
  checking: boolean;
}

const SettingsForm = () => {
  const { toast } = useToast();
  const { user, profile, refreshProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [storeName, setStoreName] = useState("");
  const [catalogName, setCatalogName] = useState("");
  const [storeDescription, setStoreDescription] = useState("");
  const [validation, setValidation] = useState<ValidationState>({
    valid: false,
    message: "",
    checking: false,
  });
  const [logo, setLogo] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [secondaryColor, setSecondaryColor] = useState("#2E8B57");
  const [qrCodeOpen, setQrCodeOpen] = useState(false);
  const [formComplete, setFormComplete] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setStoreName(profile.store_name || "");
      setCatalogName(profile.catalog_name || "");
      setLogo(profile.logo_url || null);
    }
  }, [profile]);

  // Check if the store name is valid
  const validateStoreName = (name: string): boolean => {
    const regex = /^[a-zA-Z0-9\s]{3,30}$/;
    return regex.test(name);
  };

  // Check if the store name is available
  const checkStoreNameAvailability = async (name: string) => {
    if (!validateStoreName(name)) return;

    setValidation({ ...validation, checking: true });
    
    // Simulate API call to check availability
    setTimeout(() => {
      // This is a simulation - in a real app, this would be an actual API call
      const isAvailable = Math.random() > 0.3; // 70% chance of being available for demo
      
      setValidation({
        valid: isAvailable,
        message: isAvailable ? "Nome disponível!" : "Já registrado. Tente outro.",
        checking: false,
      });
    }, 1000);
  };

  // Handle store name change
  const handleStoreNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setStoreName(name);
    
    if (name.length >= 3) {
      checkStoreNameAvailability(name);
    } else {
      setValidation({
        valid: false,
        message: "",
        checking: false,
      });
    }
  };

  const handleSaveSettings = async () => {
    if (!storeName.trim() || !catalogName.trim()) {
      toast({
        title: "Erro",
        description: "Nome da loja e nome do catálogo são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          store_name: storeName.trim(),
          catalog_name: catalogName.trim(),
          logo_url: logo
        })
        .eq('user_id', user?.id);

      if (error) throw error;

      await refreshProfile();
      
      toast({
        title: "Sucesso!",
        description: "Configurações salvas com sucesso!",
      });

      setFormComplete(true);
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar configurações. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle logo upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Erro no upload",
        description: "O arquivo deve ter no máximo 2MB",
        variant: "destructive",
      });
      return;
    }

    // Check file type
    if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
      toast({
        title: "Formato inválido",
        description: "Apenas arquivos PNG ou JPG são permitidos",
        variant: "destructive",
      });
      return;
    }

    // Simulate upload with progress
    setIsUploading(true);
    setUploadProgress(0);
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          
          // Read file and set preview
          const reader = new FileReader();
          reader.onload = (e) => {
            setLogo(e.target?.result as string);
          };
          reader.readAsDataURL(file);
          
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  // Handle remove logo
  const handleRemoveLogo = () => {
    setLogo(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Copy store link to clipboard
  const copyLinkToClipboard = () => {
    if (!profile?.catalog_slug) return;
    
    const link = `${window.location.origin}/catalogo/${profile.catalog_slug}`;
    
    navigator.clipboard.writeText(link);
    toast({
      title: "Link copiado!",
      description: "O link foi copiado para a área de transferência.",
    });
  };

  // Open test page in new tab
  const openTestPage = () => {
    if (!profile?.catalog_slug) return;
    
    const link = `${window.location.origin}/catalogo/${profile.catalog_slug}`;
    window.open(link, '_blank');
  };

  return (
    <div className="grid gap-6">
      {/* Store Data Section */}
      <Card className="border-2 border-[#2E8B57]">
        <CardHeader>
          <CardTitle>Dados da Loja</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Store Name and Catalog Name */}
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="storeName" className="text-sm font-medium">
                  Nome da Loja *
                </Label>
                <Input
                  id="storeName"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="Ex: Minha Loja"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="catalogName" className="text-sm font-medium">
                  Nome do Catálogo *
                </Label>
                <Input
                  id="catalogName"
                  value={catalogName}
                  onChange={(e) => setCatalogName(e.target.value)}
                  placeholder="Ex: Catálogo da Minha Loja"
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Nome que aparecerá no cabeçalho do catálogo
                </p>
              </div>
            </div>
          </div>

          {/* Store Description */}
          <div className="space-y-2">
            <Label htmlFor="store-description">Descrição da Loja</Label>
            <Textarea
              id="store-description"
              placeholder="Descreva sua loja em poucas palavras"
              value={storeDescription}
              onChange={(e) => setStoreDescription(e.target.value)}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Uma breve descrição que aparecerá no cabeçalho do seu catálogo
            </p>
          </div>

          {/* Store Logo */}
          <div className="space-y-2">
            <Label htmlFor="logo-upload">
              Logo da Loja
            </Label>
            <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center bg-muted/50">
              {logo ? (
                <div className="relative">
                  <img 
                    src={logo} 
                    alt="Logo preview" 
                    className="w-32 h-32 object-contain mb-2" 
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-7 w-7 rounded-full"
                    onClick={handleRemoveLogo}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                  <p className="text-sm font-medium mb-1">Arraste ou clique para fazer upload</p>
                  <p className="text-xs text-muted-foreground">PNG/JPG (max 2MB, ideal: 500x500px)</p>
                </>
              )}
              
              {isUploading && (
                <div className="w-full mt-4">
                  <div className="h-2 bg-muted rounded-full w-full">
                    <div 
                      className="h-2 bg-[#2E8B57] rounded-full" 
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
              
              <input
                ref={fileInputRef}
                id="logo-upload"
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                className="hidden"
                onChange={handleLogoUpload}
              />
              
              {!logo && !isUploading && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-4"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Selecionar arquivo
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Store Link Section */}
      <Card>
        <CardHeader>
          <CardTitle>Seu link exclusivo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col space-y-2">
            <Label htmlFor="store-url">Link do catálogo</Label>
            <div className="flex gap-2">
              <Input
                id="store-url"
                value={profile?.catalog_slug ? `${window.location.origin}/catalogo/${profile.catalog_slug}` : "Configure seu catálogo primeiro"}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                variant="outline"
                size="icon"
                disabled={!profile?.catalog_slug}
                onClick={copyLinkToClipboard}
                title="Copiar link"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <Button
              variant="outline"
              disabled={!profile?.catalog_slug}
              onClick={openTestPage}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Testar Página
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSaveSettings} 
          className="bg-brand-red hover:bg-brand-red/90"
          disabled={saving}
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            "Salvar Configurações"
          )}
        </Button>
      </div>
    </div>
  );
};

export default SettingsForm;