INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('station-photos', 'station-photos', true, 5242880, ARRAY['image/jpeg','image/png','image/webp'])
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can view station photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'station-photos');

CREATE POLICY "Authenticated users can upload station photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'station-photos'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can delete own station photos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'station-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
