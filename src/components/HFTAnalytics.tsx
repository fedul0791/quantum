'use client'
import { useMarketStore } from '@/store/marketStore'
import { useEffect, useState, useMemo, memo } from 'react'

interface Props {
  symbol?: string
}

const HFTAnalytics = memo(function HFTAnalytics({ symbol = 'BTCUSDT' }: Props) {
  const orderBook = useMarketStore(state => state.orderBooks[symbol])
  const [metrics, setMetrics] = useState({
    ofi: 0,
    microprice: 0,
    queueImbalance: { l1: 0, l5: 0, l10: 0 },
    volatility: 0,
    fillProb: 65,
  })

  // Memoize metric calculations
  const calculatedMetrics = useMemo(() => {
    if (!orderBook?.bids?.length || !orderBook?.asks?.length) return null

    const bids = orderBook.bids
    const asks = orderBook.asks

    // 1. Microprice
    const bidPrice = bids[0][0]
    const askPrice = asks[0][0]
    const bidSize = bids[0][1]
    const askSize = asks[0][1]
    const microprice = (bidPrice * askSize + askPrice * bidSize) / (bidSize + askSize)

    // 2. Simple OFI
    const bidVol = bids.slice(0, 5).reduce((sum, [, q]) => sum + q, 0)
    const askVol = asks.slice(0, 5).reduce((sum, [, q]) => sum + q, 0)
    const ofi = (bidVol - askVol) / (bidVol + askVol + 1)

    // 3. Queue Imbalance
    const l1 = (bids[0][1] - asks[0][1]) / (bids[0][1] + asks[0][1] + 1)
    const l5Bid = bids.slice(0, 5).reduce((sum, [, q]) => sum + q, 0)
    const l5Ask = asks.slice(0, 5).reduce((sum, [, q]) => sum + q, 0)
    const l5 = (l5Bid - l5Ask) / (l5Bid + l5Ask + 1)

    // 4. Volatility
    const spread = askPrice - bidPrice
    const volatility = Math.min(2.8, spread * 100)

    // 5. Fill Probability
    const fillProb = Math.max(35, Math.min(92, 85 - spread * 40))

    return { ofi, microprice, queueImbalance: { l1, l5, l10: l5 }, volatility, fillProb }
  }, [orderBook])

  useEffect(() => {
    if (calculatedMetrics) {
      setMetrics(calculatedMetrics)
    }
  }, [calculatedMetrics])

  const pressureColor = metrics.ofi > 0.1 ? '#00E5A0' : metrics.ofi < -0.1 ? '#FF4757' : '#FFA502'

  return (
    <div className="glass rounded-2xl p-6 h-full">
      <h2 className="text-lg font-semibold text-[#00E5D4] mb-5">HFT ANALYTICS</h2>

      <div className="grid grid-cols-2 gap-5 text-sm">
        {/* OFI */}
        <div>
          <div className="text-[#8FA3B8] text-xs mb-1">ORDER FLOW IMBALANCE (OFI)</div>
          <div className="text-3xl font-mono font-bold" style={{ color: pressureColor }}>
            {metrics.ofi.toFixed(3)}
          </div>
          <div className="text-xs mt-1" style={{ color: pressureColor }}>
            {metrics.ofi > 0 ? '↑ BUYING PRESSURE' : metrics.ofi < 0 ? '↓ SELLING PRESSURE' : 'NEUTRAL'}
          </div>
        </div>

        {/* Microprice */}
        <div>
          <div className="text-[#8FA3B8] text-xs mb-1">MICROPRICE</div>
          <div className="text-3xl font-mono font-bold text-[#00E5D4]">
            {metrics.microprice.toFixed(2)}
          </div>
          <div className="text-xs text-[#8FA3B8]">
            vs Mid: {orderBook?.bids?.[0]?.[0] && orderBook?.asks?.[0]?.[0] ? (metrics.microprice - (orderBook.bids[0][0] + orderBook.asks[0][0]) / 2).toFixed(2) : '—'}
          </div>
        </div>

        {/* Queue Imbalance */}
        <div className="col-span-2">
          <div className="text-[#8FA3B8] text-xs mb-2">QUEUE IMBALANCE</div>
          <div className="flex gap-6 text-sm font-mono">
            <div>
              L1: <span style={{ color: metrics.queueImbalance.l1 > 0 ? '#00E5A0' : '#FF4757' }}>{metrics.queueImbalance.l1.toFixed(3)}</span>
            </div>
            <div>
              L5: <span style={{ color: metrics.queueImbalance.l5 > 0 ? '#00E5A0' : '#FF4757' }}>{metrics.queueImbalance.l5.toFixed(3)}</span>
            </div>
            <div>
              L10: <span style={{ color: metrics.queueImbalance.l10 > 0 ? '#00E5A0' : '#FF4757' }}>{metrics.queueImbalance.l10.toFixed(3)}</span>
            </div>
          </div>
        </div>

        {/* Volatility & Fill Prob */}
        <div>
          <div className="text-[#8FA3B8] text-xs mb-1">REALIZED VOL 30s</div>
          <div className="text-2xl font-mono font-bold text-[#8B5CF6]">{metrics.volatility.toFixed(2)}%</div>
        </div>

        <div>
          <div className="text-[#8FA3B8] text-xs mb-1">FILL PROBABILITY</div>
          <div className="text-2xl font-mono font-bold text-[#00E5D4]">{Math.round(metrics.fillProb)}%</div>
          <div className="h-1.5 bg-[#1E2B3D] rounded mt-2 overflow-hidden">
            <div className="h-full bg-[#00E5D4] transition-all" style={{ width: `${metrics.fillProb}%` }} />
          </div>
        </div>
      </div>
    </div>
  )
})

export default HFTAnalytics
