'use client'
import { useState, useEffect, useRef } from 'react'

export default function ReplayPage() {
  const [symbol, setSymbol] = useState('BTCUSDT')
  const [trades, setTrades] = useState<any[]>([])
  const [orderbooks, setOrderbooks] = useState<any[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [timeRange, setTimeRange] = useState<any>(null)
  const playRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    fetchData()
  }, [symbol])

  useEffect(() => {
    if (isPlaying && trades.length > 0) {
      playRef.current = setInterval(() => {
        setCurrentIndex(prev => {
          if (prev + 1 >= trades.length) {
            setIsPlaying(false)
            return prev
          }
          return prev + 1
        })
      }, 500 / speed)
    }

    return () => {
      if (playRef.current) clearInterval(playRef.current)
    }
  }, [isPlaying, speed, trades.length])

  const fetchData = async () => {
    try {
      const [tradesRes, orderbooksRes, timeRangeRes] = await Promise.all([
        fetch(`/api/replay/historical-trades?symbol=${symbol}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
        }),
        fetch(`/api/replay/historical-orderbook?symbol=${symbol}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
        }),
        fetch(`/api/replay/time-range?symbol=${symbol}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
        }),
      ])

      if (tradesRes.ok) {
        const tradesData = await tradesRes.json()
        setTrades(tradesData)
      }

      if (orderbooksRes.ok) {
        const obData = await orderbooksRes.json()
        setOrderbooks(obData)
      }

      if (timeRangeRes.ok) {
        const trData = await timeRangeRes.json()
        setTimeRange(trData)
      }

      setCurrentIndex(0)
    } catch (error) {
      console.error('Failed to fetch replay data:', error)
    }
  }

  const currentTrade = trades[currentIndex]
  const currentOB = orderbooks[Math.floor((currentIndex / trades.length) * orderbooks.length)]

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-accent">Market Replay</h1>
        <div className="flex gap-2">
          {['BTCUSDT', 'ETHUSDT', 'SOLUSDT'].map(sym => (
            <button
              key={sym}
              onClick={() => setSymbol(sym)}
              className={`px-4 py-2 rounded font-semibold transition ${
                symbol === sym
                  ? 'bg-accent text-background'
                  : 'bg-surface text-text-secondary hover:bg-surface-hover'
              }`}
            >
              {sym.replace('USDT', '')}
            </button>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-surface rounded-2xl border border-accent border-opacity-10 p-6">
        <div className="space-y-4">
          {/* Playback Controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-4 py-2 bg-accent text-background rounded font-semibold hover:bg-accent-hover transition"
            >
              {isPlaying ? '⏸ Pause' : '▶ Play'}
            </button>

            <button
              onClick={() => setCurrentIndex(0)}
              className="px-4 py-2 bg-surface-hover rounded border border-accent border-opacity-20 text-text-secondary hover:bg-secondary transition"
            >
              ⏮ Start
            </button>

            <button
              onClick={() => setCurrentIndex(Math.max(0, currentIndex - 10))}
              className="px-4 py-2 bg-surface-hover rounded border border-accent border-opacity-20 text-text-secondary hover:bg-secondary transition"
            >
              ⏪ -10s
            </button>

            <button
              onClick={() => setCurrentIndex(Math.min(trades.length - 1, currentIndex + 10))}
              className="px-4 py-2 bg-surface-hover rounded border border-accent border-opacity-20 text-text-secondary hover:bg-secondary transition"
            >
              ⏩ +10s
            </button>

            <div className="flex items-center gap-2 ml-auto">
              <label className="text-sm text-text-secondary">Speed:</label>
              <select
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="px-3 py-2 bg-surface-hover rounded border border-accent border-opacity-20 text-text-primary text-sm"
              >
                <option value={0.5}>0.5x</option>
                <option value={1}>1x</option>
                <option value={2}>2x</option>
                <option value={4}>4x</option>
              </select>
            </div>
          </div>

          {/* Timeline */}
          <div>
            <input
              type="range"
              min="0"
              max={Math.max(0, trades.length - 1)}
              value={currentIndex}
              onChange={(e) => setCurrentIndex(Number(e.target.value))}
              className="w-full h-2 bg-surface-hover rounded appearance-none cursor-pointer accent-accent"
            />
            <div className="flex justify-between text-xs text-text-secondary mt-2">
              <span>{currentIndex} / {trades.length}</span>
              <span>
                {timeRange?.start_time && new Date(trades[currentIndex]?.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Data Display */}
      <div className="grid grid-cols-2 gap-6">
        {/* Current Trade */}
        <div className="rounded-2xl bg-surface border border-accent border-opacity-10 p-6">
          <h2 className="text-lg font-semibold text-accent mb-4">Current Trade</h2>
          {currentTrade ? (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-text-secondary">Price</span>
                <span className="font-mono font-bold text-accent">${currentTrade.price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Quantity</span>
                <span className="font-mono font-bold text-text-primary">{currentTrade.quantity.toFixed(4)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Direction</span>
                <span className={`font-bold ${currentTrade.is_buyer_maker ? 'text-danger' : 'text-success'}`}>
                  {currentTrade.is_buyer_maker ? '📉 Sell' : '📈 Buy'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Timestamp</span>
                <span className="font-mono text-xs text-text-muted">
                  {new Date(currentTrade.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center text-text-secondary">No trades available</div>
          )}
        </div>

        {/* Current Order Book */}
        <div className="rounded-2xl bg-surface border border-accent border-opacity-10 p-6">
          <h2 className="text-lg font-semibold text-accent mb-4">Order Book Snapshot</h2>
          {currentOB ? (
            <div className="space-y-3">
              <div>
                <div className="text-xs text-text-secondary mb-1">Best Bid</div>
                <div className="font-mono font-bold text-success">
                  ${currentOB.bids[0]?.[0].toFixed(2) || '—'}
                </div>
              </div>
              <div>
                <div className="text-xs text-text-secondary mb-1">Best Ask</div>
                <div className="font-mono font-bold text-danger">
                  ${currentOB.asks[0]?.[0].toFixed(2) || '—'}
                </div>
              </div>
              <div>
                <div className="text-xs text-text-secondary mb-1">Spread</div>
                <div className="font-mono font-bold text-warning">
                  {currentOB.spread?.toFixed(4) || '—'}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-text-secondary">No order book data</div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="text-center text-xs text-text-muted">
        Replay Mode — {trades.length} trades loaded • Speed {speed}x • {Math.round((currentIndex / trades.length) * 100)}% complete
      </div>
    </div>
  )
}
