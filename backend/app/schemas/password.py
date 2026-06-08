import re
from pydantic import BaseModel, field_validator, ConfigDict
from typing import Optional


class PasswordValidator:
    """Password strength validation"""
    
    MIN_LENGTH = 8
    REQUIRE_UPPERCASE = True
    REQUIRE_LOWERCASE = True
    REQUIRE_DIGIT = True
    REQUIRE_SPECIAL = True
    
    SPECIAL_CHARS = "!@#$%^&*()_+-=[]{}|;:,.<>?"
    
    @classmethod
    def validate(cls, password: str) -> tuple[bool, str]:
        """
        Validate password strength.
        Returns: (is_valid, error_message)
        """
        errors = []
        
        # Length check
        if len(password) < cls.MIN_LENGTH:
            errors.append(f"Password must be at least {cls.MIN_LENGTH} characters long")
        
        # Uppercase check
        if cls.REQUIRE_UPPERCASE and not re.search(r'[A-Z]', password):
            errors.append("Password must contain at least one uppercase letter (A-Z)")
        
        # Lowercase check
        if cls.REQUIRE_LOWERCASE and not re.search(r'[a-z]', password):
            errors.append("Password must contain at least one lowercase letter (a-z)")
        
        # Digit check
        if cls.REQUIRE_DIGIT and not re.search(r'\d', password):
            errors.append("Password must contain at least one digit (0-9)")
        
        # Special character check
        if cls.REQUIRE_SPECIAL:
            if not any(c in cls.SPECIAL_CHARS for c in password):
                errors.append(f"Password must contain at least one special character: {cls.SPECIAL_CHARS}")
        
        # Check for common weak patterns
        weak_patterns = [
            r'(.)\1{2,}',  # Repeated characters (aaa, 111)
            r'^[a-z]+$',   # Only lowercase
            r'^\d+$',      # Only digits
        ]
        for pattern in weak_patterns:
            if re.search(pattern, password):
                errors.append("Password contains weak patterns (repeated chars, only lowercase/digits)")
                break
        
        return (len(errors) == 0, " | ".join(errors) if errors else "")


class UserRegisterRequest(BaseModel):
    """User registration request with password validation"""
    email: str
    password: str
    confirm_password: str
    
    model_config = ConfigDict(str_strip_whitespace=True)
    
    @field_validator('email')
    @classmethod
    def validate_email(cls, v: str) -> str:
        if not re.match(r'^[^\s@]+@[^\s@]+\.[^\s@]+$', v):
            raise ValueError('Invalid email format')
        return v.lower()
    
    @field_validator('password')
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        is_valid, error_msg = PasswordValidator.validate(v)
        if not is_valid:
            raise ValueError(error_msg)
        return v
    
    @field_validator('confirm_password')
    @classmethod
    def validate_password_match(cls, v: str, info) -> str:
        if info.data.get('password') != v:
            raise ValueError('Passwords do not match')
        return v


class UserLoginRequest(BaseModel):
    """User login request"""
    email: str
    password: str
    
    model_config = ConfigDict(str_strip_whitespace=True)


class ChangePasswordRequest(BaseModel):
    """Change password request"""
    current_password: str
    new_password: str
    confirm_password: str
    
    @field_validator('new_password')
    @classmethod
    def validate_new_password(cls, v: str) -> str:
        is_valid, error_msg = PasswordValidator.validate(v)
        if not is_valid:
            raise ValueError(error_msg)
        return v
    
    @field_validator('confirm_password')
    @classmethod
    def validate_new_password_match(cls, v: str, info) -> str:
        if info.data.get('new_password') != v:
            raise ValueError('New passwords do not match')
        return v
