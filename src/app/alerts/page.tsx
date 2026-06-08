'use client'

import React, { useState } from 'react'

export default function AlertsPage() {
  const [alerts] = useState([
    { id: 1, symbol: 'BTCUSDT', type: 'price', condition: 'Price > 50000', active: true },
    { id: 2, symbol: 'ETHUSDT', type: 'volatility', condition: 'Volatility > 0.05', active: false },
  ])

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#F5F7FA', margin: 0 }}>
          🔔 Alerts
        </h1>
        <p style={{ fontSize: 14, color: '#8FA3B8', margin: '8px 0 0 0' }}>
          Create custom alerts for market conditions
        </p>
      </div>

      {/* Create Alert Form */}
      <div
        style={{
          background: 'rgba(16, 24, 38, 0.6)',
          border: '1px solid rgba(0, 229, 212, 0.2)',
          borderRadius: 12,
          padding: 20,
          marginBottom: 20,
        }}
      >
        <h2 style={{ fontSize: 16, fontWeight: 600, color: '#00E5D4', margin: '0 0 16px 0' }}>
          Create New Alert
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          <input
            type="text"
            placeholder="Symbol (e.g., BTCUSDT)"
            style={{
              background: 'rgba(7, 11, 18, 0.8)',
              border: '1px solid rgba(0, 229, 212, 0.2)',
              borderRadius: 8,
              padding: '10px 12px',
              color: '#F5F7FA',
              fontSize: 14,
            }}
          />

          <select
            style={{
              background: 'rgba(7, 11, 18, 0.8)',
              border: '1px solid rgba(0, 229, 212, 0.2)',
              borderRadius: 8,
              padding: '10px 12px',
              color: '#F5F7FA',
              fontSize: 14,
            }}
          >
            <option>Price Alert</option>
            <option>Volatility Alert</option>
            <option>Volume Alert</option>
            <option>OFI Alert</option>
          </select>
        </div>

        <input
          type="text"
          placeholder="Condition (e.g., > 50000)"
          style={{
            width: '100%',
            background: 'rgba(7, 11, 18, 0.8)',
            border: '1px solid rgba(0, 229, 212, 0.2)',
            borderRadius: 8,
            padding: '10px 12px',
            color: '#F5F7FA',
            fontSize: 14,
            marginBottom: 12,
            boxSizing: 'border-box',
          }}
        />

        <button
          style={{
            width: '100%',
            background: '#00E5D4',
            color: '#070B12',
            border: 'none',
            borderRadius: 8,
            padding: '10px 16px',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: 14,
          }}
        >
          Create Alert
        </button>
      </div>

      {/* Active Alerts */}
      <h2 style={{ fontSize: 16, fontWeight: 600, color: '#00E5D4', margin: '0 0 12px 0' }}>
        Active Alerts
      </h2>

      <div style={{ display: 'grid', gap: 12 }}>
        {alerts.map((alert) => (
          <div
            key={alert.id}
            style={{
              background: 'rgba(16, 24, 38, 0.6)',
              border: `1px solid ${alert.active ? 'rgba(0, 229, 160, 0.2)' : 'rgba(255, 71, 87, 0.2)'}`,
              borderRadius: 12,
              padding: 16,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <p style={{ color: '#F5F7FA', fontWeight: 600, margin: '0 0 4px 0' }}>
                {alert.symbol} — {alert.type}
              </p>
              <p style={{ color: '#8FA3B8', fontSize: 12, margin: 0 }}>
                {alert.condition}
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: alert.active ? '#00E5A0' : '#8FA3B8',
                }}
              />
              <span style={{ color: '#8FA3B8', fontSize: 12 }}>
                {alert.active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
