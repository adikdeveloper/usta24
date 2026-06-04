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
} from 'antd'
import { EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
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

      {/* Ko'rish */}
      <Drawer
        title="Mijoz ma'lumotlari"
        width={420}
        open={view !== null}
        onClose={() => setView(null)}
      >
        {view && (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div style={{ textAlign: 'center' }}>
              <Avatar size={80} src={view.avatar_url || undefined} />
              <div style={{ marginTop: 8, fontWeight: 600, fontSize: 16 }}>
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
