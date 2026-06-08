from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timedelta, timezone
import logging

from ..core import (
    get_db,
    create_access_token,
    create_refresh_token,
    decode_token,
    get_user_id_from_token,
)
from ..services import AuthService
from ..schemas import (
    UserCreate,
    UserLogin,
    UserResponse,
    TokenResponse,
    TokenRefresh,
)
from ..schemas.password import UserRegisterRequest, UserLoginRequest, PasswordValidator

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/auth", tags=["auth"])
security = HTTPBearer()


# Helper to get current user from token
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    session: AsyncSession = Depends(get_db),
):
    token = credentials.credentials
    user_id = get_user_id_from_token(token)
    
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )
    
    user = await AuthService.get_user_by_id(session, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    
    return user


@router.post("/register", response_model=UserResponse)
async def register(
    user_data: UserRegisterRequest,
    session: AsyncSession = Depends(get_db),
):
    """Register new user with strong password validation"""
    try:
        # Password strength already validated by schema validator
        # Convert to UserCreate for service
        user_create = UserCreate(
            email=user_data.email,
            password=user_data.password,
        )
        user = await AuthService.register_user(session, user_create)
        return UserResponse.model_validate(user)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        logger.error(f"Registration error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed",
        )


@router.post("/login", response_model=TokenResponse)
async def login(
    credentials: UserLoginRequest,
    session: AsyncSession = Depends(get_db),
):
    """Login user"""
    user = await AuthService.authenticate_user(
        session, credentials.email, credentials.password
    )
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )
    
    # Create tokens
    access_token_expires = timedelta(minutes=30)
    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=access_token_expires,
    )
    
    refresh_token = create_refresh_token(data={"sub": str(user.id)})
    
    # Save refresh token to DB
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    await AuthService.create_refresh_token(
        session, str(user.id), refresh_token, expires_at
    )
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=1800,  # 30 minutes
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh(
    token_data: TokenRefresh,
    session: AsyncSession = Depends(get_db),
):
    """Refresh access token"""
    refresh_token = await AuthService.get_refresh_token(session, token_data.refresh_token)
    
    if not refresh_token or not refresh_token.is_valid():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        )
    
    # Create new access token
    access_token = create_access_token(data={"sub": str(refresh_token.user_id)})
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=token_data.refresh_token,
        expires_in=1800,
    )


@router.post("/logout")
async def logout(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    session: AsyncSession = Depends(get_db),
):
    """Logout user (revoke refresh token if needed)"""
    # In a real app, you might want to blacklist the token
    return {"message": "Logged out successfully"}


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    user = Depends(get_current_user),
):
    """Get current user info"""
    return UserResponse.model_validate(user)


@router.post("/verify-email")
async def verify_email(
    token: str,
    session: AsyncSession = Depends(get_db),
):
    """Verify email address"""
    user_id = get_user_id_from_token(token)
    
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid token",
        )
    
    user = await AuthService.get_user_by_id(session, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    user.is_verified = True
    await session.commit()
    
    return {"message": "Email verified successfully"}
