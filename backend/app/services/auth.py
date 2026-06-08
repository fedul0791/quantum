import logging
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError

from ..models import User, UserRole, RefreshToken
from ..core import hash_password, verify_password
from ..schemas import UserCreate, UserLogin, UserResponse

logger = logging.getLogger(__name__)


class AuthService:
    @staticmethod
    async def register_user(session: AsyncSession, user_data: UserCreate) -> User:
        """Register new user"""
        try:
            # Check if email/username already exists
            stmt = select(User).where(
                (User.email == user_data.email) | (User.username == user_data.username)
            )
            result = await session.execute(stmt)
            if result.scalar_one_or_none():
                raise ValueError("Email or username already exists")
            
            # Create new user
            user = User(
                email=user_data.email,
                username=user_data.username,
                full_name=user_data.full_name,
                hashed_password=hash_password(user_data.password),
                role=UserRole.USER,
                is_active=True,
                is_verified=False,
            )
            session.add(user)
            await session.commit()
            await session.refresh(user)
            
            logger.info(f"User registered: {user.email}")
            return user
            
        except IntegrityError:
            await session.rollback()
            raise ValueError("User with this email or username already exists")
        except Exception as e:
            await session.rollback()
            logger.error(f"Registration error: {e}")
            raise
    
    
    @staticmethod
    async def authenticate_user(session: AsyncSession, email: str, password: str) -> User | None:
        """Authenticate user by email and password"""
        stmt = select(User).where(User.email == email)
        result = await session.execute(stmt)
        user = result.scalar_one_or_none()
        
        if not user:
            return None
        
        if not verify_password(password, user.hashed_password):
            return None
        
        if not user.is_active:
            return None
        
        return user
    
    
    @staticmethod
    async def get_user_by_id(session: AsyncSession, user_id: str) -> User | None:
        """Get user by ID"""
        stmt = select(User).where(User.id == user_id)
        result = await session.execute(stmt)
        return result.scalar_one_or_none()
    
    
    @staticmethod
    async def get_user_by_email(session: AsyncSession, email: str) -> User | None:
        """Get user by email"""
        stmt = select(User).where(User.email == email)
        result = await session.execute(stmt)
        return result.scalar_one_or_none()
    
    
    @staticmethod
    async def get_or_create_oauth_user(
        session: AsyncSession,
        google_id: str,
        email: str,
        full_name: str,
    ) -> User:
        """Get or create user via OAuth (Google)"""
        stmt = select(User).where(User.google_id == google_id)
        result = await session.execute(stmt)
        user = result.scalar_one_or_none()
        
        if user:
            return user
        
        # Create new user
        user = User(
            email=email,
            username=email.split('@')[0],  # Use part before @ as username
            full_name=full_name,
            google_id=google_id,
            hashed_password="",  # OAuth users don't have passwords
            role=UserRole.USER,
            is_active=True,
            is_verified=True,  # OAuth emails are verified
        )
        session.add(user)
        await session.commit()
        await session.refresh(user)
        
        logger.info(f"OAuth user created: {email}")
        return user
    
    
    @staticmethod
    async def create_refresh_token(
        session: AsyncSession,
        user_id: str,
        token: str,
        expires_at,
    ) -> RefreshToken:
        """Create refresh token record"""
        refresh_token = RefreshToken(
            user_id=user_id,
            token=token,
            expires_at=expires_at,
        )
        session.add(refresh_token)
        await session.commit()
        await session.refresh(refresh_token)
        return refresh_token
    
    
    @staticmethod
    async def get_refresh_token(session: AsyncSession, token: str) -> RefreshToken | None:
        """Get refresh token"""
        stmt = select(RefreshToken).where(RefreshToken.token == token)
        result = await session.execute(stmt)
        return result.scalar_one_or_none()
    
    
    @staticmethod
    async def revoke_refresh_token(session: AsyncSession, token: str) -> bool:
        """Revoke refresh token"""
        stmt = select(RefreshToken).where(RefreshToken.token == token)
        result = await session.execute(stmt)
        refresh_token = result.scalar_one_or_none()
        
        if not refresh_token:
            return False
        
        from datetime import datetime, timezone
        refresh_token.revoked_at = datetime.now(timezone.utc)
        await session.commit()
        return True
