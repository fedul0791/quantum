'use client'
import { useState } from 'react'

export default function AltseasonPage() {
  const [expanded, setExpanded] = useState(false)
  
  return (
    <div style={{ padding: 28, maxWidth: 900 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif', color: '#F5F7FA' }}>
        Altseason <span style={{ color: '#F7931A' }}>Index</span>
      </h1>
      <div style={{ background: 'rgba(16,24,38,0.8)', border: '1px solid rgba(0,229,212,0.1)', borderRadius: 14, padding: 24, marginTop: 20 }}>
        <div style={{ fontSize: 48, fontWeight: 700, textAlign: 'center', background: 'linear-gradient(135deg, #F7931A, #EC4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>34</div>
        <p style={{ textAlign: 'center', color: '#F7931A', fontWeight: 700 }}>BTC Season</p>
        <div style={{ height: 200, background: 'rgba(0,229,212,0.03)', borderRadius: 12, marginTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5C728A' }}>BlockchainCenter data</div>
        <p style={{ color: '#8FA3B8', fontSize: 13, marginTop: 16 }}>
          The Altseason Index shows whether altcoins are outperforming Bitcoin.
          Value above 75 means Altseason (75% of top-50 alts beat BTC in 90 days).
        </p>
        {!expanded && <button onClick={() => setExpanded(true)} style={{ color: '#00E5D4', background: 'none', border: 'none', cursor: 'pointer', marginTop: 8 }}>Read more</button>}
        {expanded && (
          <div style={{ marginTop: 12, color: '#8FA3B8', fontSize: 13 }}>
            <p>BTC Season (0-25): focus on BTC. Altseason (75-100): rotate into altcoins.</p>
            <p style={{ color: '#5C728A', fontSize: 11, marginTop: 8 }}>Source: BlockchainCenter.net</p>
            <button onClick={() => setExpanded(false)} style={{ color: '#00E5D4', background: 'none', border: 'none', cursor: 'pointer', marginTop: 8 }}>Collapse</button>
          </div>
        )}
      </div>
    </div>
  )
}
