-- ════════════════════════════════════════════════════════════════
--  Admin — mijozni o'chirish ruxsati (profiles delete)
--  Supabase SQL Editor da ishga tushiring.
--  (Tahrirlash uchun "admin update profiles" supabase_admin.sql da bor.)
-- ════════════════════════════════════════════════════════════════

-- ⚠️ Mijoz o'chirilganda uning buyurtmalari, sharhlari va kartalari ham
--    cascade bo'yicha o'chadi (FK on delete cascade).
drop policy if exists "admin delete profiles" on public.profiles;
create policy "admin delete profiles" on public.profiles
  for delete using (public.is_admin());
