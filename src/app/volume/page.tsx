'use client'
import { useState, useEffect } from 'react'
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts'

export default function VolumePage() {
  const [expanded, setExpanded] = useState(false)
  const [volume, setVolume] = useState(0)
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('https://api.coingecko.com/api/v3/global')
        const g = await res.json()
        setVolume(g.data.total_volume.usd)
        
        const chartRes = await fetch('https://api.coingecko.com/api/v3/global/market_cap_chart?days=14&vs_currency=usd')
        const chartData = await chartRes.json()
        if (chartData.total_volumes) {
          setData(chartData.total_volumes.map(([t, v]: [number, number]) => ({
            date: new Date(t).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }),
            value: v
          })))
        }
      } catch (e) {} finally { setLoading(false) }
    }
    load()
  }, [])

  const fmt = (n: number) => n >= 1e9 ? `$${(n/1e9).toFixed(1)}B` : `$${(n/1e6).toFixed(1)}M`

  return (
    <div style={{ padding: 28, maxWidth: 960 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif', color: '#F5F7FA', marginBottom: 8 }}>
        Объём <span style={{ color: '#FF6B81' }}>торгов 24ч</span>
      </h1>
      <div style={{ background: 'rgba(16,24,38,0.8)', border: '1px solid rgba(0,229,212,0.1)', borderRadius: 14, padding: 24, marginTop: 20 }}>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 36, fontWeight: 700, color: '#FF6B81' }}>{loading ? '...' : fmt(volume)}</div>
        <div style={{ color: '#5C728A', fontSize: 11, marginTop: 4 }}>Суммарный объём всех бирж за 24ч</div>
        
        <div style={{ height: 280, background: 'rgba(0,229,212,0.02)', borderRadius: 12, border: '1px solid rgba(0,229,212,0.06)', padding: 12, margin: '20px 0' }}>
          {data.length > 0 ? (
            <ResponsiveContainer>
              <AreaChart data={data}>
                <defs><linearGradient id="volg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#FF6B81" stopOpacity={0.4}/><stop offset="100%" stopColor="#FF6B81" stopOpacity={0}/></linearGradient></defs>
                <Tooltip contentStyle={{ background: '#101826', border: '1px solid rgba(255,107,129,0.2)', borderRadius: 8, color: '#F5F7FA', fontSize: 12 }} formatter={(v: any) => [fmt(typeof v === 'number' ? v : 0), 'Объём']} />
                <Area type="monotone" dataKey="value" stroke="#FF6B81" strokeWidth={2.5} fill="url(#volg)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          ) : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#5C728A' }}>Загрузка...</div>}
        </div>

        <h2 style={{ color: '#F5F7FA', fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Описание</h2>
        <p style={{ color: '#8FA3B8', fontSize: 13, lineHeight: 1.7 }}>Общий объём торгов на всех отслеживаемых биржах. Высокий объём подтверждает тренд. Падение объёма при росте цены — медвежий сигнал.</p>
        {!expanded && <button onClick={() => setExpanded(true)} style={{ color: '#00E5D4', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, marginTop: 8, padding: 0 }}>Читать подробнее →</button>}
        {expanded && (
          <div style={{ marginTop: 12 }}>
            <p style={{ color: '#8FA3B8', fontSize: 13, lineHeight: 1.7 }}>Данные включают спотовый и деривативный рынки. Агрегируются из 400+ бирж. Пиковые значения объёмов наблюдаются в периоды высокой волатильности.</p>
            <p style={{ color: '#5C728A', fontSize: 11, marginTop: 8 }}>Источник: CoinGecko. Обновление: 60с.</p>
            <button onClick={() => setExpanded(false)} style={{ color: '#00E5D4', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, marginTop: 8, padding: 0 }}>Свернуть ↑</button>
          </div>
        )}
      </div>
    </div>
  )
}
