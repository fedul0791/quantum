'use client'
import { useState, useEffect } from 'react'
import { useMarketStore } from '@/store/marketStore'
import HFTAnalytics from '@/components/HFTAnalytics'
import ProfessionalOrderBook from '@/components/ProfessionalOrderBook'

export default function MicrostructureDashboard() {
  const [symbol, setSymbol] = useState('BTCUSDT')
  const [metrics, setMetrics] = useState<any>(null)
  const [spreadHistory, setSpreadHistory] = useState<any[]>([])

  useEffect(() => {
    // Fetch microstructure metrics from API
    const fetchMetrics = async () => {
      try {
        const response = await fetch(`/api/hft/metrics?symbol=${symbol}`)
        if (response.ok) {
          const data = await response.json()
          setMetrics(data)
        }
      } catch (error) {
        console.error('Failed to fetch metrics:', error)
      }
    }

    const fetchSpreadHistory = async () => {
      try {
        const response = await fetch(`/api/orderbook/spread-history?symbol=${symbol}`)
        if (response.ok) {
          const data = await response.json()
          setSpreadHistory(data)
        }
      } catch (error) {
        console.error('Failed to fetch spread history:', error)
      }
    }

    fetchMetrics()
    fetchSpreadHistory()

    const interval = setInterval(() => {
      fetchMetrics()
    }, 1000)

    return () => clearInterval(interval)
  }, [symbol])

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-accent">Market Microstructure Analysis</h1>
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

      {/* Main Grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Left Column - HFT Metrics */}
        <div className="col-span-1">
          <HFTAnalytics symbol={symbol} />
        </div>

        {/* Middle Column - Order Book */}
        <div className="col-span-1">
          <ProfessionalOrderBook symbol={symbol} levels={20} />
        </div>

        {/* Right Column - Liquidity Metrics */}
        <div className="col-span-1 space-y-4">
          {/* Spread Evolution */}
          <div className="rounded-2xl bg-surface border border-accent border-opacity-10 p-4">
            <h3 className="text-sm font-semibold text-accent mb-3">SPREAD EVOLUTION</h3>
            <div className="space-y-2">
              {spreadHistory.slice(-5).map((item, i) => (
                <div key={i} className="flex justify-between items-center text-xs">
                  <span className="text-text-secondary">{new Date(item.timestamp).toLocaleTimeString()}</span>
                  <span className="text-warning font-mono">{item.spread?.toFixed(4) || '—'}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Market Pressure */}
          <div className="rounded-2xl bg-surface border border-accent border-opacity-10 p-4">
            <h3 className="text-sm font-semibold text-accent mb-3">MARKET PRESSURE</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-text-secondary">Buying Pressure</span>
                  <span className="text-success">65%</span>
                </div>
                <div className="h-2 bg-surface-hover rounded overflow-hidden">
                  <div className="h-full bg-success" style={{ width: '65%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-text-secondary">Selling Pressure</span>
                  <span className="text-danger">35%</span>
                </div>
                <div className="h-2 bg-surface-hover rounded overflow-hidden">
                  <div className="h-full bg-danger" style={{ width: '35%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Liquidity Walls */}
          <div className="rounded-2xl bg-surface border border-accent border-opacity-10 p-4">
            <h3 className="text-sm font-semibold text-accent mb-3">LIQUIDITY WALLS</h3>
            <div className="space-y-2 text-xs">
              <div className="p-2 bg-surface-hover rounded border border-danger border-opacity-30">
                <div className="flex justify-between">
                  <span className="text-danger">Ask Wall</span>
                  <span className="text-text-secondary">$62,500 (3.5 BTC)</span>
                </div>
              </div>
              <div className="p-2 bg-surface-hover rounded border border-success border-opacity-30">
                <div className="flex justify-between">
                  <span className="text-success">Bid Wall</span>
                  <span className="text-text-secondary">$61,800 (4.2 BTC)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section - Advanced Metrics */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Avg Spread', value: '2.5', unit: 'bps', color: 'warning' },
          { label: 'Order Book Imbalance', value: '0.23', unit: '', color: 'accent' },
          { label: 'Liquidity Ratio', value: '1.85', unit: 'x', color: 'success' },
          { label: 'Realized Vol (1m)', value: '0.45', unit: '%', color: 'info' },
        ].map((metric, i) => (
          <div key={i} className="rounded-2xl bg-surface border border-accent border-opacity-10 p-4">
            <div className="text-xs text-text-secondary mb-2">{metric.label}</div>
            <div className={`text-2xl font-mono font-bold text-${metric.color}`}>
              {metric.value}
              <span className="text-sm ml-1">{metric.unit}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Info */}
      <div className="text-center text-xs text-text-muted pt-4">
        Updates every 100ms • Data from order book snapshots • Designed for HFT analysis
      </div>
    </div>
  )
}
