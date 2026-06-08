'use client'

import React, { useState } from 'react'

export default function WatchlistPage() {
  const [symbols, setSymbols] = useState([
    { symbol: 'BTCUSDT', price: 42500, change24h: 2.5 },
    { symbol: 'ETHUSDT', price: 2250, change24h: -1.2 },
    { symbol: 'SOLUSDT', price: 105, change24h: 5.8 },
  ])

  const [newSymbol, setNewSymbol] = useState('')

  const handleAdd = () => {
    if (newSymbol.trim()) {
      setSymbols([...symbols, { symbol: newSymbol.toUpperCase(), price: 0, change24h: 0 }])
      setNewSymbol('')
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#F5F7FA', margin: 0 }}>
          ⭐ Watchlist
        </h1>
        <p style={{ fontSize: 14, color: '#8FA3B8', margin: '8px 0 0 0' }}>
          Track your favorite cryptocurrency pairs
        </p>
      </div>

      {/* Add Symbol */}
      <div
        style={{
          background: 'rgba(16, 24, 38, 0.6)',
          border: '1px solid rgba(0, 229, 212, 0.2)',
          borderRadius: 12,
          padding: 16,
          marginBottom: 20,
          display: 'flex',
          gap: 12,
        }}
      >
        <input
          type="text"
          placeholder="Enter symbol (e.g., BTCUSDT)"
          value={newSymbol}
          onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
          onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
          style={{
            flex: 1,
            background: 'rgba(7, 11, 18, 0.8)',
            border: '1px solid rgba(0, 229, 212, 0.2)',
            borderRadius: 8,
            padding: '10px 12px',
            color: '#F5F7FA',
            fontSize: 14,
          }}
        />

        <button
          onClick={handleAdd}
          style={{
            background: '#00E5D4',
            color: '#070B12',
            border: 'none',
            borderRadius: 8,
            padding: '10px 20px',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: 14,
          }}
        >
          Add
        </button>
      </div>

      {/* Watchlist Items */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
        {symbols.map((item, idx) => (
          <div
            key={idx}
            style={{
              background: 'rgba(16, 24, 38, 0.6)',
              border: '1px solid rgba(0, 229, 212, 0.2)',
              borderRadius: 12,
              padding: 16,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.background = 'rgba(16, 24, 38, 0.9)'
              ;(e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(0, 229, 212, 0.4)'
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.background = 'rgba(16, 24, 38, 0.6)'
              ;(e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(0, 229, 212, 0.2)'
            }}
          >
            <p style={{ color: '#00E5D4', fontSize: 14, fontWeight: 600, margin: '0 0 8px 0' }}>
              {item.symbol}
            </p>

            <p style={{ color: '#F5F7FA', fontSize: 20, fontWeight: 700, margin: '0 0 8px 0', fontFamily: 'monospace' }}>
              ${item.price.toFixed(2)}
            </p>

            <p
              style={{
                color: item.change24h >= 0 ? '#00E5A0' : '#FF4757',
                fontSize: 12,
                margin: 0,
              }}
            >
              {item.change24h >= 0 ? '+' : ''}{item.change24h.toFixed(2)}%
            </p>
          </div>
        ))}
      </div>

      {/* Info */}
      {symbols.length === 0 && (
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
          <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
          <h2 style={{ color: '#00E5D4', fontSize: 20, fontWeight: 600, margin: '0 0 8px 0' }}>
            Your watchlist is empty
          </h2>
          <p style={{ color: '#8FA3B8', margin: 0 }}>
            Add your favorite symbols to track them
          </p>
        </div>
      )}
    </div>
  )
}
