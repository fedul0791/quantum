'use client'
import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createChart, ColorType, CrosshairMode, LineStyle } from 'lightweight-charts'

// ==================== Форматирование ====================
function fmtPrice(p: number) {
  if (p >= 1000) return p.toLocaleString('en-US', { maximumFractionDigits: 0 })
  if (p >= 1) return p.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return p.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 })
}

// ==================== Стакан с визуализацией ====================
function OrderBookDepth({ symbol }: { symbol: string }) {
  const [bids, setBids] = useState<[number, number][]>([])
  const [asks, setAsks] = useState<[number, number][]>([])
  const [spread, setSpread] = useState(0)
  const [mid, setMid] = useState(0)
  const maxTotal = Math.max(
    bids.reduce((s, b) => s + b[1], 0),
    asks.reduce((s, a) => s + a[1], 0)
  )

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch(`/api/orderbook?symbol=${symbol}`)
        const data = await res.json()
        if (cancelled || !data.bids) return
        const b: [number, number][] = data.bids.slice(0, 15).map(([p, q]: string[]) => [parseFloat(p), parseFloat(q)])
        const a: [number, number][] = data.asks.slice(0, 15).map(([p, q]: string[]) => [parseFloat(p), parseFloat(q)]).reverse()
        setBids(b)
        setAsks(a)
        setSpread(parseFloat((a[0][0] - b[0][0]).toFixed(2)))
        setMid(parseFloat(((b[0][0] + a[0][0]) / 2).toFixed(2)))
      } catch (e) {}
    }
    load()
    const interval = setInterval(load, 2000)
    return () => { cancelled = true; clearInterval(interval) }
  }, [symbol])

  return (
    <div style={{ background: 'rgba(16,24,38,0.7)', border: '1px solid rgba(0,229,212,0.08)', borderRadius: 12, padding: 14 }}>
      <div style={{ color: '#8FA3B8', fontSize: 12, fontWeight: 600, marginBottom: 10 }}>Order Book</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', fontSize: 10, color: '#5C728A', marginBottom: 6 }}>
        <span>Price</span><span style={{ textAlign: 'right' }}>Size</span><span style={{ textAlign: 'right' }}>Total</span>
      </div>
      {asks.map((a, i) => {
        const cumTotal = asks.slice(0, i + 1).reduce((s, x) => s + x[1], 0)
        const depthPct = maxTotal > 0 ? (cumTotal / maxTotal) * 100 : 0
        return (
          <div key={`a-${i}`} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', fontSize: 11, padding: '2px 0', position: 'relative' }}>
            <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: `${depthPct}%`, background: 'rgba(255,71,87,0.06)', transition: 'width 0.3s' }} />
            <span style={{ color: '#FF4757', fontFamily: 'JetBrains Mono, monospace', position: 'relative' }}>{fmtPrice(a[0])}</span>
            <span style={{ color: '#8FA3B8', fontFamily: 'JetBrains Mono, monospace', textAlign: 'right', position: 'relative' }}>{a[1].toFixed(4)}</span>
            <span style={{ color: '#5C728A', fontFamily: 'JetBrains Mono, monospace', textAlign: 'right', position: 'relative' }}>{cumTotal.toFixed(4)}</span>
          </div>
        )
      })}
      <div style={{ textAlign: 'center', padding: '6px 0', borderTop: '1px solid rgba(0,229,212,0.2)', borderBottom: '1px solid rgba(0,229,212,0.2)', margin: '4px 0' }}>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 15, fontWeight: 700, color: '#00E5D4' }}>{fmtPrice(mid)}</span>
        <span style={{ color: '#5C728A', fontSize: 10, marginLeft: 8 }}>Spread: {spread} ({(spread / mid * 100).toFixed(3)}%)</span>
      </div>
      {bids.map((b, i) => {
        const cumTotal = bids.slice(0, i + 1).reduce((s, x) => s + x[1], 0)
        const depthPct = maxTotal > 0 ? (cumTotal / maxTotal) * 100 : 0
        return (
          <div key={`b-${i}`} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', fontSize: 11, padding: '2px 0', position: 'relative' }}>
            <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: `${depthPct}%`, background: 'rgba(0,229,160,0.06)', transition: 'width 0.3s' }} />
            <span style={{ color: '#00E5A0', fontFamily: 'JetBrains Mono, monospace', position: 'relative' }}>{fmtPrice(b[0])}</span>
            <span style={{ color: '#8FA3B8', fontFamily: 'JetBrains Mono, monospace', textAlign: 'right', position: 'relative' }}>{b[1].toFixed(4)}</span>
            <span style={{ color: '#5C728A', fontFamily: 'JetBrains Mono, monospace', textAlign: 'right', position: 'relative' }}>{cumTotal.toFixed(4)}</span>
          </div>
        )
      })}
    </div>
  )
}

// ==================== HFT панель ====================
function HFTPanel({ symbol }: { symbol: string }) {
  const [metrics, setMetrics] = useState<any>(null)
  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch(`/api/hft?symbol=${symbol}`)
        const data = await res.json()
        if (!cancelled && !data.error) setMetrics(data)
      } catch (e) {}
    }
    load()
    const interval = setInterval(load, 3000)
    return () => { cancelled = true; clearInterval(interval) }
  }, [symbol])

  if (!metrics) return <div style={{ color: '#5C728A', fontSize: 13, padding: 20, textAlign: 'center' }}>Loading HFT indicators...</div>

  const m = metrics
  return (
    <div style={{ background: 'rgba(16,24,38,0.7)', border: '1px solid rgba(0,229,212,0.08)', borderRadius: 12, padding: 14 }}>
      <div style={{ color: '#8FA3B8', fontSize: 12, fontWeight: 600, marginBottom: 12 }}>HFT Indicators</div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <div style={{ color: '#5C728A', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Order Flow Imbalance</div>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 16, fontWeight: 600, color: m.orderFlowImbalance.pressure === 'buy' ? '#00E5A0' : m.orderFlowImbalance.pressure === 'sell' ? '#FF4757' : '#FFA502' }}>
            {m.orderFlowImbalance.current.toFixed(3)} <span style={{ fontSize: 10, textTransform: 'uppercase' }}>{m.orderFlowImbalance.pressure}</span>
          </div>
        </div>
        <div>
          <div style={{ color: '#5C728A', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Microprice</div>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 16, fontWeight: 600, color: '#00E5D4' }}>
            {m.microprice.value.toFixed(2)} <span style={{ fontSize: 10, color: '#8FA3B8' }}>{m.microprice.deviationPercent >= 0 ? '+' : ''}{m.microprice.deviationPercent.toFixed(3)}%</span>
          </div>
        </div>
        <div>
          <div style={{ color: '#5C728A', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Queue Imbalance</div>
          <div style={{ display: 'flex', gap: 16, fontSize: 12, fontFamily: 'JetBrains Mono, monospace' }}>
            <span style={{ color: m.queueImbalance.level1 > 0 ? '#00E5A0' : '#FF4757' }}>L1 {m.queueImbalance.level1.toFixed(3)}</span>
            <span style={{ color: m.queueImbalance.level5 > 0 ? '#00E5A0' : '#FF4757' }}>L5 {m.queueImbalance.level5.toFixed(3)}</span>
            <span style={{ color: m.queueImbalance.level10 > 0 ? '#00E5A0' : '#FF4757' }}>L10 {m.queueImbalance.level10.toFixed(3)}</span>
          </div>
        </div>
        <div>
          <div style={{ color: '#5C728A', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Trade Flow</div>
          <div style={{ display: 'flex', gap: 16, fontSize: 12, fontFamily: 'JetBrains Mono, monospace' }}>
            <span style={{ color: '#00E5A0' }}>Buy {m.tradeFlow.aggressiveBidVolume.toFixed(0)}</span>
            <span style={{ color: '#FF4757' }}>Sell {m.tradeFlow.aggressiveAskVolume.toFixed(0)}</span>
          </div>
        </div>
        <div>
          <div style={{ color: '#5C728A', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Realized Volatility</div>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 14, fontWeight: 600, color: '#8B5CF6' }}>
            10s: {m.realizedVolatility.window10s.toFixed(3)}% | 30s: {m.realizedVolatility.window30s.toFixed(3)}% | 60s: {m.realizedVolatility.window60s.toFixed(3)}%
          </div>
        </div>
        <div>
          <div style={{ color: '#5C728A', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Fill Probability</div>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 16, fontWeight: 600, color: '#00E5D4' }}>
            {m.fillProbability.bidFillProb}% <span style={{ fontSize: 10, color: '#5C728A' }}>confidence {m.fillProbability.confidence}%</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ==================== Основной компонент ====================
const timeframes = [
  { label: '1m', value: '1m' },
  { label: '5m', value: '5m' },
  { label: '15m', value: '15m' },
  { label: '1h', value: '1h' },
  { label: '4h', value: '4h' },
  { label: '1d', value: '1d' },
  { label: '1w', value: '1w' },
]

export default function CoinPage() {
  const params = useParams()
  const router = useRouter()
  const symbol = (params?.symbol as string) || 'BTCUSDT'
  const [ticker, setTicker] = useState<any>(null)
  const [interval, setInterval] = useState('1h')
  const [loading, setLoading] = useState(true)
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<any>(null)
  const candleRef = useRef<any>(null)
  const volumeRef = useRef<any>(null)

  // Загрузка тикера
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/binance')
        const all = await res.json()
        if (Array.isArray(all)) {
          const found = all.find((t: any) => t.symbol === symbol)
          if (found) setTicker(found)
        }
      } catch (e) {} finally { setLoading(false) }
    })()
  }, [symbol])

  // График
  useEffect(() => {
    if (!chartContainerRef.current) return
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 450,
      layout: { background: { type: ColorType.Solid, color: 'transparent' }, textColor: '#8FA3B8' },
      grid: { vertLines: { color: 'rgba(30,43,61,0.3)' }, horzLines: { color: 'rgba(30,43,61,0.3)' } },
      crosshair: { mode: CrosshairMode.Normal, vertLine: { color: 'rgba(0,229,212,0.4)', width: 1, style: LineStyle.Dashed }, horzLine: { color: 'rgba(0,229,212,0.4)', width: 1, style: LineStyle.Dashed } },
      rightPriceScale: { borderColor: 'rgba(30,43,61,0.5)', scaleMargins: { top: 0.1, bottom: 0.2 } },
      timeScale: { borderColor: 'rgba(30,43,61,0.5)', timeVisible: true, fixLeftEdge: true, fixRightEdge: true, barSpacing: 12 },
      handleScroll: { vertTouchDrag: false },
    })

    const candleSeries = (chart as any).addCandlestickSeries({
      upColor: '#00E5A0', downColor: '#FF4757',
      borderUpColor: '#00E5A0', borderDownColor: '#FF4757',
      wickUpColor: '#00E5A0', wickDownColor: '#FF4757',
    })
    const volumeSeries = (chart as any).addHistogramSeries({
      color: 'rgba(0,229,212,0.3)',
      priceFormat: { type: 'volume' },
      priceScaleId: '',
    })
    volumeSeries.priceScale().applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } })

    chartRef.current = chart
    candleRef.current = candleSeries
    volumeRef.current = volumeSeries

    const handleResize = () => {
      if (chartContainerRef.current) chart.applyOptions({ width: chartContainerRef.current.clientWidth })
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chart.remove()
    }
  }, [])

  // Загрузка данных графика
  useEffect(() => {
    if (!candleRef.current) return
    (async () => {
      try {
        const res = await fetch(`/api/klines?symbol=${symbol}&interval=${interval}&limit=300`)
        const data = await res.json()
        if (!Array.isArray(data)) return
        const candleData = data.map((d: any) => ({
          time: d[0] / 1000,
          open: parseFloat(d[1]), high: parseFloat(d[2]),
          low: parseFloat(d[3]), close: parseFloat(d[4]),
        }))
        const volumeData = data.map((d: any) => ({
          time: d[0] / 1000,
          value: parseFloat(d[5]),
          color: parseFloat(d[4]) >= parseFloat(d[1]) ? 'rgba(0,229,160,0.3)' : 'rgba(255,71,87,0.3)',
        }))
        candleRef.current.setData(candleData)
        volumeRef.current.setData(volumeData)
      } catch (e) {}
    })()
  }, [symbol, interval])

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#FFA502' }}>Loading...</div>
  if (!ticker) return <div style={{ padding: 40, textAlign: 'center', color: '#FF4757' }}>Asset not found</div>

  const price = parseFloat(ticker.lastPrice)
  const change = parseFloat(ticker.priceChangePercent)
  const isPos = change >= 0

  return (
    <div style={{ padding: 24, maxWidth: 1300, margin: '0 auto' }}>
      {/* Верхняя строка */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: '1px solid rgba(0,229,212,0.2)', color: '#00E5D4', padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 12 }}>← Назад</button>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{ background: 'rgba(0,229,212,0.08)', border: '1px solid rgba(0,229,212,0.2)', color: '#00E5D4', padding: '6px 14px', borderRadius: 8, fontSize: 12, cursor: 'pointer' }}>★ Save</button>
          <button style={{ background: 'rgba(0,229,212,0.08)', border: '1px solid rgba(0,229,212,0.2)', color: '#00E5D4', padding: '6px 14px', borderRadius: 8, fontSize: 12, cursor: 'pointer' }}>⚡ Alert</button>
        </div>
      </div>

      {/* Тикер */}
      <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#F5F7FA', fontSize: 28, margin: 0 }}>
        {symbol.replace('USDT','')} <span style={{ color: '#00E5D4' }}>/ USDT</span>
      </h1>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginTop: 8, flexWrap: 'wrap' }}>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 34, fontWeight: 700, color: '#00E5D4' }}>${fmtPrice(price)}</span>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 20, fontWeight: 600, color: isPos ? '#00E5A0' : '#FF4757' }}>{isPos ? '+' : ''}{change.toFixed(2)}%</span>
        <span style={{ color: '#8FA3B8', fontSize: 13 }}>24h</span>
        <span style={{ color: '#5C728A', fontSize: 12 }}>H: {ticker.highPrice} L: {ticker.lowPrice} Vol: {parseFloat(ticker.quoteVolume).toLocaleString()}</span>
      </div>

      {/* Таймфреймы */}
      <div style={{ display: 'flex', gap: 6, marginTop: 20, marginBottom: 12 }}>
        {timeframes.map(tf => (
          <button key={tf.value} onClick={() => setInterval(tf.value)} style={{
            background: interval === tf.value ? 'rgba(0,229,212,0.12)' : 'transparent',
            color: interval === tf.value ? '#00E5D4' : '#5C728A',
            border: interval === tf.value ? '1px solid rgba(0,229,212,0.3)' : '1px solid transparent',
            padding: '5px 12px', borderRadius: 6, fontSize: 11, cursor: 'pointer',
            fontFamily: 'JetBrains Mono, monospace', fontWeight: 600
          }}>{tf.label}</button>
        ))}
      </div>

      {/* График */}
      <div ref={chartContainerRef} style={{ width: '100%', height: 450, background: 'rgba(16,24,38,0.7)', border: '1px solid rgba(0,229,212,0.08)', borderRadius: 14, overflow: 'hidden', marginBottom: 24 }} />

      {/* Стакан + HFT */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <OrderBookDepth symbol={symbol} />
        <HFTPanel symbol={symbol} />
      </div>
    </div>
  )
}
