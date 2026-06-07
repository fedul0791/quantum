from sqlalchemy import Column, String, DateTime, Boolean, Integer, Enum
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid
import enum

from ..core.database import Base


class UserRole(str, enum.Enum):
    GUEST = "guest"
    USER = "user"
    PREMIUM = "premium"
    ADMIN = "admin"


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    username = Column(String(100), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    
    # OAuth
    google_id = Column(String(255), unique=True, nullable=True)
    
    # Profile
    full_name = Column(String(255), nullable=True)
    avatar_url = Column(String(255), nullable=True)
    
    # Role
    role = Column(Enum(UserRole), default=UserRole.USER, nullable=False)
    
    # Account status
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    last_login = Column(DateTime, nullable=True)
    
    # Premium info
    premium_expires_at = Column(DateTime, nullable=True)
    
    def __repr__(self):
        return f"<User {self.email}>"
