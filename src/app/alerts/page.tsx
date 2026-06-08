'use client'
import { useState, useEffect } from 'react'
import { AnimatedCard } from '@/lib/animations'

interface Alert {
  id: number
  symbol: string
  alert_type: string
  threshold: number
  status: string
  created_at: string
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newAlert, setNewAlert] = useState({ symbol: 'BTCUSDT', type: 'OFI', value: '0.2' })
  const [creating, setCreating] = useState(false)

  // Fetch alerts on mount
  useEffect(() => {
    fetchAlerts()
  }, [])

  const fetchAlerts = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch('/api/alerts', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      })

      if (!response.ok) throw new Error('Failed to load alerts')
      const data = await response.json()
      setAlerts(Array.isArray(data) ? data : [])
      setError(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load alerts'
      setError(message)
      console.error('Alerts fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/alerts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({
          symbol: newAlert.symbol,
          alert_type: newAlert.type,
          threshold: parseFloat(newAlert.value),
        }),
      })

      if (!response.ok) throw new Error('Failed to create alert')
      
      await fetchAlerts()
      setNewAlert({ symbol: 'BTCUSDT', type: 'OFI', value: '0.2' })
      setError(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create alert'
      setError(message)
      console.error('Alert creation error:', err)
    } finally {
      setCreating(false)
    }
  }

  const deleteAlert = async (id: number) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/alerts/${id}`, {
        method: 'DELETE',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      })

      if (!response.ok) throw new Error('Failed to delete alert')
      await fetchAlerts()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete alert'
      setError(message)
      console.error('Alert deletion error:', err)
    }
  }

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <AnimatedCard delay={0}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: '#F5F7FA', marginBottom: 8 }}>
            Alert Configuration
          </h1>
          <p style={{ color: '#8FA3B8', fontSize: 14 }}>Create and manage market alerts for real-time notifications</p>
        </div>
      </AnimatedCard>

      {/* Error Message */}
      {error && (
        <AnimatedCard delay={0.02}>
          <div style={{
            padding: 12,
            background: 'rgba(255, 71, 87, 0.1)',
            border: '1px solid rgba(255, 71, 87, 0.3)',
            borderRadius: 12,
            color: '#FF4757',
            marginBottom: 20,
            fontSize: 12,
          }}>
            ⚠️ {error}
          </div>
        </AnimatedCard>
      )}

      {/* Create Alert Form */}
      <AnimatedCard delay={0.05}>
        <div style={{ background: 'rgba(16,24,38,0.6)', border: '1px solid rgba(0,229,212,0.1)', borderRadius: 12, padding: 20, marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: '#00E5D4', marginBottom: 16 }}>Create New Alert</h2>
          
          <form onSubmit={handleCreateAlert}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 16 }}>
              <div>
                <label style={{ display: 'block', color: '#8FA3B8', fontSize: 12, marginBottom: 6 }}>Symbol</label>
                <select
                  value={newAlert.symbol}
                  onChange={(e) => setNewAlert({ ...newAlert, symbol: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    background: 'rgba(7, 11, 18, 0.5)',
                    border: '1px solid rgba(0,229,212,0.2)',
                    borderRadius: 6,
                    color: '#F5F7FA',
                    fontSize: 12,
                  }}
                >
                  {['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', color: '#8FA3B8', fontSize: 12, marginBottom: 6 }}>Alert Type</label>
                <select
                  value={newAlert.type}
                  onChange={(e) => setNewAlert({ ...newAlert, type: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    background: 'rgba(7, 11, 18, 0.5)',
                    border: '1px solid rgba(0,229,212,0.2)',
                    borderRadius: 6,
                    color: '#F5F7FA',
                    fontSize: 12,
                  }}
                >
                  <option>OFI</option>
                  <option>Volatility</option>
                  <option>Spread</option>
                  <option>Queue Imbalance</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', color: '#8FA3B8', fontSize: 12, marginBottom: 6 }}>Threshold</label>
                <input
                  type="number"
                  step="0.01"
                  value={newAlert.value}
                  onChange={(e) => setNewAlert({ ...newAlert, value: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    background: 'rgba(7, 11, 18, 0.5)',
                    border: '1px solid rgba(0,229,212,0.2)',
                    borderRadius: 6,
                    color: '#F5F7FA',
                    fontSize: 12,
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={creating || loading}
              style={{
                padding: '10px 20px',
                background: 'rgba(0,229,212,0.1)',
                border: '1px solid rgba(0,229,212,0.3)',
                borderRadius: 6,
                color: '#00E5D4',
                fontSize: 12,
                fontWeight: 600,
                cursor: creating || loading ? 'not-allowed' : 'pointer',
                opacity: creating || loading ? 0.6 : 1,
              }}
            >
              {creating ? 'Creating...' : '+ Create Alert'}
            </button>
          </form>
        </div>
      </AnimatedCard>

      {/* Active Alerts */}
      <AnimatedCard delay={0.1}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#00E5D4', marginBottom: 16 }}>Active Alerts</h2>
          
          {loading ? (
            <div style={{ padding: 24, textAlign: 'center', color: '#8FA3B8' }}>
              Loading alerts...
            </div>
          ) : alerts.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: '#8FA3B8' }}>
              No alerts configured yet
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 12 }}>
              {alerts.map(alert => (
                <div
                  key={alert.id}
                  style={{
                    background: 'rgba(16,24,38,0.6)',
                    border: '1px solid rgba(0,229,212,0.1)',
                    borderRadius: 8,
                    padding: 12,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ color: '#F5F7FA', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                      {alert.symbol} — {alert.alert_type}
                    </div>
                    <div style={{ color: '#8FA3B8', fontSize: 11 }}>
                      Threshold: {alert.threshold}
                    </div>
                    <div style={{ color: '#5C728A', fontSize: 10, marginTop: 4 }}>
                      {new Date(alert.created_at).toLocaleString()}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <div style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: alert.status === 'active' ? '#00E5A0' : '#FFA502',
                    }} />
                    <button
                      onClick={() => deleteAlert(alert.id)}
                      style={{
                        padding: '4px 8px',
                        background: 'rgba(255, 71, 87, 0.1)',
                        border: '1px solid rgba(255, 71, 87, 0.2)',
                        borderRadius: 4,
                        color: '#FF4757',
                        fontSize: 11,
                        cursor: 'pointer',
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </AnimatedCard>
    </div>
  )
}
