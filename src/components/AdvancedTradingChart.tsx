'use client'
import { useEffect, useRef, useState } from 'react'
import { createChart, ColorType, LineStyle } from 'lightweight-charts'
import { useMarketStore } from '@/store/marketStore'

interface AdvancedTradingChartProps {
  symbol: string
  height?: number
}

export default function AdvancedTradingChart({ symbol = 'BTCUSDT', height = 500 }: AdvancedTradingChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<any>(null)
  const candlestickRef = useRef<any>(null)
  const volumeRef = useRef<any>(null)
  const [timeframe, setTimeframe] = useState<'1m' | '5m' | '15m' | '1h' | '4h' | '1d'>('1h')
  
  const timeframes = ['1m', '5m', '15m', '1h', '4h', '1d']

  useEffect(() => {
    if (!containerRef.current) return

    // Create chart
    const chart = createChart(containerRef.current, {
      layout: {
        background: { color: '#070B12' },
        textColor: '#F5F7FA',
        fontFamily: 'Space Grotesk, sans-serif',
      },
      width: containerRef.current.clientWidth,
      height: height,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
      grid: {
        horzLines: { color: '#1A2636', visible: true },
        vertLines: { color: '#1A2636', visible: true },
      },
    })

    chartRef.current = chart

    // Create candlestick series
    const candlestickSeries = (chart as any).addCandlestickSeries({
      upColor: '#00E5A0',
      downColor: '#FF4757',
      borderUpColor: '#00E5A0',
      borderDownColor: '#FF4757',
      wickUpColor: '#00E5A0',
      wickDownColor: '#FF4757',
    })

    candlestickRef.current = candlestickSeries

    // Create volume series
    const volumeSeries = (chart as any).addHistogramSeries({
      color: '#00E5D4',
      title: 'Volume',
    })

    volumeRef.current = volumeSeries

    // Mock data for demonstration
    const mockCandles = [
      { time: '2024-01-01', open: 62000, high: 62500, low: 61500, close: 62200 },
      { time: '2024-01-02', open: 62200, high: 63000, low: 62000, close: 62800 },
      { time: '2024-01-03', open: 62800, high: 63200, low: 62500, close: 63000 },
      { time: '2024-01-04', open: 63000, high: 63500, low: 62700, close: 63200 },
      { time: '2024-01-05', open: 63200, high: 64000, low: 63000, close: 63800 },
    ]

    const mockVolume = mockCandles.map(c => ({
      time: c.time,
      value: Math.random() * 1000000,
      color: c.close > c.open ? '#00E5A0' : '#FF4757',
    }))

    candlestickSeries.setData(mockCandles)
    volumeSeries.setData(mockVolume)

    // Add indicators
    // EMA (Exponential Moving Average)
    const emaLine = (chart as any).addLineSeries({
      color: '#00E5D4',
      lineWidth: 2,
      title: 'EMA 20',
      lineStyle: LineStyle.Dashed,
    })

    const emaData = mockCandles.map((c, i) => ({
      time: c.time,
      value: c.close - 200 + (i * 50),
    }))

    emaLine.setData(emaData)

    // VWAP line
    const vwapLine = (chart as any).addLineSeries({
      color: '#FFA502',
      lineWidth: 1.5,
      title: 'VWAP',
    })

    const vwapData = mockCandles.map((c, i) => ({
      time: c.time,
      value: c.close - 100 + (i * 30),
    }))

    vwapLine.setData(vwapData)

    // Fit content
    chart.timeScale().fitContent()

    // Handle resize
    const handleResize = () => {
      if (containerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: containerRef.current.clientWidth,
        })
      }
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chart.remove()
    }
  }, [symbol, height])

  return (
    <div className="rounded-2xl bg-surface border border-accent border-opacity-10 overflow-hidden">
      {/* Controls */}
      <div className="flex justify-between items-center p-4 bg-surface-hover border-b border-accent border-opacity-10">
        <h2 className="text-lg font-semibold text-accent">{symbol} Chart</h2>
        
        <div className="flex gap-2">
          {timeframes.map((tf: any) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                timeframe === tf
                  ? 'bg-accent text-background'
                  : 'bg-surface text-text-secondary hover:bg-surface-hover'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
        
        <div className="flex gap-2">
          <button className="px-3 py-1 rounded bg-surface-hover text-text-secondary hover:bg-secondary transition text-xs">
            📊 Indicators
          </button>
          <button className="px-3 py-1 rounded bg-surface-hover text-text-secondary hover:bg-secondary transition text-xs">
            ↗️ Fullscreen
          </button>
        </div>
      </div>

      {/* Chart */}
      <div ref={containerRef} style={{ height: `${height}px` }} />

      {/* Legend */}
      <div className="grid grid-cols-4 gap-4 p-4 bg-surface-hover border-t border-accent border-opacity-10 text-xs">
        <div>
          <span className="text-text-secondary">EMA 20:</span>
          <span className="text-accent ml-2">█ Dashed</span>
        </div>
        <div>
          <span className="text-text-secondary">VWAP:</span>
          <span className="text-warning ml-2">█ Orange</span>
        </div>
        <div>
          <span className="text-text-secondary">Volume:</span>
          <span className="text-accent ml-2">█ Green/Red</span>
        </div>
        <div>
          <span className="text-text-secondary">Timeframe:</span>
          <span className="text-text-primary ml-2">{timeframe}</span>
        </div>
      </div>
    </div>
  )
}
