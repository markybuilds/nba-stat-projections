"""
Database optimization utilities for improved performance
"""
import time
import logging
import hashlib
import json
import asyncio
import functools
from typing import Any, Dict, List, Callable, Optional, TypeVar, Awaitable, Union
from datetime import datetime, timedelta

from app.utils.database import get_supabase_client
from app.core.config import settings

# Type variable for generic function
T = TypeVar('T')

# Setup logging
logger = logging.getLogger(__name__)

# Cache for query results
_query_cache: Dict[str, Dict[str, Any]] = {}
_cache_ttl: Dict[str, datetime] = {}

# Connection pool settings
MAX_CONNECTIONS = getattr(settings, "MAX_DB_CONNECTIONS", 20)
CONNECTION_TIMEOUT = getattr(settings, "DB_CONNECTION_TIMEOUT", 30)
CONNECTION_POOL = None

# Cache settings
CACHE_ENABLED = getattr(settings, "DB_CACHE_ENABLED", True)
DEFAULT_CACHE_TTL = getattr(settings, "DB_CACHE_TTL", 60)  # in seconds
CACHE_SIZE_LIMIT = getattr(settings, "DB_CACHE_SIZE_LIMIT", 1000)

# Query monitoring settings
SLOW_QUERY_THRESHOLD = getattr(settings, "SLOW_QUERY_THRESHOLD", 1.0)  # in seconds
QUERY_MONITORING_ENABLED = getattr(settings, "QUERY_MONITORING_ENABLED", True)

class DBPerformanceMonitor:
    """Class for monitoring database query performance"""

    def __init__(self):
        self.queries = []
        self.slow_queries = []
        self.query_count = 0
        self.slow_query_count = 0
        self.total_time = 0
    
    def record_query(self, query: str, execution_time: float, params: Optional[Dict] = None):
        """Record a database query execution"""
        if not QUERY_MONITORING_ENABLED:
            return
        
        self.query_count += 1
        self.total_time += execution_time
        
        # Track slow queries
        if execution_time > SLOW_QUERY_THRESHOLD:
            self.slow_query_count += 1
            self.slow_queries.append({
                'query': query,
                'params': params,
                'execution_time': execution_time,
                'timestamp': datetime.now().isoformat()
            })
            logger.warning(f"Slow query detected ({execution_time:.2f}s): {query}")
    
    def get_stats(self) -> Dict[str, Any]:
        """Get query performance statistics"""
        return {
            'query_count': self.query_count,
            'slow_query_count': self.slow_query_count,
            'total_time': self.total_time,
            'avg_time': self.total_time / self.query_count if self.query_count > 0 else 0,
            'slow_queries': self.slow_queries[-10:],  # Last 10 slow queries
        }
    
    def reset_stats(self):
        """Reset performance statistics"""
        self.queries = []
        self.slow_queries = []
        self.query_count = 0
        self.slow_query_count = 0
        self.total_time = 0

# Create singleton instance of performance monitor
performance_monitor = DBPerformanceMonitor()

def generate_cache_key(func_name: str, args: tuple, kwargs: Dict[str, Any]) -> str:
    """
    Generate a cache key from function name and arguments
    
    Args:
        func_name: Name of the function
        args: Positional arguments
        kwargs: Keyword arguments
        
    Returns:
        str: Cache key
    """
    # Convert args and kwargs to a stable string representation
    args_str = json.dumps(args, sort_keys=True, default=str)
    kwargs_str = json.dumps(kwargs, sort_keys=True, default=str)
    
    # Generate a key using function name and arguments
    key_str = f"{func_name}:{args_str}:{kwargs_str}"
    
    # Create a hash to keep keys shorter
    return hashlib.md5(key_str.encode()).hexdigest()

def cached_query(ttl: int = DEFAULT_CACHE_TTL):
    """
    Decorator for caching database query results
    
    Args:
        ttl: Cache time-to-live in seconds
        
    Returns:
        Callable: Decorated function
    """
    def decorator(func: Callable[..., Awaitable[T]]) -> Callable[..., Awaitable[T]]:
        @functools.wraps(func)
        async def wrapper(*args: Any, **kwargs: Any) -> T:
            if not CACHE_ENABLED:
                # Timing the query execution for performance monitoring
                start_time = time.time()
                result = await func(*args, **kwargs)
                execution_time = time.time() - start_time
                
                # Record query performance
                performance_monitor.record_query(
                    func.__name__, 
                    execution_time,
                    kwargs
                )
                
                return result
            
            # Generate cache key
            cache_key = generate_cache_key(func.__name__, args, kwargs)
            
            # Check if result is in cache and not expired
            if cache_key in _query_cache and _cache_ttl.get(cache_key, datetime.min) > datetime.now():
                logger.debug(f"Cache hit for {func.__name__}")
                return _query_cache[cache_key]
            
            # If not in cache or expired, execute the query
            start_time = time.time()
            result = await func(*args, **kwargs)
            execution_time = time.time() - start_time
            
            # Record query performance
            performance_monitor.record_query(
                func.__name__, 
                execution_time,
                kwargs
            )
            
            # Cache the result
            _query_cache[cache_key] = result
            _cache_ttl[cache_key] = datetime.now() + timedelta(seconds=ttl)
            
            # Clean up cache if it exceeds size limit
            if len(_query_cache) > CACHE_SIZE_LIMIT:
                _cleanup_cache()
            
            return result
        
        return wrapper
    
    return decorator

def _cleanup_cache():
    """Clean up expired or oldest entries when cache exceeds size limit"""
    now = datetime.now()
    
    # First, remove expired entries
    expired_keys = [k for k, v in _cache_ttl.items() if v <= now]
    for key in expired_keys:
        if key in _query_cache:
            del _query_cache[key]
        if key in _cache_ttl:
            del _cache_ttl[key]
    
    # If still too large, remove oldest entries
    if len(_query_cache) > CACHE_SIZE_LIMIT:
        # Sort by expiry time and remove oldest
        sorted_keys = sorted(_cache_ttl.items(), key=lambda x: x[1])
        keys_to_remove = sorted_keys[:len(_query_cache) - CACHE_SIZE_LIMIT]
        
        for key, _ in keys_to_remove:
            if key in _query_cache:
                del _query_cache[key]
            if key in _cache_ttl:
                del _cache_ttl[key]

def invalidate_cache(pattern: Optional[str] = None):
    """
    Invalidate cache entries
    
    Args:
        pattern: Optional pattern to match cache keys
    """
    global _query_cache, _cache_ttl
    
    if pattern is None:
        # Clear entire cache
        _query_cache = {}
        _cache_ttl = {}
        logger.info("Query cache cleared")
    else:
        # Clear entries matching pattern
        keys_to_remove = [k for k in _query_cache.keys() if pattern in k]
        for key in keys_to_remove:
            if key in _query_cache:
                del _query_cache[key]
            if key in _cache_ttl:
                del _cache_ttl[key]
        
        logger.info(f"Cleared {len(keys_to_remove)} cache entries matching '{pattern}'")

def get_query_performance_stats() -> Dict[str, Any]:
    """Get query performance statistics"""
    return performance_monitor.get_stats()

def reset_performance_stats():
    """Reset query performance statistics"""
    performance_monitor.reset_stats()
    logger.info("Performance statistics reset")

# Export optimized functions
__all__ = [
    'cached_query',
    'invalidate_cache',
    'get_query_performance_stats',
    'reset_performance_stats',
    'performance_monitor'
] 