import type { ReactNode } from 'react'
import { Layout, Menu, Button, Avatar, Typography } from 'antd'
import {
  DashboardOutlined,
  TeamOutlined,
  UserOutlined,
  LogoutOutlined,
  SafetyCertificateOutlined,
  AppstoreOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/auth'

const { Sider, Header, Content } = Layout

export default function AdminLayout({ children }: { children: ReactNode }) {
  const nav = useNavigate()
  const loc = useLocation()
  const { signOut, session } = useAuth()
  const selected =
    loc.pathname === '/' ? 'dashboard' : loc.pathname.replace('/', '')
  const email = session?.user?.email ?? ''

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        theme="light"
        breakpoint="lg"
        collapsedWidth="0"
        width={232}
        style={{ borderRight: '1px solid #EEF0F3' }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '18px 18px 14px',
          }}
        >
          <img
            src="/logo.png"
            alt="Usta24"
            style={{ width: 34, height: 34, borderRadius: 9 }}
          />
          <div>
            <div
              style={{
                fontWeight: 800,
                fontSize: 17,
                color: '#111827',
                lineHeight: 1.1,
              }}
            >
              Usta24
            </div>
            <div style={{ fontSize: 11, color: '#9CA3AF' }}>Admin panel</div>
          </div>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[selected]}
          style={{ borderInlineEnd: 'none' }}
          onClick={(e) => nav(e.key === 'dashboard' ? '/' : `/${e.key}`)}
          items={[
            { key: 'dashboard', icon: <DashboardOutlined />, label: 'Boshqaruv' },
            { key: 'masters', icon: <TeamOutlined />, label: 'Ustalar' },
            {
              key: 'verification',
              icon: <SafetyCertificateOutlined />,
              label: 'Tasdiqlash',
            },
            { key: 'categories', icon: <AppstoreOutlined />, label: 'Kasblar' },
            { key: 'clients', icon: <UserOutlined />, label: 'Mijozlar' },
            { key: 'regions', icon: <EnvironmentOutlined />, label: 'Hududlar' },
          ]}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            background: '#fff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingInline: 24,
            borderBottom: '1px solid #EEF0F3',
          }}
        >
          <Typography.Text strong style={{ fontSize: 16, color: '#111827' }}>
            Boshqaruv paneli
          </Typography.Text>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar
                size={32}
                style={{ background: '#EFF6FF', color: '#3B82F6' }}
                icon={<UserOutlined />}
              />
              <Typography.Text type="secondary" style={{ fontSize: 13 }}>
                {email}
              </Typography.Text>
            </div>
            <Button icon={<LogoutOutlined />} onClick={signOut}>
              Chiqish
            </Button>
          </div>
        </Header>
        <Content style={{ margin: 24 }}>{children}</Content>
      </Layout>
    </Layout>
  )
}
