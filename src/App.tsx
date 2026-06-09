import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Spin, Result, Button } from 'antd'
import { useAuth } from './lib/auth'
import Login from './pages/Login'
import AdminLayout from './components/AdminLayout'
import Dashboard from './pages/Dashboard'
import Masters from './pages/Masters'
import Clients from './pages/Clients'
import Verification from './pages/Verification'
import Categories from './pages/Categories'
import Regions from './pages/Regions'
import Privacy from './pages/Privacy'

export default function App() {
  const { session, isAdmin, loading, signOut } = useAuth()
  const location = useLocation()

  // Ommaviy maxfiylik siyosati — auth/loading tekshiruvidan OLDIN ko'rsatiladi
  // (Google Play talabi: login yoki kutishsiz darhol ochilishi shart).
  if (location.pathname === '/privacy') return <Privacy />

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          height: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Spin size="large" />
      </div>
    )
  }

  // Tizimga kirmagan → login
  if (!session) return <Login />

  // Kirgan, lekin admin emas → ruxsat yo'q
  if (!isAdmin) {
    return (
      <Result
        status="403"
        title="Ruxsat yo'q"
        subTitle="Bu hisob admin emas. Admin huquqiga ega hisob bilan kiring."
        extra={
          <Button type="primary" onClick={signOut}>
            Chiqish
          </Button>
        }
        style={{ paddingTop: 80 }}
      />
    )
  }

  // Admin → to'liq panel
  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/masters" element={<Masters />} />
        <Route path="/verification" element={<Verification />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/clients" element={<Clients />} />
        <Route path="/regions" element={<Regions />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AdminLayout>
  )
}
