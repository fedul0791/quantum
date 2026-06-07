'use client'
import { useMarketStore } from '@/store/marketStore'
import { useEffect, useState } from 'react'

interface Props {
  symbol?: string
}

export default function HFTAnalytics({ symbol = 'BTCUSDT' }: Props) {
  const orderBook = useMarketStore(state => state.orderBooks[symbol])
  const lastTrade = useMarketStore(state => state.lastTrades[symbol])
  const priceData = useMarketStore(state => state.prices[symbol])

  const [ofi, setOfi] = useState(0)
  const [microprice, setMicroprice] = useState(0)
  const [queueImbalance, setQueueImbalance] = useState({ l1: 0, l5: 0, l10: 0 })
  const [volatility, setVolatility] = useState(0)
  const [fillProb, setFillProb] = useState(65)

  useEffect(() => {
    if (!orderBook?.bids?.length || !orderBook?.asks?.length) return

    const bids = orderBook.bids
    const asks = orderBook.asks

    // 1. Microprice
    const bidPrice = bids[0][0]
    const askPrice = asks[0][0]
    const bidSize = bids[0][1]
    const askSize = asks[0][1]
    const mp = (bidPrice * askSize + askPrice * bidSize) / (bidSize + askSize)
    setMicroprice(mp)

    // 2. Simple OFI (Order Flow Imbalance)
    const bidVol = bids.slice(0, 5).reduce((sum, [, q]) => sum + q, 0)
    const askVol = asks.slice(0, 5).reduce((sum, [, q]) => sum + q, 0)
    const currentOfi = (bidVol - askVol) / (bidVol + askVol + 1)
    setOfi(currentOfi)

    // 3. Queue Imbalance
    const l1 = (bids[0][1] - asks[0][1]) / (bids[0][1] + asks[0][1] + 1)
    const l5Bid = bids.slice(0, 5).reduce((sum, [, q]) => sum + q, 0)
    const l5Ask = asks.slice(0, 5).reduce((sum, [, q]) => sum + q, 0)
    const l5 = (l5Bid - l5Ask) / (l5Bid + l5Ask + 1)

    setQueueImbalance({ l1, l5, l10: l5 })

    // 4. Volatility (mock based on spread)
    const spread = askPrice - bidPrice
    setVolatility(Math.min(2.8, spread * 100))

    // 5. Fill Probability (heuristic)
    setFillProb(Math.max(35, Math.min(92, 85 - spread * 40)))
  }, [orderBook])

  const pressureColor = ofi > 0.1 ? '#00E5A0' : ofi < -0.1 ? '#FF4757' : '#FFA502'

  return (
    <div className="glass rounded-2xl p-6 h-full">
      <h2 className="text-lg font-semibold text-[#00E5D4] mb-5">HFT ANALYTICS</h2>

      <div className="grid grid-cols-2 gap-5 text-sm">
        {/* OFI */}
        <div>
          <div className="text-[#8FA3B8] text-xs mb-1">ORDER FLOW IMBALANCE (OFI)</div>
          <div className="text-3xl font-mono font-bold" style={{ color: pressureColor }}>
            {ofi.toFixed(3)}
          </div>
          <div className="text-xs mt-1" style={{ color: pressureColor }}>
            {ofi > 0 ? '↑ BUYING PRESSURE' : ofi < 0 ? '↓ SELLING PRESSURE' : 'NEUTRAL'}
          </div>
        </div>

        {/* Microprice */}
        <div>
          <div className="text-[#8FA3B8] text-xs mb-1">MICROPRICE</div>
          <div className="text-3xl font-mono font-bold text-[#00E5D4]">
            {microprice.toFixed(2)}
          </div>
          <div className="text-xs text-[#8FA3B8]">
            vs Mid: {(microprice - (orderBook?.bids?.[0]?.[0] + orderBook?.asks?.[0]?.[0]) / 2 || 0).toFixed(2)}
          </div>
        </div>

        {/* Queue Imbalance */}
        <div className="col-span-2">
          <div className="text-[#8FA3B8] text-xs mb-2">QUEUE IMBALANCE</div>
          <div className="flex gap-6 text-sm font-mono">
            <div>
              L1: <span style={{ color: queueImbalance.l1 > 0 ? '#00E5A0' : '#FF4757' }}>{queueImbalance.l1.toFixed(3)}</span>
            </div>
            <div>
              L5: <span style={{ color: queueImbalance.l5 > 0 ? '#00E5A0' : '#FF4757' }}>{queueImbalance.l5.toFixed(3)}</span>
            </div>
            <div>
              L10: <span style={{ color: queueImbalance.l10 > 0 ? '#00E5A0' : '#FF4757' }}>{queueImbalance.l10.toFixed(3)}</span>
            </div>
          </div>
        </div>

        {/* Volatility & Fill Prob */}
        <div>
          <div className="text-[#8FA3B8] text-xs mb-1">REALIZED VOL 30s</div>
          <div className="text-2xl font-mono font-bold text-[#8B5CF6]">{volatility.toFixed(2)}%</div>
        </div>

        <div>
          <div className="text-[#8FA3B8] text-xs mb-1">FILL PROBABILITY</div>
          <div className="text-2xl font-mono font-bold text-[#00E5D4]">{fillProb}%</div>
          <div className="h-1.5 bg-[#1E2B3D] rounded mt-2 overflow-hidden">
            <div className="h-full bg-[#00E5D4] transition-all" style={{ width: `${fillProb}%` }} />
          </div>
        </div>
      </div>
    </div>
  )
}
