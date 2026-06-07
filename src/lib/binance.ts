const BINANCE = 'https://api.binance.com/api/v3'

export async function fetch24hrTicker() {
  const res = await fetch(`${BINANCE}/ticker/24hr`)
  if (!res.ok) throw new Error('Binance API error')
  return res.json()
}

export async function fetchKlines(symbol: string, interval: string = '1h', limit: number = 48) {
  const res = await fetch(`${BINANCE}/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`)
  if (!res.ok) throw new Error('Binance API error')
  return res.json()
}

export async function fetchOrderBook(symbol: string, limit: number = 20) {
  const res = await fetch(`${BINANCE}/depth?symbol=${symbol}&limit=${limit}`)
  if (!res.ok) throw new Error('Binance API error')
  return res.json()
}
