-- Add coupon_id column to products table to enable coupon association
ALTER TABLE public.products 
ADD COLUMN coupon_id UUID REFERENCES public.coupons(id);