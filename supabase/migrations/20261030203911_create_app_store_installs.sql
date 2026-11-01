/*
# Create app_store_installs table (single-tenant, no auth)

1. New Tables
- `app_store_installs`
- `slug` (text, primary key): identifier of a fan-made app in the App Store
- `installed_at` (timestamptz): when the app was installed

2. Security
- Enable RLS on `app_store_installs`.
- Grant SELECT, INSERT, DELETE to `anon` and `authenticated` because the app has no sign-in and the phone reads and writes as anon.
- Policies allow anon and authenticated to read, install and uninstall. The data is intentionally shared and public.
*/

CREATE TABLE IF NOT EXISTS app_store_installs (
  slug text PRIMARY KEY,
  installed_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE app_store_installs ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, DELETE ON app_store_installs TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_app_store_installs" ON app_store_installs;
CREATE POLICY "anon_select_app_store_installs" ON app_store_installs FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_app_store_installs" ON app_store_installs;
CREATE POLICY "anon_insert_app_store_installs" ON app_store_installs FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_app_store_installs" ON app_store_installs;
CREATE POLICY "anon_delete_app_store_installs" ON app_store_installs FOR DELETE
  TO anon, authenticated USING (true);
