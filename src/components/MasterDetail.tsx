import { useEffect, useState } from 'react'
import {
  Drawer,
  Tabs,
  Avatar,
  Descriptions,
  Tag,
  Button,
  Space,
  Spin,
  Empty,
  Image,
  Typography,
  Popconfirm,
  message,
  Modal,
  Rate,
} from 'antd'
import {
  MessageOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons'
import { supabase } from '../lib/supabase'

// Masters.tsx ro'yxatidan keladigan to'liq yozuv (select('*')).
export interface MasterRow {
  id: string
  first_name: string | null
  last_name: string | null
  level: string | null
  level_code?: string | null
  rating: number | null
  reviews_count: number | null
  call_price: number | null
  balance?: number | null
  total_jobs?: number | null
  is_available?: boolean
  avatar_url: string | null
  bio_uz?: string | null
  category_id?: string | null
  verification_status?: string | null
}

interface Doc {
  passport_series: string | null
  passport_number: string | null
  jshshir: string | null
  passport_front_url: string | null
  passport_back_url: string | null
  selfie_url: string | null
  verification_status: string | null
  rejection_reason: string | null
  submitted_at: string | null
}

interface OrderRow {
  id: string
  status: string | null
  price: number | null
  address: string | null
  note: string | null
  created_at: string | null
  completed_at: string | null
  before_photos: string[] | null
  after_photos: string[] | null
  categories: { name_uz: string } | null
  client: { first_name: string | null; last_name: string | null } | null
  reviews: { stars: number; comment: string | null }[] | null
}

function fullName(f: string | null, l: string | null) {
  return `${f ?? ''} ${l ?? ''}`.trim() || '—'
}

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

function orderStatusTag(s: string | null) {
  switch (s) {
    case 'completed':
      return <Tag color="green">Bajarildi</Tag>
    case 'pending':
      return <Tag color="orange">Kutilmoqda</Tag>
    case 'accepted':
      return <Tag color="blue">Qabul qilindi</Tag>
    case 'on_the_way':
      return <Tag color="blue">Yo'lda</Tag>
    case 'arrived':
      return <Tag color="blue">Yetib keldi</Tag>
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

// Storage yo'lidan signed URL (private 'documents' bucket). Eski public URL — o'zini.
async function signedUrl(path: string | null): Promise<string | undefined> {
  if (!path) return undefined
  if (path.startsWith('http')) return path
  const { data } = await supabase.storage
    .from('documents')
    .createSignedUrl(path, 3600)
  return data?.signedUrl
}

// ── Bitta buyurtma suhbati (chat) ──
function OrderChat({
  orderId,
  masterId,
  onClose,
}: {
  orderId: string
  masterId: string
  onClose: () => void
}) {
  const [msgs, setMsgs] = useState<
    { id: string; sender_id: string; text: string; created_at: string }[]
  >([])
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
        Ko'k — usta · kulrang — mijoz
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
            const mine = m.sender_id === masterId
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

// ── Ish rasmlari ustuni (Oldin / Keyin) ──
function PhotoStrip({ label, urls }: { label: string; urls: string[] }) {
  return (
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 4 }}>
        {label} {urls.length > 0 ? `(${urls.length})` : ''}
      </div>
      {urls.length === 0 ? (
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          —
        </Typography.Text>
      ) : (
        <Space wrap size={6}>
          {urls.map((u, i) => (
            <Image
              key={i}
              src={u}
              width={64}
              height={64}
              style={{ objectFit: 'cover', borderRadius: 8 }}
            />
          ))}
        </Space>
      )}
    </div>
  )
}

// ── Bitta buyurtma kartasi (Ishlar va Yozishmalar uchun) ──
function OrderCard({
  o,
  masterId,
  showReview,
}: {
  o: OrderRow
  masterId: string
  showReview?: boolean
}) {
  const [chat, setChat] = useState(false)
  const cat = o.categories?.name_uz ?? '—'
  const client = o.client ? fullName(o.client.first_name, o.client.last_name) : '—'
  const review = o.reviews?.[0]
  const before = o.before_photos ?? []
  const after = o.after_photos ?? []
  return (
    <div style={{ border: '1px solid #EEF0F3', borderRadius: 12, padding: 12 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span style={{ fontWeight: 600 }}>{cat}</span>
        {orderStatusTag(o.status)}
      </div>
      <div style={{ fontSize: 13, color: '#6B7280', marginTop: 4 }}>
        Mijoz: {client}
      </div>
      {o.address && (
        <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>
          {o.address}
        </div>
      )}
      {showReview && (before.length > 0 || after.length > 0) && (
        <Image.PreviewGroup>
          <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
            <PhotoStrip label="Oldin" urls={before} />
            <PhotoStrip label="Keyin" urls={after} />
          </div>
        </Image.PreviewGroup>
      )}
      {showReview && review && (
        <div style={{ marginTop: 6 }}>
          <Rate disabled value={review.stars} style={{ fontSize: 13 }} />
          {review.comment && (
            <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
              "{review.comment}"
            </div>
          )}
        </div>
      )}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 6,
        }}
      >
        <span style={{ fontSize: 12, color: '#9CA3AF' }}>
          {o.completed_at
            ? new Date(o.completed_at).toLocaleString()
            : o.created_at
              ? new Date(o.created_at).toLocaleString()
              : '—'}{' '}
          · {(o.price ?? 0).toLocaleString()} so'm
        </span>
        <Button
          size="small"
          icon={<MessageOutlined />}
          onClick={() => setChat(true)}
        >
          Suhbat
        </Button>
      </div>
      {chat && (
        <OrderChat
          orderId={o.id}
          masterId={masterId}
          onClose={() => setChat(false)}
        />
      )}
    </div>
  )
}

export default function MasterDetail({
  master,
  catName,
  onClose,
  onChanged,
}: {
  master: MasterRow | null
  catName?: string
  onClose: () => void
  onChanged: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [phone, setPhone] = useState<string | null>(null)
  const [doc, setDoc] = useState<Doc | null>(null)
  const [imgs, setImgs] = useState<{ front?: string; back?: string; selfie?: string }>(
    {},
  )
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [acting, setActing] = useState(false)
  // Drawer ichida tasdiqdan keyin holatni darhol ko'rsatish uchun lokal nusxa.
  const [status, setStatus] = useState<string | null | undefined>(
    master?.verification_status,
  )

  useEffect(() => {
    if (!master) return
    setStatus(master.verification_status)
    let alive = true
    ;(async () => {
      setLoading(true)
      setDoc(null)
      setImgs({})
      setOrders([])
      setPhone(null)
      const [p, d, o] = await Promise.all([
        supabase
          .from('profiles')
          .select('phone')
          .eq('id', master.id)
          .maybeSingle(),
        supabase
          .from('master_documents')
          .select('*')
          .eq('master_id', master.id)
          .maybeSingle(),
        supabase
          .from('orders')
          .select(
            'id,status,price,address,note,created_at,completed_at,before_photos,after_photos,categories(name_uz),client:profiles(first_name,last_name),reviews(stars,comment)',
          )
          .eq('master_id', master.id)
          .order('created_at', { ascending: false }),
      ])
      if (!alive) return
      if (p.error) message.error(p.error.message)
      if (d.error) message.error(d.error.message)
      if (o.error) message.error(o.error.message)
      setPhone((p.data as { phone: string | null } | null)?.phone ?? null)
      const dd = (d.data as Doc) ?? null
      setDoc(dd)
      setOrders((o.data ?? []) as unknown as OrderRow[])
      if (dd) {
        const [front, back, selfie] = await Promise.all([
          signedUrl(dd.passport_front_url),
          signedUrl(dd.passport_back_url),
          signedUrl(dd.selfie_url),
        ])
        if (alive) setImgs({ front, back, selfie })
      }
      if (alive) setLoading(false)
    })()
    return () => {
      alive = false
    }
  }, [master])

  async function decide(next: 'approved' | 'rejected') {
    if (!master) return
    setActing(true)
    try {
      const r1 = await supabase
        .from('masters')
        .update({ verification_status: next })
        .eq('id', master.id)
      if (r1.error) throw r1.error
      // master_documents ham sinxron bo'lishi shart (Tasdiqlash sahifasi bilan).
      await supabase
        .from('master_documents')
        .update({
          verification_status: next,
          reviewed_at: new Date().toISOString(),
        })
        .eq('master_id', master.id)
      setStatus(next)
      setDoc((d) => (d ? { ...d, verification_status: next } : d))
      message.success(next === 'approved' ? 'Usta tasdiqlandi' : 'Rad etildi')
      onChanged()
    } catch (e) {
      message.error((e as Error).message ?? 'Xato')
    } finally {
      setActing(false)
    }
  }

  const completed = orders.filter((o) => o.status === 'completed')
  const name = master ? fullName(master.first_name, master.last_name) : '—'

  return (
    <Drawer
      title="Usta ma'lumotlari"
      width={620}
      open={master !== null}
      onClose={onClose}
      destroyOnClose
    >
      {master && (
        <Tabs
          defaultActiveKey="info"
          items={[
            {
              key: 'info',
              label: "Ma'lumot",
              children: (
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  <div style={{ textAlign: 'center' }}>
                    <Avatar size={84} src={master.avatar_url || undefined} />
                    <div style={{ marginTop: 8, fontWeight: 600, fontSize: 16 }}>
                      {name}
                    </div>
                    <div style={{ marginTop: 4 }}>{verifyTag(status)}</div>
                  </div>

                  <Descriptions column={1} bordered size="small">
                    <Descriptions.Item label="Telefon">
                      {phone ?? '—'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Kasb">
                      {catName ?? '—'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Daraja">
                      {master.level_code ?? master.level ?? '—'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Reyting">
                      {master.rating != null ? master.rating.toFixed(1) : '—'} (
                      {master.reviews_count ?? 0} sharh)
                    </Descriptions.Item>
                    <Descriptions.Item label="Bajargan ishlari">
                      {master.total_jobs ?? completed.length}
                    </Descriptions.Item>
                    <Descriptions.Item label="Balans">
                      {`${(master.balance ?? 0).toLocaleString()} so'm`}
                    </Descriptions.Item>
                    <Descriptions.Item label="Chaqiruv narxi">
                      {master.call_price
                        ? `${master.call_price.toLocaleString()} so'm`
                        : '—'}
                    </Descriptions.Item>
                    {master.bio_uz && (
                      <Descriptions.Item label="Bio">
                        {master.bio_uz}
                      </Descriptions.Item>
                    )}
                  </Descriptions>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <Popconfirm
                      title="Ustani tasdiqlaysizmi?"
                      okText="Ha"
                      cancelText="Yo'q"
                      onConfirm={() => decide('approved')}
                    >
                      <Button
                        type="primary"
                        icon={<CheckCircleOutlined />}
                        loading={acting}
                        disabled={status === 'approved'}
                        style={{ flex: 1 }}
                        block
                      >
                        Tasdiqlash
                      </Button>
                    </Popconfirm>
                    <Popconfirm
                      title="Rad etasizmi?"
                      okText="Ha"
                      cancelText="Yo'q"
                      onConfirm={() => decide('rejected')}
                    >
                      <Button
                        danger
                        icon={<CloseCircleOutlined />}
                        loading={acting}
                        disabled={status === 'rejected'}
                        style={{ flex: 1 }}
                        block
                      >
                        Rad etish
                      </Button>
                    </Popconfirm>
                  </div>
                </Space>
              ),
            },
            {
              key: 'passport',
              label: 'Passport',
              children: loading ? (
                <div style={{ textAlign: 'center', padding: 40 }}>
                  <Spin />
                </div>
              ) : doc === null ? (
                <Empty description="Hujjat topilmadi" />
              ) : (
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  <Descriptions column={1} bordered size="small">
                    <Descriptions.Item label="Seriya / Raqam">
                      {`${doc.passport_series ?? ''} ${doc.passport_number ?? ''}`.trim() ||
                        '—'}
                    </Descriptions.Item>
                    <Descriptions.Item label="JSHSHIR">
                      {doc.jshshir ?? '—'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Holat">
                      {verifyTag(doc.verification_status)}
                    </Descriptions.Item>
                    {doc.rejection_reason && (
                      <Descriptions.Item label="Rad sababi">
                        {doc.rejection_reason}
                      </Descriptions.Item>
                    )}
                    <Descriptions.Item label="Yuborilgan">
                      {doc.submitted_at
                        ? new Date(doc.submitted_at).toLocaleString()
                        : '—'}
                    </Descriptions.Item>
                  </Descriptions>
                  <div>
                    <Typography.Text type="secondary">
                      Hujjat rasmlari
                    </Typography.Text>
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
                        {!imgs.front && !imgs.back && !imgs.selfie && (
                          <Typography.Text type="secondary">
                            Rasm yo'q
                          </Typography.Text>
                        )}
                      </Space>
                    </Image.PreviewGroup>
                  </div>
                </Space>
              ),
            },
            {
              key: 'works',
              label: `Ishlari (${completed.length})`,
              children: loading ? (
                <div style={{ textAlign: 'center', padding: 40 }}>
                  <Spin />
                </div>
              ) : completed.length === 0 ? (
                <Empty description="Bajarilgan ish yo'q" />
              ) : (
                <Space direction="vertical" size={10} style={{ width: '100%' }}>
                  {completed.map((o) => (
                    <OrderCard
                      key={o.id}
                      o={o}
                      masterId={master.id}
                      showReview
                    />
                  ))}
                </Space>
              ),
            },
            {
              key: 'chats',
              label: 'Yozishmalar',
              children: loading ? (
                <div style={{ textAlign: 'center', padding: 40 }}>
                  <Spin />
                </div>
              ) : orders.length === 0 ? (
                <Empty description="Buyurtma yo'q" />
              ) : (
                <Space direction="vertical" size={10} style={{ width: '100%' }}>
                  {orders.map((o) => (
                    <OrderCard key={o.id} o={o} masterId={master.id} />
                  ))}
                </Space>
              ),
            },
          ]}
        />
      )}
    </Drawer>
  )
}
