-- Criar política para permitir visualização pública dos dados do catálogo
CREATE POLICY "Public can view catalog profiles" 
ON public.profiles 
FOR SELECT 
USING (catalog_slug IS NOT NULL AND catalog_name IS NOT NULL);