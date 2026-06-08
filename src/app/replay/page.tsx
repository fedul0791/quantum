'use client'
import { useState, useEffect } from 'react'
import { AnimatedCard } from '@/lib/animations'

interface HistoricalCandle {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export default function ReplayPage() {
  const [symbol, setSymbol] = useState('BTCUSDT')
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [candles, setCandles] = useState<HistoricalCandle[]>([
    { time: 1704067200, open: 62000, high: 62500, low: 61500, close: 62200, volume: 1200 },
    { time: 1704153600, open: 62200, high: 63000, low: 62000, close: 62800, volume: 1400 },
    { time: 1704240000, open: 62800, high: 63200, low: 62500, close: 63000, volume: 1100 },
    { time: 1704326400, open: 63000, high: 63500, low: 62700, close: 63200, volume: 1300 },
    { time: 1704412800, open: 63200, high: 64000, low: 63000, close: 63800, volume: 1600 },
  ])

  useEffect(() => {
    if (!isPlaying) return

    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % candles.length)
    }, 1000 / speed)

    return () => clearInterval(interval)
  }, [isPlaying, speed, candles.length])

  const currentCandle = candles[currentIndex]
  const progress = ((currentIndex + 1) / candles.length) * 100

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString('en-US')
  }

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <AnimatedCard delay={0}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: '#F5F7FA', marginBottom: 16 }}>
            Historical Replay Mode
          </h1>
          <p style={{ color: '#8FA3B8', fontSize: 14 }}>Playback historical market data and analyze microstructure</p>
        </div>
      </AnimatedCard>

      {/* Controls */}
      <AnimatedCard delay={0.05}>
        <div style={{ background: 'rgba(16,24,38,0.6)', border: '1px solid rgba(0,229,212,0.1)', borderRadius: 12, padding: 20, marginBottom: 24 }}>
          {/* Symbol Selector */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ color: '#8FA3B8', fontSize: 12, marginBottom: 8, display: 'block' }}>Symbol</label>
            <select
              value={symbol}
              onChange={(e) => {
                setSymbol(e.target.value)
                setCurrentIndex(0)
                setIsPlaying(false)
              }}
              style={{
                width: '100%',
                maxWidth: 200,
                padding: '8px 12px',
                background: 'rgba(7, 11, 18, 0.5)',
                border: '1px solid rgba(0,229,212,0.2)',
                borderRadius: 6,
                color: '#F5F7FA',
                fontSize: 12,
              }}
            >
              {['BTCUSDT', 'ETHUSDT', 'SOLUSDT'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>

          {/* Timeline */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#8FA3B8', fontSize: 12 }}>Timeline</span>
              <span style={{ color: '#00E5D4', fontSize: 12 }}>
                {currentIndex + 1} / {candles.length}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={candles.length - 1}
              value={currentIndex}
              onChange={(e) => {
                setCurrentIndex(parseInt(e.target.value))
                setIsPlaying(false)
              }}
              style={{
                width: '100%',
                cursor: 'pointer',
              }}
            />
            <div style={{
              height: 3,
              background: 'rgba(0,229,212,0.1)',
              borderRadius: 2,
              marginTop: 8,
              overflow: 'hidden',
            }}>
              <div style={{
                height: '100%',
                background: 'linear-gradient(90deg, #00E5D4, #00E5A0)',
                width: `${progress}%`,
                transition: 'width 0.2s',
              }} />
            </div>
          </div>

          {/* Playback Controls */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 20 }}>
            <button
              onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
              style={{
                padding: '10px 12px',
                background: 'rgba(0,229,212,0.1)',
                border: '1px solid rgba(0,229,212,0.2)',
                borderRadius: 6,
                color: '#00E5D4',
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              ⏮ Step Back
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              style={{
                padding: '10px 20px',
                background: isPlaying ? 'rgba(255, 71, 87, 0.1)' : 'rgba(0,229,212,0.1)',
                border: isPlaying ? '1px solid rgba(255, 71, 87, 0.3)' : '1px solid rgba(0,229,212,0.2)',
                borderRadius: 6,
                color: isPlaying ? '#FF4757' : '#00E5D4',
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 600,
                flex: 1,
              }}
            >
              {isPlaying ? '⏸ Pause' : '▶ Play'}
            </button>

            <button
              onClick={() => setCurrentIndex(Math.min(candles.length - 1, currentIndex + 1))}
              style={{
                padding: '10px 12px',
                background: 'rgba(0,229,212,0.1)',
                border: '1px solid rgba(0,229,212,0.2)',
                borderRadius: 6,
                color: '#00E5D4',
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              Step Forward ⏭
            </button>
          </div>

          {/* Speed Control */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ color: '#8FA3B8', fontSize: 12 }}>Speed:</span>
            {[0.5, 1, 2, 4].map(s => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                style={{
                  padding: '6px 12px',
                  background: speed === s ? 'rgba(0,229,212,0.2)' : 'rgba(0,229,212,0.05)',
                  border: `1px solid ${speed === s ? 'rgba(0,229,212,0.3)' : 'rgba(0,229,212,0.1)'}`,
                  borderRadius: 4,
                  color: speed === s ? '#00E5D4' : '#8FA3B8',
                  cursor: 'pointer',
                  fontSize: 11,
                  fontWeight: 500,
                }}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </AnimatedCard>

      {/* Current Candle Data */}
      {currentCandle && (
        <AnimatedCard delay={0.1}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: '#00E5D4', marginBottom: 16 }}>
              {symbol} — {formatDate(currentCandle.time)}
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
              <div style={{ background: 'rgba(16,24,38,0.5)', padding: 16, borderRadius: 8 }}>
                <div style={{ color: '#8FA3B8', fontSize: 12, marginBottom: 8 }}>Open</div>
                <div style={{ color: '#F5F7FA', fontSize: 18, fontWeight: 700, fontFamily: 'monospace' }}>
                  ${currentCandle.open.toFixed(2)}
                </div>
              </div>

              <div style={{ background: 'rgba(16,24,38,0.5)', padding: 16, borderRadius: 8 }}>
                <div style={{ color: '#8FA3B8', fontSize: 12, marginBottom: 8 }}>High</div>
                <div style={{ color: '#00E5A0', fontSize: 18, fontWeight: 700, fontFamily: 'monospace' }}>
                  ${currentCandle.high.toFixed(2)}
                </div>
              </div>

              <div style={{ background: 'rgba(16,24,38,0.5)', padding: 16, borderRadius: 8 }}>
                <div style={{ color: '#8FA3B8', fontSize: 12, marginBottom: 8 }}>Low</div>
                <div style={{ color: '#FF4757', fontSize: 18, fontWeight: 700, fontFamily: 'monospace' }}>
                  ${currentCandle.low.toFixed(2)}
                </div>
              </div>

              <div style={{ background: 'rgba(16,24,38,0.5)', padding: 16, borderRadius: 8 }}>
                <div style={{ color: '#8FA3B8', fontSize: 12, marginBottom: 8 }}>Close</div>
                <div style={{ color: '#00E5D4', fontSize: 18, fontWeight: 700, fontFamily: 'monospace' }}>
                  ${currentCandle.close.toFixed(2)}
                </div>
              </div>

              <div style={{ background: 'rgba(16,24,38,0.5)', padding: 16, borderRadius: 8 }}>
                <div style={{ color: '#8FA3B8', fontSize: 12, marginBottom: 8 }}>Volume</div>
                <div style={{ color: '#FFA502', fontSize: 18, fontWeight: 700 }}>
                  {currentCandle.volume}
                </div>
              </div>

              <div style={{ background: 'rgba(16,24,38,0.5)', padding: 16, borderRadius: 8 }}>
                <div style={{ color: '#8FA3B8', fontSize: 12, marginBottom: 8 }}>Change</div>
                <div style={{
                  color: currentCandle.close >= currentCandle.open ? '#00E5A0' : '#FF4757',
                  fontSize: 18,
                  fontWeight: 700,
                }}>
                  {((currentCandle.close - currentCandle.open) / currentCandle.open * 100).toFixed(2)}%
                </div>
              </div>
            </div>
          </div>
        </AnimatedCard>
      )}
    </div>
  )
}
