from sqlalchemy import Column, String, DateTime, Float, Integer, ForeignKey, Enum, Boolean, Text, func
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import uuid
import enum

from ..core.database import Base


class AlertType(str, enum.Enum):
    OFI_THRESHOLD = "ofi_threshold"
    VOLATILITY_SPIKE = "volatility_spike"
    LIQUIDITY_WALL = "liquidity_wall"
    SPREAD_EXPANSION = "spread_expansion"
    QUEUE_IMBALANCE = "queue_imbalance"
    PRICE_LEVEL = "price_level"


class AlertNotificationMethod(str, enum.Enum):
    BROWSER = "browser"
    EMAIL = "email"
    BOTH = "both"


class Alert(Base):
    __tablename__ = "alerts"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # User association (will add when User table is ready)
    user_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    
    # Alert configuration
    symbol = Column(String(20), nullable=False, index=True)
    alert_type = Column(Enum(AlertType), nullable=False)
    
    # Trigger conditions (flexible JSON for different alert types)
    condition = Column(JSONB, nullable=False)  # e.g., {"threshold": 0.5, "direction": "above"}
    
    # Notification settings
    notification_method = Column(Enum(AlertNotificationMethod), default=AlertNotificationMethod.BOTH)
    
    # Status
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Metadata
    name = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    def __repr__(self):
        return f"<Alert {self.symbol} {self.alert_type}>"


class AlertNotification(Base):
    __tablename__ = "alert_notifications"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Alert association
    alert_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    
    # Notification data
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    
    # Status
    is_read = Column(Boolean, default=False, nullable=False)
    is_sent = Column(Boolean, default=False, nullable=False)
    
    # Timestamps
    triggered_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    sent_at = Column(DateTime(timezone=True), nullable=True)
    read_at = Column(DateTime(timezone=True), nullable=True)
    
    def __repr__(self):
        return f"<AlertNotification {self.title}>"


class Watchlist(Base):
    __tablename__ = "watchlists"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # User association
    user_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    
    # Watchlist info
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    
    # Symbols stored as JSON array
    symbols = Column(JSONB, nullable=False, default=[])  # ["BTCUSDT", "ETHUSDT", ...]
    
    # Settings
    is_default = Column(Boolean, default=False)
    is_public = Column(Boolean, default=False)
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    def __repr__(self):
        return f"<Watchlist {self.name}>"
