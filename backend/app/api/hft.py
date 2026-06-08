from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from datetime import datetime, timezone
import logging

from ..core import get_db
from ..models import MarketMetrics, OrderBookSnapshot
from ..schemas import HFTMetricsResponse
from ..api.auth import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/hft", tags=["hft"])


@router.get("/metrics", response_model=HFTMetricsResponse)
async def get_hft_metrics(
    symbol: str = Query("BTCUSDT"),
    session: AsyncSession = Depends(get_db),
    user = Depends(get_current_user),
):
    """Get latest HFT metrics for a symbol"""
    
    stmt = select(MarketMetrics).where(
        MarketMetrics.symbol == symbol
    ).order_by(desc(MarketMetrics.recorded_at)).limit(1)
    
    result = await session.execute(stmt)
    metrics = result.scalar_one_or_none()
    
    if not metrics:
        # Return default metrics if none found
        return HFTMetricsResponse(
            symbol=symbol,
            ofi=0.0,
            microprice=0.0,
            queue_imbalance_l1=0.0,
            queue_imbalance_l5=0.0,
            queue_imbalance_l10=0.0,
            realized_vol_30s=0.0,
            fill_probability=50.0,
            trade_imbalance=0.0,
            timestamp=datetime.now(timezone.utc),
        )
    
    return HFTMetricsResponse(
        symbol=metrics.symbol,
        ofi=metrics.ofi or 0.0,
        microprice=metrics.ofi or 0.0,
        queue_imbalance_l1=metrics.queue_imbalance_l1 or 0.0,
        queue_imbalance_l5=metrics.queue_imbalance_l5 or 0.0,
        queue_imbalance_l10=metrics.queue_imbalance_l10 or 0.0,
        realized_vol_30s=metrics.realized_vol_30s or 0.0,
        fill_probability=metrics.fill_probability or 50.0,
        trade_imbalance=metrics.trade_imbalance or 0.0,
        timestamp=metrics.recorded_at,
    )


@router.get("/metrics/history")
async def get_hft_metrics_history(
    symbol: str = Query("BTCUSDT"),
    limit: int = Query(100, le=500),
    session: AsyncSession = Depends(get_db),
    user = Depends(get_current_user),
):
    """Get historical HFT metrics"""
    
    stmt = select(MarketMetrics).where(
        MarketMetrics.symbol == symbol
    ).order_by(desc(MarketMetrics.recorded_at)).limit(limit)
    
    result = await session.execute(stmt)
    metrics_list = result.scalars().all()
    
    return [
        {
            "timestamp": m.recorded_at,
            "ofi": m.ofi,
            "microprice": m.ofi,
            "queue_imbalance_l1": m.queue_imbalance_l1,
            "queue_imbalance_l5": m.queue_imbalance_l5,
            "realized_vol_30s": m.realized_vol_30s,
        }
        for m in reversed(metrics_list)
    ]


@router.get("/orderbook-depth")
async def get_orderbook_depth(
    symbol: str = Query("BTCUSDT"),
    levels: int = Query(20, ge=10, le=50),
    session: AsyncSession = Depends(get_db),
    user = Depends(get_current_user),
):
    """Get order book depth for visualization"""
    
    stmt = select(OrderBookSnapshot).where(
        OrderBookSnapshot.symbol == symbol
    ).order_by(desc(OrderBookSnapshot.event_time)).limit(1)
    
    result = await session.execute(stmt)
    snapshot = result.scalar_one_or_none()
    
    if not snapshot:
        return {"symbol": symbol, "bids": [], "asks": [], "timestamp": None}
    
    # Limit to requested levels
    bids = snapshot.bids[:levels] if snapshot.bids else []
    asks = snapshot.asks[:levels] if snapshot.asks else []
    
    return {
        "symbol": symbol,
        "bids": bids,
        "asks": asks,
        "timestamp": snapshot.event_time,
    }


@router.get("/liquidity-walls")
async def get_liquidity_walls(
    symbol: str = Query("BTCUSDT"),
    threshold: float = Query(100000.0),
    session: AsyncSession = Depends(get_db),
    user = Depends(get_current_user),
):
    """Detect liquidity walls in order book"""
    
    stmt = select(OrderBookSnapshot).where(
        OrderBookSnapshot.symbol == symbol
    ).order_by(desc(OrderBookSnapshot.event_time)).limit(1)
    
    result = await session.execute(stmt)
    snapshot = result.scalar_one_or_none()
    
    if not snapshot:
        return {"bid_walls": [], "ask_walls": []}
    
    bid_walls = []
    ask_walls = []
    
    # Find bid walls
    if snapshot.bids:
        cumulative_qty = 0
        for price, qty in snapshot.bids:
            cumulative_qty += qty
            if cumulative_qty >= threshold:
                bid_walls.append({
                    "price": price,
                    "quantity": qty,
                    "cumulative": cumulative_qty,
                })
    
    # Find ask walls
    if snapshot.asks:
        cumulative_qty = 0
        for price, qty in snapshot.asks:
            cumulative_qty += qty
            if cumulative_qty >= threshold:
                ask_walls.append({
                    "price": price,
                    "quantity": qty,
                    "cumulative": cumulative_qty,
                })
    
    return {
        "symbol": symbol,
        "bid_walls": bid_walls,
        "ask_walls": ask_walls,
    }
