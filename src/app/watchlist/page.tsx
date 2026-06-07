'use client'
import { useState, useEffect } from 'react'

export default function WatchlistPage() {
  const [watchlists, setWatchlists] = useState<any[]>([])
  const [selectedWatchlist, setSelectedWatchlist] = useState<any>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    symbols: [] as string[],
  })
  const [newSymbol, setNewSymbol] = useState('')

  const allSymbols = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT', 'ADAUSDT']

  useEffect(() => {
    fetchWatchlists()
  }, [])

  const fetchWatchlists = async () => {
    try {
      const response = await fetch('/api/watchlists/list', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
      })
      if (response.ok) {
        const data = await response.json()
        setWatchlists(data)
        if (data.length > 0) {
          setSelectedWatchlist(data[0])
        }
      }
    } catch (error) {
      console.error('Failed to fetch watchlists:', error)
    }
  }

  const handleCreateWatchlist = async () => {
    if (!formData.name) return

    try {
      const response = await fetch('/api/watchlists/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      if (response.ok) {
        setShowCreateModal(false)
        fetchWatchlists()
        setFormData({ name: '', description: '', symbols: [] })
      }
    } catch (error) {
      console.error('Failed to create watchlist:', error)
    }
  }

  const handleAddSymbol = async (watchlistId: string, symbol: string) => {
    try {
      const response = await fetch(`/api/watchlists/${watchlistId}/add-symbol?symbol=${symbol}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
      })
      if (response.ok) {
        fetchWatchlists()
      }
    } catch (error) {
      console.error('Failed to add symbol:', error)
    }
  }

  const handleRemoveSymbol = async (watchlistId: string, symbol: string) => {
    try {
      const response = await fetch(`/api/watchlists/${watchlistId}/remove-symbol?symbol=${symbol}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
      })
      if (response.ok) {
        fetchWatchlists()
      }
    } catch (error) {
      console.error('Failed to remove symbol:', error)
    }
  }

  const handleDeleteWatchlist = async (watchlistId: string) => {
    try {
      const response = await fetch(`/api/watchlists/${watchlistId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
      })
      if (response.ok) {
        fetchWatchlists()
        setSelectedWatchlist(null)
      }
    } catch (error) {
      console.error('Failed to delete watchlist:', error)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-accent">My Watchlists</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-accent text-background rounded font-semibold hover:bg-accent-hover transition"
        >
          + New Watchlist
        </button>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {/* Watchlist List */}
        <div className="col-span-1 rounded-2xl bg-surface border border-accent border-opacity-10 p-4">
          <h2 className="font-semibold text-accent mb-4">Watchlists</h2>
          <div className="space-y-2">
            {watchlists.map(wl => (
              <button
                key={wl.id}
                onClick={() => setSelectedWatchlist(wl)}
                className={`w-full text-left px-3 py-2 rounded transition ${
                  selectedWatchlist?.id === wl.id
                    ? 'bg-accent text-background'
                    : 'bg-surface-hover text-text-secondary hover:bg-secondary'
                }`}
              >
                <div className="font-semibold">{wl.name}</div>
                <div className="text-xs">{wl.symbols.length} symbols</div>
              </button>
            ))}
            {watchlists.length === 0 && (
              <div className="text-center text-text-secondary text-sm py-8">No watchlists yet</div>
            )}
          </div>
        </div>

        {/* Watchlist Detail */}
        {selectedWatchlist && (
          <div className="col-span-3 rounded-2xl bg-surface border border-accent border-opacity-10 p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-accent">{selectedWatchlist.name}</h2>
                {selectedWatchlist.description && (
                  <p className="text-text-secondary mt-1">{selectedWatchlist.description}</p>
                )}
              </div>
              <button
                onClick={() => handleDeleteWatchlist(selectedWatchlist.id)}
                className="text-danger hover:text-danger text-sm transition"
              >
                Delete
              </button>
            </div>

            {/* Current Symbols */}
            <div>
              <h3 className="text-sm font-semibold text-text-primary mb-3">Symbols ({selectedWatchlist.symbols.length})</h3>
              <div className="grid grid-cols-3 gap-3 mb-6">
                {selectedWatchlist.symbols.map((symbol: string) => (
                  <div
                    key={symbol}
                    className="p-3 bg-surface-hover rounded border border-accent border-opacity-20 flex justify-between items-center"
                  >
                    <span className="font-semibold text-accent">{symbol}</span>
                    <button
                      onClick={() => handleRemoveSymbol(selectedWatchlist.id, symbol)}
                      className="text-danger hover:text-danger transition"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Add Symbols */}
            <div>
              <h3 className="text-sm font-semibold text-text-primary mb-3">Add Symbols</h3>
              <div className="grid grid-cols-3 gap-2">
                {allSymbols
                  .filter(sym => !selectedWatchlist.symbols.includes(sym))
                  .map(symbol => (
                    <button
                      key={symbol}
                      onClick={() => handleAddSymbol(selectedWatchlist.id, symbol)}
                      className="px-3 py-2 bg-surface-hover rounded border border-accent border-opacity-20 text-text-primary hover:bg-secondary transition text-sm"
                    >
                      + {symbol}
                    </button>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-surface rounded-2xl p-6 max-w-md w-full border border-accent border-opacity-20">
            <h2 className="text-xl font-bold text-accent mb-4">Create Watchlist</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-text-secondary mb-1">Watchlist Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Top Gainers"
                  className="w-full px-3 py-2 bg-surface-hover rounded border border-accent border-opacity-20 text-text-primary placeholder-text-muted"
                />
              </div>

              <div>
                <label className="block text-sm text-text-secondary mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description"
                  className="w-full px-3 py-2 bg-surface-hover rounded border border-accent border-opacity-20 text-text-primary placeholder-text-muted resize-none"
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-3 py-2 bg-surface-hover rounded border border-accent border-opacity-20 text-text-secondary hover:bg-secondary transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateWatchlist}
                  className="flex-1 px-3 py-2 bg-accent text-background rounded font-semibold hover:bg-accent-hover transition disabled:opacity-50"
                  disabled={!formData.name}
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
