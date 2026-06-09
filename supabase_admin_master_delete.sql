-- ════════════════════════════════════════════════════════════════
--  Usta24 Admin — Master (usta) ni butunlay o'chirish
--  Supabase Dashboard → SQL Editor da BIR MARTA ishga tushiring.
--  (supabase_admin.sql DAN KEYIN — is_admin() o'sha yerda yaratilgan.)
--
--  admin_delete_master(uuid): ustaning auth hisobini VA u bilan bog'liq
--  BARCHA ma'lumotni o'chiradi. Faqat admin chaqira oladi (ichida tekshiriladi).
--  Admin paneldagi "Ustani o'chirish" tugmasi shu funksiyani chaqiradi.
--
--  O'chirish tartibi FK cheklovlari sababli muhim:
--    1) reviews  — reviews.master_id da CASCADE yo'q
--    2) orders   — orders.master_id da CASCADE yo'q
--                  (reviews/messages order_id orqali cascade,
--                   master_earnings.order_id SET NULL bo'ladi)
--    3) storage  — passport / ish rasmlari / avatar fayl yozuvlari
--    4) auth.users → CASCADE: profiles, masters, hamda masters'ga bog'langan
--       master_documents / master_level_history / master_locations /
--       master_earnings / withdrawals
-- ════════════════════════════════════════════════════════════════

create or replace function public.admin_delete_master(p_master_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Faqat admin o'chira oladi
  if not public.is_admin() then
    raise exception 'Ruxsat yo''q: faqat admin master o''chira oladi';
  end if;

  -- Master haqiqatan mavjudligini tekshir
  if not exists (select 1 from public.masters where id = p_master_id) then
    raise exception 'Master topilmadi: %', p_master_id;
  end if;

  -- 1) Sharhlar (reviews.master_id — cascade emas, oldin qo'lda)
  delete from public.reviews where master_id = p_master_id;

  -- 2) Buyurtmalar (orders.master_id — cascade emas, oldin qo'lda).
  --    Bu reviews/messages ni order_id orqali, master_earnings.order_id ni
  --    SET NULL orqali tozalaydi.
  delete from public.orders where master_id = p_master_id;

  -- 3) Storage fayllari (passport, ish rasmlari, avatar):
  --    Supabase storage.objects'ni SQL bilan o'chirishni BLOKLAYDI
  --    ("Direct deletion from storage tables is not allowed. Use the Storage API").
  --    Shuning uchun fayllar bu yerda o'chmaydi — Storage API orqali (admin app
  --    yoki Edge Function) alohida tozalanadi. Quyidagi auth.users o'chirilishi
  --    master_documents'dagi fayl YO'Llarini (DB yozuvi) baribir o'chiradi;
  --    passport bucket'i PRIVATE bo'lgani uchun fayllar ommaga ochiq qolmaydi.

  -- 4) Auth foydalanuvchi → profiles + masters + master_* (hammasi cascade)
  delete from auth.users where id = p_master_id;
end;
$$;

-- anon (kirmaganlar) chaqira olmaydi; ichida admin tekshiruvi baribir bor.
revoke all on function public.admin_delete_master(uuid) from public, anon;
grant execute on function public.admin_delete_master(uuid) to authenticated;
