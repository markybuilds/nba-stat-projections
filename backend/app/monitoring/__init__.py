"""
Monitoring package for NBA Stat Projections.

This package contains modules for monitoring application performance,
tracking metrics, and generating alerts for the NBA Stat Projections
application.
"""

from app.monitoring.init import setup_monitoring

__all__ = ["setup_monitoring"] 