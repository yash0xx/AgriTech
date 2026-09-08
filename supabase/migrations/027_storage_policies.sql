-- ============================================================
-- 027_storage_policies.sql
-- Storage bucket definitions and Row-Level Security policies
-- for Product Images (Public Catalog) and KYC Documents (Private Vault)
-- ============================================================

-- 1. Create Storage Buckets if storage schema exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'storage') THEN
    -- Public Product Images Bucket
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
      'product-images',
      'product-images',
      true,
      5242880, -- 5 MB
      ARRAY['image/jpeg', 'image/png', 'image/webp']
    )
    ON CONFLICT (id) DO UPDATE
    SET public = true,
        file_size_limit = 5242880;

    -- Private KYC Documents Vault Bucket
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
      'kyc-documents',
      'kyc-documents',
      false, -- Strictly private
      10485760, -- 10 MB
      ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
    )
    ON CONFLICT (id) DO UPDATE
    SET public = false,
        file_size_limit = 10485760;
  END IF;
END $$;

-- 2. Storage RLS Policies
-- Note: storage.objects inherits standard PostgreSQL RLS in Supabase

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'storage' AND table_name = 'objects') THEN

    -- PRODUCT IMAGES: Public read
    DROP POLICY IF EXISTS "Public can view product images" ON storage.objects;
    CREATE POLICY "Public can view product images"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'product-images');

    -- PRODUCT IMAGES: Authenticated farmers/sellers can upload
    DROP POLICY IF EXISTS "Authenticated users can upload product images" ON storage.objects;
    CREATE POLICY "Authenticated users can upload product images"
      ON storage.objects FOR INSERT
      TO authenticated
      WITH CHECK (bucket_id = 'product-images');

    -- KYC DOCUMENTS: Strictly private - Only owner or platform admin can view
    DROP POLICY IF EXISTS "Owner and admin can view KYC documents" ON storage.objects;
    CREATE POLICY "Owner and admin can view KYC documents"
      ON storage.objects FOR SELECT
      TO authenticated
      USING (
        bucket_id = 'kyc-documents'
        AND (
          (auth.uid())::text = (storage.foldername(name))[1]
          OR public.is_admin()
        )
      );

    -- KYC DOCUMENTS: Only owner can upload into their own folder
    DROP POLICY IF EXISTS "Owner can upload KYC documents" ON storage.objects;
    CREATE POLICY "Owner can upload KYC documents"
      ON storage.objects FOR INSERT
      TO authenticated
      WITH CHECK (
        bucket_id = 'kyc-documents'
        AND (auth.uid())::text = (storage.foldername(name))[1]
      );

  END IF;
END $$;
