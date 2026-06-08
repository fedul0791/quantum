import asyncio
import json
import logging
import redis.asyncio as redis
from typing import Dict, Any
from datetime import datetime, timezone

logger = logging.getLogger(__name__)

class RealTimeService:
    """Service for publishing real-time market data through WebSocket"""
    
    _redis_client: redis.Redis | None = None
    _pubsub: redis.client.PubSub | None = None
    
    @classmethod
    async def init(cls, redis_host: str = "localhost", redis_port: int = 6379):
        """Initialize Redis connection"""
        try:
            cls._redis_client = await redis.from_url(
                f"redis://{redis_host}:{redis_port}",
                decode_responses=True
            )
            logger.info("Real-time service initialized")
        except Exception as e:
            logger.error(f"Failed to initialize real-time service: {e}")
    
    @classmethod
    async def publish_market_update(cls, symbol: str, data: Dict[str, Any]):
        """Publish market data update"""
        if not cls._redis_client:
            return
        
        try:
            message = {
                "type": "market_update",
                "symbol": symbol,
                "data": data,
                "timestamp": datetime.now(timezone.utc).isoformat(),
            }
            
            await cls._redis_client.publish(
                f"ws:market:{symbol}",
                json.dumps(message)
            )
            logger.debug(f"Published market update for {symbol}")
        except Exception as e:
            logger.error(f"Failed to publish market update: {e}")
    
    @classmethod
    async def publish_hft_metrics(cls, symbol: str, metrics: Dict[str, Any]):
        """Publish HFT metrics update"""
        if not cls._redis_client:
            return
        
        try:
            message = {
                "type": "hft_update",
                "symbol": symbol,
                "metrics": metrics,
                "timestamp": datetime.now(timezone.utc).isoformat(),
            }
            
            await cls._redis_client.publish(
                f"ws:hft:{symbol}",
                json.dumps(message)
            )
            logger.debug(f"Published HFT metrics for {symbol}")
        except Exception as e:
            logger.error(f"Failed to publish HFT metrics: {e}")
    
    @classmethod
    async def subscribe_to_market_data(cls, symbol: str, callback):
        """Subscribe to market data updates"""
        if not cls._redis_client:
            return
        
        try:
            pubsub = cls._redis_client.pubsub()
            await pubsub.subscribe(f"trades:{symbol}", f"depth:{symbol}")
            
            async for message in pubsub.listen():
                if message["type"] == "message":
                    try:
                        data = json.loads(message["data"])
                        await callback(data)
                    except json.JSONDecodeError:
                        logger.warning(f"Invalid JSON in market data: {message['data']}")
        except Exception as e:
            logger.error(f"Error subscribing to market data: {e}")
        finally:
            await pubsub.close()
    
    @classmethod
    async def close(cls):
        """Close Redis connection"""
        if cls._redis_client:
            await cls._redis_client.close()
            logger.info("Real-time service closed")
