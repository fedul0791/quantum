from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
import json
import logging
import asyncio
from datetime import datetime, timezone

from ..core import get_db, get_user_id_from_token
from ..models import MarketMetrics, OrderBookSnapshot, Trade
from ..services.realtime import RealTimeService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/ws", tags=["websocket"])

# Store active connections with user context
class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[str, list[dict]] = {}
    
    async def connect(self, websocket: WebSocket, channel: str, user_id: str):
        """Connect authenticated user to channel"""
        await websocket.accept()
        if channel not in self.active_connections:
            self.active_connections[channel] = []
        self.active_connections[channel].append({
            "websocket": websocket,
            "user_id": user_id,
            "connected_at": datetime.now(timezone.utc)
        })
        logger.info(f"User {user_id} connected to {channel}")
    
    def disconnect(self, websocket: WebSocket, channel: str):
        """Disconnect from channel"""
        if channel in self.active_connections:
            self.active_connections[channel] = [
                conn for conn in self.active_connections[channel]
                if conn["websocket"] != websocket
            ]
            logger.info(f"Client disconnected from {channel}")
    
    async def broadcast(self, message: dict, channel: str, exclude_user: str = None):
        """Broadcast message to all connected clients in channel"""
        if channel in self.active_connections:
            dead_connections = []
            for conn in self.active_connections[channel]:
                # Skip if excluding specific user
                if exclude_user and conn["user_id"] == exclude_user:
                    continue
                
                try:
                    await conn["websocket"].send_json(message)
                except Exception as e:
                    logger.error(f"Broadcast error: {e}")
                    dead_connections.append(conn)
            
            # Clean up dead connections
            if dead_connections:
                self.active_connections[channel] = [
                    conn for conn in self.active_connections[channel]
                    if conn not in dead_connections
                ]

manager = ConnectionManager()


async def verify_websocket_token(token: str) -> str:
    """Verify JWT token and return user_id"""
    try:
        user_id = await get_user_id_from_token(token)
        if not user_id:
            raise Exception("Invalid token")
        return user_id
    except Exception as e:
        logger.error(f"Token verification failed: {e}")
        raise


@router.websocket("/market/{symbol}")
async def websocket_market_data(
    websocket: WebSocket,
    symbol: str,
    token: str = Query(..., description="JWT token for authentication"),
    db: AsyncSession = Depends(get_db)
):
    """WebSocket for real-time market data streaming (AUTHENTICATED)"""
    
    # Authenticate before accepting connection
    try:
        user_id = await verify_websocket_token(token)
    except Exception as e:
        logger.warning(f"WebSocket auth failed: {e}")
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="Unauthorized")
        return
    
    channel = f"market_{symbol}"
    await manager.connect(websocket, channel, user_id)
    
    # Subscribe to Redis market updates
    async def market_callback(data):
        try:
            if data.get("type") == "trade":
                await manager.broadcast(
                    {
                        "type": "trade_update",
                        "symbol": symbol,
                        "price": data.get("price"),
                        "quantity": data.get("quantity"),
                        "timestamp": data.get("event_time"),
                    },
                    channel
                )
            elif data.get("type") == "depth":
                await manager.broadcast(
                    {
                        "type": "depth_update",
                        "symbol": symbol,
                        "bids": data.get("bids", [])[:10],
                        "asks": data.get("asks", [])[:10],
                        "timestamp": data.get("event_time"),
                    },
                    channel
                )
        except Exception as e:
            logger.error(f"Error in market callback: {e}")
    
    subscribe_task = None
    heartbeat_task = None
    
    try:
        subscribe_task = asyncio.create_task(
            RealTimeService.subscribe_to_market_data(symbol, market_callback)
        )
        
        # Heartbeat to keep connection alive
        async def heartbeat():
            while True:
                try:
                    await asyncio.sleep(30)  # Ping every 30 seconds
                    await websocket.send_json({
                        "type": "ping",
                        "timestamp": datetime.now(timezone.utc).isoformat()
                    })
                except Exception as e:
                    logger.debug(f"Heartbeat send failed: {e}")
                    break
        
        heartbeat_task = asyncio.create_task(heartbeat())
        
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # Handle ping/pong
            if message.get("type") == "ping":
                await websocket.send_json({"type": "pong"})
            # Log activity
            logger.debug(f"User {user_id} sent: {message.get('type')}")
    
    except WebSocketDisconnect:
        logger.info(f"User {user_id} disconnected from {channel}")
        manager.disconnect(websocket, channel)
        if subscribe_task:
            subscribe_task.cancel()
        if heartbeat_task:
            heartbeat_task.cancel()
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        manager.disconnect(websocket, channel)
        if subscribe_task:
            subscribe_task.cancel()
        if heartbeat_task:
            heartbeat_task.cancel()


@router.websocket("/hft/{symbol}")
async def websocket_hft_metrics(
    websocket: WebSocket,
    symbol: str,
    token: str = Query(..., description="JWT token for authentication")
):
    """WebSocket for real-time HFT metrics (AUTHENTICATED)"""
    
    # Authenticate before accepting connection
    try:
        user_id = await verify_websocket_token(token)
    except Exception as e:
        logger.warning(f"WebSocket auth failed: {e}")
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="Unauthorized")
        return
    
    channel = f"hft_{symbol}"
    await manager.connect(websocket, channel, user_id)
    
    heartbeat_task = None
    
    try:
        # Heartbeat
        async def heartbeat():
            while True:
                try:
                    await asyncio.sleep(30)
                    await websocket.send_json({
                        "type": "ping",
                        "timestamp": datetime.now(timezone.utc).isoformat()
                    })
                except Exception as e:
                    logger.debug(f"Heartbeat send failed: {e}")
                    break
        
        heartbeat_task = asyncio.create_task(heartbeat())
        
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if message.get("type") == "ping":
                await websocket.send_json({"type": "pong"})
            logger.debug(f"User {user_id} sent: {message.get('type')}")
    
    except WebSocketDisconnect:
        logger.info(f"User {user_id} disconnected from {channel}")
        manager.disconnect(websocket, channel)
        if heartbeat_task:
            heartbeat_task.cancel()
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        manager.disconnect(websocket, channel)
        if heartbeat_task:
            heartbeat_task.cancel()


async def broadcast_market_update(symbol: str, data: dict):
    """Broadcast market update to all connected clients"""
    await manager.broadcast(
        {
            "type": "market_update",
            "symbol": symbol,
            "data": data,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        },
        f"market_{symbol}"
    )


async def broadcast_hft_update(symbol: str, metrics: dict):
    """Broadcast HFT metrics update"""
    await manager.broadcast(
        {
            "type": "hft_update",
            "symbol": symbol,
            "metrics": metrics,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        },
        f"hft_{symbol}"
    )
