from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.pool import AsyncAdaptedQueuePool
import logging

from .config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)

# Create async engine with proper connection pooling
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    # Use AsyncAdaptedQueuePool for scalable connection pooling
    poolclass=AsyncAdaptedQueuePool,
    pool_size=10,           # Min connections to maintain
    max_overflow=20,        # Additional connections when needed
    pool_timeout=30,        # Seconds to wait for connection
    pool_recycle=3600,      # Recycle connections after 1 hour
    pool_pre_ping=True,     # Test connection before using
    connect_args={
        "timeout": 10,
        "server_settings": {
            "jit": "off",   # Disable JIT for consistency
        }
    },
)

# Create async session factory
async_session = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)

Base = declarative_base()


async def get_db() -> AsyncSession:
    """Get database session"""
    async with async_session() as session:
        try:
            yield session
        except Exception as e:
            await session.rollback()
            logger.error(f"Database session error: {e}")
            raise
        finally:
            await session.close()


async def init_db():
    """Initialize database tables and check connectivity"""
    try:
        # Test connection
        async with engine.begin() as conn:
            await conn.execute("SELECT 1")
            logger.info("Database connection successful")
            
            # Create tables
            await conn.run_sync(Base.metadata.create_all)
            logger.info("Database tables created/verified")
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")
        raise


async def dispose_db():
    """Dispose database connection pool"""
    try:
        await engine.dispose()
        logger.info("Database connection pool disposed")
    except Exception as e:
        logger.error(f"Error disposing database: {e}")
