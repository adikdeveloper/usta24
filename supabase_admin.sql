-- ════════════════════════════════════════════════════════════════
--  Usta24 Admin — role + RLS
--  Supabase Dashboard → SQL Editor da ishga tushiring.
-- ════════════════════════════════════════════════════════════════

-- 1) profiles ga 'role' ustuni (default: client)
alter table public.profiles
  add column if not exists role text not null default 'client';

-- 2) Admin tekshiruvi.
--    SECURITY DEFINER — profiles RLS rekursiyasidan qochish uchun.
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- 3) Admin RLS qoidalari
--    (mavjud "owner-only" qoidalar ustiga qo'shiladi — Postgres ularni OR bilan birlashtiradi)

-- profiles: admin barchasini ko'radi va yangilaydi
drop policy if exists "admin read profiles" on public.profiles;
create policy "admin read profiles" on public.profiles
  for select using (public.is_admin());

drop policy if exists "admin update profiles" on public.profiles;
create policy "admin update profiles" on public.profiles
  for update using (public.is_admin()) with check (public.is_admin());

-- masters: admin to'liq boshqaradi (ko'rish + yangilash)
drop policy if exists "admin all masters" on public.masters;
create policy "admin all masters" on public.masters
  for all using (public.is_admin()) with check (public.is_admin());

-- orders: admin barchasini ko'radi
drop policy if exists "admin read orders" on public.orders;
create policy "admin read orders" on public.orders
  for select using (public.is_admin());

-- ════════════════════════════════════════════════════════════════
-- 4) O'ZINGIZNI ADMIN QILISH
-- ════════════════════════════════════════════════════════════════
-- a) Supabase Dashboard → Authentication → Providers → Email YOQILGAN bo'lsin.
-- b) Authentication → Users → "Add user" → admin email + parol yarating
--    (masalan: admin@usta24.uz).
-- c) Quyidagini ishga tushiring (email'ni o'zingiznikiga almashtiring):

update public.profiles p
set role = 'admin'
from auth.users u
where u.id = p.id
  and u.email = 'admin@usta24.uz';

-- Tekshirish (admin bo'lganini ko'rish):
-- select p.id, u.email, p.role
-- from public.profiles p
-- join auth.users u on u.id = p.id
-- where p.role = 'admin';
