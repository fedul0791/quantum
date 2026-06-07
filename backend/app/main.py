from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from .core import init_db, dispose_db, get_settings
from .api import auth, dashboard, hft, orderbook, websocket, alerts, watchlists, replay, oauth

settings = get_settings()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting Quantum Flow Terminal API")
    await init_db()
    yield
    # Shutdown
    logger.info("Shutting down Quantum Flow Terminal API")
    await dispose_db()


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(dashboard.router)
app.include_router(hft.router)
app.include_router(orderbook.router)
app.include_router(websocket.router)
app.include_router(alerts.router)
app.include_router(watchlists.router)
app.include_router(replay.router)
app.include_router(oauth.router)


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "version": settings.APP_VERSION}


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Quantum Flow Terminal API",
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "openapi": "/openapi.json",
    }
