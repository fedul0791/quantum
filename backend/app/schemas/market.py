from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List
from uuid import UUID


class PriceData(BaseModel):
    symbol: str
    price: float
    change_24h: float
    volume_24h: float
    high_24h: float
    low_24h: float


class MarketOverviewResponse(BaseModel):
    symbols: List[PriceData]
    last_update: datetime


class OrderBookLevel(BaseModel):
    price: float
    quantity: float


class OrderBookResponse(BaseModel):
    symbol: str
    bids: List[OrderBookLevel]
    asks: List[OrderBookLevel]
    best_bid: float
    best_ask: float
    spread: float
    timestamp: datetime


class HFTMetricsResponse(BaseModel):
    symbol: str
    ofi: float  # Order Flow Imbalance
    microprice: float
    queue_imbalance_l1: float
    queue_imbalance_l5: float
    queue_imbalance_l10: float
    realized_vol_30s: float
    fill_probability: float
    trade_imbalance: float
    timestamp: datetime


class TradeResponse(BaseModel):
    symbol: str
    price: float
    quantity: float
    is_buyer_maker: bool
    event_time: datetime
