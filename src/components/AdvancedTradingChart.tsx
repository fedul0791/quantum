'use client'
import { useEffect, useRef } from 'react'
import { createChart, ColorType } from 'lightweight-charts'

interface CandleData {
  time: number
  open: number
  high: number
  low: number
  close: number
}

interface BarData {
  time: number
  value: number
}

interface AdvancedTradingChartProps {
  title?: string
  symbol?: string
  data?: CandleData[]
  volume?: BarData[]
}

export function AdvancedTradingChart({
  title = 'Price Chart',
  symbol = 'BTC/USDT',
  data = [],
  volume = [],
}: AdvancedTradingChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<any>(null)

  useEffect(() => {
    if (!containerRef.current) return

    try {
      // Create chart with lightweight-charts
      const chart = createChart(containerRef.current, {
        layout: {
          textColor: '#d1d5db',
          background: { type: ColorType.Solid, color: 'rgba(7, 11, 18, 0.5)' },
        },
        width: containerRef.current.clientWidth,
        height: 400,
        timeScale: {
          timeVisible: true,
          secondsVisible: true,
          rightOffset: 12,
        },
        grid: {
          vertLines: { color: 'rgba(0, 229, 212, 0.05)' },
          hLines: { color: 'rgba(0, 229, 212, 0.05)' },
        },
      })

      chartRef.current = chart

      // Create candlestick series using correct API
      const candleSeries = chart.addCandlestickSeries({
        upColor: '#00E5D4',
        downColor: '#FF4757',
        borderUpColor: '#00E5D4',
        borderDownColor: '#FF4757',
        wickUpColor: '#00E5D4',
        wickDownColor: '#FF4757',
      })

      // Set data
      if (data && data.length > 0) {
        candleSeries.setData(data)
      } else {
        // Provide default mock data
        const mockData = [
          { time: 1000, open: 100, high: 110, low: 95, close: 105 },
          { time: 2000, open: 105, high: 115, low: 100, close: 110 },
          { time: 3000, open: 110, high: 120, low: 105, close: 115 },
        ]
        candleSeries.setData(mockData)
      }

      // Fit content
      chart.timeScale().fitContent()

      // Handle resize
      const handleResize = () => {
        if (containerRef.current && chartRef.current) {
          const width = containerRef.current.clientWidth
          chartRef.current.applyOptions({ width })
        }
      }

      window.addEventListener('resize', handleResize)

      return () => {
        window.removeEventListener('resize', handleResize)
        try {
          chart.remove()
        } catch (e) {
          console.error('Error removing chart:', e)
        }
      }
    } catch (error) {
      console.error('Chart initialization error:', error)
    }
  }, [data])

  return (
    <div
      style={{
        background: 'rgba(16, 24, 38, 0.4)',
        border: '1px solid rgba(0, 229, 212, 0.1)',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
      }}
    >
      <div style={{ marginBottom: 12 }}>
        <h3
          style={{
            color: '#F5F7FA',
            fontSize: 16,
            fontWeight: 600,
            margin: 0,
          }}
        >
          {title} — {symbol}
        </h3>
        <p
          style={{
            color: '#8FA3B8',
            fontSize: 12,
            margin: '4px 0 0 0',
          }}
        >
          Real-time OHLCV data
        </p>
      </div>

      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: 400,
          borderRadius: 8,
          background: 'rgba(7, 11, 18, 0.5)',
          border: '1px solid rgba(0, 229, 212, 0.05)',
        }}
      />
    </div>
  )
}
