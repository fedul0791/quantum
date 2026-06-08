from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from datetime import datetime, timedelta, timezone
import logging

from ..core import get_db
from ..models import Trade, OrderBookSnapshot
from ..api.auth import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/replay", tags=["replay"])


@router.get("/historical-trades")
async def get_historical_trades(
    symbol: str = Query("BTCUSDT"),
    start_time: datetime = Query(datetime.now(timezone.utc) - timedelta(hours=1)),
    end_time: datetime = Query(datetime.now(timezone.utc)),
    limit: int = Query(1000, le=10000),
    session: AsyncSession = Depends(get_db),
    user = Depends(get_current_user),
):
    """Get historical trades for replay"""
    
    stmt = select(Trade).where(
        Trade.symbol == symbol,
        Trade.event_time >= start_time,
        Trade.event_time <= end_time,
    ).order_by(Trade.event_time).limit(limit)
    
    result = await session.execute(stmt)
    trades = result.scalars().all()
    
    return [
        {
            "timestamp": t.event_time,
            "price": t.price,
            "quantity": t.quantity,
            "is_buyer_maker": t.is_buyer_maker,
        }
        for t in trades
    ]


@router.get("/historical-orderbook")
async def get_historical_orderbook(
    symbol: str = Query("BTCUSDT"),
    start_time: datetime = Query(datetime.now(timezone.utc) - timedelta(hours=1)),
    end_time: datetime = Query(datetime.now(timezone.utc)),
    limit: int = Query(500, le=5000),
    session: AsyncSession = Depends(get_db),
    user = Depends(get_current_user),
):
    """Get historical order book snapshots for replay"""
    
    stmt = select(OrderBookSnapshot).where(
        OrderBookSnapshot.symbol == symbol,
        OrderBookSnapshot.event_time >= start_time,
        OrderBookSnapshot.event_time <= end_time,
    ).order_by(OrderBookSnapshot.event_time).limit(limit)
    
    result = await session.execute(stmt)
    snapshots = result.scalars().all()
    
    return [
        {
            "timestamp": s.event_time,
            "bids": s.bids or [],
            "asks": s.asks or [],
            "spread": s.spread,
        }
        for s in snapshots
    ]


@router.get("/available-symbols")
async def get_available_symbols(
    session: AsyncSession = Depends(get_db),
    user = Depends(get_current_user),
):
    """Get available symbols for replay"""
    
    stmt = select(Trade.symbol).distinct()
    result = await session.execute(stmt)
    symbols = result.scalars().all()
    
    return {"symbols": sorted(set(symbols))}


@router.get("/time-range")
async def get_time_range(
    symbol: str = Query("BTCUSDT"),
    session: AsyncSession = Depends(get_db),
    user = Depends(get_current_user),
):
    """Get available time range for replay"""
    
    # Get earliest trade
    stmt_earliest = select(Trade).where(
        Trade.symbol == symbol
    ).order_by(Trade.event_time).limit(1)
    
    result_earliest = await session.execute(stmt_earliest)
    earliest = result_earliest.scalar_one_or_none()
    
    # Get latest trade
    stmt_latest = select(Trade).where(
        Trade.symbol == symbol
    ).order_by(desc(Trade.event_time)).limit(1)
    
    result_latest = await session.execute(stmt_latest)
    latest = result_latest.scalar_one_or_none()
    
    return {
        "start_time": earliest.event_time if earliest else None,
        "end_time": latest.event_time if latest else None,
    }
