import uuid
from typing import List
from sqlalchemy import Column, String, Boolean, DateTime, func, JSON
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class User(Base):
    """User model for authentication and user management"""
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=True)
    hashed_password = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    roles = Column(ARRAY(String), default=["user"])
    created_at = Column(DateTime(timezone=True), default=func.now())
    updated_at = Column(DateTime(timezone=True), default=func.now(), onupdate=func.now())
    
    # Notification Preferences
    email_notifications = Column(Boolean, default=True)
    game_alerts = Column(Boolean, default=True)
    projection_updates = Column(Boolean, default=True)
    favorite_team_updates = Column(Boolean, default=True)
    
    # Advanced Email Notification Settings
    email_notification_types = Column(
        JSON, 
        default={
            "system": True,
            "alert": True,
            "info": True,
            "update": True
        }
    )
    email_notification_digest = Column(Boolean, default=False)
    email_notification_schedule = Column(String, default="daily")
    
    # Relationships
    favorites = relationship("Favorite", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<User {self.id}: {self.email}>" 