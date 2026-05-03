-- ============================================================
-- Admin User Setup
-- Run AFTER you've signed up via Supabase Auth Dashboard
-- ============================================================
--
-- STEP 1: First create the admin auth user
-- Go to Supabase Dashboard > Authentication > Users > "Add User" > "Create new user"
--   Email:    eyelash@showlovein.com
--   Password: Ltj123456!  (or your strong password)
--   ✅ Auto Confirm User
--
-- STEP 2: Then run this SQL to grant admin role
-- ============================================================

INSERT INTO admin_users (auth_user_id, email, role, is_active)
SELECT id, email, 'super_admin', true
FROM auth.users
WHERE email = 'eyelash@showlovein.com'
ON CONFLICT (email) DO UPDATE
SET auth_user_id = EXCLUDED.auth_user_id,
    role = 'super_admin',
    is_active = true;

-- Verify
SELECT
    au.email,
    au.role,
    au.is_active,
    au.auth_user_id IS NOT NULL AS auth_linked
FROM admin_users au
WHERE au.email = 'eyelash@showlovein.com';
