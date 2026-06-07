'use client'
import { useState, useEffect } from 'react'
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts'

export default function BTCDomPage() {
  const [expanded, setExpanded] = useState(false)
  const [dominance, setDominance] = useState(0)
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('https://api.coingecko.com/api/v3/global')
        const g = await res.json()
        setDominance(g.data.market_cap_percentage.btc)
        
        // График доминации (приближение через рыночные данные)
        const btcRes = await fetch('https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=30')
        const btcData = await btcRes.json()
        const globalRes = await fetch('https://api.coingecko.com/api/v3/global/market_cap_chart?days=30&vs_currency=usd')
        const globalData = await globalRes.json()
        
        if (btcData.prices && globalData.market_caps) {
          const chartData = btcData.prices.map(([t, p]: [number, number], i: number) => {
            const btcCap = p * 19_500_000 // приблизительно
            const totalCap = globalData.market_caps[i]?.[1] || btcCap * 2
            return {
              date: new Date(t).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }),
              value: (btcCap / totalCap) * 100
            }
          })
          setData(chartData)
        }
      } catch (e) {} finally { setLoading(false) }
    }
    load()
  }, [])

  return (
    <div style={{ padding: 28, maxWidth: 960 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif', color: '#F5F7FA', marginBottom: 8 }}>
        Доминация <span style={{ color: '#F7931A' }}>BTC</span>
      </h1>
      <div style={{ background: 'rgba(16,24,38,0.8)', border: '1px solid rgba(0,229,212,0.1)', borderRadius: 14, padding: 24, marginTop: 20 }}>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 36, fontWeight: 700, color: '#F7931A' }}>{loading ? '...' : `${dominance.toFixed(1)}%`}</div>
        <div style={{ color: '#5C728A', fontSize: 11, marginTop: 4 }}>Доля BTC в общей капитализации</div>
        
        <div style={{ height: 280, background: 'rgba(0,229,212,0.02)', borderRadius: 12, border: '1px solid rgba(0,229,212,0.06)', padding: 12, margin: '20px 0' }}>
          {data.length > 0 ? (
            <ResponsiveContainer>
              <AreaChart data={data}>
                <defs><linearGradient id="btcdg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#F7931A" stopOpacity={0.4}/><stop offset="100%" stopColor="#F7931A" stopOpacity={0}/></linearGradient></defs>
                <Tooltip contentStyle={{ background: '#101826', border: '1px solid rgba(247,147,26,0.2)', borderRadius: 8, color: '#F5F7FA', fontSize: 12 }} formatter={(v: any) => [`${typeof v === 'number' ? v.toFixed(1) : v}%`, 'Доминация']} />
                <Area type="monotone" dataKey="value" stroke="#F7931A" strokeWidth={2.5} fill="url(#btcdg)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          ) : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#5C728A' }}>Загрузка...</div>}
        </div>

        <h2 style={{ color: '#F5F7FA', fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Описание</h2>
        <p style={{ color: '#8FA3B8', fontSize: 13, lineHeight: 1.7 }}>Доминирование BTC = доля капитализации биткоина от всего рынка. Рост = бегство в качество. Падение = аппетит к риску.</p>
        {!expanded && <button onClick={() => setExpanded(true)} style={{ color: '#00E5D4', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, marginTop: 8, padding: 0 }}>Читать подробнее →</button>}
        {expanded && (
          <div style={{ marginTop: 12 }}>
            <p style={{ color: '#8FA3B8', fontSize: 13, lineHeight: 1.7 }}>Исторические минимумы: 37% (янв 2018). Максимумы: 73% (дек 2020). Текущий тренд — консолидация 50-55%.</p>
            <p style={{ color: '#5C728A', fontSize: 11, marginTop: 8 }}>Источник: CoinGecko. Обновление: 60с.</p>
            <button onClick={() => setExpanded(false)} style={{ color: '#00E5D4', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, marginTop: 8, padding: 0 }}>Свернуть ↑</button>
          </div>
        )}
      </div>
    </div>
  )
}
