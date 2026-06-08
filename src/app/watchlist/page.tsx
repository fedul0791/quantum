'use client'
import { useState, useEffect } from 'react'
import { AnimatedCard } from '@/lib/animations'

interface Watchlist {
  id: number
  name: string
  symbols: string[]
  is_default: boolean
}

const availableSymbols = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'ADAUSDT', 'XRPUSDT']

export default function WatchlistPage() {
  const [watchlists, setWatchlists] = useState<Watchlist[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newWatchlistName, setNewWatchlistName] = useState('')
  const [creating, setCreating] = useState(false)
  const [selectedSymbol, setSelectedSymbol] = useState('')
  const [editingWatchlist, setEditingWatchlist] = useState<number | null>(null)

  // Fetch watchlists on mount
  useEffect(() => {
    fetchWatchlists()
  }, [])

  const fetchWatchlists = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch('/api/watchlists', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      })

      if (!response.ok) throw new Error('Failed to load watchlists')
      const data = await response.json()
      setWatchlists(Array.isArray(data) ? data : [])
      setError(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load watchlists'
      setError(message)
      console.error('Watchlists fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const createWatchlist = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newWatchlistName.trim()) return

    setCreating(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/watchlists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({ name: newWatchlistName }),
      })

      if (!response.ok) throw new Error('Failed to create watchlist')
      
      await fetchWatchlists()
      setNewWatchlistName('')
      setError(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create watchlist'
      setError(message)
      console.error('Watchlist creation error:', err)
    } finally {
      setCreating(false)
    }
  }

  const deleteWatchlist = async (id: number) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/watchlists/${id}`, {
        method: 'DELETE',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      })

      if (!response.ok) throw new Error('Failed to delete watchlist')
      await fetchWatchlists()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete watchlist'
      setError(message)
      console.error('Watchlist deletion error:', err)
    }
  }

  const toggleDefault = async (id: number) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/watchlists/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({ is_default: true }),
      })

      if (!response.ok) throw new Error('Failed to update watchlist')
      await fetchWatchlists()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update watchlist'
      setError(message)
      console.error('Watchlist update error:', err)
    }
  }

  const addSymbol = async (watchlistId: number, symbol: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/watchlists/${watchlistId}/symbols`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({ symbol }),
      })

      if (!response.ok) throw new Error('Failed to add symbol')
      await fetchWatchlists()
      setSelectedSymbol('')
      setEditingWatchlist(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add symbol'
      setError(message)
      console.error('Symbol add error:', err)
    }
  }

  const removeSymbol = async (watchlistId: number, symbol: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/watchlists/${watchlistId}/symbols/${symbol}`, {
        method: 'DELETE',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      })

      if (!response.ok) throw new Error('Failed to remove symbol')
      await fetchWatchlists()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to remove symbol'
      setError(message)
      console.error('Symbol remove error:', err)
    }
  }

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <AnimatedCard delay={0}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: '#F5F7FA', marginBottom: 8 }}>
            My Watchlists
          </h1>
          <p style={{ color: '#8FA3B8', fontSize: 14 }}>Organize and track your favorite cryptocurrencies</p>
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

      {/* Create Watchlist */}
      <AnimatedCard delay={0.05}>
        <div style={{ background: 'rgba(16,24,38,0.6)', border: '1px solid rgba(0,229,212,0.1)', borderRadius: 12, padding: 20, marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: '#00E5D4', marginBottom: 16 }}>Create Watchlist</h2>
          
          <form onSubmit={createWatchlist} style={{ display: 'flex', gap: 12 }}>
            <input
              type="text"
              placeholder="Enter watchlist name..."
              value={newWatchlistName}
              onChange={(e) => setNewWatchlistName(e.target.value)}
              style={{
                flex: 1,
                padding: '10px 12px',
                background: 'rgba(7, 11, 18, 0.5)',
                border: '1px solid rgba(0,229,212,0.2)',
                borderRadius: 6,
                color: '#F5F7FA',
                fontSize: 12,
              }}
            />
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
              Create
            </button>
          </form>
        </div>
      </AnimatedCard>

      {/* Watchlists Grid */}
      {loading ? (
        <AnimatedCard delay={0.1}>
          <div style={{ padding: 24, textAlign: 'center', color: '#8FA3B8' }}>
            Loading watchlists...
          </div>
        </AnimatedCard>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {watchlists.map((watchlist, idx) => (
            <AnimatedCard key={watchlist.id} delay={0.05 + idx * 0.05}>
              <div style={{
                background: 'rgba(16,24,38,0.6)',
                border: watchlist.is_default ? '1px solid rgba(0,229,212,0.3)' : '1px solid rgba(0,229,212,0.1)',
                borderRadius: 12,
                padding: 16,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 16 }}>
                  <div>
                    <h3 style={{ color: '#F5F7FA', fontSize: 14, fontWeight: 600 }}>{watchlist.name}</h3>
                    {watchlist.is_default && (
                      <div style={{ color: '#00E5D4', fontSize: 10, marginTop: 4 }}>★ Default</div>
                    )}
                  </div>
                  <button
                    onClick={() => deleteWatchlist(watchlist.id)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#8FA3B8',
                      cursor: 'pointer',
                      fontSize: 16,
                    }}
                  >
                    ✕
                  </button>
                </div>

                {/* Symbols */}
                <div style={{ marginBottom: 16 }}>
                  {watchlist.symbols.length === 0 ? (
                    <div style={{ color: '#5C728A', fontSize: 12, textAlign: 'center', padding: '12px 0' }}>
                      No symbols added
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                      {watchlist.symbols.map(sym => (
                        <div key={sym} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <div
                            style={{
                              background: 'rgba(0,229,212,0.1)',
                              padding: '4px 8px',
                              borderRadius: 4,
                              color: '#00E5D4',
                              fontSize: 11,
                              fontWeight: 500,
                            }}
                          >
                            {sym}
                          </div>
                          <button
                            onClick={() => removeSymbol(watchlist.id, sym)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#FF4757',
                              cursor: 'pointer',
                              fontSize: 12,
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Add Symbol */}
                  {editingWatchlist === watchlist.id ? (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <select
                        value={selectedSymbol}
                        onChange={(e) => setSelectedSymbol(e.target.value)}
                        style={{
                          flex: 1,
                          padding: '6px 8px',
                          background: 'rgba(7, 11, 18, 0.5)',
                          border: '1px solid rgba(0,229,212,0.2)',
                          borderRadius: 4,
                          color: '#F5F7FA',
                          fontSize: 11,
                        }}
                      >
                        <option value="">Select symbol...</option>
                        {availableSymbols.filter(s => !watchlist.symbols.includes(s)).map(s => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => {
                          if (selectedSymbol) addSymbol(watchlist.id, selectedSymbol)
                        }}
                        style={{
                          padding: '6px 12px',
                          background: 'rgba(0,229,212,0.1)',
                          border: '1px solid rgba(0,229,212,0.2)',
                          borderRadius: 4,
                          color: '#00E5D4',
                          fontSize: 10,
                          cursor: 'pointer',
                        }}
                      >
                        Add
                      </button>
                    </div>
                  ) : null}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 6 }}>
                  {!watchlist.is_default && (
                    <button
                      onClick={() => toggleDefault(watchlist.id)}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        background: 'rgba(0,229,212,0.05)',
                        border: '1px solid rgba(0,229,212,0.2)',
                        borderRadius: 6,
                        color: '#8FA3B8',
                        fontSize: 11,
                        cursor: 'pointer',
                      }}
                    >
                      Set Default
                    </button>
                  )}
                  <button
                    onClick={() => setEditingWatchlist(editingWatchlist === watchlist.id ? null : watchlist.id)}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      background: editingWatchlist === watchlist.id ? 'rgba(0,229,212,0.15)' : 'rgba(0,229,212,0.05)',
                      border: '1px solid rgba(0,229,212,0.2)',
                      borderRadius: 6,
                      color: '#8FA3B8',
                      fontSize: 11,
                      cursor: 'pointer',
                    }}
                  >
                    {editingWatchlist === watchlist.id ? 'Done' : 'Add Symbol'}
                  </button>
                </div>
              </div>
            </AnimatedCard>
          ))}
        </div>
      )}
    </div>
  )
}
