'use client'
import { useEffect, useRef, useCallback } from 'react'
import { useMarketStore } from '@/store/marketStore'

const WS_URL = typeof window !== 'undefined' ? 
  (window.location.protocol === 'https:' ? 'wss:' : 'ws:') + '//' + window.location.host + '/api/ws' :
  'ws://localhost:8000/api/ws'

export function useWebSocket(symbol: string, type: 'market' | 'hft' = 'market') {
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const maxReconnectAttempts = 5
  const reconnectDelay = 3000
  const setIsConnected = useMarketStore(state => {
    if (type === 'market') return state.setIsConnected
    return () => {} // HFT doesn't need global connected state
  })

  const connect = useCallback(() => {
    try {
      const url = `${WS_URL}/${type}/${symbol}`
      console.log(`[WebSocket] Connecting to ${url}`)
      
      wsRef.current = new WebSocket(url)

      wsRef.current.onopen = () => {
        console.log(`[WebSocket] Connected: ${type}/${symbol}`)
        reconnectAttemptsRef.current = 0
        setIsConnected(true)
        // Send initial ping
        wsRef.current?.send(JSON.stringify({ type: 'ping' }))
      }

      wsRef.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)
          
          if (message.type === 'pong') {
            // Heartbeat response
            return
          }

          if (message.type === 'market_update' && type === 'market') {
            // Update market store with new data
            useMarketStore.getState().setPrice(symbol, {
              price: message.data.price,
              change: message.data.change,
            })
          } else if (message.type === 'hft_update' && type === 'hft') {
            // Update HFT metrics
            console.log('[WebSocket] HFT Update:', message.metrics)
          }
        } catch (error) {
          console.error('[WebSocket] Message parse error:', error)
        }
      }

      wsRef.current.onerror = (event) => {
        console.error(`[WebSocket] Error on ${type}/${symbol}:`, event)
        setIsConnected(false)
      }

      wsRef.current.onclose = () => {
        console.log(`[WebSocket] Closed: ${type}/${symbol}`)
        setIsConnected(false)
        
        // Attempt reconnect
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++
          console.log(`[WebSocket] Reconnecting... (attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts})`)
          setTimeout(connect, reconnectDelay * reconnectAttemptsRef.current)
        } else {
          console.error('[WebSocket] Max reconnect attempts reached')
        }
      }
    } catch (error) {
      console.error('[WebSocket] Connection error:', error)
      setIsConnected(false)
    }
  }, [symbol, type, setIsConnected])

  useEffect(() => {
    connect()

    // Heartbeat interval
    const heartbeatInterval = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'ping' }))
      }
    }, 30000) // 30 seconds

    return () => {
      clearInterval(heartbeatInterval)
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.close()
      }
    }
  }, [connect])

  return {
    send: (message: any) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify(message))
      }
    },
    isConnected: wsRef.current?.readyState === WebSocket.OPEN,
  }
}
