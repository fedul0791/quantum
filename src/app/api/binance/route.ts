import { NextResponse } from 'next/server'

const NEEDED = [
  'BTCUSDT','ETHUSDT','SOLUSDT','BNBUSDT','ADAUSDT','AVAXUSDT','DOTUSDT','NEARUSDT',
  'APTUSDT','SUIUSDT','ICPUSDT','ALGOUSDT','VETUSDT','TONUSDT','KASUSDT',
  'UNIUSDT','AAVEUSDT','MKRUSDT','LINKUSDT','RUNEUSDT','GRTUSDT','INJUSDT','JASMYUSDT','QNTUSDT',
  'FETUSDT','RNDRUSDT','TAOUSDT',
  'IMXUSDT','SANDUSDT','MANAUSDT','AXSUSDT','GALAUSDT','BEAMUSDT',
  'MATICUSDT','ARBUSDT','OPUSDT','SEIUSDT','STRKUSDT',
  'ONDOUSDT','CFGUSDT','OMUSDT','HBARUSDT',
  'DOGEUSDT','SHIBUSDT','PEPEUSDT','WIFUSDT','FLOKIUSDT',
  'XRPUSDT','LTCUSDT','BCHUSDT','XLMUSDT','CROUSDT','HYPEUSDT','FLRUSDT','ENAUSDT','BONKUSDT'
]

export async function GET() {
  try {
    // Запрашиваем все тикеры (без фильтра)
    const res = await fetch('https://api.binance.com/api/v3/ticker/24hr', {
      headers: { 'Accept': 'application/json' },
      cache: 'no-store'
    })
    const allTickers = await res.json()
    
    if (!Array.isArray(allTickers)) {
      return NextResponse.json({ error: 'Invalid response' }, { status: 500 })
    }
    
    // Фильтруем только нужные
    const neededSet = new Set(NEEDED)
    const filtered = allTickers.filter((t: any) => neededSet.has(t.symbol))
    
    return NextResponse.json(filtered)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
