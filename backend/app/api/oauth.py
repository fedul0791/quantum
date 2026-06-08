"""
Google OAuth authentication
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timedelta, timezone
import httpx
import logging

from ..core import get_db, get_settings, create_access_token, create_refresh_token
from ..services import AuthService
from ..schemas import TokenResponse

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/auth/oauth", tags=["oauth"])

settings = get_settings()


@router.get("/google/login")
async def google_login():
    """Redirect to Google login"""
    
    if not settings.GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Google OAuth not configured",
        )
    
    google_auth_url = (
        f"https://accounts.google.com/o/oauth2/v2/auth?"
        f"client_id={settings.GOOGLE_CLIENT_ID}"
        f"&redirect_uri={settings.GOOGLE_REDIRECT_URL}"
        f"&response_type=code"
        f"&scope=openid%20email%20profile"
    )
    
    return {"url": google_auth_url}


@router.get("/google/callback")
async def google_callback(
    code: str = Query(...),
    session: AsyncSession = Depends(get_db),
):
    """Handle Google OAuth callback"""
    
    if not settings.GOOGLE_CLIENT_ID or not settings.GOOGLE_CLIENT_SECRET:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Google OAuth not configured",
        )
    
    try:
        # Exchange code for token
        token_url = "https://oauth2.googleapis.com/token"
        
        async with httpx.AsyncClient() as client:
            token_response = await client.post(
                token_url,
                data={
                    "code": code,
                    "client_id": settings.GOOGLE_CLIENT_ID,
                    "client_secret": settings.GOOGLE_CLIENT_SECRET,
                    "redirect_uri": settings.GOOGLE_REDIRECT_URL,
                    "grant_type": "authorization_code",
                },
            )
            
            if token_response.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Failed to exchange code for token",
                )
            
            token_data = token_response.json()
            id_token = token_data.get("id_token")
            
            # Get user info from Google
            userinfo_url = "https://openidconnect.googleapis.com/v1/userinfo"
            userinfo_response = await client.get(
                userinfo_url,
                headers={"Authorization": f"Bearer {token_data.get('access_token')}"},
            )
            
            if userinfo_response.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Failed to get user info",
                )
            
            user_info = userinfo_response.json()
        
        # Get or create user
        user = await AuthService.get_or_create_oauth_user(
            session,
            google_id=user_info.get("sub"),
            email=user_info.get("email"),
            full_name=user_info.get("name"),
        )
        
        # Create tokens
        access_token = create_access_token(data={"sub": str(user.id)})
        refresh_token = create_refresh_token(data={"sub": str(user.id)})
        
        # Save refresh token
        expires_at = datetime.now(timezone.utc) + timedelta(days=7)
        await AuthService.create_refresh_token(session, str(user.id), refresh_token, expires_at)
        
        logger.info(f"User logged in via Google: {user.email}")
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            expires_in=1800,
        )
        
    except httpx.HTTPError as e:
        logger.error(f"Google OAuth error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="OAuth error",
        )
