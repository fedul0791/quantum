# 🔧 ПЛАН ДОВЕДЕНИЯ ПРОЕКТА ДО ГОТОВНОСТИ

**Дата:** 2026-06-08  
**Статус:** АКТИВНЫЙ  
**Текущий уровень завершенности:** 38%  
**Целевой уровень:** 100%  
**Расчетное время:** 6-8 недель (1 разработчик) / 2-3 недели (команда 2-3 человека)

---

## 📊 ТЕКУЩЕЕ СОСТОЯНИЕ

### ✅ Что работает (38%)
- ✅ Backend инфраструктура (FastAPI, PostgreSQL, Redis)
- ✅ Docker контейнеры и оркестрация
- ✅ Базовая структура Frontend (Next.js 14, TypeScript)
- ✅ Design система (Tailwind, цветовая палитра)
- ✅ Зависимости установлены

### ❌ Что НЕ работает (62%)
- ❌ **Приложение падает при загрузке** (infinite loop в AdvancedTradingChart)
- ❌ **API endpoints пусты** (6/7 папок с endpoints не реализованы)
- ❌ **Нет аутентификации** (зависимости есть, реализации нет)
- ❌ **Отсутствуют критические страницы** (/chart, /orderbook, /hft, /replay)
- ❌ **WebSocket relay не реализован** (фронт пытается подключиться прямо к Binance)
- ❌ **Нет моделей БД** (только структура, без SQLAlchemy моделей)
- ❌ **Реальные данные не текут** (mock data везде)
- ❌ **Системы не связаны** (market-collector, analytics-engine изолированы)

---

## 🎯 ФАЗЫ РЕАЛИЗАЦИИ

### 📌 ФАЗА 0: КРИТИЧЕСКИЙ ПАТЧ (1-2 часа) ⚠️ ОБЯЗАТЕЛЬНАЯ

**Цель:** Запустить приложение хотя бы без ошибок

#### Задача 0.1: Исправить crash на загрузке
```bash
# Проблема: src/components/AdvancedTradingChart.tsx вызывает бесконечный loop

ФАЙЛ: src/components/AdvancedTradingChart.tsx
- ❌ УДАЛИТЬ весь компонент ИЛИ закомментировать
- ❌ УДАЛИТЬ импорт из pages/index.tsx
- ✅ Заменить placeholder компонентом

Время: 20 минут
```

#### Задача 0.2: Проверить API connectivity
```bash
# Проблема: Frontend не может обратиться к backend

ФАЙЛ: next.config.js
✅ УЖЕ ПРАВИЛЬНО настроен:
   - proxy: http://qf-backend:8000
   - rewrites для /api/*

ФАЙЛ: docker-compose.yml
✅ УЖЕ правильно настроен

ДЕЙСТВИЕ: Просто перезагрузить контейнеры
docker compose restart frontend backend

Время: 10 минут
```

#### Задача 0.3: Создать placeholder страницы
```bash
ФАЙЛЫ:
- src/app/chart/page.tsx         ← Create (placeholder)
- src/app/orderbook/page.tsx     ← Create (placeholder)
- src/app/hft/page.tsx           ← Create (placeholder)
- src/app/microstructure/page.tsx ← Create (placeholder)
- src/app/replay/page.tsx        ← Create (placeholder)
- src/app/alerts/page.tsx        ← Create (placeholder)
- src/app/watchlist/page.tsx     ← Create (placeholder)

Контент каждого файла:
```

```typescript
// src/app/chart/page.tsx
'use client';

import React from 'react';

export default function ChartPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-accent mb-4">📊 Advanced Chart</h1>
      <div className="bg-surface rounded-lg p-6 border border-accent/20 min-h-96">
        <p className="text-text-muted">🚧 Coming Soon...</p>
      </div>
    </div>
  );
}
```

Время: 15 минут (7 файлов)
```

**Сумма Фазы 0: 45 минут**

**Чекпоинт:** После этого приложение должно:
- ✅ Загружаться без ошибок на http://localhost:3000
- ✅ Показывать главную страницу
- ✅ Навигация работает (все страницы открываются)

---

### 📌 ФАЗА 1: FOUNDATION (БЭ + БД) (8-12 часов) 🔴 КРИТИЧЕСКАЯ

**Цель:** Работающее API + БД с реальными данными

#### Задача 1.1: Создать SQLAlchemy модели
```bash
ФАЙЛЫ:
- backend/app/models/__init__.py
- backend/app/models/user.py         (User model)
- backend/app/models/trade.py        (Trade model)
- backend/app/models/orderbook.py    (OrderBook snapshot model)
- backend/app/models/alert.py        (Alert model)
- backend/app/models/watchlist.py    (Watchlist model)

Контент:
```

```python
# backend/app/models/user.py
from sqlalchemy import Column, String, DateTime, Enum, UUID
from sqlalchemy.ext.declarative import declarative_base
import uuid
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, index=True)
    username = Column(String(100), unique=True)
    hashed_password = Column(String(255))
    full_name = Column(String(255), nullable=True)
    role = Column(String(50), default="user")  # guest, user, premium, admin
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
```

```python
# backend/app/models/trade.py
from sqlalchemy import Column, String, Float, DateTime, UUID, Boolean
from sqlalchemy.ext.declarative import declarative_base
import uuid
from datetime import datetime

Base = declarative_base()

class Trade(Base):
    __tablename__ = "trades"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    symbol = Column(String(20), index=True)  # BTCUSDT, ETHUSDT
    price = Column(Float)
    quantity = Column(Float)
    is_buyer_maker = Column(Boolean)  # True =買い方が maker (売り圧力), False = 売り方が maker
    trade_id = Column(String(50), unique=True)
    event_time = Column(DateTime, default=datetime.utcnow, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
```

```python
# backend/app/models/orderbook.py
from sqlalchemy import Column, String, Float, DateTime, UUID, JSON, Integer
from sqlalchemy.ext.declarative import declarative_base
import uuid
from datetime import datetime

Base = declarative_base()

class OrderbookSnapshot(Base):
    __tablename__ = "orderbook_snapshots"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    symbol = Column(String(20), index=True)
    bids = Column(JSON)  # [[price, quantity], ...]
    asks = Column(JSON)  # [[price, quantity], ...]
    best_bid = Column(Float)
    best_ask = Column(Float)
    spread = Column(Float)
    microprice = Column(Float)
    timestamp = Column(DateTime, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
```

Время: 2 часа

#### Задача 1.2: Создать Alembic миграции
```bash
ДЕЙСТВИЕ:
1. cd backend
2. alembic init alembic
3. Настроить alembic.ini для PostgreSQL
4. Создать миграцию:
   alembic revision --autogenerate -m "Initial schema"
5. Применить миграцию:
   alembic upgrade head

Файлы:
- backend/alembic/env.py        (Configure)
- backend/alembic.ini           (Configure)
- backend/alembic/versions/*.py (Generated)

Время: 1.5 часа
```

#### Задача 1.3: Реализовать API endpoints
```bash
ФАЙЛЫ (создать endpoints):
- backend/app/api/binance.py        (GET /api/binance/{symbol})
- backend/app/api/orderbook.py      (GET /api/orderbook/{symbol})
- backend/app/api/hft.py            (GET /api/hft/metrics)
- backend/app/api/chart.py          (GET /api/chart/{symbol})
- backend/app/api/replay.py         (GET /api/replay/trades)
- backend/app/api/health.py         (GET /health)

Контент примера:
```

```python
# backend/app/api/binance.py
from fastapi import APIRouter, HTTPException
from sqlalchemy.orm import Session
from app.models.trade import Trade
from datetime import datetime, timedelta

router = APIRouter(prefix="/api/binance", tags=["binance"])

@router.get("/{symbol}")
async def get_market_data(symbol: str, limit: int = 100):
    """Get recent trades for a symbol"""
    # TODO: Get from database
    # trades = db.query(Trade).filter(Trade.symbol == symbol).limit(limit).all()
    
    return {
        "symbol": symbol,
        "data": [
            {
                "price": 42500.50,
                "quantity": 0.15,
                "time": datetime.utcnow().isoformat(),
                "is_buyer_maker": True
            }
        ]
    }

@router.get("/{symbol}/24h")
async def get_24h_stats(symbol: str):
    """Get 24h statistics"""
    return {
        "symbol": symbol,
        "high": 43000,
        "low": 41500,
        "open": 42000,
        "close": 42500,
        "volume": 12500.5,
        "change": 2.5,
        "changePercent": 0.0608
    }
```

Время: 3 часа

#### Задача 1.4: Запустить и протестировать
```bash
ДЕЙСТВИЕ:
1. docker compose down
2. docker compose up -d
3. Проверить миграции: docker compose logs backend | grep "alembic"
4. Протестировать endpoints: curl http://localhost:8000/api/binance/BTCUSDT
5. Открыть http://localhost:8000/docs

Время: 1 час (включая отладку)
```

**Сумма Фазы 1: 7.5 часов**

**Чекпоинт:**
- ✅ API endpoints доступны на http://localhost:8000/docs
- ✅ База данных инициализирована
- ✅ Данные текут (хотя бы mock)

---

### 📌 ФАЗА 2: AUTHENTICATION (3-4 часа)

**Цель:** Работающая система логина/регистрации

#### Задача 2.1: Backend auth endpoints
```python
# backend/app/api/auth.py
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta

router = APIRouter(prefix="/api/auth", tags=["auth"])
pwd_context = CryptContext(schemes=["bcrypt"])

class UserRegister(BaseModel):
    email: str
    password: str
    username: str

class UserLogin(BaseModel):
    email: str
    password: str

@router.post("/register")
async def register(user: UserRegister):
    """Register new user"""
    # TODO: Create user in DB
    return {"message": "User created", "user_id": "uuid"}

@router.post("/login")
async def login(credentials: UserLogin):
    """Login user"""
    # TODO: Check credentials
    # TODO: Generate JWT token
    return {
        "access_token": "jwt_token_here",
        "token_type": "bearer",
        "user": {"id": "uuid", "email": "email@example.com"}
    }

@router.post("/refresh")
async def refresh_token(token: str):
    """Refresh JWT token"""
    # TODO: Validate and refresh token
    return {"access_token": "new_jwt_token"}

@router.get("/me")
async def get_current_user(token: str = Depends(OAuth2PasswordBearer(tokenUrl="login"))):
    """Get current user"""
    # TODO: Decode token and return user
    return {"id": "uuid", "email": "email@example.com", "role": "user"}
```

Время: 1.5 часа

#### Задача 2.2: Frontend auth pages + context
```typescript
// src/app/login/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('token', data.access_token);
        router.push('/');
      } else {
        setError('Invalid credentials');
      }
    } catch (err) {
      setError('Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="bg-surface p-8 rounded-lg border border-accent/20 w-96">
        <h1 className="text-2xl font-bold text-accent mb-6">Login</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 bg-background border border-accent/20 rounded"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 bg-background border border-accent/20 rounded"
          />
          <button
            type="submit"
            className="w-full bg-accent text-background py-2 rounded font-bold hover:opacity-80"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
```

```typescript
// src/lib/auth-context.tsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  role: 'guest' | 'user' | 'premium' | 'admin';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      // TODO: Fetch current user
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    if (res.ok) {
      const data = await res.json();
      setToken(data.access_token);
      setUser(data.user);
      localStorage.setItem('token', data.access_token);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

Время: 1.5 часа

#### Задача 2.3: Protected routes
```typescript
// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Защищенные маршруты
  const protectedRoutes = ['/dashboard', '/chart', '/orderbook', '/hft', '/alerts'];
  
  if (protectedRoutes.some(route => pathname.startsWith(route)) && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/chart/:path*', '/orderbook/:path*'],
};
```

Время: 0.5 часа

**Сумма Фазы 2: 3.5 часа**

**Чекпоинт:**
- ✅ Пользователь может зарегистрироваться на http://localhost:3000/register
- ✅ Пользователь может залогиниться на http://localhost:3000/login
- ✅ JWT token сохраняется и используется в запросах

---

### 📌 ФАЗА 3: REAL-TIME DATA + WEBSOCKET (6-8 часов)

**Цель:** Реальные данные текут от Binance через backend к фронту

#### Задача 3.1: WebSocket relay в backend
```python
# backend/app/api/websocket.py
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import asyncio
import json
import aioredis

router = APIRouter()

@router.websocket("/ws/market/{symbol}")
async def websocket_market(websocket: WebSocket, symbol: str):
    await websocket.accept()
    
    redis = await aioredis.create_redis_pool('redis://redis:6379')
    
    try:
        while True:
            # Get data from Redis (published by market-collector)
            data = await redis.get(f"market:{symbol}")
            
            if data:
                await websocket.send_json(json.loads(data))
            
            await asyncio.sleep(0.1)
            
    except WebSocketDisconnect:
        redis.close()
        await redis.wait_closed()

@router.websocket("/ws/hft/{symbol}")
async def websocket_hft(websocket: WebSocket, symbol: str):
    """Stream HFT metrics"""
    await websocket.accept()
    
    redis = await aioredis.create_redis_pool('redis://redis:6379')
    
    try:
        while True:
            data = await redis.get(f"hft:{symbol}")
            
            if data:
                await websocket.send_json(json.loads(data))
            
            await asyncio.sleep(0.5)
            
    except WebSocketDisconnect:
        redis.close()
        await redis.wait_closed()
```

Время: 2 часа

#### Задача 3.2: Связь market-collector с Redis
```python
# services/market-collector/main.py
import asyncio
import aioredis
import json
from binance import AsyncClient
from datetime import datetime

async def start_collector():
    client = await AsyncClient.create()
    redis = await aioredis.create_redis_pool('redis://redis:6379')
    
    async def handle_message(msg):
        symbol = msg['s']  # BTCUSDT
        data = {
            'symbol': symbol,
            'price': float(msg['p']),
            'quantity': float(msg['q']),
            'time': datetime.utcnow().isoformat(),
            'is_buyer_maker': msg['m']
        }
        
        # Publish to Redis
        await redis.set(f"market:{symbol}", json.dumps(data))
        
        # Also save to DB (optional)
        # await db.trades.insert_one(data)
    
    bm = BinanceSocketManager(client)
    
    async with bm.multiplex_socket(['btcusdt@trade', 'ethusdt@trade', 'solusdt@trade']) as ts:
        async for msg in ts:
            if msg['data']:
                await handle_message(msg['data'])

if __name__ == '__main__':
    asyncio.run(start_collector())
```

Время: 1.5 часа

#### Задача 3.3: Frontend WebSocket hook
```typescript
// src/hooks/useWebSocket.ts
import { useEffect, useState, useCallback } from 'react';

interface UseWebSocketOptions {
  url: string;
  onMessage?: (data: any) => void;
  onError?: (error: Error) => void;
  reconnect?: boolean;
}

export function useWebSocket({
  url,
  onMessage,
  onError,
  reconnect = true,
}: UseWebSocketOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [data, setData] = useState<any>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}${url}`;
    
    try {
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log('WebSocket connected:', url);
        setIsConnected(true);
      };
      
      ws.onmessage = (event) => {
        const newData = JSON.parse(event.data);
        setData(newData);
        onMessage?.(newData);
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        onError?.(new Error('WebSocket error'));
        setIsConnected(false);
      };
      
      ws.onclose = () => {
        console.log('WebSocket closed:', url);
        setIsConnected(false);
        
        if (reconnect) {
          setTimeout(() => {
            // Reconnect
          }, 3000);
        }
      };
      
      wsRef.current = ws;
    } catch (error) {
      console.error('WebSocket creation error:', error);
    }

    return () => {
      wsRef.current?.close();
    };
  }, [url, onMessage, onError, reconnect]);

  return { isConnected, data };
}
```

```typescript
// src/app/page.tsx (использование WebSocket)
'use client';

import React, { useState } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';

export default function Home() {
  const { data: marketData, isConnected } = useWebSocket({
    url: '/api/ws/market/BTCUSDT',
    onMessage: (data) => console.log('Market update:', data),
  });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Market Data</h1>
      <p>WebSocket: {isConnected ? '🟢 Connected' : '🔴 Disconnected'}</p>
      
      {marketData && (
        <div className="mt-4 bg-surface p-4 rounded">
          <p>Price: {marketData.price}</p>
          <p>Quantity: {marketData.quantity}</p>
          <p>Time: {marketData.time}</p>
        </div>
      )}
    </div>
  );
}
```

Время: 2.5 часа

#### Задача 3.4: Тестирование
```bash
1. docker compose restart
2. Проверить, что market-collector подключился к Binance
   docker compose logs market-collector | grep "Connected"
3. Проверить, что данные в Redis
   docker compose exec redis redis-cli GET market:BTCUSDT
4. Открыть http://localhost:3000
5. Посмотреть консоль браузера (F12 → Console)
6. Должны видеть сообщения о WebSocket подключении
7. Должны видеть обновления данных каждые 100ms

Время: 1.5 часа (debug)
```

**Сумма Фазы 3: 7.5 часов**

**Чекпоинт:**
- ✅ WebSocket connected на странице
- ✅ Данные обновляются в реальном времени
- ✅ Redis содержит свежие данные

---

### 📌 ФАЗА 4: FRONTEND COMPONENTS (10-14 часов)

**Цель:** Все страницы с реальными компонентами

#### Задача 4.1: Advanced Trading Chart
```typescript
// src/components/AdvancedChart.tsx
'use client';

import React, { useEffect, useRef } from 'react';
import { createChart, ColorType } from 'lightweight-charts';

interface Props {
  symbol: string;
  data: Array<{
    time: string;
    open: number;
    high: number;
    low: number;
    close: number;
  }>;
}

export default function AdvancedChart({ symbol, data }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || data.length === 0) return;

    const chart = createChart(containerRef.current, {
      layout: { background: { color: '#070B12' as ColorType } },
      width: containerRef.current.clientWidth,
      height: 400,
    });

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#00E5D4',
      downColor: '#FF4444',
    });

    candlestickSeries.setData(data);
    chart.timeScale().fitContent();

    const handleResize = () => {
      if (containerRef.current) {
        chart.applyOptions({
          width: containerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [data]);

  return <div ref={containerRef} className="w-full h-96" />;
}
```

Время: 3 часа

#### Задача 4.2: Order Book Component
```typescript
// src/components/OrderBook.tsx
'use client';

import React, { useEffect, useState } from 'react';

interface OrderLevel {
  price: number;
  quantity: number;
  total: number;
}

export default function OrderBook() {
  const [bids, setBids] = useState<OrderLevel[]>([]);
  const [asks, setAsks] = useState<OrderLevel[]>([]);

  useEffect(() => {
    // Subscribe to WebSocket
    const ws = new WebSocket('ws://localhost:8000/ws/orderbook/BTCUSDT');
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setBids(data.bids);
      setAsks(data.asks);
    };

    return () => ws.close();
  }, []);

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Bids (Green) */}
      <div className="bg-surface rounded p-4">
        <h3 className="text-accent font-bold mb-2">Bids</h3>
        <div className="space-y-1">
          {bids.map((bid, idx) => (
            <div key={idx} className="flex justify-between text-sm">
              <span className="text-green-400">{bid.price.toFixed(2)}</span>
              <span>{bid.quantity.toFixed(4)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Asks (Red) */}
      <div className="bg-surface rounded p-4">
        <h3 className="text-accent font-bold mb-2">Asks</h3>
        <div className="space-y-1">
          {asks.map((ask, idx) => (
            <div key={idx} className="flex justify-between text-sm">
              <span className="text-red-400">{ask.price.toFixed(2)}</span>
              <span>{ask.quantity.toFixed(4)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

Время: 2 часа

#### Задача 4.3: HFT Analytics Component
```typescript
// src/components/HFTAnalytics.tsx
'use client';

import React, { useEffect, useState } from 'react';

interface HFTMetrics {
  ofi: number;
  microprice: number;
  queueImbalance: number;
  realizedVolatility: number;
  fillProbability: number;
}

export default function HFTAnalytics() {
  const [metrics, setMetrics] = useState<HFTMetrics | null>(null);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8000/ws/hft/BTCUSDT');
    
    ws.onmessage = (event) => {
      setMetrics(JSON.parse(event.data));
    };

    return () => ws.close();
  }, []);

  if (!metrics) return <div>Loading...</div>;

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      <MetricCard label="OFI" value={metrics.ofi} color="text-blue-400" />
      <MetricCard label="Microprice" value={metrics.microprice} color="text-green-400" />
      <MetricCard label="Queue Imbalance" value={metrics.queueImbalance} color="text-yellow-400" />
      <MetricCard label="Realized Vol" value={metrics.realizedVolatility} color="text-red-400" />
      <MetricCard label="Fill Prob" value={metrics.fillProbability} color="text-accent" />
    </div>
  );
}

function MetricCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-surface rounded p-4 border border-accent/20">
      <p className="text-sm text-text-muted mb-2">{label}</p>
      <p className={`text-lg font-bold ${color}`}>{value.toFixed(4)}</p>
    </div>
  );
}
```

Время: 2 часа

#### Задача 4.4: Alert Management
```typescript
// src/app/alerts/page.tsx
'use client';

import React, { useState, useEffect } from 'react';

interface Alert {
  id: string;
  symbol: string;
  type: string;
  condition: string;
  isActive: boolean;
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [newAlert, setNewAlert] = useState({
    symbol: 'BTCUSDT',
    type: 'price',
    condition: '',
  });

  useEffect(() => {
    // Fetch alerts from API
    fetch('/api/alerts')
      .then(r => r.json())
      .then(data => setAlerts(data.alerts));
  }, []);

  const handleCreateAlert = async () => {
    const res = await fetch('/api/alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newAlert),
    });

    if (res.ok) {
      const alert = await res.json();
      setAlerts([...alerts, alert]);
      setNewAlert({ symbol: 'BTCUSDT', type: 'price', condition: '' });
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-accent mb-6">🔔 Alerts</h1>

      {/* Create Alert */}
      <div className="bg-surface rounded p-6 border border-accent/20 mb-6">
        <h2 className="text-lg font-bold mb-4">Create New Alert</h2>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Condition (e.g., price > 50000)"
            value={newAlert.condition}
            onChange={(e) => setNewAlert({ ...newAlert, condition: e.target.value })}
            className="w-full px-4 py-2 bg-background border border-accent/20 rounded"
          />
          <button
            onClick={handleCreateAlert}
            className="bg-accent text-background px-4 py-2 rounded font-bold hover:opacity-80"
          >
            Create Alert
          </button>
        </div>
      </div>

      {/* Alert List */}
      <div className="space-y-2">
        {alerts.map((alert) => (
          <div key={alert.id} className="bg-surface p-4 rounded border border-accent/20">
            <p className="font-bold">{alert.symbol}</p>
            <p className="text-sm text-text-muted">{alert.condition}</p>
            <p className={`text-xs mt-2 ${alert.isActive ? 'text-green-400' : 'text-gray-400'}`}>
              {alert.isActive ? '🟢 Active' : '⚪ Inactive'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

Время: 2 часа

#### Задача 4.5: Watchlist
```typescript
// src/app/watchlist/page.tsx
'use client';

import React, { useState, useEffect } from 'react';

interface WatchlistItem {
  id: string;
  symbol: string;
  price: number;
  change24h: number;
}

export default function WatchlistPage() {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [newSymbol, setNewSymbol] = useState('');

  useEffect(() => {
    fetch('/api/watchlists')
      .then(r => r.json())
      .then(data => setItems(data.items));
  }, []);

  const handleAddSymbol = async () => {
    if (!newSymbol) return;

    const res = await fetch('/api/watchlists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symbol: newSymbol }),
    });

    if (res.ok) {
      const item = await res.json();
      setItems([...items, item]);
      setNewSymbol('');
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-accent mb-6">⭐ Watchlist</h1>

      {/* Add Symbol */}
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="Enter symbol (e.g., BTCUSDT)"
          value={newSymbol}
          onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
          className="flex-1 px-4 py-2 bg-background border border-accent/20 rounded"
        />
        <button
          onClick={handleAddSymbol}
          className="bg-accent text-background px-6 py-2 rounded font-bold hover:opacity-80"
        >
          Add
        </button>
      </div>

      {/* Watchlist */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item) => (
          <div key={item.id} className="bg-surface p-4 rounded border border-accent/20">
            <p className="text-lg font-bold text-accent">{item.symbol}</p>
            <p className="text-2xl font-bold mt-2">${item.price.toFixed(2)}</p>
            <p className={item.change24h >= 0 ? 'text-green-400' : 'text-red-400'}>
              {item.change24h >= 0 ? '+' : ''}{item.change24h.toFixed(2)}%
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

Время: 2 часа

#### Задача 4.6: Replay Mode
```typescript
// src/app/replay/page.tsx
'use client';

import React, { useState } from 'react';

export default function ReplayPage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [timestamp, setTimestamp] = useState(0);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-accent mb-6">🎬 Replay Mode</h1>

      {/* Timeline */}
      <div className="bg-surface rounded p-6 border border-accent/20 mb-6">
        <div className="flex gap-4 items-center">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="bg-accent text-background px-6 py-2 rounded font-bold hover:opacity-80"
          >
            {isPlaying ? '⏸ Pause' : '▶ Play'}
          </button>

          <div className="flex-1">
            <input
              type="range"
              min="0"
              max="86400"
              value={timestamp}
              onChange={(e) => setTimestamp(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <select
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="px-4 py-2 bg-background border border-accent/20 rounded"
          >
            <option value={0.5}>0.5x</option>
            <option value={1}>1x</option>
            <option value={2}>2x</option>
            <option value={5}>5x</option>
          </select>
        </div>
      </div>

      {/* Playback Preview */}
      <div className="bg-surface rounded p-6 border border-accent/20">
        <p className="text-text-muted">Timestamp: {new Date(timestamp * 1000).toISOString()}</p>
        <p className="text-2xl font-bold text-accent mt-2">42,500.50 USDT</p>
      </div>
    </div>
  );
}
```

Время: 1.5 часа

**Сумма Фазы 4: 12.5 часов**

**Чекпоинт:**
- ✅ Все страницы открываются без ошибок
- ✅ Компоненты отображают данные
- ✅ Базовая функциональность работает

---

### 📌 ФАЗА 5: POLISH & OPTIMIZATION (6-8 часов)

**Цель:** Production-ready качество

#### Задача 5.1: Error Handling
```typescript
// src/components/ErrorBoundary.tsx
'use client';

import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 bg-red-900/20 border border-red-500 rounded">
          <h2 className="text-red-500 font-bold">Something went wrong</h2>
          <p className="text-red-300">{this.state.error?.message}</p>
        </div>
      );
    }

    return this.props.children;
  }
}
```

Время: 1 час

#### Задача 5.2: Loading States & Skeletons
```typescript
// src/components/LoadingSkeleton.tsx
'use client';

export default function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 bg-surface rounded w-1/3" />
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-surface rounded" />
        ))}
      </div>
    </div>
  );
}
```

Время: 1 час

#### Задача 5.3: Performance Optimization
```typescript
// Добавить memoization и code splitting
import dynamic from 'next/dynamic';
import { memo } from 'react';

const HeavyChart = dynamic(() => import('@/components/AdvancedChart'), {
  loading: () => <LoadingSkeleton />,
  ssr: false,
});

const MemoOrderBook = memo(OrderBook);
const MemoHFTAnalytics = memo(HFTAnalytics);
```

Время: 2 часа

#### Задача 5.4: Responsive Design
```typescript
// Улучшить Tailwind классы для мобильных
// Добавить медиа-запросы, flexbox/grid для разных размеров

// Примеры:
// md:, lg:, xl: breakpoints
// Проверить на телефоне
```

Время: 2 часа

#### Задача 5.5: Testing
```bash
# Добавить простые тесты
npm install --save-dev @testing-library/react @testing-library/jest-dom jest

# Создать src/__tests__/components.test.tsx
# Протестировать основные компоненты

Время: 2 часа
```

**Сумма Фазы 5: 8 часов**

---

## 📊 ИТОГОВЫЙ ПЛАН

### Временная линия

```
ФАЗА 0: КРИТИЧЕСКИЙ ПАТЧ      (0.75 ч)   ⚠️ ОБЯЗАТЕЛЬНО
ФАЗА 1: FOUNDATION             (7.5 ч)    🔴 КРИТИЧЕСКАЯ
ФАЗА 2: AUTHENTICATION         (3.5 ч)    🔴 КРИТИЧЕСКАЯ
ФАЗА 3: REAL-TIME DATA         (7.5 ч)    🔴 КРИТИЧЕСКАЯ
ФАЗА 4: FRONTEND COMPONENTS    (12.5 ч)   🟠 ВЫСОКИЙ ПРИОРИТЕТ
ФАЗА 5: POLISH & OPTIMIZATION  (8 ч)      🟡 СРЕДНИЙ ПРИОРИТЕТ

ИТОГО: 39.75 часов ≈ 40 часов (1 неделя интенсивной работы)
```

### По дням (1 разработчик, 8 часов/день)

```
ДЕНЬ 1: ФАЗА 0 + Половина ФАЗЫ 1
- ✅ Приложение запускается
- ✅ API endpoints обновляются

ДЕНЬ 2: Вторая половина ФАЗЫ 1 + ФАЗА 2
- ✅ БД работает
- ✅ Аутентификация работает

ДЕНЬ 3: ФАЗА 3
- ✅ WebSocket подключен
- ✅ Реальные данные текут

ДЕНЬ 4-5: ФАЗА 4
- ✅ Все компоненты реализованы
- ✅ Страницы функциональны

ДЕНЬ 6: ФАЗА 5 + Testing
- ✅ Оптимизация
- ✅ Error handling
- ✅ Базовые тесты

ДЕНЬ 7: Deployment + Documentation
- ✅ Production build
- ✅ Deploy на staging
- ✅ Final testing
```

### По командам (2-3 разработчика)

```
ПАРАЛЛЕЛЬНО:
Разработчик 1: Backend (ФАЗЫ 1-3)
Разработчик 2: Frontend (ФАЗЫ 4-5)
(+опциональный QA для testing)

Время: 2-3 недели
```

---

## 🔄 ЗАВИСИМОСТИ МЕЖДУ ФАЗАМИ

```
ФАЗА 0 (Patch)
    ↓
ФАЗА 1 (Backend) ← ФАЗА 2 (Auth) нуждается в User моделях
    ↓
ФАЗА 3 (WebSocket) ← зависит от ФАЗЫ 1
    ↓
ФАЗА 4 (Frontend) ← зависит от ФАЗ 1-3
    ↓
ФАЗА 5 (Polish)
```

**Оптимальный порядок:**
1. ФАЗА 0 (быстрый патч)
2. ФАЗА 1 + ФАЗА 2 (параллельно: DB + Auth)
3. ФАЗА 3 (WebSocket только после ФАЗЫ 1)
4. ФАЗА 4 (Frontend с использованием готовых APIs)
5. ФАЗА 5 (Polish в конце)

---

## 📋 ЧЕКЛИСТ ГОТОВНОСТИ

### После ФАЗЫ 0
- [ ] Приложение открывается на http://localhost:3000
- [ ] Нет консольных ошибок при загрузке

### После ФАЗЫ 1
- [ ] API endpoints доступны на http://localhost:8000/docs
- [ ] База данных инициализирована
- [ ] Миграции применены успешно

### После ФАЗЫ 2
- [ ] Можно зарегистрироваться
- [ ] Можно залогиниться
- [ ] JWT токен сохраняется

### После ФАЗЫ 3
- [ ] WebSocket подключен
- [ ] Данные обновляются в реальном времени
- [ ] Redis содержит свежие данные

### После ФАЗЫ 4
- [ ] Все страницы открываются
- [ ] Компоненты отображают данные
- [ ] Никаких 404 ошибок

### После ФАЗЫ 5
- [ ] Нет консольных ошибок
- [ ] Работает на мобильных
- [ ] Производительность хорошая (LCP < 3s)
- [ ] Базовые тесты проходят

---

## 🚀 КАК НАЧАТЬ

### Шаг 1: Выполнить ФАЗУ 0
```bash
cd quantum

# Исправить AdvancedTradingChart
rm src/components/AdvancedTradingChart.tsx
# или переделать его

# Создать placeholder страницы
touch src/app/chart/page.tsx
# ... и т.д.

# Перезагрузить
docker compose down
docker compose up -d

# Проверить
curl http://localhost:3000
```

### Шаг 2: Создать branch для разработки
```bash
git checkout -b dev/readiness-phase-1
```

### Шаг 3: Начать с ФАЗЫ 1
```bash
# Создать models
# Создать migrations
# Создать endpoints
# Коммитить каждую задачу отдельно
```

### Шаг 4: Push и PR
```bash
git push origin dev/readiness-phase-1
# Создать Pull Request на main
# Code review
# Merge
```

---

## 📚 ДОПОЛНИТЕЛЬНЫЕ РЕСУРСЫ

- [AUDIT_REPORT.md](AUDIT_REPORT.md) — Полный аудит проблем
- [COMPLIANCE_AUDIT.md](COMPLIANCE_AUDIT.md) — Что реализовано vs требования
- [README.md](README.md) — Описание проекта
- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) — Deployment после готовности

---

**Начинайте с ФАЗЫ 0 прямо сейчас! ⏱️**

Если у вас есть вопросы по каким-то фазам, спрашивайте.
