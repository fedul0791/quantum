from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
import json
import logging
from datetime import datetime

from ..core import get_db, get_user_id_from_token
from ..models import MarketMetrics, OrderBookSnapshot, Trade

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
async def websocket_market_data(websocket: WebSocket, symbol: str):
    """WebSocket for real-time market data streaming"""
    
    channel = f"market_{symbol}"
    await manager.connect(websocket, channel)
    
    try:
        while True:
            # Receive message from client (could be ping or subscription changes)
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if message.get("type") == "ping":
                await websocket.send_json({"type": "pong"})
    
    except WebSocketDisconnect:
        manager.disconnect(websocket, channel)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        manager.disconnect(websocket, channel)


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
