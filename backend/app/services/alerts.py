"""
Alert checking service for triggering alerts
"""
import logging
from datetime import datetime, timezone
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..models import Alert, AlertNotification, MarketMetrics, User
from ..services.email import EmailService

logger = logging.getLogger(__name__)


class AlertCheckService:
    @staticmethod
    async def check_alerts(
        session: AsyncSession,
        symbol: str,
        metrics: dict,
    ) -> None:
        """Check all alerts for a symbol and trigger if conditions met"""
        
        # Get all active alerts for this symbol
        stmt = select(Alert).where(
            Alert.symbol == symbol,
            Alert.is_active == True,
        )
        
        result = await session.execute(stmt)
        alerts = result.scalars().all()
        
        for alert in alerts:
            triggered = await AlertCheckService._check_condition(alert, metrics)
            
            if triggered:
                # Get user
                user_stmt = select(User).where(User.id == alert.user_id)
                user_result = await session.execute(user_stmt)
                user = user_result.scalar_one_or_none()
                
                if user:
                    # Create notification
                    notification = AlertNotification(
                        alert_id=alert.id,
                        user_id=alert.user_id,
                        title=f"{alert.name} Triggered",
                        message=f"{alert.symbol} condition met: {alert.condition}",
                        triggered_at=datetime.now(timezone.utc),
                        is_sent=False,
                    )
                    
                    session.add(notification)
                    await session.commit()
                    
                    # Send email if configured
                    if "email" in alert.notification_method.value or alert.notification_method.value == "both":
                        await EmailService.send_alert_notification(
                            to_email=user.email,
                            alert_name=alert.name,
                            symbol=symbol,
                            condition=alert.condition,
                            value=metrics.get(alert.alert_type.value, 0),
                        )
                    
                    # Send browser notification (handled by frontend WebSocket)
                    logger.info(f"Alert triggered: {alert.name}")
    
    
    @staticmethod
    async def _check_condition(alert: Alert, metrics: dict) -> bool:
        """Check if alert condition is met"""
        
        condition = alert.condition
        alert_type = alert.alert_type.value
        
        if alert_type == "ofi_threshold":
            ofi = metrics.get("ofi", 0)
            threshold = condition.get("threshold", 0.5)
            direction = condition.get("direction", "above")
            
            if direction == "above":
                return abs(ofi) > threshold
            elif direction == "below":
                return abs(ofi) < threshold
        
        elif alert_type == "volatility_spike":
            volatility = metrics.get("realized_vol_30s", 0)
            threshold = condition.get("threshold", 2.0)
            return volatility > threshold
        
        elif alert_type == "spread_expansion":
            spread = metrics.get("spread", 0)
            threshold = condition.get("threshold", 0.01)
            return spread > threshold
        
        elif alert_type == "queue_imbalance":
            imbalance = abs(metrics.get("queue_imbalance_l1", 0))
            threshold = condition.get("threshold", 0.5)
            return imbalance > threshold
        
        return False
