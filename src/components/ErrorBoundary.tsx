'use client'
import React from 'react'

interface Props {
  children: React.ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          background: '#070B12',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
        }}>
          <div style={{
            maxWidth: 500,
            background: 'rgba(16,24,38,0.6)',
            border: '1px solid rgba(255, 71, 87, 0.3)',
            borderRadius: 12,
            padding: 32,
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
            <h1 style={{ color: '#FF4757', fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
              Something went wrong
            </h1>
            <p style={{ color: '#8FA3B8', marginBottom: 24 }}>
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => window.location.href = '/'}
              style={{
                padding: '12px 24px',
                background: 'rgba(0,229,212,0.1)',
                border: '1px solid rgba(0,229,212,0.3)',
                borderRadius: 6,
                color: '#00E5D4',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
