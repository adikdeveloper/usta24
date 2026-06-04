import { useState } from 'react'
import { Card, Form, Input, Button, Typography, message } from 'antd'
import { useAuth } from '../lib/auth'

export default function Login() {
  const { signIn } = useAuth()
  const [loading, setLoading] = useState(false)

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true)
    const { error } = await signIn(values.email, values.password)
    setLoading(false)
    if (error) message.error(error)
  }

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#F2F4F7',
        padding: 16,
      }}
    >
      <Card
        style={{
          width: 380,
          borderRadius: 16,
          boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <img
            src="/logo.png"
            alt="Usta24"
            style={{ width: 72, height: 72, borderRadius: 16, marginBottom: 10 }}
          />
          <Typography.Title level={3} style={{ marginBottom: 4, color: '#3B82F6' }}>
            Usta24 Admin
          </Typography.Title>
          <Typography.Text type="secondary">Boshqaruv paneliga kirish</Typography.Text>
        </div>
        <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, message: 'Email kiriting' }]}
          >
            <Input size="large" placeholder="admin@usta24.uz" autoComplete="username" />
          </Form.Item>
          <Form.Item
            name="password"
            label="Parol"
            rules={[{ required: true, message: 'Parol kiriting' }]}
          >
            <Input.Password
              size="large"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </Form.Item>
          <Button type="primary" htmlType="submit" size="large" block loading={loading}>
            Kirish
          </Button>
        </Form>
      </Card>
    </div>
  )
}
