from sqlalchemy import Column, String, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime, timezone
import uuid

from ..core.database import Base


class RefreshToken(Base):
    __tablename__ = "refresh_tokens"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    token = Column(String(500), unique=True, nullable=False)
    
    expires_at = Column(DateTime(timezone=True), nullable=False)
    revoked_at = Column(DateTime(timezone=True), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    def is_valid(self) -> bool:
        return self.revoked_at is None and datetime.now(timezone.utc) < self.expires_at
    
    def __repr__(self):
        return f"<RefreshToken {self.user_id}>"
