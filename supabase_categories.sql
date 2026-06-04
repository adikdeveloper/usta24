-- ════════════════════════════════════════════════════════════════
--  Admin — kategoriyalarni (kasblarni) boshqarish RLS
--  Supabase SQL Editor da ishga tushiring.
--  (is_admin() supabase_admin.sql yoki usta_pro migratsiyasida yaratilgan.)
-- ════════════════════════════════════════════════════════════════

-- Admin barcha kategoriyalarni ko'radi, qo'shadi, tahrirlaydi, o'chiradi.
-- (Mavjud "categories_select_all" qoidasi ustiga qo'shiladi — OR bilan.)
drop policy if exists "admin all categories" on public.categories;
create policy "admin all categories" on public.categories
  for all using (public.is_admin()) with check (public.is_admin());

-- Rasm 'avatars' bucket'ga yuklanadi (mavjud, public) — yangi bucket shart emas.
-- (avatars owner-write policy: yo'l auth.uid() bilan boshlanishi kerak — admin uchun mos.)
