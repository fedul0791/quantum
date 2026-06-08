'use client'
import { useState } from 'react'
import Link from 'next/link'
import { AnimatedCard } from '@/lib/animations'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        throw new Error('Invalid credentials')
      }

      const data = await response.json()
      localStorage.setItem('token', data.access_token)
      window.location.href = '/'
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    const redirectUri = `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/google-callback`
    const scope = 'openid profile email'
    const responseType = 'code'
    
    if (!clientId) {
      setError('Google OAuth is not configured')
      return
    }
    
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
    authUrl.searchParams.append('client_id', clientId)
    authUrl.searchParams.append('redirect_uri', redirectUri)
    authUrl.searchParams.append('response_type', responseType)
    authUrl.searchParams.append('scope', scope)
    authUrl.searchParams.append('state', Math.random().toString(36).substring(7))
    
    window.location.href = authUrl.toString()
  }

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
          background: 'rgba(16,24,38,0.6)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(0,229,212,0.1)',
          borderRadius: 20,
          padding: 40,
        }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>₿</div>
            <h1 style={{ color: '#F5F7FA', fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
              Quantum Flow
            </h1>
            <p style={{ color: '#8FA3B8', fontSize: 14 }}>
              Institutional Grade Market Intelligence
            </p>
          </div>

          {/* Google OAuth Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            style={{
              width: '100%',
              padding: '12px 24px',
              background: 'rgba(55, 66, 250, 0.1)',
              border: '1px solid rgba(55, 66, 250, 0.3)',
              borderRadius: 8,
              color: '#3742FA',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              marginBottom: 16,
            }}
          >
            <span>🔐</span>
            Sign in with Google
          </button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(0,229,212,0.1)' }} />
            <span style={{ color: '#8FA3B8', fontSize: 12 }}>or</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(0,229,212,0.1)' }} />
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Email */}
            <div>
              <label style={{
                display: 'block',
                color: '#8FA3B8',
                fontSize: 12,
                fontWeight: 600,
                marginBottom: 8,
              }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'rgba(7, 11, 18, 0.5)',
                  border: '1px solid rgba(0,229,212,0.2)',
                  borderRadius: 8,
                  color: '#F5F7FA',
                  fontSize: 14,
                  outline: 'none',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(0,229,212,0.4)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(0,229,212,0.2)'
                }}
              />
            </div>

            {/* Password */}
            <div>
              <label style={{
                display: 'block',
                color: '#8FA3B8',
                fontSize: 12,
                fontWeight: 600,
                marginBottom: 8,
              }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'rgba(7, 11, 18, 0.5)',
                  border: '1px solid rgba(0,229,212,0.2)',
                  borderRadius: 8,
                  color: '#F5F7FA',
                  fontSize: 14,
                  outline: 'none',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(0,229,212,0.4)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(0,229,212,0.2)'
                }}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div style={{
                padding: 12,
                background: 'rgba(255, 71, 87, 0.1)',
                border: '1px solid rgba(255, 71, 87, 0.3)',
                borderRadius: 8,
                color: '#FF4757',
                fontSize: 12,
              }}>
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, rgba(0,229,212,0.2) 0%, rgba(0,229,160,0.1) 100%)',
                border: '1px solid rgba(0,229,212,0.3)',
                borderRadius: 8,
                color: '#00E5D4',
                fontSize: 14,
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                transition: 'all 0.2s',
              }}
            >
              {loading ? 'Signing in...' : 'Sign In with Email'}
            </button>
          </form>

          {/* Footer */}
          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <p style={{ color: '#8FA3B8', fontSize: 12 }}>
              Don't have an account?{' '}
              <Link href="/register" style={{
                color: '#00E5D4',
                textDecoration: 'none',
                fontWeight: 600,
              }}>
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </AnimatedCard>
    </div>
  )
}
