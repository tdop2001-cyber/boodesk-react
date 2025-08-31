-- Add analytics table for tracking visits
CREATE TABLE public.analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  event_type TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;

-- Create policies for analytics
CREATE POLICY "Users can view their own analytics" 
ON public.analytics 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Anyone can insert analytics" 
ON public.analytics 
FOR INSERT 
WITH CHECK (true);

-- Add status tracking to orders table (update existing)
UPDATE public.orders SET status = 'pending' WHERE status IS NULL;

-- Create function to get user statistics
CREATE OR REPLACE FUNCTION public.get_user_stats(user_uuid UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  catalog_visits INTEGER;
  active_products INTEGER;
  monthly_orders INTEGER;
  monthly_sales NUMERIC;
  result JSON;
BEGIN
  -- Get catalog visits (last 30 days)
  SELECT COUNT(*) INTO catalog_visits
  FROM public.analytics
  WHERE user_id = user_uuid 
    AND event_type = 'catalog_visit'
    AND created_at >= NOW() - INTERVAL '30 days';

  -- Get active products count
  SELECT COUNT(*) INTO active_products
  FROM public.products
  WHERE user_id = user_uuid AND active = true;

  -- Get monthly orders count
  SELECT COUNT(*) INTO monthly_orders
  FROM public.orders
  WHERE user_id = user_uuid 
    AND created_at >= NOW() - INTERVAL '30 days';

  -- Get monthly sales total
  SELECT COALESCE(SUM(total_amount), 0) INTO monthly_sales
  FROM public.orders
  WHERE user_id = user_uuid 
    AND created_at >= NOW() - INTERVAL '30 days'
    AND status = 'completed';

  -- Build result JSON
  SELECT json_build_object(
    'catalog_visits', catalog_visits,
    'active_products', active_products,
    'monthly_orders', monthly_orders,
    'monthly_sales', monthly_sales
  ) INTO result;

  RETURN result;
END;
$$;