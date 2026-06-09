-- ════════════════════════════════════════════════════════════════
--  Usta24 — orders jadvaliga ish rasmlari ustunlari (oldin / keyin)
--  Admin "Ishlari" bo'limidagi xatoni tuzatadi:
--      column orders.before_photos does not exist
--  Supabase Dashboard → SQL Editor da BIR MARTA ishga tushiring.
--
--  (Bu usta_pro migratsiyasi 20250602000000_work_photos.sql ning ustun
--   qismi bilan bir xil — agar o'sha to'liq ishga tushirilgan bo'lsa,
--   bu fayl shart emas. `if not exists` tufayli takror ishga tushirish xavfsiz.)
-- ════════════════════════════════════════════════════════════════

alter table public.orders
  add column if not exists before_photos text[] not null default '{}',
  add column if not exists after_photos  text[] not null default '{}';
