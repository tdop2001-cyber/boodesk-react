
-- Add coupon functionality to products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS coupon_id uuid REFERENCES public.coupons(id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_products_coupon_id ON public.products(coupon_id);

-- Update orders table to include better item details
-- No changes needed as items is already jsonb and flexible

-- Add RLS policy for public to view profiles by catalog_slug (for category filtering)
CREATE POLICY IF NOT EXISTS "Public can view profiles by catalog_slug"
ON public.profiles
FOR SELECT
USING (catalog_slug IS NOT NULL);
