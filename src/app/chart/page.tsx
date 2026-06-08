'use client'

import React from 'react'

export default function ChartPage() {
  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#F5F7FA', margin: 0 }}>
          📊 Advanced Chart
        </h1>
        <p style={{ fontSize: 14, color: '#8FA3B8', margin: '8px 0 0 0' }}>
          Professional trading chart with advanced tools
        </p>
      </div>

      <div
        style={{
          background: 'rgba(16, 24, 38, 0.6)',
          border: '1px solid rgba(0, 229, 212, 0.2)',
          borderRadius: 12,
          padding: 32,
          textAlign: 'center',
          minHeight: 400,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <div style={{ fontSize: 48, marginBottom: 16 }}>📈</div>
        <h2 style={{ color: '#00E5D4', fontSize: 20, fontWeight: 600, margin: '0 0 8px 0' }}>
          Chart Coming Soon
        </h2>
        <p style={{ color: '#8FA3B8', margin: 0 }}>
          Advanced charting features with multiple timeframes, technical indicators, and drawing tools
        </p>
      </div>
    </div>
  )
}
