-- Add DELETE policy for coupons so users can delete their own coupons
CREATE POLICY "Users can delete their own coupons" 
ON public.coupons 
FOR DELETE 
USING (auth.uid() = user_id);