from sqlalchemy import Column, String, DateTime, Float, Integer, ForeignKey, Enum, JSON, Boolean, BigInteger
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum

from ..core.database import Base


class Trade(Base):
    __tablename__ = "trades"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Trade info
    symbol = Column(String(20), nullable=False, index=True)
    trade_id = Column(BigInteger, nullable=False, index=True)
    
    # Price and quantity
    price = Column(Float, nullable=False)
    quantity = Column(Float, nullable=False)
    
    # Direction
    is_buyer_maker = Column(Boolean, nullable=False)  # True = sell order initiated, False = buy order initiated
    
    # Timestamps
    event_time = Column(DateTime, nullable=False, index=True)
    trade_time = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Computed fields
    quote_asset_volume = Column(Float, nullable=True)  # price * quantity
    
    def __repr__(self):
        return f"<Trade {self.symbol} {self.price}>"


class OrderBookSnapshot(Base):
    __tablename__ = "orderbook_snapshots"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Symbol
    symbol = Column(String(20), nullable=False, index=True)
    
    # Order book data (compressed JSON)
    bids = Column(JSONB, nullable=False)  # [[price, qty], ...]
    asks = Column(JSONB, nullable=False)  # [[price, qty], ...]
    
    # Metadata
    event_time = Column(DateTime, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    
    # HFT metrics (cached)
    best_bid = Column(Float, nullable=True)
    best_ask = Column(Float, nullable=True)
    bid_qty = Column(Float, nullable=True)
    ask_qty = Column(Float, nullable=True)
    microprice = Column(Float, nullable=True)
    spread = Column(Float, nullable=True)
    
    def __repr__(self):
        return f"<OrderBookSnapshot {self.symbol} {self.event_time}>"


class MarketMetrics(Base):
    __tablename__ = "market_metrics"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Symbol
    symbol = Column(String(20), nullable=False, index=True)
    
    # Metrics
    ofi = Column(Float, nullable=True)  # Order Flow Imbalance
    queue_imbalance_l1 = Column(Float, nullable=True)
    queue_imbalance_l5 = Column(Float, nullable=True)
    queue_imbalance_l10 = Column(Float, nullable=True)
    
    realized_vol_10s = Column(Float, nullable=True)
    realized_vol_30s = Column(Float, nullable=True)
    realized_vol_60s = Column(Float, nullable=True)
    
    fill_probability = Column(Float, nullable=True)
    trade_imbalance = Column(Float, nullable=True)
    
    buy_volume = Column(Float, nullable=True)
    sell_volume = Column(Float, nullable=True)
    
    # Timestamp
    recorded_at = Column(DateTime, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    def __repr__(self):
        return f"<MarketMetrics {self.symbol} {self.recorded_at}>"
