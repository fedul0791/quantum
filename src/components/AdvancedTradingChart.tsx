'use client'
import { useEffect, useRef } from 'react'
import { createChart, ColorType, CandlestickSeries, HistogramSeries } from 'lightweight-charts'

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
  const candleSeriesRef = useRef<any>(null)
  const volumeSeriesRef = useRef<any>(null)

  useEffect(() => {
    if (!containerRef.current) return

    try {
      // Create chart with lightweight-charts v4 API
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

      // Create candlestick series using v4 API
      const candleSeries = chart.addSeries(CandlestickSeries, {
        upColor: '#00E5D4',
        downColor: '#FF4757',
        borderUpColor: '#00E5D4',
        borderDownColor: '#FF4757',
        wickUpColor: '#00E5D4',
        wickDownColor: '#FF4757',
      })

      candleSeriesRef.current = candleSeries

      // Create volume bars (histogram)
      const volumeSeries = chart.addSeries(HistogramSeries, {
        color: 'rgba(0, 229, 212, 0.3)',
      })

      volumeSeriesRef.current = volumeSeries

      // Set data
      if (data.length > 0) {
        candleSeries.setData(data)
      }
      if (volume.length > 0) {
        volumeSeries.setData(volume)
      }

      // Fit content
      chart.timeScale().fitContent()

      // Handle resize
      const handleResize = () => {
        if (containerRef.current) {
          chart.applyOptions({
            width: containerRef.current.clientWidth,
          })
        }
      }

      window.addEventListener('resize', handleResize)

      return () => {
        window.removeEventListener('resize', handleResize)
        chart.remove()
      }
    } catch (error) {
      console.error('Chart initialization error:', error)
    }
  }, [])

  // Update data when it changes
  useEffect(() => {
    if (candleSeriesRef.current && data.length > 0) {
      candleSeriesRef.current.setData(data)
      chartRef.current?.timeScale().fitContent()
    }
  }, [data])

  useEffect(() => {
    if (volumeSeriesRef.current && volume.length > 0) {
      volumeSeriesRef.current.setData(volume)
    }
  }, [volume])

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
