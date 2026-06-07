from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from datetime import datetime, timedelta
import logging

from ..core import get_db
from ..models import Trade, OrderBookSnapshot, MarketMetrics
from ..schemas import TradeResponse, OrderBookResponse, HFTMetricsResponse, MarketOverviewResponse, PriceData
from ..api.auth import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/market-overview", response_model=MarketOverviewResponse)
async def get_market_overview(
    symbols: list[str] = Query(["BTCUSDT", "ETHUSDT", "SOLUSDT"]),
    session: AsyncSession = Depends(get_db),
    user = Depends(get_current_user),
):
    """Get market overview for specified symbols"""
    
    prices = []
    
    for symbol in symbols:
        # Get latest trade for price
        stmt = select(Trade).where(
            Trade.symbol == symbol
        ).order_by(desc(Trade.event_time)).limit(1)
        
        result = await session.execute(stmt)
        trade = result.scalar_one_or_none()
        
        if trade:
            # Get 24h change (simplified - in production, fetch from external API)
            stmt_24h = select(Trade).where(
                Trade.symbol == symbol,
                Trade.event_time >= datetime.utcnow() - timedelta(hours=24)
            ).order_by(Trade.event_time).limit(1)
            
            result_24h = await session.execute(stmt_24h)
            trade_24h = result_24h.scalar_one_or_none()
            
            change_24h = 0.0
            if trade_24h:
                change_24h = ((trade.price - trade_24h.price) / trade_24h.price) * 100
            
            prices.append(PriceData(
                symbol=symbol,
                price=trade.price,
                change_24h=change_24h,
                volume_24h=trade.quantity,  # Simplified
                high_24h=trade.price,
                low_24h=trade.price,
            ))
    
    return MarketOverviewResponse(
        symbols=prices,
        last_update=datetime.utcnow(),
    )


@router.get("/recent-trades")
async def get_recent_trades(
    symbol: str = Query("BTCUSDT"),
    limit: int = Query(50, le=100),
    session: AsyncSession = Depends(get_db),
    user = Depends(get_current_user),
):
    """Get recent trades for a symbol"""
    
    stmt = select(Trade).where(
        Trade.symbol == symbol
    ).order_by(desc(Trade.event_time)).limit(limit)
    
    result = await session.execute(stmt)
    trades = result.scalars().all()
    
    return [TradeResponse.model_validate(t) for t in trades]


@router.get("/market-status")
async def get_market_status(
    session: AsyncSession = Depends(get_db),
    user = Depends(get_current_user),
):
    """Get overall market status"""
    
    stmt = select(Trade).order_by(desc(Trade.created_at)).limit(1)
    result = await session.execute(stmt)
    last_trade = result.scalar_one_or_none()
    
    return {
        "is_live": last_trade is not None,
        "last_update": last_trade.created_at if last_trade else None,
        "status": "connected" if last_trade else "disconnected",
    }
