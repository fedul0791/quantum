from fastapi import Request
from fastapi.responses import JSONResponse
import logging
from collections import defaultdict
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

class RateLimiter:
    """Simple in-memory rate limiter"""
    
    def __init__(self, requests_per_minute: int = 60):
        self.requests_per_minute = requests_per_minute
        self.requests = defaultdict(list)
    
    def is_allowed(self, client_id: str) -> bool:
        """Check if client is allowed to make a request"""
        now = datetime.utcnow()
        minute_ago = now - timedelta(minutes=1)
        
        # Clean old requests
        self.requests[client_id] = [
            req_time for req_time in self.requests[client_id]
            if req_time > minute_ago
        ]
        
        # Check if limit exceeded
        if len(self.requests[client_id]) >= self.requests_per_minute:
            logger.warning(f"Rate limit exceeded for {client_id}")
            return False
        
        # Add current request
        self.requests[client_id].append(now)
        return True

rate_limiter = RateLimiter(requests_per_minute=100)

async def rate_limit_middleware(request: Request, call_next):
    """Middleware for rate limiting"""
    client_id = request.client.host if request.client else "unknown"
    
    # Skip rate limiting for health checks
    if request.url.path == "/health":
        return await call_next(request)
    
    if not rate_limiter.is_allowed(client_id):
        logger.warning(f"Rate limit exceeded for {client_id}")
        return JSONResponse(
            status_code=429,
            content={"detail": "Rate limit exceeded"},
        )
    
    return await call_next(request)


class RequestLogger:
    """Structured request/response logging"""
    
    @staticmethod
    def log_request(request: Request):
        logger.info(
            f"REQUEST: {request.method} {request.url.path}",
            extra={
                "method": request.method,
                "path": request.url.path,
                "client": request.client.host if request.client else "unknown",
                "timestamp": datetime.utcnow().isoformat(),
            }
        )
    
    @staticmethod
    def log_response(request: Request, status_code: int, duration_ms: float):
        logger.info(
            f"RESPONSE: {request.method} {request.url.path} {status_code}",
            extra={
                "method": request.method,
                "path": request.url.path,
                "status_code": status_code,
                "duration_ms": duration_ms,
                "timestamp": datetime.utcnow().isoformat(),
            }
        )
    
    @staticmethod
    def log_error(request: Request, error: Exception):
        logger.error(
            f"ERROR: {request.method} {request.url.path} - {str(error)}",
            extra={
                "method": request.method,
                "path": request.url.path,
                "error": str(error),
                "timestamp": datetime.utcnow().isoformat(),
            },
            exc_info=True
        )

async def logging_middleware(request: Request, call_next):
    """Middleware for comprehensive request/response logging"""
    import time
    
    RequestLogger.log_request(request)
    start = time.time()
    
    try:
        response = await call_next(request)
        duration_ms = (time.time() - start) * 1000
        RequestLogger.log_response(request, response.status_code, duration_ms)
        return response
    except Exception as e:
        RequestLogger.log_error(request, e)
        raise
