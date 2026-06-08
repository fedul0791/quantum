'use client'
import { useState } from 'react'
import Link from 'next/link'
import { AnimatedCard } from '@/lib/animations'

const PASSWORD_REQUIREMENTS = [
  { label: 'At least 8 characters', check: (p: string) => p.length >= 8 },
  { label: 'Contains uppercase letter (A-Z)', check: (p: string) => /[A-Z]/.test(p) },
  { label: 'Contains lowercase letter (a-z)', check: (p: string) => /[a-z]/.test(p) },
  { label: 'Contains digit (0-9)', check: (p: string) => /\d/.test(p) },
  { label: 'Contains special character (!@#$%^&*)', check: (p: string) => /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(p) },
]

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false)

  const checkPasswordRequirements = () => {
    return PASSWORD_REQUIREMENTS.map(req => ({
      ...req,
      met: req.check(password)
    }))
  }

  const isPasswordValid = () => {
    return PASSWORD_REQUIREMENTS.every(req => req.check(password))
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!isPasswordValid()) {
      setError('Password does not meet all requirements')
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, confirm_password: confirmPassword }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.detail || 'Registration failed')
      }

      // Redirect to login
      window.location.href = '/login?registered=true'
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const requirements = checkPasswordRequirements()
  const allMet = requirements.every(r => r.met)

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
          maxWidth: 450,
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
              Create Account
            </h1>
            <p style={{ color: '#8FA3B8', fontSize: 14 }}>
              Join Quantum Flow Terminal
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
                onFocus={() => setShowPasswordRequirements(true)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'rgba(7, 11, 18, 0.5)',
                  border: `1px solid ${allMet && password ? 'rgba(0, 229, 212, 0.4)' : 'rgba(0,229,212,0.2)'}`,
                  borderRadius: 8,
                  color: '#F5F7FA',
                  fontSize: 14,
                  outline: 'none',
                }}
              />

              {/* Password Requirements */}
              {showPasswordRequirements && password && (
                <div style={{
                  marginTop: 12,
                  padding: 12,
                  background: 'rgba(7, 11, 18, 0.5)',
                  border: '1px solid rgba(0,229,212,0.1)',
                  borderRadius: 8,
                }}>
                  {requirements.map((req, idx) => (
                    <div key={idx} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      fontSize: 12,
                      color: req.met ? '#00E5D4' : '#8FA3B8',
                      marginBottom: idx < requirements.length - 1 ? 4 : 0,
                    }}>
                      <span>{req.met ? '✓' : '○'}</span>
                      <span>{req.label}</span>
                    </div>
                  ))}
                </div>
              )}
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
                  border: `1px solid ${password && confirmPassword === password ? 'rgba(0, 229, 212, 0.4)' : 'rgba(0,229,212,0.2)'}`,
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
              disabled={loading || !allMet || password !== confirmPassword}
              style={{
                padding: '12px 24px',
                background: allMet && password === confirmPassword
                  ? 'linear-gradient(135deg, rgba(0,229,212,0.2) 0%, rgba(0,229,160,0.1) 100%)'
                  : 'rgba(0,229,212,0.1)',
                border: '1px solid rgba(0,229,212,0.3)',
                borderRadius: 8,
                color: '#00E5D4',
                fontSize: 14,
                fontWeight: 600,
                cursor: (loading || !allMet || password !== confirmPassword) ? 'not-allowed' : 'pointer',
                opacity: (loading || !allMet || password !== confirmPassword) ? 0.6 : 1,
                transition: 'all 0.2s',
              }}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
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
