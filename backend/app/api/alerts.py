from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from uuid import UUID
import logging

from ..core import get_db
from ..models import Alert, AlertNotification
from ..schemas import AlertCreate, AlertUpdate, AlertResponse, AlertNotificationResponse
from ..api.auth import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/alerts", tags=["alerts"])


@router.post("/create", response_model=AlertResponse)
async def create_alert(
    alert_data: AlertCreate,
    session: AsyncSession = Depends(get_db),
    user = Depends(get_current_user),
):
    """Create new alert"""
    
    alert = Alert(
        user_id=user.id,
        symbol=alert_data.symbol,
        alert_type=alert_data.alert_type,
        condition=alert_data.condition,
        notification_method=alert_data.notification_method,
        name=alert_data.name or f"{alert_data.symbol} {alert_data.alert_type}",
        description=alert_data.description,
    )
    
    session.add(alert)
    await session.commit()
    await session.refresh(alert)
    
    logger.info(f"Alert created: {alert.id}")
    return AlertResponse.model_validate(alert)


@router.get("/list", response_model=list[AlertResponse])
async def list_alerts(
    symbol: str = Query(None),
    session: AsyncSession = Depends(get_db),
    user = Depends(get_current_user),
):
    """List all alerts for user"""
    
    query = select(Alert).where(Alert.user_id == user.id, Alert.is_active == True)
    
    if symbol:
        query = query.where(Alert.symbol == symbol)
    
    result = await session.execute(query.order_by(desc(Alert.created_at)))
    alerts = result.scalars().all()
    
    return [AlertResponse.model_validate(a) for a in alerts]


@router.get("/{alert_id}", response_model=AlertResponse)
async def get_alert(
    alert_id: UUID,
    session: AsyncSession = Depends(get_db),
    user = Depends(get_current_user),
):
    """Get specific alert"""
    
    stmt = select(Alert).where(Alert.id == alert_id, Alert.user_id == user.id)
    result = await session.execute(stmt)
    alert = result.scalar_one_or_none()
    
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alert not found",
        )
    
    return AlertResponse.model_validate(alert)


@router.put("/{alert_id}", response_model=AlertResponse)
async def update_alert(
    alert_id: UUID,
    alert_update: AlertUpdate,
    session: AsyncSession = Depends(get_db),
    user = Depends(get_current_user),
):
    """Update alert"""
    
    stmt = select(Alert).where(Alert.id == alert_id, Alert.user_id == user.id)
    result = await session.execute(stmt)
    alert = result.scalar_one_or_none()
    
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alert not found",
        )
    
    # Update fields
    if alert_update.name is not None:
        alert.name = alert_update.name
    if alert_update.description is not None:
        alert.description = alert_update.description
    if alert_update.condition is not None:
        alert.condition = alert_update.condition
    if alert_update.is_active is not None:
        alert.is_active = alert_update.is_active
    
    await session.commit()
    await session.refresh(alert)
    
    return AlertResponse.model_validate(alert)


@router.delete("/{alert_id}")
async def delete_alert(
    alert_id: UUID,
    session: AsyncSession = Depends(get_db),
    user = Depends(get_current_user),
):
    """Delete alert"""
    
    stmt = select(Alert).where(Alert.id == alert_id, Alert.user_id == user.id)
    result = await session.execute(stmt)
    alert = result.scalar_one_or_none()
    
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alert not found",
        )
    
    await session.delete(alert)
    await session.commit()
    
    return {"message": "Alert deleted"}


@router.get("/notifications/list", response_model=list[AlertNotificationResponse])
async def list_notifications(
    unread_only: bool = Query(False),
    limit: int = Query(50, le=100),
    session: AsyncSession = Depends(get_db),
    user = Depends(get_current_user),
):
    """List alert notifications"""
    
    query = select(AlertNotification).where(AlertNotification.user_id == user.id)
    
    if unread_only:
        query = query.where(AlertNotification.is_read == False)
    
    result = await session.execute(
        query.order_by(desc(AlertNotification.triggered_at)).limit(limit)
    )
    notifications = result.scalars().all()
    
    return [AlertNotificationResponse.model_validate(n) for n in notifications]


@router.put("/notifications/{notification_id}/mark-as-read")
async def mark_notification_as_read(
    notification_id: UUID,
    session: AsyncSession = Depends(get_db),
    user = Depends(get_current_user),
):
    """Mark notification as read"""
    
    from datetime import datetime, timezone
    
    stmt = select(AlertNotification).where(
        AlertNotification.id == notification_id,
        AlertNotification.user_id == user.id
    )
    result = await session.execute(stmt)
    notification = result.scalar_one_or_none()
    
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found",
        )
    
    notification.is_read = True
    notification.read_at = datetime.now(timezone.utc)
    
    await session.commit()
    
    return {"message": "Notification marked as read"}
