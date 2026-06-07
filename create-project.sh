#!/bin/bash
# Создаёт все файлы проекта Quantum Flow Terminal

set -e

echo "📁 Создание файлов проекта..."

# --- Корневые файлы ---
cat > package.json << 'PKGJSON'
{
  "name": "quantum-flow-terminal",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev -p 3000",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "14.1.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "typescript": "^5.3.3",
    "@tanstack/react-query": "^5.17.0",
    "zustand": "^4.4.7",
    "framer-motion": "^10.18.0",
    "lightweight-charts": "^4.1.3",
    "d3": "^7.8.5",
    "recharts": "^2.10.3",
    "tailwindcss": "^3.4.1",
    "lucide-react": "^0.303.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-tooltip": "^1.0.7",
    "@radix-ui/react-tabs": "^1.0.4",
    "@radix-ui/react-select": "^2.0.0",
    "socket.io-client": "^4.7.4",
    "date-fns": "^3.3.1",
    "zod": "^3.22.4",
    "react-hook-form": "^7.49.3",
    "@hookform/resolvers": "^3.3.4",
    "jsonwebtoken": "^9.0.2",
    "autoprefixer": "^10.4.17",
    "postcss": "^8.4.33"
  },
  "devDependencies": {
    "@types/node": "^20.11.0",
    "@types/react": "^18.2.47",
    "@types/react-dom": "^18.2.18",
    "@types/d3": "^7.4.3",
    "eslint": "^8.56.0",
    "eslint-config-next": "14.1.0"
  }
}
PKGJSON

# Конфигурационные файлы
cat > next.config.js << 'NEXTJS'
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws',
  },
}

module.exports = nextConfig
NEXTJS

cat > tsconfig.json << 'TSCONFIG'
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{"name": "next"}],
    "paths": {"@/*": ["./src/*"]},
    "baseUrl": "."
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
TSCONFIG

cat > tailwind.config.ts << 'TAILWIND'
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: { DEFAULT: '#070B12', deep: '#040810', elevated: '#0A1020' },
        surface: { DEFAULT: '#101826', hover: '#162032', active: '#1A2636', glass: 'rgba(16, 24, 38, 0.8)' },
        accent: { DEFAULT: '#00E5D4', hover: '#37FFF1', muted: 'rgba(0, 229, 212, 0.15)', glow: 'rgba(0, 229, 212, 0.3)' },
        secondary: { DEFAULT: '#1E2B3D', hover: '#263448', muted: '#152130' },
        text: { primary: '#F5F7FA', secondary: '#8FA3B8', muted: '#5C728A', inverse: '#070B12' },
        success: { DEFAULT: '#00E5A0', muted: 'rgba(0, 229, 160, 0.15)' },
        danger: { DEFAULT: '#FF4757', muted: 'rgba(255, 71, 87, 0.15)' },
        warning: { DEFAULT: '#FFA502', muted: 'rgba(255, 165, 2, 0.15)' },
        info: { DEFAULT: '#3742FA', muted: 'rgba(55, 66, 250, 0.15)' },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
TAILWIND

cat > postcss.config.js << 'POSTCSS'
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
POSTCSS

# Docker
cat > docker-compose.yml << 'DOCKERCOMPOSE'
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: qf-postgres
    environment:
      POSTGRES_DB: quantum_flow
      POSTGRES_USER: qf_user
      POSTGRES_PASSWORD: ${DB_PASSWORD:-changeme}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    container_name: qf-redis
    command: redis-server --appendonly yes
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: qf-backend
    environment:
      DATABASE_URL: postgresql+asyncpg://qf_user:changeme@postgres:5432/quantum_flow
      REDIS_URL: redis://redis:6379/0
      SECRET_KEY: dev-secret-change-in-production-min-32-chars-long
    ports:
      - "8000:8000"
    depends_on:
      - postgres
      - redis
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
DOCKERCOMPOSE

# Backend Dockerfile
cat > backend/Dockerfile << 'BKNDOCKER'
FROM python:3.12-slim
WORKDIR /app
RUN apt-get update && apt-get install -y gcc libpq-dev && rm -rf /var/lib/apt/lists/*
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
BKNDOCKER

# Backend requirements
cat > backend/requirements.txt << 'REQS'
fastapi==0.109.0
uvicorn[standard]==0.27.0
sqlalchemy==2.0.25
asyncpg==0.29.0
alembic==1.13.1
redis==5.0.1
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6
pydantic==2.5.3
pydantic-settings==2.1.0
websockets==12.0
httpx==0.26.0
ccxt==4.2.19
numpy==1.26.3
pandas==2.1.5
python-dotenv==1.0.0
REQS

# .env
cat > .env << 'ENVFILE'
DB_PASSWORD=changeme
SECRET_KEY=dev-secret-key-change-in-production-min-32-chars
ENVIRONMENT=development
ENVFILE

echo "✅ Все файлы созданы!"