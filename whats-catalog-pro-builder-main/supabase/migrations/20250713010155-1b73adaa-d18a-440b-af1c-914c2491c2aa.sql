-- Add category column to products table for product groups
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS category text;

-- Create index for better performance on category filtering
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);

-- Create trigger to update the updated_at column for products
CREATE OR REPLACE FUNCTION public.update_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_products_updated_at_trigger ON public.products;
CREATE TRIGGER update_products_updated_at_trigger
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_products_updated_at();