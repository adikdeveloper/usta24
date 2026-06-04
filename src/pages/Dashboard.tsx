import { useEffect, useState } from 'react'
import { Card, Col, Row, Statistic, Spin } from 'antd'
import {
  TeamOutlined,
  UserOutlined,
  ShoppingOutlined,
} from '@ant-design/icons'
import { supabase } from '../lib/supabase'

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
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={8}>
        <Card>
          <Statistic
            title="Ustalar"
            value={counts.masters}
            prefix={<TeamOutlined />}
            valueStyle={{ color: '#3B82F6' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={8}>
        <Card>
          <Statistic
            title="Mijozlar"
            value={counts.clients}
            prefix={<UserOutlined />}
            valueStyle={{ color: '#10B981' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={8}>
        <Card>
          <Statistic
            title="Buyurtmalar"
            value={counts.orders}
            prefix={<ShoppingOutlined />}
            valueStyle={{ color: '#F59E0B' }}
          />
        </Card>
      </Col>
    </Row>
  )
}
