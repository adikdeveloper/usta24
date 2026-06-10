-- ════════════════════════════════════════════════════════════════
--  Usta24 — Foydalanuvchi O'ZINI o'chirishi (in-app "Hisobni o'chirish")
--  Supabase Dashboard → SQL Editor da BIR MARTA ishga tushiring.
--  (supabase_admin.sql / boshqa sxema DAN KEYIN bo'lsa ham mustaqil ishlaydi.)
--
--  Google Play talabi: foydalanuvchi ilova ICHIDAN o'z hisobini o'chira olishi.
--  Bu funksiya HAR IKKALA ilovaga ishlaydi (bitta Supabase bazasi):
--    • usta_client (mijoz) — profiles/orders/reviews/payment_cards CASCADE
--    • usta_pro  (usta)    — masters CASCADE; lekin orders.master_id va
--                            reviews.master_id CASCADE EMAS → qo'lda o'chiriladi
--
--  XAVFSIZLIK: parametr YO'Q — funksiya faqat auth.uid() ni (chaqiruvchining
--  o'zini) o'chiradi. Boshqovning hisobini o'chirib bo'lmaydi.
--  SECURITY DEFINER — auth.users dan o'chirish uchun kerak.
-- ════════════════════════════════════════════════════════════════

create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'Avtorizatsiya yo''q: hisobni faqat egasi o''chira oladi';
  end if;

  -- 1) USTA tomoni: CASCADE bo'lmagan FK'lar (mijoz uchun bu qatorlar no-op).
  --    reviews.master_id / orders.master_id masters(id) ga ishora qiladi,
  --    ON DELETE CASCADE yo'q — shuning uchun auth.users dan oldin qo'lda.
  --    orders o'chishi o'z messages/reviews ni order_id orqali cascade qiladi.
  delete from public.reviews where master_id = v_uid;
  delete from public.orders  where master_id = v_uid;

  -- 2) Auth foydalanuvchini o'chirish → qolgani CASCADE bilan ketadi:
  --      • profiles  (→ payment_cards, mijoz orders → messages/reviews)
  --      • masters   (→ master_documents/locations/earnings/withdrawals/level_history)
  --      • auth.identities / sessions / refresh_tokens (auth sxemasi cascade)
  --    Eslatma: messages.sender_id auth.users ga NO ACTION (RESTRICT emas) —
  --    tekshiruv statement oxirida bo'lgani uchun cascade o'chirgan qatorlar
  --    muammo qilmaydi.
  delete from auth.users where id = v_uid;
end;
$$;

-- anon/public to'g'ridan-to'g'ri chaqira olmaydi; ichida auth.uid() tekshiriladi.
-- (Supabase anonim kirish 'authenticated' rolini beradi — shu yetarli.)
revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
