-- ════════════════════════════════════════════════════════════════
--  Usta24 — Xavfsizlik tuzatishlari (Security Advisor warninglari)
--  Supabase → SQL Editor da bir marta ishga tushiring.
--
--  MUHIM: 36 warningning KO'PI xato emas — ilova hozir ANONIM login
--  ishlatadi (SMS to'xtatilgan), shuning uchun RLS anonim foydalanuvchiga
--  ruxsat beradi. Bu kutilgan holat. Ushbu fayl faqat XAVFSIZ, ilovani
--  buzmaydigan tuzatishlarni qiladi.
-- ════════════════════════════════════════════════════════════════


-- 1) "Function Search Path Mutable" (3 warning) ─────────────────────
--    Barcha o'z funksiyalarimizga qat'iy search_path o'rnatamiz.
--    Eng to'g'ri amaliyot; hech narsani buzmaydi.
do $$
declare r record;
begin
  for r in
    select p.proname, pg_get_function_identity_arguments(p.oid) as args
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.prokind = 'f'
      and not exists (
        select 1 from pg_depend d where d.objid = p.oid and d.deptype = 'e'
      )
  loop
    execute format(
      'alter function public.%I(%s) set search_path = public, pg_temp',
      r.proname, r.args
    );
  end loop;
end $$;


-- 2) Trigger / sozlash funksiyalarini tashqi (RPC) chaqiruvdan yopamiz ──
--    Triggerlar baribir ishlayveradi — bu faqat to'g'ridan chaqirishni bloklaydi.
do $$
begin
  begin revoke execute on function public.handle_new_user()         from public, anon, authenticated; exception when undefined_function then null; end;
  begin revoke execute on function public.set_updated_at()          from public, anon, authenticated; exception when undefined_function then null; end;
  begin revoke execute on function public.recompute_master_rating() from public, anon, authenticated; exception when undefined_function then null; end;
  begin revoke execute on function public.rls_auto_enable()         from public, anon, authenticated; exception when undefined_function then null; end;
end $$;


-- 3) record_earning — HAQIQIY XAVF edi ─────────────────────────────
--    Avval hech qanday tekshiruv yo'q edi: istalgan foydalanuvchi istalgan
--    ustaga soxta daromad/balans yozishi mumkin edi.
--    Endi faqat ustaning O'ZI (auth.uid() = p_master) yoza oladi. Ilova ishlayveradi.
create or replace function public.record_earning(p_master uuid, p_order uuid, p_gross bigint)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare comm bigint; net_amt bigint;
begin
  if auth.uid() <> p_master then
    raise exception 'Ruxsat yoq';
  end if;
  select ml.commission into comm from public.master_levels ml
    join public.masters m on m.level_code = ml.code where m.id = p_master;
  comm := coalesce(comm, 5000);
  net_amt := greatest(0, p_gross - comm);
  insert into public.master_earnings(master_id, order_id, gross, commission, net)
    values (p_master, p_order, p_gross, comm, net_amt);
  update public.masters
     set balance = balance + net_amt, total_jobs = total_jobs + 1
   where id = p_master;
end;
$$;


-- ════════════════════════════════════════════════════════════════
--  QOLGAN WARNINGLAR — ataylab QOLDIRILGAN (ilova buzilmasligi uchun):
--
--  • "Anonymous Sign-Ins Allowed" (~20 ta) — ilova anonim login ishlatadi
--    (SMS to'xtatilgan). RLS anonim foydalanuvchiga ruxsat berishi SHART,
--    aks holda ilova ishlamaydi. Haqiqiy yechim: keyin SMS/OTP yoqilganda
--    siyosatlarni qattiqlaymiz.
--
--  • is_admin / master_stats / can_upgrade_level / nearest_free_masters /
--    upgrade_master_level — ilovalar shu funksiyalarni chaqiradi, kerak.
--    upgrade_master_level allaqachon o'zini himoyalagan (auth.uid() tekshiruvi).
--
--  • storage.avatars public listing — avatarlar ataylab ochiq (public URL kerak).
--    Past xavf; xohlasangiz keyin listingni cheklaymiz.
-- ════════════════════════════════════════════════════════════════
