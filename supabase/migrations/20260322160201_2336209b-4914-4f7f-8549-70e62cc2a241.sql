
CREATE TABLE public.quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  text text NOT NULL,
  author text NOT NULL DEFAULT 'Unknown',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Anyone can view quotes"
  ON public.quotes FOR SELECT
  TO anon, authenticated
  USING (true);

-- Public insert access
CREATE POLICY "Anyone can add quotes"
  ON public.quotes FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
