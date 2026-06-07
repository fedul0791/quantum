from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List, Dict, Any
from uuid import UUID

from ..models import AlertType, AlertNotificationMethod


class AlertCreate(BaseModel):
    symbol: str
    alert_type: AlertType
    condition: Dict[str, Any]
    notification_method: AlertNotificationMethod = AlertNotificationMethod.BOTH
    name: Optional[str] = None
    description: Optional[str] = None


class AlertUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    condition: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None


class AlertResponse(BaseModel):
    id: UUID
    symbol: str
    alert_type: AlertType
    condition: Dict[str, Any]
    notification_method: AlertNotificationMethod
    is_active: bool
    name: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True


class AlertNotificationResponse(BaseModel):
    id: UUID
    alert_id: UUID
    title: str
    message: str
    is_read: bool
    triggered_at: datetime
    
    class Config:
        from_attributes = True


class WatchlistCreate(BaseModel):
    name: str
    description: Optional[str] = None
    symbols: List[str] = []
    is_default: bool = False


class WatchlistUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    symbols: Optional[List[str]] = None
    is_default: Optional[bool] = None


class WatchlistResponse(BaseModel):
    id: UUID
    name: str
    description: Optional[str]
    symbols: List[str]
    is_default: bool
    is_public: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
