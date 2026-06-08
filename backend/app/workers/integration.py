"""
Integration worker that connects market-collector & analytics-engine
to the FastAPI backend, storing data in PostgreSQL and broadcasting via WebSocket.
"""

import asyncio
import json
import logging
from datetime import datetime, timezone
from sqlalchemy import select
from redis import asyncio as redis_asyncio

from app.core import async_session, get_settings
from app.models import Trade, OrderBookSnapshot, MarketMetrics
from app.api.websocket import broadcast_market_update, broadcast_hft_update

settings = get_settings()
logger = logging.getLogger(__name__)

redis_client = None


async def init_redis():
    """Initialize Redis connection"""
    global redis_client
    redis_client = await redis_asyncio.from_url(settings.REDIS_URL)
    logger.info("Redis connection initialized")


async def process_trades():
    """Listen to trades from Redis and store in DB + broadcast"""
    pubsub = redis_client.pubsub()
    
    for symbol in ["BTCUSDT", "ETHUSDT", "SOLUSDT"]:
        await pubsub.subscribe(f"trades:{symbol}")
    
    logger.info("Subscribed to trade streams")
    
    async for message in pubsub.listen():
        if message["type"] == "message":
            channel = message["channel"].decode()
            data = json.loads(message["data"])
            
            symbol = channel.split(":")[1]
            
            try:
                # Store in database
                async with async_session() as session:
                    trade = Trade(
                        symbol=symbol,
                        trade_id=data.get("trade_id"),
                        price=data.get("price"),
                        quantity=data.get("quantity"),
                        is_buyer_maker=data.get("buyer_maker", False),
                        event_time=datetime.fromisoformat(
                            data.get("event_time", datetime.now(timezone.utc).isoformat())
                        ),
                        trade_time=datetime.fromisoformat(
                            data.get("trade_time", datetime.now(timezone.utc).isoformat())
                        ),
                        quote_asset_volume=data.get("price", 0) * data.get("quantity", 0),
                    )
                    session.add(trade)
                    await session.commit()
                
                # Broadcast to WebSocket clients
                await broadcast_market_update(symbol, data)
                
            except Exception as e:
                logger.error(f"Error processing trade: {e}")


async def process_depth():
    """Listen to order book snapshots and store in DB"""
    pubsub = redis_client.pubsub()
    
    for symbol in ["BTCUSDT", "ETHUSDT", "SOLUSDT"]:
        await pubsub.subscribe(f"depth:{symbol}")
    
    logger.info("Subscribed to depth streams")
    
    async for message in pubsub.listen():
        if message["type"] == "message":
            channel = message["channel"].decode()
            data = json.loads(message["data"])
            
            symbol = channel.split(":")[1]
            
            try:
                async with async_session() as session:
                    # Calculate metrics
                    bids = data.get("bids", [])
                    asks = data.get("asks", [])
                    
                    best_bid = float(bids[0][0]) if bids else None
                    best_ask = float(asks[0][0]) if asks else None
                    bid_qty = float(bids[0][1]) if bids else 0
                    ask_qty = float(asks[0][1]) if asks else 0
                    
                    spread = (best_ask - best_bid) if best_ask and best_bid else None
                    microprice = (best_ask * bid_qty + best_bid * ask_qty) / (bid_qty + ask_qty) if (bid_qty + ask_qty) > 0 else None
                    
                    # Store order book snapshot
                    snapshot = OrderBookSnapshot(
                        symbol=symbol,
                        bids=bids,
                        asks=asks,
                        event_time=datetime.fromisoformat(
                            data.get("event_time", datetime.now(timezone.utc).isoformat())
                        ),
                        best_bid=best_bid,
                        best_ask=best_ask,
                        bid_qty=bid_qty,
                        ask_qty=ask_qty,
                        microprice=microprice,
                        spread=spread,
                    )
                    session.add(snapshot)
                    await session.commit()
                
            except Exception as e:
                logger.error(f"Error processing depth: {e}")


async def process_metrics():
    """Listen to HFT metrics from analytics-engine and store in DB"""
    # This would be implemented when analytics-engine is updated to publish metrics
    logger.info("Metrics processing ready (waiting for analytics-engine updates)")


async def main():
    """Main worker loop"""
    await init_redis()
    
    try:
        # Run all tasks concurrently
        await asyncio.gather(
            process_trades(),
            process_depth(),
            process_metrics(),
        )
    except Exception as e:
        logger.error(f"Worker error: {e}")
    finally:
        if redis_client:
            await redis_client.close()


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    asyncio.run(main())
