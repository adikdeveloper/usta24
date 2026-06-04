import { useEffect, useState } from 'react'
import { Card, Col, Row, Spin, Typography } from 'antd'
import {
  TeamOutlined,
  UserOutlined,
  ShoppingOutlined,
} from '@ant-design/icons'
import { supabase } from '../lib/supabase'

const cards = [
  { key: 'masters', label: 'Ustalar', icon: <TeamOutlined />, color: '#3B82F6', bg: '#EFF6FF' },
  { key: 'clients', label: 'Mijozlar', icon: <UserOutlined />, color: '#10B981', bg: '#ECFDF5' },
  { key: 'orders', label: 'Buyurtmalar', icon: <ShoppingOutlined />, color: '#F59E0B', bg: '#FFFBEB' },
] as const

export default function Dashboard() {
  const [counts, setCounts] = useState({ masters: 0, clients: 0, orders: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      const [m, c, o] = await Promise.all([
        supabase.from('masters').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
      ])
      setCounts({
        masters: m.count ?? 0,
        clients: c.count ?? 0,
        orders: o.count ?? 0,
      })
      setLoading(false)
    })()
  }, [])

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div>
      <Typography.Title level={3} style={{ marginTop: 0, marginBottom: 2 }}>
        Boshqaruv paneli
      </Typography.Title>
      <Typography.Text type="secondary">
        Usta24 platformasi umumiy ko'rsatkichlari
      </Typography.Text>
      <Row gutter={[16, 16]} style={{ marginTop: 20 }}>
        {cards.map((s) => (
          <Col xs={24} sm={12} lg={8} key={s.key}>
            <Card style={{ boxShadow: '0 1px 3px rgba(16,24,40,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 14,
                    background: s.bg,
                    color: s.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 24,
                  }}
                >
                  {s.icon}
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 28,
                      fontWeight: 700,
                      color: '#111827',
                      lineHeight: 1.1,
                    }}
                  >
                    {counts[s.key]}
                  </div>
                  <div style={{ color: '#6B7280', fontSize: 14 }}>{s.label}</div>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  )
}
