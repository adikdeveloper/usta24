import { Typography, Divider } from 'antd'

const { Title, Paragraph, Text } = Typography

// Ommaviy (public) hisobni o'chirish sahifasi — login talab qilmaydi.
// Google Play "App content > Data deletion" maydoniga shu URL kiritiladi:
//   https://usta24.org/delete-account
// Play talabi: in-app o'chirish + APPSIZ ham so'rash imkoniyati (web URL).
export default function DeleteAccount() {
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
          Hisobni o'chirish
        </Title>
        <Text type="secondary">
          Usta24 (mijoz ilovasi) va Usta24 Pro (usta ilovasi)
        </Text>

        <Divider />

        <Title level={4}>Ilova ichidan o'chirish (tavsiya etiladi)</Title>
        <Paragraph>
          Hisobingizni istalgan vaqtda ilovaning o'zidan o'chirishingiz mumkin:
        </Paragraph>
        <ol>
          <li>
            Ilovani oching → <Text strong>Profil</Text> bo'limiga o'ting
          </li>
          <li>
            Pastga tushib <Text strong>«Hisobni o'chirish»</Text> tugmasini bosing
          </li>
          <li>Tasdiqlang — hisobingiz va barcha ma'lumotlar darhol o'chiriladi</li>
        </ol>

        <Title level={4}>Ilovasiz o'chirishni so'rash</Title>
        <Paragraph>
          Ilovaga kira olmasangiz, hisobingizni o'chirishni quyidagi pochta orqali
          so'rashingiz mumkin. Hisobga bog'langan telefon raqamini yozing:
        </Paragraph>
        <Paragraph>
          <Text strong>Email: </Text>
          <a href="mailto:support@usta24.org?subject=Hisobni%20o'chirish">
            support@usta24.org
          </a>
        </Paragraph>
        <Paragraph type="secondary">
          So'rovingiz 7 ish kuni ichida ko'rib chiqiladi va hisobingiz o'chiriladi.
        </Paragraph>

        <Divider />

        <Title level={4}>Qanday ma'lumot o'chiriladi</Title>
        <ul>
          <li>Profil ma'lumotlari: ism, telefon raqami, profil rasmi</li>
          <li>Buyurtmalar tarixi va xabarlar</li>
          <li>Baholar va sharhlar</li>
          <li>
            <Text strong>Mijoz:</Text> saqlangan to'lov kartalari ma'lumotlari
          </li>
          <li>
            <Text strong>Usta:</Text> hujjatlar (passport, JSHSHIR), balans va
            daromad tarixi
          </li>
        </ul>
        <Paragraph type="secondary">
          O'chirish butunlay va ortga qaytarib bo'lmaydigan tarzda amalga oshiriladi.
          Qonun talab qilgan hollarda ayrim yozuvlar (masalan, moliyaviy hisob-kitob)
          belgilangan muddat saqlanishi mumkin.
        </Paragraph>
      </div>
    </div>
  )
}
