import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

type OrderBookLevel = [number, number];

interface MarketState {
  prices: Record<string, any>;
  orderBooks: Record<string, { bids: OrderBookLevel[]; asks: OrderBookLevel[] }>;
  lastTrades: Record<string, any>;
  isConnected: boolean;
  setPrice: (symbol: string, data: any) => void;
  updateOrderBook: (symbol: string, data: any) => void;
  addTrade: (symbol: string, trade: any) => void;
}

export const useMarketStore = create<MarketState>()(
  subscribeWithSelector((set) => ({
    prices: {},
    orderBooks: {},
    lastTrades: {},
    isConnected: false,

    setPrice: (symbol, data) =>
      set((state) => ({
        prices: { ...state.prices, [symbol]: data },
      })),

    updateOrderBook: (symbol, data) =>
      set((state) => ({
        orderBooks: { ...state.orderBooks, [symbol]: data },
      })),

    addTrade: (symbol, trade) =>
      set((state) => ({
        lastTrades: { ...state.lastTrades, [symbol]: trade },
      })),
  }))
);
