-- Create policies for product-images bucket uploads
CREATE POLICY "Authenticated users can upload product images" 
ON storage.objects 
FOR INSERT 
TO authenticated
WITH CHECK (
  bucket_id = 'product-images' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can view their own product images" 
ON storage.objects 
FOR SELECT 
TO authenticated
USING (
  bucket_id = 'product-images' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own product images" 
ON storage.objects 
FOR UPDATE 
TO authenticated
USING (
  bucket_id = 'product-images' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own product images" 
ON storage.objects 
FOR DELETE 
TO authenticated
USING (
  bucket_id = 'product-images' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public access to product images for catalog viewing
CREATE POLICY "Public can view product images" 
ON storage.objects 
FOR SELECT 
TO public
USING (bucket_id = 'product-images');