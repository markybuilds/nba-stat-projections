"""
WebSocket endpoints for real-time NBA stat projections.
"""

import json
import uuid
from typing import Dict, Any
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from .manager import manager

router = APIRouter()

async def process_message(client_id: str, message: Dict[str, Any]):
    """
    Process incoming WebSocket messages
    
    Args:
        client_id: Client identifier
        message: Message data
    """
    # Handle different message types
    message_type = message.get("type")
    
    if message_type == "subscribe":
        # Subscribe to a topic
        topic = message.get("topic", "")
        if topic:
            manager.subscribe(client_id, topic)
            # Send confirmation
            await manager.send_personal_message(
                client_id,
                {"type": "subscribed", "topic": topic}
            )
    
    elif message_type == "unsubscribe":
        # Unsubscribe from a topic
        topic = message.get("topic", "")
        if topic:
            manager.unsubscribe(client_id, topic)
            # Send confirmation
            await manager.send_personal_message(
                client_id,
                {"type": "unsubscribed", "topic": topic}
            )


@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for real-time updates
    """
    # Generate a unique client ID
    client_id = str(uuid.uuid4())
    
    # Accept the connection
    await manager.connect(websocket, client_id)
    
    # Send welcome message with client ID
    await manager.send_personal_message(
        client_id,
        {"type": "connected", "client_id": client_id}
    )
    
    try:
        while True:
            # Receive incoming WebSocket message
            data = await websocket.receive_text()
            
            try:
                # Parse JSON message
                message = json.loads(data)
                
                # Process the message
                await process_message(client_id, message)
                
            except json.JSONDecodeError:
                # If invalid JSON, send error
                await manager.send_personal_message(
                    client_id,
                    {"type": "error", "message": "Invalid JSON format"}
                )
    
    except WebSocketDisconnect:
        # Handle disconnection
        manager.disconnect(client_id) 