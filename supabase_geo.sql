-- ════════════════════════════════════════════════════════════════
--  Hududlar tahlili — buyurtmaga mijoz koordinatasi (lat/lng)
--  Supabase → SQL Editor da bir marta ishga tushiring.
-- ════════════════════════════════════════════════════════════════

-- Mijoz buyurtma bergan nuqta (xaritadan tanlangan koordinata).
-- Hozir bo'sh bo'ladi; mijoz ilovasi keyin to'ldiradi — shunda
-- "Mijoz buyurtmalari" heatmap real ma'lumot bilan to'ladi.
alter table public.orders
  add column if not exists lat double precision,
  add column if not exists lng double precision;

create index if not exists orders_geo_idx
  on public.orders (lat, lng)
  where lat is not null;

-- Eslatma: admin buyurtmalarni o'qishi uchun "admin read orders" siyosati
-- supabase_admin.sql da allaqachon bor. Ustalar (masters) hammaga ko'rinadi,
-- shuning uchun ustalar xaritasi qo'shimcha ruxsatsiz ishlaydi.
