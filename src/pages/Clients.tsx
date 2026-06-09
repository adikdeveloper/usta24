import { useEffect, useState } from 'react'
import {
  Table,
  Typography,
  message,
  Avatar,
  Input,
  Button,
  Space,
  Drawer,
  Descriptions,
  Modal,
  Form,
  Popconfirm,
  Tabs,
  Tag,
  Spin,
  Empty,
} from 'antd'
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  MessageOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { supabase } from '../lib/supabase'

interface Client {
  id: string
  first_name: string | null
  last_name: string | null
  phone: string | null
  balance: number | null
  avatar_url: string | null
  birth_date: string | null
  created_at: string | null
  role: string | null
}

// ── Buyurtma holati teglari ──
function orderStatus(s: string | null) {
  switch (s) {
    case 'completed':
      return <Tag color="green">Bajarildi</Tag>
    case 'pending':
      return <Tag color="orange">Kutilmoqda</Tag>
    case 'accepted':
      return <Tag color="blue">Qabul qilindi</Tag>
    case 'on_the_way':
      return <Tag color="blue">Yo'lda</Tag>
    case 'in_progress':
      return <Tag color="blue">Bajarilmoqda</Tag>
    case 'cancelled_by_client':
      return <Tag color="red">Mijoz bekor qildi</Tag>
    case 'cancelled_by_master':
      return <Tag color="red">Usta bekor qildi</Tag>
    case 'rejected':
      return <Tag color="red">Rad etildi</Tag>
    default:
      return <Tag>{s ?? '—'}</Tag>
  }
}

// ── Bitta buyurtma suhbati (chat) ──
function OrderChat({
  orderId,
  clientId,
  onClose,
}: {
  orderId: string
  clientId: string
  onClose: () => void
}) {
  const [msgs, setMsgs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    ;(async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('id,sender_id,text,created_at')
        .eq('order_id', orderId)
        .order('created_at', { ascending: true })
      if (error) message.error(error.message)
      setMsgs(data ?? [])
      setLoading(false)
    })()
  }, [orderId])

  return (
    <Modal open title="Suhbat" footer={null} onCancel={onClose} width={460}>
      <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 10 }}>
        Ko'k — mijoz · kulrang — usta
      </div>
      {loading ? (
        <div style={{ textAlign: 'center', padding: 24 }}>
          <Spin />
        </div>
      ) : msgs.length === 0 ? (
        <Empty description="Xabar yo'q" />
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            maxHeight: 440,
            overflowY: 'auto',
          }}
        >
          {msgs.map((m) => {
            const mine = m.sender_id === clientId
            return (
              <div
                key={m.id}
                style={{
                  alignSelf: mine ? 'flex-end' : 'flex-start',
                  maxWidth: '78%',
                  background: mine ? '#EFF6FF' : '#F3F4F6',
                  padding: '8px 12px',
                  borderRadius: 12,
                }}
              >
                <div style={{ fontSize: 13, color: '#1F2937' }}>{m.text}</div>
                <div
                  style={{
                    fontSize: 10,
                    color: '#9CA3AF',
                    textAlign: 'right',
                    marginTop: 2,
                  }}
                >
                  {new Date(m.created_at).toLocaleString()}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </Modal>
  )
}

// ── Mijozning buyurtmalar tarixi ──
function ClientOrders({ clientId }: { clientId: string }) {
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [chatOrder, setChatOrder] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(
          'id,status,price,address,created_at,categories(name_uz),masters(first_name,last_name)',
        )
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })
      if (error) message.error(error.message)
      setRows(data ?? [])
      setLoading(false)
    })()
  }, [clientId])

  if (loading)
    return (
      <div style={{ textAlign: 'center', padding: 24 }}>
        <Spin />
      </div>
    )
  if (rows.length === 0) return <Empty description="Buyurtma yo'q" />

  return (
    <>
      <Space direction="vertical" size={10} style={{ width: '100%' }}>
        {rows.map((o) => {
          const cat = o.categories?.name_uz ?? '—'
          const mas = o.masters
            ? `${o.masters.first_name ?? ''} ${o.masters.last_name ?? ''}`.trim()
            : '—'
          return (
            <div
              key={o.id}
              style={{
                border: '1px solid #EEF0F3',
                borderRadius: 12,
                padding: 12,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontWeight: 600 }}>{cat}</span>
                {orderStatus(o.status)}
              </div>
              <div style={{ fontSize: 13, color: '#6B7280', marginTop: 4 }}>
                Usta: {mas || '—'}
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: 6,
                }}
              >
                <span style={{ fontSize: 12, color: '#9CA3AF' }}>
                  {o.created_at ? new Date(o.created_at).toLocaleString() : '—'}{' '}
                  · {(o.price ?? 0).toLocaleString()} so'm
                </span>
                <Button
                  size="small"
                  icon={<MessageOutlined />}
                  onClick={() => setChatOrder(o.id)}
                >
                  Suhbat
                </Button>
              </div>
            </div>
          )
        })}
      </Space>
      {chatOrder && (
        <OrderChat
          orderId={chatOrder}
          clientId={clientId}
          onClose={() => setChatOrder(null)}
        />
      )}
    </>
  )
}

export default function Clients() {
  const [rows, setRows] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [view, setView] = useState<Client | null>(null)
  const [edit, setEdit] = useState<Client | null>(null)
  const [saving, setSaving] = useState(false)
  const [form] = Form.useForm()

  async function load() {
    setLoading(true)
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) message.error(error.message)
    setRows(((data ?? []) as Client[]).filter((r) => r.role !== 'admin'))
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  function openEdit(c: Client) {
    setEdit(c)
    form.setFieldsValue({
      first_name: c.first_name,
      last_name: c.last_name,
      phone: c.phone,
    })
  }

  async function save() {
    if (!edit) return
    const v = await form.validateFields()
    setSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: v.first_name || null,
          last_name: v.last_name || null,
          phone: v.phone || null,
        })
        .eq('id', edit.id)
      if (error) throw error
      message.success('Saqlandi')
      setEdit(null)
      load()
    } catch (e) {
      message.error((e as Error).message ?? 'Xato')
    } finally {
      setSaving(false)
    }
  }

  async function remove(c: Client) {
    const { error } = await supabase.from('profiles').delete().eq('id', c.id)
    if (error) {
      message.error(error.message)
      return
    }
    message.success('Mijoz o\'chirildi')
    load()
  }

  const filtered = rows.filter((r) =>
    `${r.first_name ?? ''} ${r.last_name ?? ''} ${r.phone ?? ''}`
      .toLowerCase()
      .includes(q.toLowerCase()),
  )

  const columns: ColumnsType<Client> = [
    {
      title: '',
      dataIndex: 'avatar_url',
      width: 56,
      render: (u: string | null) => <Avatar src={u || undefined} />,
    },
    {
      title: 'Ism',
      render: (_, r) =>
        `${r.first_name ?? ''} ${r.last_name ?? ''}`.trim() || '—',
    },
    {
      title: 'Telefon',
      dataIndex: 'phone',
      render: (p: string | null) => p ?? '—',
    },
    {
      title: 'Balans',
      dataIndex: 'balance',
      render: (v: number | null) => `${(v ?? 0).toLocaleString()} so'm`,
    },
    {
      title: "Ro'yxatdan o'tgan",
      dataIndex: 'created_at',
      render: (d: string | null) =>
        d ? new Date(d).toLocaleDateString() : '—',
    },
    {
      title: '',
      width: 150,
      render: (_, r) => (
        <Space>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => setView(r)}
          />
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => openEdit(r)}
          />
          <Popconfirm
            title="Mijoz o'chirilsinmi?"
            description="Buyurtmalari ham o'chadi."
            okText="Ha"
            cancelText="Yo'q"
            onConfirm={() => remove(r)}
          >
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <Typography.Title level={4} style={{ margin: 0 }}>
          Mijozlar
        </Typography.Title>
        <Input.Search
          placeholder="Qidirish..."
          allowClear
          style={{ width: 240 }}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
      <Table
        rowKey="id"
        loading={loading}
        dataSource={filtered}
        columns={columns}
        pagination={{ pageSize: 10 }}
        scroll={{ x: 700 }}
      />

      {/* Ko'rish — Ma'lumot + Buyurtmalar/Suhbatlar */}
      <Drawer
        title="Mijoz ma'lumotlari"
        width={600}
        open={view !== null}
        onClose={() => setView(null)}
      >
        {view && (
          <Tabs
            defaultActiveKey="info"
            items={[
              {
                key: 'info',
                label: "Ma'lumot",
                children: (
                  <Space
                    direction="vertical"
                    size="large"
                    style={{ width: '100%' }}
                  >
                    <div style={{ textAlign: 'center' }}>
                      <Avatar size={80} src={view.avatar_url || undefined} />
                      <div
                        style={{ marginTop: 8, fontWeight: 600, fontSize: 16 }}
                      >
                        {`${view.first_name ?? ''} ${view.last_name ?? ''}`.trim() ||
                          'Mijoz'}
                      </div>
                    </div>
                    <Descriptions column={1} bordered size="small">
                      <Descriptions.Item label="Telefon">
                        {view.phone ?? '—'}
                      </Descriptions.Item>
                      <Descriptions.Item label="Balans">
                        {`${(view.balance ?? 0).toLocaleString()} so'm`}
                      </Descriptions.Item>
                      <Descriptions.Item label="Tug'ilgan sana">
                        {view.birth_date
                          ? new Date(view.birth_date).toLocaleDateString()
                          : '—'}
                      </Descriptions.Item>
                      <Descriptions.Item label="Ro'yxatdan o'tgan">
                        {view.created_at
                          ? new Date(view.created_at).toLocaleString()
                          : '—'}
                      </Descriptions.Item>
                    </Descriptions>
                    <Button
                      block
                      icon={<EditOutlined />}
                      onClick={() => {
                        const c = view
                        setView(null)
                        if (c) openEdit(c)
                      }}
                    >
                      Tahrirlash
                    </Button>
                  </Space>
                ),
              },
              {
                key: 'orders',
                label: 'Buyurtmalar',
                children: <ClientOrders clientId={view.id} />,
              },
            ]}
          />
        )}
      </Drawer>

      {/* Tahrirlash */}
      <Modal
        title="Mijozni tahrirlash"
        open={edit !== null}
        onCancel={() => setEdit(null)}
        onOk={save}
        confirmLoading={saving}
        okText="Saqlash"
        cancelText="Bekor"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 12 }}>
          <Form.Item name="first_name" label="Ism">
            <Input placeholder="Ism" />
          </Form.Item>
          <Form.Item name="last_name" label="Familya">
            <Input placeholder="Familya" />
          </Form.Item>
          <Form.Item name="phone" label="Telefon">
            <Input placeholder="+998..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
