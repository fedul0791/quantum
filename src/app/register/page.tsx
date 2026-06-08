'use client'
import { useState } from 'react'
import Link from 'next/link'
import { AnimatedCard } from '@/lib/animations'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        throw new Error('Registration failed')
      }

      window.location.href = '/login'
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
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
              Join Quantum Flow
            </h1>
            <p style={{ color: '#8FA3B8', fontSize: 14 }}>
              Create your account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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

            {/* Confirm Password */}
            <div>
              <label style={{
                display: 'block',
                color: '#8FA3B8',
                fontSize: 12,
                fontWeight: 600,
                marginBottom: 8,
              }}>
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          {/* Footer */}
          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <p style={{ color: '#8FA3B8', fontSize: 12 }}>
              Already have an account?{' '}
              <Link href="/login" style={{
                color: '#00E5D4',
                textDecoration: 'none',
                fontWeight: 600,
              }}>
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </AnimatedCard>
    </div>
  )
}
