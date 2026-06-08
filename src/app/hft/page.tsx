'use client'

import React from 'react'

export default function HFTPage() {
  const metrics = [
    { label: 'Order Flow Imbalance', value: '—', color: '#00E5D4' },
    { label: 'Microprice', value: '—', color: '#00E5A0' },
    { label: 'Queue Imbalance', value: '—', color: '#FFD700' },
    { label: 'Realized Volatility', value: '—', color: '#FF6B6B' },
    { label: 'Fill Probability', value: '—', color: '#A78BFA' },
  ]

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#F5F7FA', margin: 0 }}>
          ⚡ HFT Analytics
        </h1>
        <p style={{ fontSize: 14, color: '#8FA3B8', margin: '8px 0 0 0' }}>
          High-frequency trading metrics and microstructure analysis
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 20 }}>
        {metrics.map((metric, idx) => (
          <div
            key={idx}
            style={{
              background: 'rgba(16, 24, 38, 0.6)',
              border: '1px solid rgba(0, 229, 212, 0.2)',
              borderRadius: 12,
              padding: 16,
              textAlign: 'center',
            }}
          >
            <p style={{ color: '#8FA3B8', fontSize: 12, margin: '0 0 8px 0' }}>
              {metric.label}
            </p>
            <p style={{ color: metric.color, fontSize: 24, fontWeight: 700, margin: 0 }}>
              {metric.value}
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
        <div style={{ fontSize: 48, marginBottom: 16 }}>⚡</div>
        <h2 style={{ color: '#00E5D4', fontSize: 20, fontWeight: 600, margin: '0 0 8px 0' }}>
          HFT Analytics Coming Soon
        </h2>
        <p style={{ color: '#8FA3B8', margin: 0 }}>
          Advanced HFT metrics: OFI, microprice, queue imbalance, volatility, and fill probability
        </p>
      </div>
    </div>
  )
}
