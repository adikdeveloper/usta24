import { useEffect, useState } from 'react'
import {
  Table,
  Tag,
  Button,
  Drawer,
  Descriptions,
  Image,
  message,
  Space,
  Segmented,
  Typography,
  Spin,
  Empty,
  Popconfirm,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { supabase } from '../lib/supabase'

interface MasterRow {
  id: string
  first_name: string | null
  last_name: string | null
  category_id: string | null
  verification_status: string | null
}

interface Doc {
  passport_series: string | null
  passport_number: string | null
  jshshir: string | null
  passport_front_url: string | null
  passport_back_url: string | null
  selfie_url: string | null
  verification_status: string | null
}

function statusTag(s: string | null) {
  switch (s) {
    case 'approved':
      return <Tag color="green">Tasdiqlangan</Tag>
    case 'rejected':
      return <Tag color="red">Rad etilgan</Tag>
    default:
      return <Tag color="orange">Kutilmoqda</Tag>
  }
}

export default function Verification() {
  const [rows, setRows] = useState<MasterRow[]>([])
  const [cats, setCats] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('pending')
  const [open, setOpen] = useState<MasterRow | null>(null)
  const [doc, setDoc] = useState<Doc | null>(null)
  const [docLoading, setDocLoading] = useState(false)
  const [acting, setActing] = useState(false)
  const [imgs, setImgs] = useState<{
    front?: string
    back?: string
    selfie?: string
  }>({})

  // Storage yo'lidan signed URL (private bucket). Eski public URL bo'lsa — o'zini.
  async function signedUrl(path: string | null): Promise<string | undefined> {
    if (!path) return undefined
    if (path.startsWith('http')) return path
    const { data } = await supabase.storage
      .from('documents')
      .createSignedUrl(path, 3600)
    return data?.signedUrl
  }

  async function load() {
    setLoading(true)
    const query = supabase
      .from('masters')
      .select('id,first_name,last_name,category_id,verification_status')
    const mq =
      filter === 'pending'
        ? query.eq('verification_status', 'pending')
        : query
    const [m, c] = await Promise.all([
      mq.order('verification_status', { ascending: true }),
      supabase.from('categories').select('id,name_uz'),
    ])
    if (m.error) message.error(m.error.message)
    setRows((m.data ?? []) as MasterRow[])
    const map: Record<string, string> = {}
    for (const r of (c.data ?? []) as { id: string; name_uz: string }[]) {
      map[r.id] = r.name_uz
    }
    setCats(map)
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])

  async function openDrawer(row: MasterRow) {
    setOpen(row)
    setDoc(null)
    setImgs({})
    setDocLoading(true)
    const { data, error } = await supabase
      .from('master_documents')
      .select('*')
      .eq('master_id', row.id)
      .maybeSingle()
    if (error) message.error(error.message)
    const d = (data as Doc) ?? null
    setDoc(d)
    if (d) {
      setImgs({
        front: await signedUrl(d.passport_front_url),
        back: await signedUrl(d.passport_back_url),
        selfie: await signedUrl(d.selfie_url),
      })
    }
    setDocLoading(false)
  }

  async function decide(status: 'approved' | 'rejected') {
    if (!open) return
    setActing(true)
    try {
      const r1 = await supabase
        .from('masters')
        .update({ verification_status: status })
        .eq('id', open.id)
      if (r1.error) throw r1.error
      await supabase
        .from('master_documents')
        .update({
          verification_status: status,
          reviewed_at: new Date().toISOString(),
        })
        .eq('master_id', open.id)
      message.success(status === 'approved' ? 'Usta tasdiqlandi' : 'Rad etildi')
      setOpen(null)
      load()
    } catch (e) {
      message.error((e as Error).message ?? 'Xato')
    } finally {
      setActing(false)
    }
  }

  const columns: ColumnsType<MasterRow> = [
    {
      title: 'Ism',
      render: (_, r) =>
        `${r.first_name ?? ''} ${r.last_name ?? ''}`.trim() || '—',
    },
    {
      title: 'Kasb',
      dataIndex: 'category_id',
      render: (id: string | null) => (id && cats[id]) || '—',
    },
    {
      title: 'Holat',
      dataIndex: 'verification_status',
      render: (s: string | null) => statusTag(s),
    },
    {
      title: '',
      width: 180,
      render: (_, r) => (
        <Button type="primary" ghost onClick={() => openDrawer(r)}>
          Hujjatlarni ko'rish
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
          Ustalarni tasdiqlash
        </Typography.Title>
        <Segmented
          value={filter}
          onChange={(v) => setFilter(v as string)}
          options={[
            { label: 'Kutilmoqda', value: 'pending' },
            { label: 'Hammasi', value: 'all' },
          ]}
        />
      </div>
      <Table
        rowKey="id"
        loading={loading}
        dataSource={rows}
        columns={columns}
        pagination={{ pageSize: 10 }}
      />

      <Drawer
        title="Passport tekshiruvi"
        width={460}
        open={open !== null}
        onClose={() => setOpen(null)}
      >
        {docLoading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Spin />
          </div>
        ) : doc === null ? (
          <Empty description="Hujjat topilmadi" />
        ) : (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Usta">
                {`${open?.first_name ?? ''} ${open?.last_name ?? ''}`.trim() || '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Seriya / Raqam">
                {`${doc.passport_series ?? ''} ${doc.passport_number ?? ''}`.trim() ||
                  '—'}
              </Descriptions.Item>
              <Descriptions.Item label="JSHSHIR">
                {doc.jshshir ?? '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Holat">
                {statusTag(doc.verification_status)}
              </Descriptions.Item>
            </Descriptions>

            <div>
              <Typography.Text type="secondary">Hujjat rasmlari</Typography.Text>
              <Image.PreviewGroup>
                <Space wrap style={{ marginTop: 8 }}>
                  {imgs.front && (
                    <Image
                      width={120}
                      height={120}
                      style={{ objectFit: 'cover', borderRadius: 8 }}
                      src={imgs.front}
                    />
                  )}
                  {imgs.back && (
                    <Image
                      width={120}
                      height={120}
                      style={{ objectFit: 'cover', borderRadius: 8 }}
                      src={imgs.back}
                    />
                  )}
                  {imgs.selfie && (
                    <Image
                      width={120}
                      height={120}
                      style={{ objectFit: 'cover', borderRadius: 8 }}
                      src={imgs.selfie}
                    />
                  )}
                </Space>
              </Image.PreviewGroup>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ flex: 1 }}>
                <Popconfirm
                  title="Tasdiqlaysizmi?"
                  okText="Ha"
                  cancelText="Yo'q"
                  onConfirm={() => decide('approved')}
                >
                  <Button type="primary" loading={acting} block>
                    Tasdiqlash
                  </Button>
                </Popconfirm>
              </div>
              <div style={{ flex: 1 }}>
                <Popconfirm
                  title="Rad etasizmi?"
                  okText="Ha"
                  cancelText="Yo'q"
                  onConfirm={() => decide('rejected')}
                >
                  <Button danger loading={acting} block>
                    Rad etish
                  </Button>
                </Popconfirm>
              </div>
            </div>
          </Space>
        )}
      </Drawer>
    </div>
  )
}
