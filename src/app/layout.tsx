'use client'
import { useState } from 'react'
import ErrorBoundary from '@/components/ErrorBoundary'
import { ToastProvider } from '@/components/Toast'
import './globals.css'

const menuItems = [
  { name: 'Dashboard', icon: '◈', id: 'dashboard', path: '/' },
  { name: 'Microstructure', icon: '⧈', id: 'microstructure', path: '/microstructure' },
  { name: 'Alerts', icon: '⚡', id: 'alerts', path: '/alerts' },
  { name: 'Watchlists', icon: '★', id: 'watchlist', path: '/watchlist' },
  { name: 'Replay', icon: '⟳', id: 'replay', path: '/replay' },
]

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [expanded, setExpanded] = useState(false)
  const [activeItem, setActiveItem] = useState('dashboard')

  const handleNav = (id: string, path: string) => {
    setActiveItem(id)
    window.location.href = path
  }

  return (
    <html lang="en">
      <body>
        <ErrorBoundary>
          <ToastProvider>
        <div className="flex h-screen">
          {/* Sidebar */}
          <div 
            onMouseEnter={() => setExpanded(true)}
            onMouseLeave={() => setExpanded(false)}
            style={{
              width: expanded ? 250 : 60,
              background: 'linear-gradient(180deg, rgba(10,16,32,0.98) 0%, rgba(16,24,38,0.95) 100%)',
              backdropFilter: 'blur(30px)',
              borderRight: '1px solid rgba(0,229,212,0.08)',
              display: 'flex', 
              flexDirection: 'column',
              padding: '16px 8px', 
              flexShrink: 0, 
              zIndex: 100,
              boxShadow: '8px 0 40px rgba(0,0,0,0.6)',
              transition: 'width 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
              overflow: 'hidden', 
              position: 'relative',
            }}
          >
            {/* Logo */}
            <div className="mb-8 px-3 flex items-center gap-3">
              <div className="text-3xl">₿</div>
              <div>
                <div className="text-[#00E5D4] font-bold text-xl">Quantum</div>
                <div className="text-xs text-[#8FA3B8]">Flow</div>
              </div>
            </div>

            {/* Menu */}
            <div className="flex-1 space-y-1">
              {menuItems.map((item) => {
                const isActive = activeItem === item.id
                return (
                  <div 
                    key={item.id}
                    onClick={() => handleNav(item.id, item.path)}
                    style={{
                      color: isActive ? '#00E5D4' : '#8FA3B8',
                      padding: '12px 16px',
                      borderRadius: 10,
                      marginBottom: 2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      background: isActive ? 'rgba(0,229,212,0.1)' : 'transparent',
                      border: isActive ? '1px solid rgba(0,229,212,0.2)' : '1px solid transparent',
                      fontSize: 13,
                    }}
                  >
                    <span>{item.icon}</span>
                    {expanded && <span>{item.name}</span>}
                  </div>
                )
              })}
            </div>

            {/* Footer */}
            <div style={{
              paddingTop: 16,
              borderTop: '1px solid rgba(0,229,212,0.08)',
              textAlign: 'center',
              color: '#5C728A',
              fontSize: 10,
            }}>
              {expanded && 'v1.0'}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-auto bg-[#070B12]">
            {children}
          </div>
        </div>
          </ToastProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
