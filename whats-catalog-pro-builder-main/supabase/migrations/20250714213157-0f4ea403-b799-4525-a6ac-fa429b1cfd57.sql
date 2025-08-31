-- Create reviews table for product reviews and comments
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add SEO fields to products table
ALTER TABLE public.products 
ADD COLUMN slug TEXT,
ADD COLUMN meta_title TEXT,
ADD COLUMN meta_description TEXT;

-- Create unique index on slug for products
CREATE UNIQUE INDEX idx_products_slug ON public.products(slug) WHERE slug IS NOT NULL;

-- Enable Row Level Security on reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for reviews
CREATE POLICY "Anyone can view approved reviews" 
ON public.reviews 
FOR SELECT 
USING (status = 'approved');

CREATE POLICY "Users can view all reviews for their products" 
ON public.reviews 
FOR SELECT 
USING (product_id IN (
  SELECT id FROM public.products WHERE user_id = auth.uid()
));

CREATE POLICY "Anyone can insert reviews" 
ON public.reviews 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update reviews for their products" 
ON public.reviews 
FOR UPDATE 
USING (product_id IN (
  SELECT id FROM public.products WHERE user_id = auth.uid()
));

-- Create trigger for reviews updated_at
CREATE TRIGGER update_reviews_updated_at
BEFORE UPDATE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add average rating field to products table
ALTER TABLE public.products 
ADD COLUMN average_rating NUMERIC(3,2) DEFAULT 0,
ADD COLUMN review_count INTEGER DEFAULT 0;

-- Create function to update product ratings
CREATE OR REPLACE FUNCTION public.update_product_ratings()
RETURNS TRIGGER AS $$
BEGIN
  -- Update average rating and review count for the product
  UPDATE public.products 
  SET 
    average_rating = (
      SELECT COALESCE(AVG(rating), 0) 
      FROM public.reviews 
      WHERE product_id = COALESCE(NEW.product_id, OLD.product_id) 
      AND status = 'approved'
    ),
    review_count = (
      SELECT COUNT(*) 
      FROM public.reviews 
      WHERE product_id = COALESCE(NEW.product_id, OLD.product_id) 
      AND status = 'approved'
    )
  WHERE id = COALESCE(NEW.product_id, OLD.product_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update product ratings when reviews change
CREATE TRIGGER update_product_ratings_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_product_ratings();