from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
import json
import logging
import asyncio
from datetime import datetime

from ..core import get_db, get_user_id_from_token
from ..models import MarketMetrics, OrderBookSnapshot, Trade
from ..services.realtime import RealTimeService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/ws", tags=["websocket"])

# Store active connections
class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[str, list[WebSocket]] = {}
    
    async def connect(self, websocket: WebSocket, channel: str):
        await websocket.accept()
        if channel not in self.active_connections:
            self.active_connections[channel] = []
        self.active_connections[channel].append(websocket)
        logger.info(f"Client connected to {channel}")
    
    def disconnect(self, websocket: WebSocket, channel: str):
        if channel in self.active_connections:
            self.active_connections[channel].remove(websocket)
            logger.info(f"Client disconnected from {channel}")
    
    async def broadcast(self, message: dict, channel: str):
        if channel in self.active_connections:
            for connection in self.active_connections[channel]:
                try:
                    await connection.send_json(message)
                except Exception as e:
                    logger.error(f"Broadcast error: {e}")

manager = ConnectionManager()


@router.websocket("/market/{symbol}")
async def websocket_market_data(websocket: WebSocket, symbol: str, db: AsyncSession = Depends(get_db)):
    """WebSocket for real-time market data streaming"""
    
    channel = f"market_{symbol}"
    await manager.connect(websocket, channel)
    
    # Subscribe to Redis market updates
    async def market_callback(data):
        try:
            if data.get("type") == "trade":
                # Broadcast trade data
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
                # Broadcast depth data
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
    
    subscribe_task = asyncio.create_task(
        RealTimeService.subscribe_to_market_data(symbol, market_callback)
    )
    
    try:
        while True:
            # Receive message from client (could be ping or subscription changes)
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if message.get("type") == "ping":
                await websocket.send_json({"type": "pong"})
    
    except WebSocketDisconnect:
        manager.disconnect(websocket, channel)
        subscribe_task.cancel()
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        manager.disconnect(websocket, channel)
        subscribe_task.cancel()


@router.websocket("/hft/{symbol}")
async def websocket_hft_metrics(websocket: WebSocket, symbol: str):
    """WebSocket for real-time HFT metrics"""
    
    channel = f"hft_{symbol}"
    await manager.connect(websocket, channel)
    
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if message.get("type") == "ping":
                await websocket.send_json({"type": "pong"})
    
    except WebSocketDisconnect:
        manager.disconnect(websocket, channel)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        manager.disconnect(websocket, channel)


async def broadcast_market_update(symbol: str, data: dict):
    """Broadcast market update to all connected clients"""
    await manager.broadcast(
        {
            "type": "market_update",
            "symbol": symbol,
            "data": data,
            "timestamp": datetime.utcnow().isoformat(),
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
            "timestamp": datetime.utcnow().isoformat(),
        },
        f"hft_{symbol}"
    )
