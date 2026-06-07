'use client'
import { useState } from 'react'

export default function FearGreedPage() {
  const [expanded, setExpanded] = useState(false)
  
  return (
    <div style={{ padding: 28, maxWidth: 900 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif', color: '#F5F7FA', marginBottom: 8 }}>
        Индекс <span style={{ color: '#00E5D4' }}>страха и жадности</span>
      </h1>
      
      <div style={{ background: 'rgba(16,24,38,0.8)', border: '1px solid rgba(0,229,212,0.1)', borderRadius: 14, padding: 24, marginTop: 20 }}>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 48, fontWeight: 700, textAlign: 'center', background: 'linear-gradient(135deg, #00E5D4 0%, #00E5A0 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 4 }}>72</div>
        <div style={{ textAlign: 'center', color: '#F59E0B', fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Жадность</div>
        <div style={{ textAlign: 'center', color: '#F5F7FA', fontSize: 14, marginBottom: 16 }}>Рекомендация: Продаю</div>
        
        <div style={{ height: 200, background: 'rgba(0,229,212,0.03)', borderRadius: 12, border: '1px solid rgba(0,229,212,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <span style={{ color: '#5C728A', fontSize: 14 }}>📊 График индекса за 30 дней</span>
        </div>

        <h2 style={{ color: '#F5F7FA', fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Что это</h2>
        <p style={{ color: '#8FA3B8', fontSize: 13, lineHeight: 1.7 }}>
          Индекс страха и жадности измеряет настроение рынка по шкале от 0 до 100.
          Значения ниже 20 — «Чрезвычайный страх» (возможность для покупки).
          Значения выше 80 — «Чрезвычайная жадность» (сигнал к фиксации прибыли).
        </p>
        
        {!expanded && (
          <button onClick={() => setExpanded(true)} style={{ color: '#00E5D4', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, marginTop: 8, padding: 0 }}>
            Читать подробнее →
          </button>
        )}
        
        {expanded && (
          <div style={{ marginTop: 12 }}>
            <h3 style={{ color: '#F5F7FA', fontSize: 14, marginBottom: 8 }}>Как рассчитывается</h3>
            <p style={{ color: '#8FA3B8', fontSize: 13, lineHeight: 1.7, marginBottom: 12 }}>
              Индекс учитывает: волатильность (25%), объём торгов (25%), социальные сети (15%),
              доминирование BTC (10%), тренды Google (10%), опросы (15%).
            </p>
            <h3 style={{ color: '#F5F7FA', fontSize: 14, marginBottom: 8 }}>Стратегия использования</h3>
            <p style={{ color: '#8FA3B8', fontSize: 13, lineHeight: 1.7 }}>
              Классическая стратегия: покупать при страхе (0-20), продавать при жадности (80-100).
              Это контрарианский индикатор — когда все боятся, цена часто находится вблизи дна.
            </p>
            <p style={{ color: '#5C728A', fontSize: 11, marginTop: 12 }}>Источник: alternative.me</p>
            <button onClick={() => setExpanded(false)} style={{ color: '#00E5D4', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, marginTop: 8, padding: 0 }}>
              Свернуть ↑
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
