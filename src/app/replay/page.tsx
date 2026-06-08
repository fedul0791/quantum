'use client'

import React, { useState } from 'react'

export default function ReplayPage() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [progress, setProgress] = useState(0)

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#F5F7FA', margin: 0 }}>
          🎬 Replay Mode
        </h1>
        <p style={{ fontSize: 14, color: '#8FA3B8', margin: '8px 0 0 0' }}>
          Historical market data playback with time controls
        </p>
      </div>

      {/* Controls */}
      <div
        style={{
          background: 'rgba(16, 24, 38, 0.6)',
          border: '1px solid rgba(0, 229, 212, 0.2)',
          borderRadius: 12,
          padding: 20,
          marginBottom: 20,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            style={{
              background: '#00E5D4',
              color: '#070B12',
              border: 'none',
              borderRadius: 8,
              padding: '8px 16px',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            {isPlaying ? '⏸ Pause' : '▶ Play'}
          </button>

          <div style={{ flex: 1 }}>
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
              style={{
                width: '100%',
                cursor: 'pointer',
                accentColor: '#00E5D4',
              }}
            />
          </div>

          <select
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            style={{
              background: 'rgba(7, 11, 18, 0.8)',
              color: '#F5F7FA',
              border: '1px solid rgba(0, 229, 212, 0.3)',
              borderRadius: 8,
              padding: '8px 12px',
              cursor: 'pointer',
            }}
          >
            <option value={0.5}>0.5x</option>
            <option value={1}>1x</option>
            <option value={2}>2x</option>
            <option value={5}>5x</option>
            <option value={10}>10x</option>
          </select>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#8FA3B8' }}>
          <span>00:00:00</span>
          <span>{progress}%</span>
          <span>24:00:00</span>
        </div>
      </div>

      {/* Market Data Preview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 20 }}>
        <div
          style={{
            background: 'rgba(16, 24, 38, 0.6)',
            border: '1px solid rgba(0, 229, 212, 0.2)',
            borderRadius: 12,
            padding: 16,
            textAlign: 'center',
          }}
        >
          <p style={{ color: '#8FA3B8', fontSize: 12, margin: '0 0 8px 0' }}>Price</p>
          <p style={{ color: '#00E5D4', fontSize: 24, fontWeight: 700, margin: 0 }}>—</p>
        </div>

        <div
          style={{
            background: 'rgba(16, 24, 38, 0.6)',
            border: '1px solid rgba(0, 229, 212, 0.2)',
            borderRadius: 12,
            padding: 16,
            textAlign: 'center',
          }}
        >
          <p style={{ color: '#8FA3B8', fontSize: 12, margin: '0 0 8px 0' }}>Volume</p>
          <p style={{ color: '#00E5A0', fontSize: 24, fontWeight: 700, margin: 0 }}>—</p>
        </div>

        <div
          style={{
            background: 'rgba(16, 24, 38, 0.6)',
            border: '1px solid rgba(0, 229, 212, 0.2)',
            borderRadius: 12,
            padding: 16,
            textAlign: 'center',
          }}
        >
          <p style={{ color: '#8FA3B8', fontSize: 12, margin: '0 0 8px 0' }}>Timestamp</p>
          <p style={{ color: '#FFD700', fontSize: 24, fontWeight: 700, margin: 0, fontFamily: 'monospace' }}>—</p>
        </div>
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
        <div style={{ fontSize: 48, marginBottom: 16 }}>⏱️</div>
        <h2 style={{ color: '#00E5D4', fontSize: 20, fontWeight: 600, margin: '0 0 8px 0' }}>
          Replay Coming Soon
        </h2>
        <p style={{ color: '#8FA3B8', margin: 0 }}>
          Historical data playback with full order book reconstruction and time-travel visualization
        </p>
      </div>
    </div>
  )
}
