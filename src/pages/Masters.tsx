import { useEffect, useState } from 'react'
import {
  Table,
  Tag,
  Switch,
  Typography,
  message,
  Avatar,
  Input,
  Button,
} from 'antd'
import { EyeOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { supabase } from '../lib/supabase'
import MasterDetail, { type MasterRow } from '../components/MasterDetail'

type Master = MasterRow

function verifyTag(s: string | null | undefined) {
  switch (s) {
    case 'approved':
      return <Tag color="green">Tasdiqlangan</Tag>
    case 'rejected':
      return <Tag color="red">Rad etilgan</Tag>
    default:
      return <Tag color="orange">Kutilmoqda</Tag>
  }
}

export default function Masters() {
  const [rows, setRows] = useState<Master[]>([])
  const [cats, setCats] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [view, setView] = useState<Master | null>(null)

  async function load() {
    setLoading(true)
    const [m, c] = await Promise.all([
      supabase.from('masters').select('*').order('rating', { ascending: false }),
      supabase.from('categories').select('id,name_uz'),
    ])
    if (m.error) message.error(m.error.message)
    setRows((m.data ?? []) as Master[])
    const map: Record<string, string> = {}
    for (const r of (c.data ?? []) as { id: string; name_uz: string }[]) {
      map[r.id] = r.name_uz
    }
    setCats(map)
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
      title: 'Kasb',
      dataIndex: 'category_id',
      render: (id: string | null) => (id && cats[id]) || '—',
    },
    {
      title: 'Holat',
      dataIndex: 'verification_status',
      render: (s: string | null) => verifyTag(s),
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
      render: (v: boolean | undefined, r) => (
        <Switch checked={!!v} onChange={(val) => toggleAvailable(r, val)} />
      ),
    },
    {
      title: '',
      width: 110,
      render: (_, r) => (
        <Button
          size="small"
          icon={<EyeOutlined />}
          onClick={() => setView(r)}
        >
          Ko'rish
        </Button>
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
        scroll={{ x: 800 }}
      />

      <MasterDetail
        master={view}
        catName={
          view?.category_id ? cats[view.category_id] : undefined
        }
        onClose={() => setView(null)}
        onChanged={load}
      />
    </div>
  )
}
