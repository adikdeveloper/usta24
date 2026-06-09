-- ════════════════════════════════════════════════════════════════
--  Admin — mijoz suhbatlarini (messages) o'qishi uchun
--  Supabase → SQL Editor da bir marta ishga tushiring.
-- ════════════════════════════════════════════════════════════════

-- Buyurtma (orders) admin o'qishi "admin read orders" — supabase_admin.sql da bor.
-- Sharhlar (reviews) hammaga ochiq — qo'shimcha kerak emas.
-- Faqat suhbatlar (messages) uchun admin ruxsatini qo'shamiz:
drop policy if exists "admin read messages" on public.messages;
create policy "admin read messages" on public.messages
  for select using (public.is_admin());
