import { useEffect, useState } from 'react'
import { Table, Typography, message, Avatar, Input } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { supabase } from '../lib/supabase'

interface Client {
  id: string
  first_name: string | null
  last_name: string | null
  phone: string | null
  balance: number | null
  avatar_url: string | null
  created_at: string | null
  role: string | null
}

export default function Clients() {
  const [rows, setRows] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')

  async function load() {
    setLoading(true)
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) message.error(error.message)
    // Adminlardan tashqari — faqat mijozlar
    setRows(((data ?? []) as Client[]).filter((r) => r.role !== 'admin'))
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

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
      render: (_, r) => `${r.first_name ?? ''} ${r.last_name ?? ''}`.trim() || '—',
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
      render: (d: string | null) => (d ? new Date(d).toLocaleDateString() : '—'),
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
        scroll={{ x: 600 }}
      />
    </div>
  )
}
