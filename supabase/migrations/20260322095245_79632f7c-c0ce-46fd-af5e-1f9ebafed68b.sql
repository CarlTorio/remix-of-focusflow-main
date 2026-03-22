-- Allow authenticated users to upload music files to the nexday bucket
CREATE POLICY "Users can upload music files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'nexday' AND (storage.foldername(name))[1] = 'music');

-- Allow anyone to read music files (public bucket)
CREATE POLICY "Public can read music files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'nexday' AND (storage.foldername(name))[1] = 'music');

-- Allow users to update their own music files
CREATE POLICY "Users can update own music files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'nexday' AND (storage.foldername(name))[1] = 'music');

-- Allow users to delete their own music files
CREATE POLICY "Users can delete own music files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'nexday' AND (storage.foldername(name))[1] = 'music');