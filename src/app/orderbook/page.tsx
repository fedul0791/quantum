'use client'

import React from 'react'

export default function OrderbookPage() {
  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#F5F7FA', margin: 0 }}>
          📖 Order Book
        </h1>
        <p style={{ fontSize: 14, color: '#8FA3B8', margin: '8px 0 0 0' }}>
          Real-time limit order book with depth visualization
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        <div
          style={{
            background: 'rgba(16, 24, 38, 0.6)',
            border: '1px solid rgba(0, 229, 212, 0.2)',
            borderRadius: 12,
            padding: 20,
            minHeight: 300,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <h3 style={{ color: '#00E5A0', fontSize: 16, fontWeight: 600, margin: '0 0 8px 0' }}>
            Bids
          </h3>
          <p style={{ color: '#8FA3B8', margin: 0 }}>Buy orders</p>
        </div>

        <div
          style={{
            background: 'rgba(16, 24, 38, 0.6)',
            border: '1px solid rgba(0, 229, 212, 0.2)',
            borderRadius: 12,
            padding: 20,
            minHeight: 300,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <h3 style={{ color: '#FF4757', fontSize: 16, fontWeight: 600, margin: '0 0 8px 0' }}>
            Asks
          </h3>
          <p style={{ color: '#8FA3B8', margin: 0 }}>Sell orders</p>
        </div>
      </div>

      <div
        style={{
          background: 'rgba(16, 24, 38, 0.6)',
          border: '1px solid rgba(0, 229, 212, 0.2)',
          borderRadius: 12,
          padding: 32,
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔄</div>
        <h2 style={{ color: '#00E5D4', fontSize: 20, fontWeight: 600, margin: '0 0 8px 0' }}>
          Order Book Coming Soon
        </h2>
        <p style={{ color: '#8FA3B8', margin: 0 }}>
          Real-time order book with heatmap, liquidity walls, and depth visualization
        </p>
      </div>
    </div>
  )
}
