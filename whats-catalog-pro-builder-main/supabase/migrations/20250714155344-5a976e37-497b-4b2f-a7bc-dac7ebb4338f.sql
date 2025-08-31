-- Criar tabelas para variações e opções
CREATE TABLE public.variations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.variation_options (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  variation_id UUID NOT NULL REFERENCES public.variations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price_adjustment NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.variations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.variation_options ENABLE ROW LEVEL SECURITY;

-- Create policies for variations
CREATE POLICY "Users can view their own variations" 
ON public.variations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own variations" 
ON public.variations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own variations" 
ON public.variations 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own variations" 
ON public.variations 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create policies for variation_options
CREATE POLICY "Users can view variation options" 
ON public.variation_options 
FOR SELECT 
USING (variation_id IN (SELECT id FROM public.variations WHERE user_id = auth.uid()));

CREATE POLICY "Users can create variation options" 
ON public.variation_options 
FOR INSERT 
WITH CHECK (variation_id IN (SELECT id FROM public.variations WHERE user_id = auth.uid()));

CREATE POLICY "Users can update variation options" 
ON public.variation_options 
FOR UPDATE 
USING (variation_id IN (SELECT id FROM public.variations WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete variation options" 
ON public.variation_options 
FOR DELETE 
USING (variation_id IN (SELECT id FROM public.variations WHERE user_id = auth.uid()));

-- Add trigger for timestamps
CREATE TRIGGER update_variations_updated_at
BEFORE UPDATE ON public.variations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create a table to link products to variations
CREATE TABLE public.product_variations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variation_id UUID NOT NULL REFERENCES public.variations(id) ON DELETE CASCADE,
  option_id UUID NOT NULL REFERENCES public.variation_options(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for product_variations
ALTER TABLE public.product_variations ENABLE ROW LEVEL SECURITY;

-- Create policies for product_variations
CREATE POLICY "Users can view their product variations" 
ON public.product_variations 
FOR SELECT 
USING (product_id IN (SELECT id FROM public.products WHERE user_id = auth.uid()));

CREATE POLICY "Users can create their product variations" 
ON public.product_variations 
FOR INSERT 
WITH CHECK (product_id IN (SELECT id FROM public.products WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their product variations" 
ON public.product_variations 
FOR UPDATE 
USING (product_id IN (SELECT id FROM public.products WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete their product variations" 
ON public.product_variations 
FOR DELETE 
USING (product_id IN (SELECT id FROM public.products WHERE user_id = auth.uid()));