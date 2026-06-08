'use client'
import { useState, useCallback, useEffect } from 'react'

interface AuthState {
  accessToken: string | null
  user: any | null
  isAuthenticated: boolean
}

let authState: AuthState = {
  accessToken: null,
  user: null,
  isAuthenticated: false,
}

const listeners = new Set<() => void>()

export const useAuth = () => {
  const [auth, setAuth] = useState<AuthState>(authState)

  useEffect(() => {
    const updateAuth = () => setAuth({ ...authState })
    listeners.add(updateAuth)
    return () => listeners.delete(updateAuth)
  }, [])

  const setAccessToken = useCallback((token: string | null) => {
    authState.accessToken = token
    authState.isAuthenticated = !!token
    listeners.forEach(listener => listener())
  }, [])

  const setUser = useCallback((user: any) => {
    authState.user = user
    authState.isAuthenticated = !!user
    listeners.forEach(listener => listener())
  }, [])

  const logout = useCallback(() => {
    authState.accessToken = null
    authState.user = null
    authState.isAuthenticated = false
    listeners.forEach(listener => listener())
  }, [])

  return {
    ...auth,
    setAccessToken,
    setUser,
    logout,
  }
}

// Utility function to get current auth state
export const getAuthToken = () => authState.accessToken

// Utility function to get auth headers
export const getAuthHeaders = () => ({
  'Authorization': authState.accessToken ? `Bearer ${authState.accessToken}` : '',
})
