from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID
import logging

from ..core import get_db
from ..models import Watchlist
from ..schemas import WatchlistCreate, WatchlistUpdate, WatchlistResponse
from ..api.auth import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/watchlists", tags=["watchlists"])


@router.post("/create", response_model=WatchlistResponse)
async def create_watchlist(
    watchlist_data: WatchlistCreate,
    session: AsyncSession = Depends(get_db),
    user = Depends(get_current_user),
):
    """Create new watchlist"""
    
    watchlist = Watchlist(
        user_id=user.id,
        name=watchlist_data.name,
        description=watchlist_data.description,
        symbols=watchlist_data.symbols,
        is_default=watchlist_data.is_default,
    )
    
    session.add(watchlist)
    await session.commit()
    await session.refresh(watchlist)
    
    logger.info(f"Watchlist created: {watchlist.id}")
    return WatchlistResponse.model_validate(watchlist)


@router.get("/list", response_model=list[WatchlistResponse])
async def list_watchlists(
    session: AsyncSession = Depends(get_db),
    user = Depends(get_current_user),
):
    """List all watchlists for user"""
    
    stmt = select(Watchlist).where(Watchlist.user_id == user.id)
    result = await session.execute(stmt)
    watchlists = result.scalars().all()
    
    return [WatchlistResponse.model_validate(w) for w in watchlists]


@router.get("/{watchlist_id}", response_model=WatchlistResponse)
async def get_watchlist(
    watchlist_id: UUID,
    session: AsyncSession = Depends(get_db),
    user = Depends(get_current_user),
):
    """Get specific watchlist"""
    
    stmt = select(Watchlist).where(Watchlist.id == watchlist_id, Watchlist.user_id == user.id)
    result = await session.execute(stmt)
    watchlist = result.scalar_one_or_none()
    
    if not watchlist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Watchlist not found",
        )
    
    return WatchlistResponse.model_validate(watchlist)


@router.put("/{watchlist_id}", response_model=WatchlistResponse)
async def update_watchlist(
    watchlist_id: UUID,
    watchlist_update: WatchlistUpdate,
    session: AsyncSession = Depends(get_db),
    user = Depends(get_current_user),
):
    """Update watchlist"""
    
    stmt = select(Watchlist).where(Watchlist.id == watchlist_id, Watchlist.user_id == user.id)
    result = await session.execute(stmt)
    watchlist = result.scalar_one_or_none()
    
    if not watchlist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Watchlist not found",
        )
    
    # Update fields
    if watchlist_update.name is not None:
        watchlist.name = watchlist_update.name
    if watchlist_update.description is not None:
        watchlist.description = watchlist_update.description
    if watchlist_update.symbols is not None:
        watchlist.symbols = watchlist_update.symbols
    if watchlist_update.is_default is not None:
        watchlist.is_default = watchlist_update.is_default
    
    await session.commit()
    await session.refresh(watchlist)
    
    return WatchlistResponse.model_validate(watchlist)


@router.post("/{watchlist_id}/add-symbol")
async def add_symbol_to_watchlist(
    watchlist_id: UUID,
    symbol: str,
    session: AsyncSession = Depends(get_db),
    user = Depends(get_current_user),
):
    """Add symbol to watchlist"""
    
    stmt = select(Watchlist).where(Watchlist.id == watchlist_id, Watchlist.user_id == user.id)
    result = await session.execute(stmt)
    watchlist = result.scalar_one_or_none()
    
    if not watchlist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Watchlist not found",
        )
    
    if symbol not in watchlist.symbols:
        watchlist.symbols.append(symbol)
        await session.commit()
    
    return {"message": f"Symbol {symbol} added to watchlist"}


@router.post("/{watchlist_id}/remove-symbol")
async def remove_symbol_from_watchlist(
    watchlist_id: UUID,
    symbol: str,
    session: AsyncSession = Depends(get_db),
    user = Depends(get_current_user),
):
    """Remove symbol from watchlist"""
    
    stmt = select(Watchlist).where(Watchlist.id == watchlist_id, Watchlist.user_id == user.id)
    result = await session.execute(stmt)
    watchlist = result.scalar_one_or_none()
    
    if not watchlist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Watchlist not found",
        )
    
    if symbol in watchlist.symbols:
        watchlist.symbols.remove(symbol)
        await session.commit()
    
    return {"message": f"Symbol {symbol} removed from watchlist"}


@router.delete("/{watchlist_id}")
async def delete_watchlist(
    watchlist_id: UUID,
    session: AsyncSession = Depends(get_db),
    user = Depends(get_current_user),
):
    """Delete watchlist"""
    
    stmt = select(Watchlist).where(Watchlist.id == watchlist_id, Watchlist.user_id == user.id)
    result = await session.execute(stmt)
    watchlist = result.scalar_one_or_none()
    
    if not watchlist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Watchlist not found",
        )
    
    await session.delete(watchlist)
    await session.commit()
    
    return {"message": "Watchlist deleted"}
