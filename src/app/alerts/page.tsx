'use client'
import { useState, useEffect } from 'react'
import { AlertType, AlertNotificationMethod } from '@/types/alerts'

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [formData, setFormData] = useState({
    symbol: 'BTCUSDT',
    alert_type: 'ofi_threshold',
    condition: { threshold: 0.5, direction: 'above' },
    notification_method: 'both',
    name: '',
    description: '',
  })

  useEffect(() => {
    fetchAlerts()
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchAlerts = async () => {
    try {
      const response = await fetch('/api/alerts/list', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
      })
      if (response.ok) {
        const data = await response.json()
        setAlerts(data)
      }
    } catch (error) {
      console.error('Failed to fetch alerts:', error)
    }
  }

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/alerts/notifications/list', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
      })
      if (response.ok) {
        const data = await response.json()
        setNotifications(data)
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    }
  }

  const handleCreateAlert = async () => {
    try {
      const response = await fetch('/api/alerts/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      if (response.ok) {
        setShowCreateModal(false)
        fetchAlerts()
        setFormData({
          symbol: 'BTCUSDT',
          alert_type: 'ofi_threshold',
          condition: { threshold: 0.5, direction: 'above' },
          notification_method: 'both',
          name: '',
          description: '',
        })
      }
    } catch (error) {
      console.error('Failed to create alert:', error)
    }
  }

  const handleDeleteAlert = async (alertId: string) => {
    try {
      const response = await fetch(`/api/alerts/${alertId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
      })
      if (response.ok) {
        fetchAlerts()
      }
    } catch (error) {
      console.error('Failed to delete alert:', error)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-accent">Alert Management</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-accent text-background rounded font-semibold hover:bg-accent-hover transition"
        >
          + Create Alert
        </button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Alerts */}
        <div className="rounded-2xl bg-surface border border-accent border-opacity-10 p-6">
          <h2 className="text-lg font-semibold text-accent mb-4">Active Alerts ({alerts.length})</h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {alerts.map(alert => (
              <div key={alert.id} className="p-3 bg-surface-hover rounded border border-accent border-opacity-20">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold text-text-primary">{alert.name}</div>
                    <div className="text-xs text-text-secondary mt-1">
                      {alert.symbol} • {alert.alert_type.replace('_', ' ').toUpperCase()}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteAlert(alert.id)}
                    className="text-xs text-danger hover:text-danger transition"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
            {alerts.length === 0 && (
              <div className="text-center text-text-secondary text-sm py-8">No active alerts</div>
            )}
          </div>
        </div>

        {/* Notifications */}
        <div className="rounded-2xl bg-surface border border-accent border-opacity-10 p-6">
          <h2 className="text-lg font-semibold text-accent mb-4">Recent Notifications ({notifications.length})</h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {notifications.map(notif => (
              <div
                key={notif.id}
                className={`p-3 rounded border ${
                  notif.is_read
                    ? 'bg-surface-hover border-accent border-opacity-10'
                    : 'bg-accent bg-opacity-10 border-accent border-opacity-30'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold text-text-primary">{notif.title}</div>
                    <div className="text-xs text-text-secondary mt-1">{notif.message}</div>
                    <div className="text-xs text-text-muted mt-1">
                      {new Date(notif.triggered_at).toLocaleString()}
                    </div>
                  </div>
                  {!notif.is_read && (
                    <div className="w-2 h-2 bg-accent rounded-full mt-1" />
                  )}
                </div>
              </div>
            ))}
            {notifications.length === 0 && (
              <div className="text-center text-text-secondary text-sm py-8">No notifications yet</div>
            )}
          </div>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-surface rounded-2xl p-6 max-w-md w-full border border-accent border-opacity-20">
            <h2 className="text-xl font-bold text-accent mb-4">Create Alert</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-text-secondary mb-1">Symbol</label>
                <select
                  value={formData.symbol}
                  onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                  className="w-full px-3 py-2 bg-surface-hover rounded border border-accent border-opacity-20 text-text-primary"
                >
                  <option>BTCUSDT</option>
                  <option>ETHUSDT</option>
                  <option>SOLUSDT</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-text-secondary mb-1">Alert Type</label>
                <select
                  value={formData.alert_type}
                  onChange={(e) => setFormData({ ...formData, alert_type: e.target.value })}
                  className="w-full px-3 py-2 bg-surface-hover rounded border border-accent border-opacity-20 text-text-primary"
                >
                  <option value="ofi_threshold">OFI Threshold</option>
                  <option value="volatility_spike">Volatility Spike</option>
                  <option value="spread_expansion">Spread Expansion</option>
                  <option value="queue_imbalance">Queue Imbalance</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-text-secondary mb-1">Alert Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., High OFI Alert"
                  className="w-full px-3 py-2 bg-surface-hover rounded border border-accent border-opacity-20 text-text-primary placeholder-text-muted"
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
                  onClick={handleCreateAlert}
                  className="flex-1 px-3 py-2 bg-accent text-background rounded font-semibold hover:bg-accent-hover transition"
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
