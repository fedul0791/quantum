'use client'
import { useState } from 'react'
import { useMarketStore } from '@/store/marketStore'
import ProfessionalOrderBook from '@/components/ProfessionalOrderBook'
import HFTAnalytics from '@/components/HFTAnalytics'
import { AnimatedCard } from '@/lib/animations'

const symbols = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'ADAUSDT']

export default function Microstructure() {
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT')
  const orderBook = useMarketStore(state => state.orderBooks[selectedSymbol])
  
  const bidLevels = orderBook?.bids?.length || 0
  const askLevels = orderBook?.asks?.length || 0
  const totalLiquidity = (orderBook?.bids || []).reduce((sum, [_, qty]) => sum + qty, 0) +
                         (orderBook?.asks || []).reduce((sum, [_, qty]) => sum + qty, 0)

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <AnimatedCard delay={0}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: '#F5F7FA', marginBottom: 16 }}>
            Market Microstructure Analysis
          </h1>
          
          {/* Symbol Selector */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {symbols.map(sym => (
              <button
                key={sym}
                onClick={() => setSelectedSymbol(sym)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  border: selectedSymbol === sym ? '1px solid #00E5D4' : '1px solid rgba(0,229,212,0.2)',
                  background: selectedSymbol === sym ? 'rgba(0,229,212,0.1)' : 'rgba(16,24,38,0.5)',
                  color: selectedSymbol === sym ? '#00E5D4' : '#8FA3B8',
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 500,
                  transition: 'all 0.2s',
                }}
              >
                {sym}
              </button>
            ))}
          </div>
        </div>
      </AnimatedCard>

      {/* Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 24 }}>
        <AnimatedCard delay={0.05}>
          <div style={{ background: 'rgba(16,24,38,0.6)', border: '1px solid rgba(0,229,212,0.1)', borderRadius: 12, padding: 16 }}>
            <div style={{ color: '#8FA3B8', fontSize: 12, marginBottom: 8 }}>BID LEVELS</div>
            <div style={{ color: '#00E5D4', fontSize: 24, fontWeight: 700 }}>{bidLevels}</div>
          </div>
        </AnimatedCard>
        
        <AnimatedCard delay={0.1}>
          <div style={{ background: 'rgba(16,24,38,0.6)', border: '1px solid rgba(0,229,212,0.1)', borderRadius: 12, padding: 16 }}>
            <div style={{ color: '#8FA3B8', fontSize: 12, marginBottom: 8 }}>ASK LEVELS</div>
            <div style={{ color: '#FF4757', fontSize: 24, fontWeight: 700 }}>{askLevels}</div>
          </div>
        </AnimatedCard>
        
        <AnimatedCard delay={0.15}>
          <div style={{ background: 'rgba(16,24,38,0.6)', border: '1px solid rgba(0,229,212,0.1)', borderRadius: 12, padding: 16 }}>
            <div style={{ color: '#8FA3B8', fontSize: 12, marginBottom: 8 }}>TOTAL LIQUIDITY</div>
            <div style={{ color: '#FFA502', fontSize: 24, fontWeight: 700 }}>{totalLiquidity.toFixed(0)}</div>
          </div>
        </AnimatedCard>
      </div>

      {/* Main Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Order Book */}
        <AnimatedCard delay={0.2}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: '#00E5D4', marginBottom: 16 }}>
              Order Book Depth — {selectedSymbol}
            </h2>
            <ProfessionalOrderBook symbol={selectedSymbol} levels={20} />
          </div>
        </AnimatedCard>

        {/* HFT Analytics */}
        <AnimatedCard delay={0.25}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: '#00E5D4', marginBottom: 16 }}>
              HFT Microstructure
            </h2>
            <HFTAnalytics symbol={selectedSymbol} />
          </div>
        </AnimatedCard>
      </div>

      {/* Advanced Metrics */}
      <AnimatedCard delay={0.3}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#00E5D4', marginBottom: 16 }}>
            Market Pressure Indicators
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
            <div style={{ background: 'rgba(16,24,38,0.5)', padding: 12, borderRadius: 8 }}>
              <div style={{ color: '#8FA3B8', fontSize: 11, marginBottom: 6 }}>Bid Imbalance</div>
              <div style={{ color: '#00E5A0', fontSize: 16, fontWeight: 600 }}>+12.3%</div>
            </div>
            <div style={{ background: 'rgba(16,24,38,0.5)', padding: 12, borderRadius: 8 }}>
              <div style={{ color: '#8FA3B8', fontSize: 11, marginBottom: 6 }}>Ask Pressure</div>
              <div style={{ color: '#FF4757', fontSize: 16, fontWeight: 600 }}>-8.7%</div>
            </div>
            <div style={{ background: 'rgba(16,24,38,0.5)', padding: 12, borderRadius: 8 }}>
              <div style={{ color: '#8FA3B8', fontSize: 11, marginBottom: 6 }}>Spread Change</div>
              <div style={{ color: '#FFA502', fontSize: 16, fontWeight: 600 }}>+2.1 bps</div>
            </div>
            <div style={{ background: 'rgba(16,24,38,0.5)', padding: 12, borderRadius: 8 }}>
              <div style={{ color: '#8FA3B8', fontSize: 11, marginBottom: 6 }}>Market Depth</div>
              <div style={{ color: '#00E5D4', fontSize: 16, fontWeight: 600 }}>Deep</div>
            </div>
          </div>
        </div>
      </AnimatedCard>
    </div>
  )
}
