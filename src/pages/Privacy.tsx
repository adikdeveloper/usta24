import { Typography, Divider } from 'antd'

const { Title, Paragraph, Text } = Typography

// Ommaviy (public) maxfiylik siyosati sahifasi — login talab qilmaydi.
// Google Play "App content > Privacy policy" maydoniga shu URL kiritiladi:
//   https://usta24.vercel.app/privacy   (keyinchalik https://usta24.app/privacy)
// Matn ikkala ilovaning kodidagi haqiqiy ma'lumot yig'ilishiga mos.
export default function Privacy() {
  return (
    <div style={{ background: '#F2F4F7', minHeight: '100vh', padding: '32px 16px' }}>
      <div
        style={{
          maxWidth: 820,
          margin: '0 auto',
          background: '#FFFFFF',
          borderRadius: 16,
          padding: '40px 44px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        }}
      >
        <Title level={2} style={{ marginBottom: 4 }}>
          Maxfiylik siyosati
        </Title>
        <Text type="secondary">
          Usta24 (mijoz ilovasi) va Usta24 Pro (usta ilovasi)
        </Text>
        <br />
        <Text type="secondary">Kuchga kirgan sana: 2026-yil 9-iyun</Text>

        <Divider />

        <Title level={4}>1. Umumiy ma'lumot</Title>
        <Paragraph>
          Usta24 — mijozlarni uy va xizmat ustalari bilan bog'laydigan platforma.
          Bizda ikkita ilova mavjud: <Text strong>Usta24</Text> (xizmat
          buyurtma qiluvchi mijozlar uchun) va <Text strong>Usta24 Pro</Text>{' '}
          (xizmat ko'rsatuvchi ustalar uchun). Ushbu maxfiylik siyosati ikkala
          ilovaga ham tegishli va ulardan foydalanganda qanday ma'lumot
          yig'ilishi, ishlatilishi va himoyalanishini tushuntiradi.
        </Paragraph>

        <Title level={4}>2. Biz yig'adigan ma'lumotlar</Title>
        <Paragraph>
          <Text strong>Ikkala ilova uchun umumiy:</Text>
        </Paragraph>
        <ul>
          <li>Telefon raqami — SMS kod orqali ro'yxatdan o'tish va kirish uchun</li>
          <li>Ism va familiya</li>
          <li>Profil rasmi (ixtiyoriy)</li>
          <li>
            Aniq joylashuv (GPS) — buyurtmalarni joylashuvga qarab moslash va
            xaritada ko'rsatish uchun
          </li>
          <li>Ilovadagi faollik — buyurtmalar, baholar va sharhlar</li>
        </ul>
        <Paragraph>
          <Text strong>Faqat Usta24 (mijoz ilovasi):</Text>
        </Paragraph>
        <ul>
          <li>
            To'lov karta ma'lumotlari — karta egasining nomi, amal qilish muddati
            va kartaning oxirgi 4 raqami.{' '}
            <Text type="secondary">
              To'liq karta raqami bizning serverlarimizda saqlanmaydi.
            </Text>
          </li>
        </ul>
        <Paragraph>
          <Text strong>Faqat Usta24 Pro (usta ilovasi):</Text>
        </Paragraph>
        <ul>
          <li>Passport seriyasi va raqami, JSHSHIR (PINFL)</li>
          <li>
            Passportning old va orqa tomoni rasmlari hamda selfi — shaxsni
            tasdiqlash (verifikatsiya) uchun
          </li>
          <li>Bajarilgan ishlar rasmlari (ish boshidagi va tugagandagi)</li>
          <li>Balans, daromad va pul yechish (withdrawal) ma'lumotlari</li>
        </ul>

        <Title level={4}>3. Ma'lumotlardan qanday foydalanamiz</Title>
        <ul>
          <li>Hisobingizni yaratish va xavfsiz kirishni ta'minlash</li>
          <li>
            Mijoz va ustani joylashuvga qarab bir-biriga bog'lash, buyurtmalarni
            boshqarish
          </li>
          <li>Ustaning shaxsini tasdiqlash (passport tekshiruvi)</li>
          <li>To'lovlarni amalga oshirish va balansni yuritish</li>
          <li>Xizmat sifatini yaxshilash va qo'llab-quvvatlash xizmatini ko'rsatish</li>
        </ul>

        <Title level={4}>4. Joylashuv ma'lumoti</Title>
        <Paragraph>
          Joylashuv faqat siz ilovadan foydalanayotgan paytda yig'iladi — orqa
          fonda (background) kuzatuv amalga oshirilmaydi. Usta24 Pro'da
          "online" bo'lganingizda joylashuvingiz yaqin atrofdagi buyurtmalarni
          topish va sizni mijozga ko'rsatish uchun serverga yuboriladi.
        </Paragraph>

        <Title level={4}>5. Uchinchi tomon xizmatlari</Title>
        <ul>
          <li>
            <Text strong>Supabase</Text> — ma'lumotlar bazasi va fayllarni
            saqlash. Ma'lumotlaringiz himoyalangan serverlarda saqlanadi.
          </li>
          <li>
            <Text strong>Mapbox</Text> — xarita va joylashuvni ko'rsatish xizmati.
          </li>
        </ul>
        <Paragraph>
          Biz shaxsiy ma'lumotlaringizni reklama maqsadida uchinchi tomonlarga{' '}
          <Text strong>sotmaymiz</Text>.
        </Paragraph>

        <Title level={4}>6. Ma'lumotlarni saqlash va xavfsizlik</Title>
        <ul>
          <li>Barcha ma'lumot internet orqali shifrlangan (HTTPS) holatda uzatiladi.</li>
          <li>
            Passport rasmlari maxfiy (private) saqlanadi va faqat tekshiruvchi
            admin ko'ra oladi — boshqa foydalanuvchilarga yoki mijozlarga
            ko'rinmaydi.
          </li>
        </ul>

        <Title level={4}>7. Hisobni va ma'lumotni o'chirish</Title>
        <Paragraph>
          Hisobingizni va unga bog'liq barcha ma'lumotni o'chirishni so'rashingiz
          mumkin. Buning uchun{' '}
          <Text strong>support@usta24.uz</Text> manziliga ro'yxatdan o'tgan
          telefon raqamingiz bilan murojaat qiling. So'rovingiz qabul qilingach,
          hisobingiz va unga bog'liq ma'lumotlar (profil, joylashuv, passport
          hujjatlari, to'lov ma'lumotlari va buyurtma tarixi) o'chiriladi.
          Ilova ichidan to'g'ridan-to'g'ri "Hisobni o'chirish" imkoniyati ham
          joriy etilmoqda.
        </Paragraph>

        <Title level={4}>8. Bolalar</Title>
        <Paragraph>
          Ilovalar 18 yoshga to'lgan foydalanuvchilar uchun mo'ljallangan. Biz
          ataylab voyaga yetmaganlardan ma'lumot yig'maymiz.
        </Paragraph>

        <Title level={4}>9. Siyosatga o'zgartirishlar</Title>
        <Paragraph>
          Ushbu maxfiylik siyosati vaqti-vaqti bilan yangilanishi mumkin. Har
          qanday o'zgarish shu sahifada e'lon qilinadi va yangilangan sana
          ko'rsatiladi.
        </Paragraph>

        <Title level={4}>10. Biz bilan bog'lanish</Title>
        <Paragraph>
          Maxfiylik bo'yicha savollaringiz bo'lsa, bizga murojaat qiling:{' '}
          <Text strong>support@usta24.uz</Text>
        </Paragraph>

        <Divider />
        <Text type="secondary" style={{ fontSize: 12 }}>
          © 2026 Usta24. Barcha huquqlar himoyalangan.
        </Text>
      </div>
    </div>
  )
}
