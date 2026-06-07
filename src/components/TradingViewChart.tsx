'use client'
import { useEffect, useRef, useState } from 'react'
import { createChart, ColorType } from 'lightweight-charts'

interface Props {
  symbol: string
  interval: string
}

export default function TradingViewChart({ symbol, interval }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<any>(null)
  const candleRef = useRef<any>(null)
  const volumeRef = useRef<any>(null)

  useEffect(() => {
    if (!containerRef.current) return
    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: 500,
      layout: { background: { type: ColorType.Solid, color: 'transparent' }, textColor: '#8FA3B8' },
      grid: { vertLines: { color: 'rgba(30,43,61,0.3)' }, horzLines: { color: 'rgba(30,43,61,0.3)' } },
      rightPriceScale: { borderColor: 'rgba(30,43,61,0.5)', scaleMargins: { top: 0.1, bottom: 0.2 } },
      timeScale: { borderColor: 'rgba(30,43,61,0.5)' },
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
      if (containerRef.current) chart.applyOptions({ width: containerRef.current.clientWidth })
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chart.remove()
    }
  }, [])

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

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
}
