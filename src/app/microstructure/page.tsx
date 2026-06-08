'use client'

import React from 'react'

export default function MicrostructurePage() {
  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#F5F7FA', margin: 0 }}>
          🔬 Market Microstructure
        </h1>
        <p style={{ fontSize: 14, color: '#8FA3B8', margin: '8px 0 0 0' }}>
          Professional analysis of liquidity dynamics and market pressure
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16, marginBottom: 20 }}>
        {['Spread Behavior', 'Liquidity Dynamics', 'Order Book Evolution', 'Market Pressure'].map((title, idx) => (
          <div
            key={idx}
            style={{
              background: 'rgba(16, 24, 38, 0.6)',
              border: '1px solid rgba(0, 229, 212, 0.2)',
              borderRadius: 12,
              padding: 20,
              minHeight: 200,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
            <h3 style={{ color: '#00E5D4', fontSize: 14, fontWeight: 600, margin: 0 }}>
              {title}
            </h3>
            <p style={{ color: '#8FA3B8', fontSize: 12, margin: '8px 0 0 0' }}>
              Advanced visualization
            </p>
          </div>
        ))}
      </div>

      <div
        style={{
          background: 'rgba(16, 24, 38, 0.6)',
          border: '1px solid rgba(0, 229, 212, 0.2)',
          borderRadius: 12,
          padding: 32,
          textAlign: 'center',
          minHeight: 300,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <div style={{ fontSize: 48, marginBottom: 16 }}>🏢</div>
        <h2 style={{ color: '#00E5D4', fontSize: 20, fontWeight: 600, margin: '0 0 8px 0' }}>
          Microstructure Dashboard Coming Soon
        </h2>
        <p style={{ color: '#8FA3B8', margin: 0 }}>
          Institutional-grade market microstructure analysis with professional visualizations
        </p>
      </div>
    </div>
  )
}
