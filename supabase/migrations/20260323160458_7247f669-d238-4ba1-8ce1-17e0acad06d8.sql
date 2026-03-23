
ALTER TABLE public.quotes ADD COLUMN order_index integer NOT NULL DEFAULT 0;

-- Allow anyone to update quotes (for reordering)
CREATE POLICY "Anyone can update quotes"
ON public.quotes
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Allow anyone to delete quotes
CREATE POLICY "Anyone can delete quotes"
ON public.quotes
FOR DELETE
TO anon, authenticated
USING (true);
