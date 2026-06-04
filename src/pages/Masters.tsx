import { useEffect, useState } from 'react'
import { Table, Tag, Switch, Typography, message, Avatar, Input } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { supabase } from '../lib/supabase'

interface Master {
  id: string
  first_name: string
  last_name: string
  level: string | null
  rating: number | null
  reviews_count: number | null
  call_price: number | null
  is_available: boolean
  avatar_url: string | null
}

export default function Masters() {
  const [rows, setRows] = useState<Master[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')

  async function load() {
    setLoading(true)
    const { data, error } = await supabase
      .from('masters')
      .select('*')
      .order('rating', { ascending: false })
    if (error) message.error(error.message)
    setRows((data ?? []) as Master[])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function toggleAvailable(m: Master, val: boolean) {
    const { error } = await supabase
      .from('masters')
      .update({ is_available: val })
      .eq('id', m.id)
    if (error) {
      message.error(error.message)
      return
    }
    setRows((rs) => rs.map((r) => (r.id === m.id ? { ...r, is_available: val } : r)))
    message.success('Yangilandi')
  }

  const filtered = rows.filter((r) =>
    `${r.first_name ?? ''} ${r.last_name ?? ''}`
      .toLowerCase()
      .includes(q.toLowerCase()),
  )

  const columns: ColumnsType<Master> = [
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
      title: 'Daraja',
      dataIndex: 'level',
      render: (l: string | null) => (l ? <Tag color="blue">{l}</Tag> : '—'),
    },
    {
      title: 'Reyting',
      dataIndex: 'rating',
      sorter: (a, b) => (a.rating ?? 0) - (b.rating ?? 0),
      render: (v: number | null) => (v != null ? v.toFixed(1) : '—'),
    },
    {
      title: 'Sharhlar',
      dataIndex: 'reviews_count',
      render: (v: number | null) => v ?? 0,
    },
    {
      title: 'Narx',
      dataIndex: 'call_price',
      render: (v: number | null) => (v ? `${v.toLocaleString()} so'm` : '—'),
    },
    {
      title: 'Faol',
      dataIndex: 'is_available',
      render: (v: boolean, r) => (
        <Switch checked={v} onChange={(val) => toggleAvailable(r, val)} />
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
          Ustalar
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
    </div>
  )
}
