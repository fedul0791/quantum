'use client'
import React, { useMemo } from 'react'
import { useMarketStore } from '@/store/marketStore'

interface ProfessionalOrderBookProps {
  symbol?: string
  levels?: number
}

const ProfessionalOrderBook = React.memo(function ProfessionalOrderBook({ 
  symbol = 'BTCUSDT', 
  levels = 20 
}: ProfessionalOrderBookProps) {
  const orderBook = useMarketStore(state => state.orderBooks[symbol])

  // Memoize computed values
  const { bidData, askData, maxBidQty, maxAskQty, bestBid, bestAsk, spread, bidCumulative, askCumulative } = useMemo(() => {
    const bids = orderBook?.bids?.slice(0, levels) || []
    const asks = orderBook?.asks?.slice(0, levels) || []
    
    const bidQtys = bids.map(b => b[1])
    const askQtys = asks.map(a => a[1])
    const maxBidQty = bidQtys.length > 0 ? Math.max(...bidQtys) : 1
    const maxAskQty = askQtys.length > 0 ? Math.max(...askQtys) : 1
    
    let bidCumulative = 0
    const bidData = bids.map(([price, qty]) => {
      bidCumulative += qty
      return { price, qty, cumulative: bidCumulative }
    })
    
    let askCumulative = 0
    const askData = asks.map(([price, qty]) => {
      askCumulative += qty
      return { price, qty, cumulative: askCumulative }
    })

    const bestBid = bids[0]?.[0]
    const bestAsk = asks[0]?.[0]
    const spread = bestAsk && bestBid ? ((bestAsk - bestBid) / bestBid * 100).toFixed(4) : '—'

    return { bidData, askData, maxBidQty, maxAskQty, bestBid, bestAsk, spread, bidCumulative, askCumulative }
  }, [orderBook, levels])

  const getHeatmapColor = (qty: number, maxQty: number) => {
    const intensity = Math.min(qty / maxQty, 1)
    if (intensity < 0.3) return 'rgba(0, 229, 212, 0.1)'
    if (intensity < 0.6) return 'rgba(0, 229, 212, 0.2)'
    if (intensity < 0.8) return 'rgba(0, 229, 212, 0.4)'
    return 'rgba(0, 229, 212, 0.6)'
  }

  return (
    <div className="rounded-2xl bg-surface border border-accent border-opacity-10 p-6 h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-accent">ORDER BOOK — {symbol}</h2>
        <div className="flex gap-2">
          {[10, 20, 50].map(l => (
            <button
              key={l}
              className={`px-2 py-1 rounded text-xs font-semibold transition ${
                levels === l
                  ? 'bg-accent text-background'
                  : 'bg-surface-hover text-text-secondary hover:bg-secondary'
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-surface-hover rounded border border-accent border-opacity-20">
        <div>
          <div className="text-xs text-text-secondary">Best Bid</div>
          <div className="text-lg font-mono font-bold text-success">${bestBid?.toFixed(2)}</div>
        </div>
        <div>
          <div className="text-xs text-text-secondary">Spread</div>
          <div className="text-lg font-mono font-bold text-warning">{spread}%</div>
        </div>
        <div>
          <div className="text-xs text-text-secondary">Best Ask</div>
          <div className="text-lg font-mono font-bold text-danger">${bestAsk?.toFixed(2)}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* ASKS */}
        <div>
          <h3 className="text-xs font-semibold text-text-secondary mb-3 uppercase">Asks (Sell)</h3>
          <div className="space-y-0.5 max-h-96 overflow-y-auto">
            {askData.map(({ price, qty, cumulative }, i) => {
              const heatmapBg = getHeatmapColor(qty, maxAskQty)
              return (
                <div
                  key={i}
                  className="relative flex justify-between text-xs font-mono group"
                  style={{ background: heatmapBg }}
                >
                  <div className="absolute right-0 top-0 bottom-0 w-full" 
                    style={{
                      background: `linear-gradient(90deg, transparent 0%, rgba(255, 71, 87, 0.1) ${(qty / maxAskQty) * 100}%)`,
                    }}
                  />
                  <div className="relative px-2 py-1 text-danger font-semibold">{price.toFixed(2)}</div>
                  <div className="relative px-2 py-1 text-text-secondary">{qty.toFixed(4)}</div>
                  <div className="relative px-2 py-1 text-text-muted text-right">{cumulative.toFixed(2)}</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* BIDS */}
        <div>
          <h3 className="text-xs font-semibold text-text-secondary mb-3 uppercase">Bids (Buy)</h3>
          <div className="space-y-0.5 max-h-96 overflow-y-auto">
            {bidData.map(({ price, qty, cumulative }, i) => {
              const heatmapBg = getHeatmapColor(qty, maxBidQty)
              return (
                <div
                  key={i}
                  className="relative flex justify-between text-xs font-mono group"
                  style={{ background: heatmapBg }}
                >
                  <div className="absolute right-0 top-0 bottom-0 w-full"
                    style={{
                      background: `linear-gradient(90deg, transparent 0%, rgba(0, 229, 160, 0.1) ${(qty / maxBidQty) * 100}%)`,
                    }}
                  />
                  <div className="relative px-2 py-1 text-success font-semibold">{price.toFixed(2)}</div>
                  <div className="relative px-2 py-1 text-text-secondary">{qty.toFixed(4)}</div>
                  <div className="relative px-2 py-1 text-text-muted text-right">{cumulative.toFixed(2)}</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-4 pt-4 border-t border-accent border-opacity-10 grid grid-cols-4 gap-2 text-xs">
        <div>
          <span className="text-text-secondary">Total Bid Vol:</span>
          <span className="text-accent ml-2">{bidCumulative.toFixed(2)}</span>
        </div>
        <div>
          <span className="text-text-secondary">Total Ask Vol:</span>
          <span className="text-danger ml-2">{askCumulative.toFixed(2)}</span>
        </div>
        <div>
          <span className="text-text-secondary">Imbalance:</span>
          <span className={`ml-2 ${bidCumulative > askCumulative ? 'text-success' : 'text-danger'}`}>
            {((bidCumulative - askCumulative) / (bidCumulative + askCumulative) * 100).toFixed(2)}%
          </span>
        </div>
        <div>
          <span className="text-text-secondary">Total Depth:</span>
          <span className="text-text-primary ml-2">${(bidCumulative + askCumulative).toFixed(0)}</span>
        </div>
      </div>
    </div>
  )
})

export default ProfessionalOrderBook
