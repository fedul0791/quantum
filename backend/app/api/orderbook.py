from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from datetime import datetime, timezone
import logging

from ..core import get_db
from ..models import OrderBookSnapshot
from ..schemas import OrderBookResponse, OrderBookLevel
from ..api.auth import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/orderbook", tags=["orderbook"])


@router.get("/current", response_model=OrderBookResponse)
async def get_current_orderbook(
    symbol: str = Query("BTCUSDT"),
    levels: int = Query(20, ge=10, le=50),
    session: AsyncSession = Depends(get_db),
    user = Depends(get_current_user),
):
    """Get current order book snapshot"""
    
    stmt = select(OrderBookSnapshot).where(
        OrderBookSnapshot.symbol == symbol
    ).order_by(desc(OrderBookSnapshot.event_time)).limit(1)
    
    result = await session.execute(stmt)
    snapshot = result.scalar_one_or_none()
    
    if not snapshot:
        return OrderBookResponse(
            symbol=symbol,
            bids=[],
            asks=[],
            best_bid=0.0,
            best_ask=0.0,
            spread=0.0,
            timestamp=datetime.now(timezone.utc),
        )
    
    # Convert to OrderBookLevel objects and limit
    bids = [OrderBookLevel(price=b[0], quantity=b[1]) for b in (snapshot.bids or [])[:levels]]
    asks = [OrderBookLevel(price=a[0], quantity=a[1]) for a in (snapshot.asks or [])[:levels]]
    
    return OrderBookResponse(
        symbol=snapshot.symbol,
        bids=bids,
        asks=asks,
        best_bid=snapshot.best_bid or 0.0,
        best_ask=snapshot.best_ask or 0.0,
        spread=snapshot.spread or 0.0,
        timestamp=snapshot.event_time,
    )


@router.get("/spread-history")
async def get_spread_history(
    symbol: str = Query("BTCUSDT"),
    limit: int = Query(100, le=1000),
    session: AsyncSession = Depends(get_db),
    user = Depends(get_current_user),
):
    """Get historical spread data"""
    
    stmt = select(OrderBookSnapshot).where(
        OrderBookSnapshot.symbol == symbol
    ).order_by(desc(OrderBookSnapshot.event_time)).limit(limit)
    
    result = await session.execute(stmt)
    snapshots = result.scalars().all()
    
    spread_data = [
        {
            "timestamp": s.event_time,
            "spread": s.spread or 0.0,
            "best_bid": s.best_bid or 0.0,
            "best_ask": s.best_ask or 0.0,
            "mid_price": ((s.best_bid or 0) + (s.best_ask or 0)) / 2,
        }
        for s in reversed(snapshots)
    ]
    
    return spread_data


@router.get("/depth-profile")
async def get_depth_profile(
    symbol: str = Query("BTCUSDT"),
    session: AsyncSession = Depends(get_db),
    user = Depends(get_current_user),
):
    """Get depth profile (cumulative quantity at each price level)"""
    
    stmt = select(OrderBookSnapshot).where(
        OrderBookSnapshot.symbol == symbol
    ).order_by(desc(OrderBookSnapshot.event_time)).limit(1)
    
    result = await session.execute(stmt)
    snapshot = result.scalar_one_or_none()
    
    if not snapshot:
        return {"bids_depth": [], "asks_depth": []}
    
    # Calculate cumulative quantities
    bids_depth = []
    asks_depth = []
    
    if snapshot.bids:
        cumulative = 0
        for price, qty in snapshot.bids:
            cumulative += qty
            bids_depth.append({"price": price, "cumulative_qty": cumulative})
    
    if snapshot.asks:
        cumulative = 0
        for price, qty in snapshot.asks:
            cumulative += qty
            asks_depth.append({"price": price, "cumulative_qty": cumulative})
    
    return {
        "symbol": symbol,
        "bids_depth": bids_depth,
        "asks_depth": asks_depth,
        "timestamp": snapshot.event_time,
    }


@router.get("/imbalance")
async def get_orderbook_imbalance(
    symbol: str = Query("BTCUSDT"),
    levels: int = Query(10, ge=5, le=50),
    session: AsyncSession = Depends(get_db),
    user = Depends(get_current_user),
):
    """Get order book imbalance metrics"""
    
    stmt = select(OrderBookSnapshot).where(
        OrderBookSnapshot.symbol == symbol
    ).order_by(desc(OrderBookSnapshot.event_time)).limit(1)
    
    result = await session.execute(stmt)
    snapshot = result.scalar_one_or_none()
    
    if not snapshot or not snapshot.bids or not snapshot.asks:
        return {
            "symbol": symbol,
            "bid_qty": 0.0,
            "ask_qty": 0.0,
            "imbalance_ratio": 0.0,
            "imbalance_pct": 0.0,
        }
    
    # Calculate total quantities for top levels
    bid_qty = sum(b[1] for b in snapshot.bids[:levels])
    ask_qty = sum(a[1] for a in snapshot.asks[:levels])
    
    total = bid_qty + ask_qty
    if total == 0:
        imbalance_pct = 0.0
    else:
        imbalance_pct = ((bid_qty - ask_qty) / total) * 100
    
    return {
        "symbol": symbol,
        "bid_qty": bid_qty,
        "ask_qty": ask_qty,
        "imbalance_ratio": bid_qty / ask_qty if ask_qty > 0 else 0.0,
        "imbalance_pct": imbalance_pct,
        "levels": levels,
        "timestamp": snapshot.event_time,
    }
