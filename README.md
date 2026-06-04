# Usta24 — Admin Panel

Vite + React + TypeScript + Ant Design + Supabase.

Ustalar va mijozlarni boshqarish uchun admin panel. Backend — mavjud Supabase
loyihasi (mijoz ilovasi `usta_client` bilan bir xil).

---

## Ishga tushirish

### 1. Node.js
Node.js **18+** o'rnatilgan bo'lishi kerak — https://nodejs.org (LTS).
Tekshirish: `node -v`

### 2. Bog'liqliklarni o'rnatish
```powershell
cd C:\dev\usta_admin
npm install
```

### 3. Supabase admin sozlamasi (bir martalik)
1. Supabase Dashboard → **SQL Editor** da `supabase_admin.sql` ni ishga tushiring.
2. **Authentication → Providers → Email** yoqilganini tekshiring.
3. **Authentication → Users → Add user** → admin email + parol yarating.
4. `supabase_admin.sql` oxiridagi `update ... set role='admin'` ni o'z email'ingiz
   bilan ishga tushiring.

### 4. Ishga tushirish
```powershell
npm run dev
```
Brauzer http://localhost:5173 da ochiladi. Admin email + parol bilan kiring.

---

## Tuzilishi
| Fayl | Vazifasi |
|---|---|
| `src/lib/supabase.ts` | Supabase client |
| `src/lib/auth.tsx` | Auth + admin tekshiruvi |
| `src/pages/Login.tsx` | Kirish ekrani |
| `src/components/AdminLayout.tsx` | Sidebar layout |
| `src/pages/Dashboard.tsx` | Statistika (ustalar/mijozlar/buyurtmalar soni) |
| `src/pages/Masters.tsx` | Ustalar — ro'yxat, qidiruv, faol/nofaol |
| `src/pages/Clients.tsx` | Mijozlar — ro'yxat, qidiruv |

---

## Xavfsizlik
- `.env` dagi anon key — **publishable** (brauzerda bo'lishi xavfsiz).
  `service_role` kaliti bu yerda **YO'Q**.
- Admin huquqi Supabase **RLS** orqali (`profiles.role = 'admin'`) tekshiriladi.
- Auth-foydalanuvchini o'chirish kabi maxfiy amallar kerak bo'lsa — keyinroq
  Supabase **Edge Function** qo'shamiz.

---

## Keyingi qadamlar (g'oyalar)
- Buyurtmalar bo'limi (holat bo'yicha filtr)
- Kategoriyalarni boshqarish
- Ustani tasdiqlash / bloklash workflow
- Statistika grafiklari (recharts / antd Charts)
