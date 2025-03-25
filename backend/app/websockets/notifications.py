"""
Notification functions for broadcasting real-time updates.
"""

from typing import Dict, Any, List, Optional
from .manager import manager
from datetime import datetime


async def broadcast_projection_update(
    projection_id: str,
    updated_data: Dict[str, Any]
):
    """
    Broadcast an update for a specific projection
    
    Args:
        projection_id: The ID of the updated projection
        updated_data: The updated projection data
    """
    # Broadcast to subscribers of this specific projection
    await manager.broadcast(
        f"projection/{projection_id}",
        {
            "type": "projection_update",
            "projection_id": projection_id,
            "data": updated_data
        }
    )
    
    # Also broadcast to the general projections topic
    await manager.broadcast(
        "projections",
        {
            "type": "projection_update",
            "projection_id": projection_id,
            "data": updated_data
        }
    )


async def broadcast_game_update(
    game_id: str,
    updated_data: Dict[str, Any]
):
    """
    Broadcast an update for a specific game
    
    Args:
        game_id: The ID of the updated game
        updated_data: The updated game data
    """
    # Broadcast to subscribers of this specific game
    await manager.broadcast(
        f"game/{game_id}",
        {
            "type": "game_update",
            "game_id": game_id,
            "data": updated_data
        }
    )
    
    # Also broadcast to the general games topic
    await manager.broadcast(
        "games",
        {
            "type": "game_update",
            "game_id": game_id,
            "data": updated_data
        }
    )


async def broadcast_player_update(
    player_id: str,
    updated_data: Dict[str, Any]
):
    """
    Broadcast an update for a specific player
    
    Args:
        player_id: The ID of the updated player
        updated_data: The updated player data
    """
    # Broadcast to subscribers of this specific player
    await manager.broadcast(
        f"player/{player_id}",
        {
            "type": "player_update",
            "player_id": player_id,
            "data": updated_data
        }
    )
    
    # Also broadcast to the general players topic
    await manager.broadcast(
        "players",
        {
            "type": "player_update",
            "player_id": player_id,
            "data": updated_data
        }
    )


async def broadcast_bulk_projections_update(
    projections: List[Dict[str, Any]]
):
    """
    Broadcast a bulk update of multiple projections
    
    Args:
        projections: List of updated projection data
    """
    # Broadcast to general projections topic
    await manager.broadcast(
        "projections",
        {
            "type": "bulk_projections_update",
            "data": projections
        }
    )
    
    # Also broadcast to individual projection topics
    for projection in projections:
        projection_id = projection.get("id")
        if projection_id:
            await manager.broadcast(
                f"projection/{projection_id}",
                {
                    "type": "projection_update",
                    "projection_id": projection_id,
                    "data": projection
                }
            )


async def broadcast_system_notification(
    message: str,
    level: str = "info",
    target_clients: Optional[List[str]] = None
):
    """
    Broadcast a system notification
    
    Args:
        message: Notification message
        level: Notification level (info, warning, error)
        target_clients: Optional list of client IDs to notify
    """
    notification_data = {
        "type": "system_notification",
        "message": message,
        "level": level,
        "timestamp": str(datetime.now())
    }
    
    if target_clients:
        # Send to specific clients
        for client_id in target_clients:
            await manager.send_personal_message(client_id, notification_data)
    else:
        # Broadcast to all clients subscribed to system notifications
        await manager.broadcast("system", notification_data) 