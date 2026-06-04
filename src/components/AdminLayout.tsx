import type { ReactNode } from 'react'
import { Layout, Menu, Button } from 'antd'
import {
  DashboardOutlined,
  TeamOutlined,
  UserOutlined,
  LogoutOutlined,
  SafetyCertificateOutlined,
  AppstoreOutlined,
} from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/auth'

const { Sider, Header, Content } = Layout

export default function AdminLayout({ children }: { children: ReactNode }) {
  const nav = useNavigate()
  const loc = useLocation()
  const { signOut } = useAuth()
  const selected = loc.pathname === '/' ? 'dashboard' : loc.pathname.replace('/', '')

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        theme="light"
        breakpoint="lg"
        collapsedWidth="0"
        style={{ borderRight: '1px solid #f0f0f0' }}
      >
        <div
          style={{
            padding: '18px 20px',
            fontWeight: 800,
            fontSize: 20,
            color: '#3B82F6',
          }}
        >
          Usta24
        </div>
        <Menu
          mode="inline"
          selectedKeys={[selected]}
          onClick={(e) => nav(e.key === 'dashboard' ? '/' : `/${e.key}`)}
          items={[
            { key: 'dashboard', icon: <DashboardOutlined />, label: 'Boshqaruv' },
            { key: 'masters', icon: <TeamOutlined />, label: 'Ustalar' },
            { key: 'verification', icon: <SafetyCertificateOutlined />, label: 'Tasdiqlash' },
            { key: 'categories', icon: <AppstoreOutlined />, label: 'Kasblar' },
            { key: 'clients', icon: <UserOutlined />, label: 'Mijozlar' },
          ]}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            background: '#fff',
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            paddingInline: 20,
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          <Button icon={<LogoutOutlined />} onClick={signOut}>
            Chiqish
          </Button>
        </Header>
        <Content style={{ margin: 20 }}>{children}</Content>
      </Layout>
    </Layout>
  )
}
