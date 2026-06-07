import { useMarketStore } from '@/store/marketStore';

class BinanceWebSocket {
  private ws: WebSocket | null = null;

  connect(symbols: string[] = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT']) {
    const streams = symbols
      .map(s => `${s.toLowerCase()}@ticker/${s.toLowerCase()}@depth20/${s.toLowerCase()}@trade`)
      .join('/');
    
    const url = `wss://stream.binance.com:9443/stream?streams=${streams}`;

    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      console.log('✅ Binance WebSocket connected');
      useMarketStore.setState({ isConnected: true });
    };

    this.ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        this.handleMessage(msg);
      } catch (e) {}
    };

    this.ws.onclose = () => {
      console.log('❌ WebSocket disconnected. Reconnecting...');
      useMarketStore.setState({ isConnected: false });
      setTimeout(() => this.connect(symbols), 3000);
    };
  }

  private handleMessage(msg: any) {
    const { data, stream } = msg;
    if (!data || !stream) return;

    const symbol = stream.split('@')[0].toUpperCase();

    if (stream.includes('@ticker')) {
      useMarketStore.getState().setPrice(symbol, data);
    } else if (stream.includes('@depth')) {
      useMarketStore.getState().updateOrderBook(symbol, {
        bids: data.bids?.map(([p, q]: string[]) => [parseFloat(p), parseFloat(q)]) || [],
        asks: data.asks?.map(([p, q]: string[]) => [parseFloat(p), parseFloat(q)]) || [],
      });
    } else if (stream.includes('@trade')) {
      useMarketStore.getState().addTrade(symbol, data);
    }
  }

  disconnect() {
    this.ws?.close();
  }
}

export const binanceWS = new BinanceWebSocket();
