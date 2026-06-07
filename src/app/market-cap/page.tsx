'use client'
import { useState, useEffect } from 'react'
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

export default function MarketCapPage() {
  const [expanded, setExpanded] = useState(false)
  const [data, setData] = useState<any[]>([])
  const [current, setCurrent] = useState({ cap: 0, change: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('https://api.coingecko.com/api/v3/global')
        const g = await res.json()
        setCurrent({
          cap: g.data.total_market_cap.usd,
          change: g.data.market_cap_change_percentage_24h_usd
        })
        
        // График за 30 дней
        const chartRes = await fetch('https://api.coingecko.com/api/v3/global/market_cap_chart?days=30&vs_currency=usd')
        const chartData = await chartRes.json()
        if (chartData.market_caps) {
          setData(chartData.market_caps.map(([t, v]: [number, number]) => ({
            date: new Date(t).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }),
            value: v
          })))
        }
      } catch (e) {} finally { setLoading(false) }
    }
    load()
  }, [])

  const fmt = (n: number) => n >= 1e12 ? `$${(n/1e12).toFixed(2)}T` : `$${(n/1e9).toFixed(1)}B`
  const isPositive = current.change >= 0

  return (
    <div style={{ padding: 28, maxWidth: 960 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif', color: '#F5F7FA', marginBottom: 8 }}>
        Капитализация <span style={{ color: '#00E5D4' }}>рынка</span>
      </h1>
      <div style={{ background: 'rgba(16,24,38,0.8)', border: '1px solid rgba(0,229,212,0.1)', borderRadius: 14, padding: 24, marginTop: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 16 }}>
          <div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 36, fontWeight: 700, color: '#00E5D4' }}>{loading ? '...' : fmt(current.cap)}</div>
            <div style={{ color: isPositive ? '#00E5A0' : '#FF4757', fontSize: 15, fontWeight: 600, marginTop: 4 }}>{loading ? '' : `${isPositive ? '+' : ''}${current.change.toFixed(1)}% за 24ч`}</div>
          </div>
          <div style={{ color: '#5C728A', fontSize: 11, textAlign: 'right' }}>CoinGecko<br/>30 дней</div>
        </div>
        <div style={{ height: 280, background: 'rgba(0,229,212,0.02)', borderRadius: 12, border: '1px solid rgba(0,229,212,0.06)', padding: 12 }}>
          {data.length > 0 ? (
            <ResponsiveContainer>
              <AreaChart data={data}>
                <defs><linearGradient id="mcg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#00E5D4" stopOpacity={0.4}/><stop offset="100%" stopColor="#00E5D4" stopOpacity={0}/></linearGradient></defs>
                <XAxis dataKey="date" hide /><YAxis hide domain={['dataMin', 'dataMax']} />
                <Tooltip contentStyle={{ background: '#101826', border: '1px solid rgba(0,229,212,0.2)', borderRadius: 8, color: '#F5F7FA', fontSize: 12 }} formatter={(v: any) => [fmt(typeof v === 'number' ? v : 0), 'Капитализация']} />
                <Area type="monotone" dataKey="value" stroke="#00E5D4" strokeWidth={2.5} fill="url(#mcg)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          ) : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#5C728A' }}>Загрузка графика...</div>}
        </div>
        <h2 style={{ color: '#F5F7FA', fontSize: 16, fontWeight: 600, margin: '16px 0 8px' }}>Описание</h2>
        <p style={{ color: '#8FA3B8', fontSize: 13, lineHeight: 1.7 }}>
          Общая рыночная капитализация всех криптовалют. Рассчитывается CoinGecko как сумма рыночных капитализаций всех отслеживаемых активов.
        </p>
        {!expanded && <button onClick={() => setExpanded(true)} style={{ color: '#00E5D4', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, marginTop: 8, padding: 0 }}>Читать подробнее →</button>}
        {expanded && (
          <div style={{ marginTop: 12 }}>
            <h3 style={{ color: '#F5F7FA', fontSize: 14, marginBottom: 8 }}>Значение для трейдера</h3>
            <p style={{ color: '#8FA3B8', fontSize: 13, lineHeight: 1.7, marginBottom: 12 }}>
              Рост капитализации = приток капитала в крипторынок. Снижение = вывод средств.
              ATH капитализации часто совпадает с пиками бычьего рынка (ноябрь 2021: $3T).
            </p>
            <p style={{ color: '#5C728A', fontSize: 11 }}>Источник: CoinGecko API. Обновление: 60 секунд.</p>
            <button onClick={() => setExpanded(false)} style={{ color: '#00E5D4', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, marginTop: 8, padding: 0 }}>Свернуть ↑</button>
          </div>
        )}
      </div>
    </div>
  )
}
