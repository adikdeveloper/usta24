import { useEffect, useRef, useState } from 'react'
import { Card, Col, Row, Segmented, Typography, Tag, Spin } from 'antd'
import { supabase } from '../lib/supabase'

// Mapbox public token — .env dagi VITE_MAPBOX_TOKEN dan o'qiladi
const MAPBOX_TOKEN = (import.meta.env.VITE_MAPBOX_TOKEN as string) || ''

type Pt = { lng: number; lat: number }
type Rank = { name: string; count: number }

// Namuna (real koordinata bo'lmaganda) — Toshkent tumanlari
const DEMO_DISTRICTS = [
  { name: 'Chilonzor', lng: 69.204, lat: 41.275, count: 32 },
  { name: 'Yunusobod', lng: 69.289, lat: 41.367, count: 25 },
  { name: "Mirzo Ulug'bek", lng: 69.335, lat: 41.325, count: 18 },
  { name: 'Yakkasaroy', lng: 69.26, lat: 41.29, count: 14 },
  { name: 'Shayxontohur', lng: 69.225, lat: 41.325, count: 12 },
  { name: 'Sergeli', lng: 69.22, lat: 41.23, count: 9 },
  { name: 'Olmazor', lng: 69.203, lat: 41.353, count: 7 },
  { name: 'Bektemir', lng: 69.333, lat: 41.205, count: 4 },
]
function demoPoints(): Pt[] {
  const out: Pt[] = []
  for (const d of DEMO_DISTRICTS)
    for (let i = 0; i < d.count; i++)
      out.push({
        lng: d.lng + (Math.random() - 0.5) * 0.045,
        lat: d.lat + (Math.random() - 0.5) * 0.045,
      })
  return out
}
const DEMO_RANK: Rank[] = DEMO_DISTRICTS.map((d) => ({
  name: d.name,
  count: d.count * 10,
}))

function rankColor(ratio: number) {
  if (ratio >= 0.6) return '#10B981' // Kuchli
  if (ratio >= 0.3) return '#3B82F6' // O'sayotgan
  return '#F59E0B' // Reklama kerak
}

export default function Regions() {
  const mapEl = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<any>(null)
  const [ready, setReady] = useState(false)
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState<'masters' | 'orders'>('masters')
  const [demo, setDemo] = useState(false)
  const [ptsM, setPtsM] = useState<Pt[]>([])
  const [ptsO, setPtsO] = useState<Pt[]>([])
  const [rank, setRank] = useState<Rank[]>([])
  const [stats, setStats] = useState({ masters: 0, orders: 0 })

  // ── Ma'lumot yuklash ──
  useEffect(() => {
    ;(async () => {
      const [mm, ml, addr, ocount] = await Promise.all([
        supabase
          .from('masters')
          .select('latitude,longitude')
          .not('latitude', 'is', null),
        supabase.from('master_locations').select('latitude,longitude'),
        supabase.from('orders').select('address'),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
      ])
      const m: Pt[] = []
      for (const r of (mm.data ?? []) as any[])
        if (r.longitude != null) m.push({ lng: r.longitude, lat: r.latitude })
      for (const r of (ml.data ?? []) as any[])
        if (r.longitude != null) m.push({ lng: r.longitude, lat: r.latitude })

      // Buyurtma koordinatasi (lat/lng ustuni hali bo'lmasligi mumkin)
      const o: Pt[] = []
      const oc = await supabase
        .from('orders')
        .select('lat,lng')
        .not('lat', 'is', null)
      if (!oc.error)
        for (const r of (oc.data ?? []) as any[])
          if (r.lng != null) o.push({ lng: r.lng, lat: r.lat })

      // Manzil matni bo'yicha reyting
      const cnt: Record<string, number> = {}
      for (const r of (addr.data ?? []) as any[]) {
        const a = (r.address || '').trim()
        if (!a) continue
        const key = a.split(',')[0].trim() || a
        cnt[key] = (cnt[key] || 0) + 1
      }
      const realRank = Object.entries(cnt)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8)

      const noCoords = m.length === 0 && o.length === 0
      setDemo(noCoords)
      setPtsM(m.length ? m : demoPoints())
      setPtsO(o.length ? o : noCoords ? demoPoints() : o)
      setRank(realRank.length ? realRank : DEMO_RANK)
      setStats({ masters: m.length, orders: ocount.count ?? 0 })
      setLoading(false)
    })()
  }, [])

  // ── Xaritani ishga tushirish ──
  useEffect(() => {
    if (!MAPBOX_TOKEN) return
    let tries = 0
    const t = setInterval(() => {
      const gl = (window as any).mapboxgl
      if (!mapEl.current || mapRef.current) {
        clearInterval(t)
        return
      }
      if (gl) {
        clearInterval(t)
        gl.accessToken = MAPBOX_TOKEN
        const map = new gl.Map({
          container: mapEl.current,
          style: 'mapbox://styles/mapbox/light-v11',
          center: [69.2401, 41.2995], // Toshkent
          zoom: 9.5,
        })
        map.addControl(
          new gl.NavigationControl({ showCompass: false }),
          'top-right',
        )
        map.on('load', () => setReady(true))
        mapRef.current = map
      } else if (++tries > 60) {
        clearInterval(t)
      }
    }, 100)
    return () => {
      clearInterval(t)
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  // ── Qatlamlarni yangilash ──
  useEffect(() => {
    const map = mapRef.current
    const gl = (window as any).mapboxgl
    if (!map || !ready || !gl) return
    const pts = mode === 'masters' ? ptsM : ptsO
    const data = {
      type: 'FeatureCollection',
      features: pts.map((p) => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [p.lng, p.lat] },
        properties: {},
      })),
    }
    const blue: any = [
      'interpolate', ['linear'], ['heatmap-density'],
      0, 'rgba(59,130,246,0)',
      0.2, 'rgba(96,165,250,0.5)',
      0.4, 'rgba(59,130,246,0.7)',
      0.6, 'rgba(37,99,235,0.85)',
      1, 'rgba(30,58,138,0.95)',
    ]
    const amber: any = [
      'interpolate', ['linear'], ['heatmap-density'],
      0, 'rgba(245,158,11,0)',
      0.2, 'rgba(251,191,36,0.5)',
      0.4, 'rgba(245,158,11,0.75)',
      0.6, 'rgba(217,119,6,0.88)',
      1, 'rgba(146,64,14,0.95)',
    ]
    if (map.getSource('pts')) {
      map.getSource('pts').setData(data)
    } else {
      map.addSource('pts', { type: 'geojson', data })
      map.addLayer({
        id: 'heat',
        type: 'heatmap',
        source: 'pts',
        paint: {
          'heatmap-radius': 34,
          'heatmap-intensity': 1.2,
          'heatmap-opacity': 0.82,
          'heatmap-color': blue,
        },
      })
      map.addLayer({
        id: 'dots',
        type: 'circle',
        source: 'pts',
        paint: {
          'circle-radius': 4,
          'circle-color': '#2563EB',
          'circle-opacity': 0.5,
          'circle-stroke-width': 1,
          'circle-stroke-color': '#ffffff',
        },
      })
    }
    map.setPaintProperty('heat', 'heatmap-color', mode === 'masters' ? blue : amber)
    map.setPaintProperty('dots', 'circle-color', mode === 'masters' ? '#2563EB' : '#D97706')
    if (pts.length) {
      const b = new gl.LngLatBounds()
      pts.forEach((p) => b.extend([p.lng, p.lat]))
      map.fitBounds(b, { padding: 60, maxZoom: 12, duration: 700 })
    }
  }, [ready, ptsM, ptsO, mode])

  const max = Math.max(1, ...rank.map((r) => r.count))

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginBottom: 16,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <Typography.Title level={4} style={{ margin: 0 }}>
            Hududlar bo'yicha tahlil
          </Typography.Title>
          <Typography.Text type="secondary" style={{ fontSize: 13 }}>
            Real: {stats.masters} usta joylashuvi · {stats.orders} buyurtma
          </Typography.Text>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {demo && <Tag color="orange">namuna ma'lumot</Tag>}
          <Segmented
            value={mode}
            onChange={(v) => setMode(v as 'masters' | 'orders')}
            options={[
              { label: 'Ustalar', value: 'masters' },
              { label: 'Mijoz buyurtmalari', value: 'orders' },
            ]}
          />
        </div>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={15}>
          <Card
            styles={{ body: { padding: 0 } }}
            style={{ overflow: 'hidden', boxShadow: '0 1px 3px rgba(16,24,40,0.06)' }}
          >
            <div ref={mapEl} style={{ height: 460, width: '100%' }} />
          </Card>
        </Col>
        <Col xs={24} lg={9}>
          <Card
            title="Eng faol hududlar"
            style={{ boxShadow: '0 1px 3px rgba(16,24,40,0.06)' }}
          >
            {loading ? (
              <div style={{ textAlign: 'center', padding: 30 }}>
                <Spin />
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {rank.map((r) => {
                  const ratio = r.count / max
                  return (
                    <div key={r.name}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginBottom: 5,
                        }}
                      >
                        <span style={{ fontWeight: 600, fontSize: 13 }}>
                          {r.name}
                        </span>
                        <span style={{ color: '#6B7280', fontSize: 12 }}>
                          {r.count}
                        </span>
                      </div>
                      <div
                        style={{
                          height: 9,
                          borderRadius: 5,
                          background: '#EEF0F3',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            width: `${Math.max(6, ratio * 100)}%`,
                            height: '100%',
                            borderRadius: 5,
                            background: rankColor(ratio),
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
                <div
                  style={{
                    display: 'flex',
                    gap: 14,
                    marginTop: 6,
                    flexWrap: 'wrap',
                    fontSize: 12,
                    color: '#6B7280',
                  }}
                >
                  <span>
                    <span style={{ color: '#10B981' }}>●</span> Kuchli
                  </span>
                  <span>
                    <span style={{ color: '#3B82F6' }}>●</span> O'sayotgan
                  </span>
                  <span>
                    <span style={{ color: '#F59E0B' }}>●</span> Reklama kerak
                  </span>
                </div>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      <Typography.Paragraph
        type="secondary"
        style={{ marginTop: 14, fontSize: 13 }}
      >
        {mode === 'masters'
          ? "Xarita ustalarning joylashuvi (zichligi)ni ko'rsatadi. Quyuq joy — usta ko'p; ochiq joy — usta kam, ya'ni o'sha hududga reklama yoki usta jalb qilish kerak."
          : "Xarita mijoz buyurtmalari zichligini ko'rsatadi. To'lishi uchun buyurtmaga koordinata saqlanadi (supabase_geo.sql + mijoz ilovasi yangilanishi)."}
      </Typography.Paragraph>
    </div>
  )
}
