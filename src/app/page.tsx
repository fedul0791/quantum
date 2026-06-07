'use client'
import { useState, useEffect } from 'react'
import { binanceWS } from '@/lib/binanceWebSocket'
import { useMarketStore } from '@/store/marketStore'
import ProfessionalOrderBook from '@/components/ProfessionalOrderBook'
import HFTAnalytics from '@/components/HFTAnalytics'
import AdvancedTradingChart from "@/components/AdvancedTradingChart"
import { AnimatedCard, SlideIn, StaggerContainer } from '@/lib/animations'

function Sparkline({ data, color, width = 80, height = 30 }: { data: number[]; color: string; width?: number; height?: number }) {
  if (!data || data.length < 2) return <div style={{ width, height }} />
  const max = Math.max(...data), min = Math.min(...data), r = max - min || 1
  const pts = data.map((v, i) => `${(i/(data.length-1))*width},${height - ((v-min)/r)*height}`).join(' ')
  return (
    <svg width={width} height={height} style={{ flexShrink: 0 }}>
      <defs>
        <linearGradient id={`sp-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <polygon points={`0,${height} ${pts} ${width},${height}`} fill={`url(#sp-${color.replace('#','')})`}/>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5"/>
    </svg>
  )
}

function genSpark(change: number, base: number, points: number = 15): number[] {
  const arr: number[] = []
  const vol = Math.abs(change) / 100 * (base || 100) * 0.12
  for (let i = 0; i < points; i++) {
    const t = i / (points - 1)
    arr.push((base || 100) * (1 - change/300) + vol * Math.sin(t * Math.PI * 3) * (1 - t))
  }
  arr[arr.length - 1] = base || 100
  return arr
}

const fmt = (p: number | undefined) => {
  if (p === undefined || p === null || isNaN(p)) return '—'
  if (p >= 1000) return p.toLocaleString('en-US', { maximumFractionDigits: 0 })
  if (p >= 1) return p.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return p.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 6 })
}

export default function Dashboard() {
  const [time, setTime] = useState('')
  const prices = useMarketStore(state => state.prices)
  const isConnected = useMarketStore(state => state.isConnected)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    binanceWS.connect()
    return () => binanceWS.disconnect()
  }, [])

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date().toLocaleTimeString('ru-RU')), 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    fetch('/api/binance')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          const map: any = {}
          data.forEach((t: any) => {
            map[t.symbol] = {
              price: parseFloat(t.lastPrice),
              change: parseFloat(t.priceChangePercent),
            }
          })
          Object.entries(map).forEach(([symbol, d]) => {
            useMarketStore.getState().setPrice(symbol, d)
          })
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const topMovers = Object.entries(prices || {})
    .sort((a, b) => {
      const changeA = (a[1] as any)?.change || 0
      const changeB = (b[1] as any)?.change || 0
      return Math.abs(changeB) - Math.abs(changeA)
    })
    .slice(0, 5)

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <AnimatedCard delay={0}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, padding: '12px 16px', background: 'rgba(16,24,38,0.5)', border: '1px solid rgba(0,229,212,0.06)', borderRadius: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: isConnected ? '#00E5A0' : '#FFA502' }} />
            <span style={{ color: '#F5F7FA', fontFamily: 'Space Grotesk, sans-serif', fontSize: 18, fontWeight: 700 }}>Quantum Flow Terminal</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ color: '#5C728A', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}>UTC {time}</span>
            <div style={{ padding: '4px 10px', background: isConnected ? 'rgba(0,229,212,0.1)' : 'rgba(255,165,2,0.1)', border: `1px solid ${isConnected ? 'rgba(0,229,212,0.3)' : 'rgba(255,165,2,0.3)'}`, borderRadius: 6, color: isConnected ? '#00E5D4' : '#FFA502', fontSize: 10, fontWeight: 600 }}>
              {isConnected ? '● LIVE' : 'CONNECTING'}
            </div>
          </div>
        </div>
      </AnimatedCard>

      {/* Title */}
      <SlideIn direction="left" delay={0.1}>
        <h1 style={{ fontSize: 28, marginBottom: 20, color: '#F5F7FA' }}>Live Market Overview</h1>
      </SlideIn>

      {/* Market Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14, marginBottom: 30 }}>
        {Object.entries(prices).slice(0, 12).map(([symbol, data]: any, index) => {
          const change = data?.change || 0
          const price = data?.price || 0
          const isPos = change >= 0
          return (
            <AnimatedCard key={symbol} delay={0.05 * index}>
              <div 
                style={{
                  background: 'rgba(16,24,38,0.7)',
                  border: '1px solid rgba(0,229,212,0.08)',
                  borderRadius: 12,
                  padding: 16,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.background = 'rgba(16,24,38,0.9)'
                  ;(e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(0,229,212,0.2)'
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.background = 'rgba(16,24,38,0.7)'
                  ;(e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(0,229,212,0.08)'
                }}
                onClick={() => window.location.href = `/coin/${symbol}`}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ fontWeight: 600, color: '#F5F7FA' }}>{symbol.replace('USDT', '')}</div>
                  <div style={{ color: isPos ? '#00E5A0' : '#FF4757', fontSize: 13 }}>
                    {isPos ? '+' : ''}{change.toFixed(2)}%
                  </div>
                </div>
                <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', color: '#00E5D4', marginBottom: 8 }}>
                  ${fmt(price)}
                </div>
                <Sparkline data={genSpark(change, price)} color={isPos ? '#00E5A0' : '#FF4757'} />
              </div>
            </AnimatedCard>
          )
        })}
      </div>

      {/* Professional Order Book */}
      <AnimatedCard delay={0.2}>
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-[#00E5D4] mb-4">Professional Order Book — BTCUSDT</h2>
          <ProfessionalOrderBook symbol="BTCUSDT" levels={20} />
        </div>
      </AnimatedCard>

      {/* HFT Analytics */}
      <AnimatedCard delay={0.25}>
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-[#00E5D4] mb-4">HFT Analytics — BTCUSDT</h2>
          <HFTAnalytics symbol="BTCUSDT" />
        </div>
      </AnimatedCard>

      {/* Advanced Chart */}
      <AnimatedCard delay={0.3}>
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-[#00E5D4] mb-4">Advanced Chart</h2>
          <AdvancedTradingChart symbol="BTCUSDT" />
        </div>
      </AnimatedCard>

      {/* Footer */}
      <AnimatedCard delay={0.35}>
        <div style={{ marginTop: 30, padding: '12px 16px', background: 'rgba(16,24,38,0.6)', borderRadius: 10, textAlign: 'center', color: '#8FA3B8', fontSize: 13 }}>
          {isConnected ? 'WebSocket подключён — данные обновляются в реальном времени' : 'Подключение к Binance...'}
        </div>
      </AnimatedCard>
    </div>
  )
}
