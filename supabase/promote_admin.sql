-- Run in Supabase Dashboard → SQL Editor
UPDATE profiles SET role = 'admin'
WHERE id IN (
  SELECT id FROM auth.users
  WHERE email = 'saar0246@gmail.com'
);
