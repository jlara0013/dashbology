-- Migration: Auth trigger + usuarios RLS fixes
-- Run this in the Supabase SQL Editor (dashboard.supabase.com → SQL Editor)

-- 1. Drop the old "own profile only" SELECT policy
DROP POLICY IF EXISTS "Users can view their own profile." ON public.usuarios;

-- 2. Allow any authenticated user to read all profiles
--    (needed for the responsable dropdown to show team members)
CREATE POLICY "Authenticated users can view all profiles."
  ON public.usuarios
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- 3. Allow users to insert their own profile row
--    (needed for client-side upsert and the trigger below)
CREATE POLICY "Users can insert their own profile."
  ON public.usuarios
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 4. Trigger function: auto-insert into public.usuarios on every new auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.usuarios (id, nombre_completo)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Attach trigger to auth.users (fires after every new signup)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
