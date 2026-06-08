'use client'
import React, { createContext, useContext, useState, useCallback } from 'react'

interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration?: number
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (message: string, type: 'success' | 'error' | 'warning' | 'info', duration?: number) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const addToast = useCallback((message: string, type: 'success' | 'error' | 'warning' | 'info', duration = 5000) => {
    const id = Date.now().toString()
    const toast: Toast = { id, message, type, duration }
    setToasts(prev => [...prev, toast])

    if (duration > 0) {
      setTimeout(() => removeToast(id), duration)
    }
  }, [removeToast])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

function ToastContainer({ toasts, removeToast }: { toasts: Toast[], removeToast: (id: string) => void }) {
  const colors = {
    success: { bg: 'rgba(0, 229, 160, 0.1)', border: 'rgba(0, 229, 160, 0.3)', color: '#00E5A0', icon: '✓' },
    error: { bg: 'rgba(255, 71, 87, 0.1)', border: 'rgba(255, 71, 87, 0.3)', color: '#FF4757', icon: '✕' },
    warning: { bg: 'rgba(255, 165, 2, 0.1)', border: 'rgba(255, 165, 2, 0.3)', color: '#FFA502', icon: '!' },
    info: { bg: 'rgba(55, 66, 250, 0.1)', border: 'rgba(55, 66, 250, 0.3)', color: '#3742FA', icon: 'ℹ' },
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: 20,
      right: 20,
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
    }}>
      {toasts.map(toast => {
        const theme = colors[toast.type]
        return (
          <div
            key={toast.id}
            style={{
              background: theme.bg,
              border: `1px solid ${theme.border}`,
              borderRadius: 8,
              padding: '12px 16px',
              color: theme.color,
              fontSize: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              minWidth: 250,
              maxWidth: 400,
              animation: 'slideIn 0.3s ease-out',
            }}
          >
            <span style={{ fontSize: 16 }}>{theme.icon}</span>
            <span style={{ flex: 1 }}>{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              style={{
                background: 'transparent',
                border: 'none',
                color: theme.color,
                cursor: 'pointer',
                fontSize: 12,
              }}
            >
              ✕
            </button>
          </div>
        )
      })}
    </div>
  )
}
