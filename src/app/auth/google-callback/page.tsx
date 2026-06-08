'use client'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AnimatedCard } from '@/lib/animations'

export default function GoogleCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get authorization code from query params
        const code = searchParams.get('code')
        const state = searchParams.get('state')

        if (!code) {
          throw new Error('No authorization code received')
        }

        // Exchange code for token
        const response = await fetch('/api/auth/oauth/google/callback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, state }),
        })

        if (!response.ok) {
          throw new Error('OAuth authentication failed')
        }

        const data = await response.json()
        
        // Store token
        localStorage.setItem('token', data.access_token)
        
        // Redirect to dashboard
        router.push('/')
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Authentication failed'
        setError(message)
        setLoading(false)
        console.error('OAuth callback error:', err)
      }
    }

    handleCallback()
  }, [searchParams, router])

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #070B12 0%, #101826 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
    }}>
      <AnimatedCard delay={0}>
        <div style={{
          width: '100%',
          maxWidth: 400,
          textAlign: 'center',
        }}>
          {loading ? (
            <>
              <div style={{ fontSize: 48, marginBottom: 16, animation: 'spin 1s linear infinite' }}>
                ⟳
              </div>
              <h1 style={{ color: '#F5F7FA', fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
                Authenticating with Google...
              </h1>
              <p style={{ color: '#8FA3B8', fontSize: 14 }}>
                Please wait while we verify your account
              </p>
            </>
          ) : error ? (
            <>
              <div style={{ fontSize: 48, marginBottom: 16 }}>❌</div>
              <h1 style={{ color: '#FF4757', fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
                Authentication Error
              </h1>
              <p style={{ color: '#8FA3B8', fontSize: 14, marginBottom: 24 }}>
                {error}
              </p>
              <button
                onClick={() => window.location.href = '/login'}
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
                Back to Login
              </button>
            </>
          ) : null}
        </div>
      </AnimatedCard>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
