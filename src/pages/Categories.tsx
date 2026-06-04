import { useEffect, useState } from 'react'
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Switch,
  Upload,
  message,
  Popconfirm,
  Image,
  Typography,
  Space,
} from 'antd'
import {
  PlusOutlined,
  UploadOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { supabase } from '../lib/supabase'

interface Category {
  id: string
  name_uz: string
  description_uz: string | null
  image_url: string | null
  sort_order: number
  is_active: boolean
}

export default function Categories() {
  const [rows, setRows] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form] = Form.useForm()

  async function load() {
    setLoading(true)
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true })
    if (error) message.error(error.message)
    setRows((data ?? []) as Category[])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  function openNew() {
    setEditing(null)
    setImageUrl(null)
    form.resetFields()
    const nextSort =
      (rows.length ? Math.max(...rows.map((r) => r.sort_order)) : 0) + 1
    form.setFieldsValue({ sort_order: nextSort, is_active: true })
    setOpen(true)
  }

  function openEdit(c: Category) {
    setEditing(c)
    setImageUrl(c.image_url)
    form.setFieldsValue({
      name_uz: c.name_uz,
      description_uz: c.description_uz,
      sort_order: c.sort_order,
      is_active: c.is_active,
    })
    setOpen(true)
  }

  async function uploadImage(file: File) {
    setUploading(true)
    try {
      const { data: u } = await supabase.auth.getUser()
      const uid = u.user?.id
      const ext = (file.name.split('.').pop() || 'png').toLowerCase()
      const path = `${uid}/cat_${Date.now()}.${ext}`
      const { error } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true })
      if (error) throw error
      const url = supabase.storage.from('avatars').getPublicUrl(path).data
        .publicUrl
      setImageUrl(url)
      message.success('Rasm yuklandi')
    } catch (e) {
      message.error((e as Error).message ?? 'Yuklashda xato')
    } finally {
      setUploading(false)
    }
  }

  async function save() {
    const v = await form.validateFields()
    setSaving(true)
    try {
      const payload = {
        name_uz: v.name_uz,
        description_uz: v.description_uz || null,
        sort_order: v.sort_order ?? 0,
        is_active: v.is_active ?? true,
        image_url: imageUrl,
      }
      if (editing) {
        const { error } = await supabase
          .from('categories')
          .update(payload)
          .eq('id', editing.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('categories').insert(payload)
        if (error) throw error
      }
      message.success('Saqlandi')
      setOpen(false)
      load()
    } catch (e) {
      message.error((e as Error).message ?? 'Xato')
    } finally {
      setSaving(false)
    }
  }

  async function remove(c: Category) {
    const { error } = await supabase.from('categories').delete().eq('id', c.id)
    if (error) {
      message.error(error.message)
      return
    }
    message.success('O\'chirildi')
    load()
  }

  async function toggleActive(c: Category, val: boolean) {
    const { error } = await supabase
      .from('categories')
      .update({ is_active: val })
      .eq('id', c.id)
    if (error) {
      message.error(error.message)
      return
    }
    setRows((rs) => rs.map((r) => (r.id === c.id ? { ...r, is_active: val } : r)))
  }

  const columns: ColumnsType<Category> = [
    {
      title: '',
      dataIndex: 'image_url',
      width: 64,
      render: (u: string | null) =>
        u ? (
          <Image
            width={44}
            height={44}
            style={{ objectFit: 'cover', borderRadius: 8 }}
            src={u}
          />
        ) : (
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 8,
              background: '#f0f0f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#bbb',
            }}
          >
            —
          </div>
        ),
    },
    { title: 'Nomi', dataIndex: 'name_uz' },
    {
      title: 'Tavsif',
      dataIndex: 'description_uz',
      render: (d: string | null) => d || '—',
    },
    {
      title: 'Tartib',
      dataIndex: 'sort_order',
      width: 90,
      sorter: (a, b) => a.sort_order - b.sort_order,
    },
    {
      title: 'Faol',
      dataIndex: 'is_active',
      width: 80,
      render: (v: boolean, c) => (
        <Switch checked={v} onChange={(val) => toggleActive(c, val)} />
      ),
    },
    {
      title: '',
      width: 110,
      render: (_, c) => (
        <Space>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => openEdit(c)}
          />
          <Popconfirm
            title="O'chirilsinmi?"
            okText="Ha"
            cancelText="Yo'q"
            onConfirm={() => remove(c)}
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
          Kasblar (kategoriyalar)
        </Typography.Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openNew}>
          Yangi kasb
        </Button>
      </div>
      <Table
        rowKey="id"
        loading={loading}
        dataSource={rows}
        columns={columns}
        pagination={false}
      />

      <Modal
        title={editing ? 'Kasbni tahrirlash' : 'Yangi kasb'}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={save}
        confirmLoading={saving}
        okText="Saqlash"
        cancelText="Bekor"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 12 }}>
          <Form.Item label="Rasm">
            <Upload
              showUploadList={false}
              accept="image/*"
              beforeUpload={(f) => {
                uploadImage(f as File)
                return false
              }}
            >
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt=""
                  style={{
                    width: 90,
                    height: 90,
                    objectFit: 'cover',
                    borderRadius: 10,
                    cursor: 'pointer',
                  }}
                />
              ) : (
                <Button icon={<UploadOutlined />} loading={uploading}>
                  Rasm yuklash
                </Button>
              )}
            </Upload>
          </Form.Item>
          <Form.Item
            name="name_uz"
            label="Nomi"
            rules={[{ required: true, message: 'Nom kiriting' }]}
          >
            <Input placeholder="Masalan: Santexnik" />
          </Form.Item>
          <Form.Item name="description_uz" label="Tavsif">
            <Input.TextArea rows={2} placeholder="Qisqa tavsif" />
          </Form.Item>
          <Space size="large">
            <Form.Item name="sort_order" label="Tartib raqami">
              <InputNumber min={0} />
            </Form.Item>
            <Form.Item name="is_active" label="Faol" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Space>
        </Form>
      </Modal>
    </div>
  )
}
