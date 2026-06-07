'use client'
import { useState } from 'react'
import './globals.css'

const menuItems = [
  { name: 'Главная', icon: '◈', id: 'dashboard' },
  { name: 'Графики', icon: '⊟', id: 'chart' },
  { name: 'Стакан', icon: '⊞', id: 'orderbook' },
  { name: 'HFT и LOB Метрики', icon: '⟐', id: 'hft' },
  { name: 'Микроструктура', icon: '⧈', id: 'microstructure' },
  { name: 'Оповещение', icon: '⚡', id: 'alerts' },
  { name: 'Избранное', icon: '★', id: 'watchlist' },
]

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [expanded, setExpanded] = useState(false)
  const [activeItem, setActiveItem] = useState('dashboard')

  const handleNav = (id: string) => {
    setActiveItem(id)
    const paths: Record<string, string> = {
      dashboard: '/',
      chart: '/chart',
      orderbook: '/orderbook',
      hft: '/hft',
      microstructure: '/microstructure',
      alerts: '/alerts',
      watchlist: '/watchlist',
    }
    window.location.href = paths[id] || '/'
  }

  return (
    <html lang="ru">
      <body>
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
            {/* Логотип */}
            <div className="mb-8 px-3 flex items-center gap-3">
              <div className="text-3xl">₿</div>
              <div>
                <div className="text-[#00E5D4] font-bold text-xl">Quantum Flow</div>
                <div className="text-xs text-[#8FA3B8]">Terminal</div>
              </div>
            </div>

            {/* Меню */}
            <div className="flex-1 space-y-1">
              {menuItems.map((item) => {
                const isActive = activeItem === item.id
                return (
                  <div 
                    key={item.id}
                    onClick={() => handleNav(item.id)}
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
          </div>

          {/* Основной контент */}
          <div className="flex-1 overflow-auto bg-[#070B12]">
            {children}
          </div>
        </div>
      </body>
    </html>
  )
}
